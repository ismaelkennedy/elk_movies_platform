# Runbook — ELK Movies Platform

Document de synthèse technique. Permet de relancer, comprendre et opérer la plateforme sur une machine vierge.

---

## 1. Architecture

```
movies.csv
    │
    ▼
Logstash ──── parse + nettoyage ──► movies_raw  (769 631 docs bruts)
                                 ──► movies_clean (662 083 docs nettoyés)
                                          │
                              ┌───────────┴───────────┐
                              ▼                       ▼
                           Kibana               Flask API
                         (dashboard)        (moteur de recherche)
                                             http://localhost:5000
```

| Service | URL | Rôle |
|---|---|---|
| Elasticsearch | http://localhost:9200 | Stockage + recherche |
| Kibana | http://localhost:5601 | Dashboard & visualisations |
| Flask | http://localhost:5000 | Moteur de recherche UI/API |

---

## 2. Prérequis

- Docker Desktop (actif)
- Python 3.10+
- Git

---

## 3. Démarrage de la stack

```bash
# Démarrer tous les services
docker compose up -d

# Vérifier que les services sont actifs
curl http://localhost:9200          # Elasticsearch
curl http://localhost:9200/_cat/indices?v  # Voir les index
```

Attendre ~30 secondes que Logstash ait fini l'ingestion avant de vérifier.

---

## 4. Vérification des données

```bash
# Nombre de documents bruts
curl http://localhost:9200/movies_raw/_count

# Nombre de documents nettoyés
curl http://localhost:9200/movies_clean/_count

# Échantillon de 1 document nettoyé
curl "http://localhost:9200/movies_clean/_search?size=1&pretty"
```

Résultats attendus :

| Index | Documents |
|---|---|
| `movies_raw` | 769 631 |
| `movies_clean` | 662 083 |

---

## 5. Moteur de recherche (US-05)

### Lancer l'application

```bash
cd search_engine
pip install -r requirements.txt
python app.py
```

Accessible sur **http://localhost:5000**

### Endpoints API

| Endpoint | Méthode | Description |
|---|---|---|
| `/` | GET | Interface de recherche UI |
| `/api/search` | GET | Recherche full-text + filtres |
| `/api/aggregations` | GET | Genres et langues disponibles |

### Paramètres `/api/search`

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `q` | string | `""` | Texte libre (titre, overview, tagline) |
| `genre` | string | `""` | Filtre exact sur le genre |
| `language` | string | `""` | Filtre sur la langue originale |
| `year_from` | int | — | Année de sortie minimale |
| `year_to` | int | — | Année de sortie maximale |
| `sort` | string | `trending` | Voir options ci-dessous |
| `page` | int | `1` | Pagination (10 résultats/page) |

### Options de tri (`sort`)

| Valeur | Comportement |
|---|---|
| `trending` | Score composite : popularité + note + votes (défaut) |
| `relevance` | Score textuel Elasticsearch (`_score`) |
| `popularity` | Tri sur le champ `popularity` brut |
| `date_desc` | Date de sortie décroissante |
| `date_asc` | Date de sortie croissante |
| `rating` | Note moyenne décroissante |

---

## 6. Algorithme Tendances (score composite)

Utilisé par défaut sur la page d'accueil (sans requête texte).

### Formule

```
score = 1 + pop_norm × 0.35 + rating_norm × 0.40 + votes_norm × 0.25
```

### Normalisation de chaque signal

| Signal | Formule | Référence | Poids |
|---|---|---|---|
| `popularity` | `log1p(pop) / log1p(500)` | pop = 500 → score 1.0 | 35% |
| `vote_average` | `vote_average / 10` | note = 10 → score 1.0 | 40% |
| `vote_count` | `log1p(votes) / log1p(50 000)` | 50k votes → score 1.0 | 25% |

`log1p(x)` = `ln(1 + x)` — compresse les grandes valeurs pour éviter qu'un film viral (popularité 10 000) n'écrase tous les autres.

La note (`vote_average`) a le poids le plus élevé car c'est le signal qualité le plus stable dans le temps.

> **Limite connue** : les valeurs de référence (500 pour la popularité, 50 000 pour les votes) sont des estimations. Pour les calibrer précisément, il faudrait calculer le percentile 95 sur le dataset réel au démarrage de l'app.

---

## 7. Stratégie de recherche full-text

Quand un terme est saisi, trois stratégies sont combinées :

| Stratégie | Exemple | Boost |
|---|---|---|
| `multi_match` analysé | "spider man" → films bien indexés | ×3 |
| `match_phrase_prefix` | "spide" → "Spider-Man" | ×2 |
| `wildcard` sur `.keyword` | "*spide*" → toute occurrence | ×1 |

Le score textuel est ensuite multiplié par `sqrt(popularity) × 2` via `function_score` pour favoriser les films connus sans sacrifier la pertinence.

---

## 8. Pipeline Logstash — résumé du nettoyage

| Étape | Action |
|---|---|
| Conversion de types | `id` → integer, `popularity/vote_average/runtime` → float |
| Parsing date | `release_date` : `yyyy-MM-dd` → timestamp ISO 8601 |
| Split des listes | `genres` et `keywords` : `"Action-Drama"` → `["Action", "Drama"]` |
| Déduplication | `document_id` basé sur `id` pour éviter les doublons |
| Tag qualité | `missing_title` ajouté aux films sans titre |

**Impact** : 107 548 doublons supprimés (769 631 → 662 083 documents).

---

## 9. Analyzer personnalisé (`movies_search_analyzer`)

Appliqué aux champs `title`, `overview` et `tagline` dans `movies_clean`.

| Filtre | Rôle |
|---|---|
| `html_strip` | Supprime les balises HTML résiduelles |
| `lowercase` | Normalise la casse |
| `asciifolding` | `é` → `e`, `ñ` → `n` |
| `english_stop` | Supprime les mots vides (`the`, `a`, `is`…) |
| `english_stemmer` | Réduit à la racine (`running` → `run`) |

---

## 10. Arrêt de la stack

```bash
docker compose down
```

Pour supprimer aussi les volumes (reset complet) :

```bash
docker compose down -v
```