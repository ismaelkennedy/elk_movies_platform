### 1.Documentation des données

### 1.1 Description du dataset

Source : [TMDB Movies Dataset — Kaggle](https://www.kaggle.com/datasets/akshaypawar7/millions-of-movies)  
Fichier : `DATA/movies.csv` — 769 631 lignes, 20 colonnes

Champs principaux : `id`, `title`, `overview`, `tagline`, `genres`, `original_language`, `release_date`, `popularity`, `vote_average`, `vote_count`, `runtime`, `budget`, `revenue`, `status`, `credits`, `keywords`, `poster_path`

### 2. Anomalies observées 

| Champ | Anomalie |
|---|---|
| `id` | Doublons dans le CSV |
| `title` | Valeurs vides ou nulles | 
| `overview` | Valeurs nulles | 
| `genres` | Valeurs nulles | 
| `release_date` | Valeurs nulles ou mal formatées | 
| `tagline`, `keywords` | Valeurs nulles | 
| Tous champs numériques | Typés en string dans le CSV | 

### 3. Règles de nettoyage Logstash

# Conversion de types
```
id → integer | popularity, vote_average, runtime → float
budget, revenue, vote_count → integer
```

# Parsing de la date
```
release_date : "yyyy-MM-dd" → timestamp ISO 8601
Films sans date : conservés avec tag _date_parse_failure
```

# Normalisation des listes
```
genres   : "Action-Drama"            → ["Action", "Drama"]
keywords : "space-adventure-sci-fi"  → ["space", "adventure", "sci-fi"]
```

# Déduplication
```
document_id = champ id → écrasement des doublons à la ré-ingestion
```

# Détection qualité
```
Films sans titre → tag missing_title ajouté
```

### 4. Mesure d'impact avant / après

| Métrique | `movies_raw` | `movies_clean` |
|---|---|---|
| Documents | 769 631 | 662 083 |
| Doublons | 107 548 | 0 |
| Type `release_date` | string | date ISO |
| Type `vote_average` | string | float |
| Type `budget` | string | integer |
| `genres` | string `"Action-Drama"` | tableau `["Action","Drama"]` |
| `keywords` | string | tableau |
| Titres manquants détectés | non | oui (tag) |
| Champs techniques Logstash | présents | supprimés |

---

## 5. Bilan, limites et améliorations

### Points bloquants rencontrés
- Volume du dataset : 769k lignes → temps d'ingestion Logstash long (environ 15 min)
- Champs JSON imbriqués (`credits`, `recommendations`) difficiles à parser depuis le CSV
- Valeurs nulles massives sur `overview` et `genres`  limitent les filtres

### Limites connues
- Les seuils de normalisation du score Tendances (`log1p(500)`, `log1p(50 000)`) sont des estimations non calibrées sur la distribution réelle
- Pas de gestion de l'authentification sur l'API Flask
- Dashboard Kibana exporté manuellement 

### Améliorations possibles
1. Calculer le percentile 95 de `popularity` et `vote_count` au démarrage de l'app pour calibrer le scoring automatiquement
2. Ajouter une logique de recommandation basée sur les `keywords` communs
3. Comparer les analyzers `english` vs `french` vs `standard` dans le moteur
4. Provisionner le dashboard Kibana via `docker-compose` (volume `kibana/dashboards/`)