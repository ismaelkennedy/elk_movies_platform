# Planning Poker

## 1) Participants
- Membre 1: BENBOUABDELLAH Melissa
- Membre 2: AKOUDAD Elias
- Membre 3: CONG Hoa
- Membre 4: KANTE Ismaël Kennedy

## 2) Échelle utilisée
Fibonacci: 1, 2, 3, 5, 8, 13

## 3) Stories estimées
| ID | User Story | Votes initiaux | Estimation finale | Hypothèses | Owner |
| --- | --- | --- | --- | --- | --- |
| US-01 | Bootstrap & Infra : Docker-compose ELK fonctionnel et reproductible. | 2, 3, 3, 2 | 3 | La RAM des machines est suffisante. |  |
| US-02 | Ingestion brute : Lecture CSV et indexation dans movies_raw.| 2, 2, 3, 1 | 2 | Le CSV n'a pas de lignes corrompues. |  |
| US-03 | Nettoyage & Mapping : Pipeline Logstash (types, dates, listes) vers movies_clean. | 5, 8, 8, 5 | 8 |  Les colonnes JSON (genres, etc.) sont complexes à parser.|  |
| US-04 | Recherche & DSL : 12 requêtes Elasticsearch dont 5 bool. | 3, 5, 5, 3 | 5 | Nécessite une bonne compréhension du mapping. |  |
| US-05 | Dashboard Kibana : 6 à 8 visualisations avec analyse métier. | 3, 3, 5, 3 | 3 | On utilise Kibana Lens pour aller plus vite. |  |
| US-06 | Mini Moteur de Recherche : UI ou API connectée à ES avec filtres.| 5, 8, 5, 5 | 5 | Utilisation de Python (Flask) ou Node.js. |  |
| US-07 | Documentation & Démo : GIF, Runbook et rapport de 5 pages.| 3, 5, 3, 5 | 5 | Très chronophage sur la fin du projet. |  |



## 4) Décisions de découpage
- Story:
  - Découpage:
  - Risque:
  - Action:

## 5) Répartition finale des features
- Membre 1:
- Membre 2:
- Membre 3:
- Membre 4: