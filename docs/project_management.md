# Gestion de Projet — ELK Movies Platform

## 1) Équipe

| Membre | Rôle | Features |
|---|---|---|
| BENBOUABDELLAH Melissa | Scrum Master| US-06 — Documentation & Démo |
| AKOUDAD Elias | Data Vis| US-03 — Requêtes DSL / US-04 — Dashboard Kibana |
| CONG Hoa | Lead Technique | US-02 — Mapping & Analyzer / US-05 — Mini Moteur de Recherche |
| KANTE Ismaël Kennedy | Data Engineer & DevOps (Lead ingestion)| US-01 — Bootstrap & Ingestion / US-03 — Requêtes DSL |

---

## 2) Organisation Gitflow

### Branches utilisées

| Branche | Rôle |
|---|---|
| `main` | Version stable, protégée — push direct interdit |
| `dev` | Branche d'intégration — push direct interdit |
| `feature/<id>-<slug>` | Développement de chaque feature |

### Règles appliquées
- Tout développement se fait sur une branche `feature/`
- Merge uniquement via Pull Request vers `dev`
- Minimum 1 reviewer obligatoire par PR
- `main` ne reçoit que des merges validés depuis `dev`

---

## 3) Pull Requests

| PR | Branche | Feature | Auteur | Reviewer | Statut |
|---|---|---|---|---|---|
| #4 | `feature/US-03-Recherche` | Requêtes DSL (12 requêtes dont 5 bool) | KANTE Ismaël Kennedy | AKOUDAD Elias | Merged |
| #6 | `features/US-02-Mapping-Analyzer` | Mapping explicite + analyzer custom | CONG Hoa | KANTE Ismaël Kennedy | Merged |
| #8 | `features/US-02-Mapping-Analyzer` | Corrections mapping post-review | CONG Hoa | AKOUDAD Elias | Merged |
| — | `feature/US-05-Mini-Search-Engine` | Mini moteur de recherche Flask | CONG Hoa | — | En cours |

---

## 4) Répartition des features

### Membre 1 — BENBOUABDELLAH Melissa
- **US-06** : Documentation finale, runbook, GIF de démo, rapport de synthèse (~5 pages)

### Membre 2 — AKOUDAD Elias
- **US-03** : Co-rédaction des requêtes DSL (12 requêtes, 5 bool)
- **US-04** : Dashboard Kibana — 6 à 8 visualisations avec lecture métier

### Membre 3 — CONG Hoa
- **US-02** : Mapping explicite `movies_clean` + analyzer custom (`movies_text_analyzer`)
- **US-05** : Mini moteur de recherche (Flask + UI + API REST)

### Membre 4 — KANTE Ismaël Kennedy
- **US-01** : Docker Compose ELK + pipeline Logstash (ingestion brute `movies_raw` + nettoyage `movies_clean`)
- **US-03** : Co-rédaction des requêtes DSL

---

## 6) Suivi d'avancement

| Feature | Statut |
|---|---|
| US-01 — Bootstrap & Ingestion | Terminé |
| US-02 — Mapping & Analyzer | Terminé |
| US-03 — Requêtes DSL | Terminé |
| US-04 — Dashboard Kibana | En cours |
| US-05 — Mini Moteur de Recherche | Terminé |
| US-06 — Documentation & Démo | En cours |

---

## 7) Décisions techniques notables

| Décision | Justification |
|---|---|
| Python Flask pour le moteur de recherche | Cohérence avec l'environnement Python existant (notebooks), déploiement simple |
| Mapping appliqué via PUT avant Logstash | Évite les conflits de type automatique par Elasticsearch |
| Champs `keyword` pour les agrégations Kibana | Performances d'agrégation supérieures aux champs `text` |
| Analyzer custom `movies_text_analyzer` | Stemming anglais + ASCII folding pour améliorer le recall sur les titres |
| Échantillon réduit pour les premiers tests | Évite la saturation RAM lors de l'ingestion des ~1.5M lignes |