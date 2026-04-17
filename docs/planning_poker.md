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
| US-01 | Bootstrap, Ingestion & Nettoyage : Docker-compose ELK opérationnel + lecture CSV, indexation dans movies_raw, puis pipeline Logstash de nettoyage (types, dates, listes, valeurs manquantes) vers movies_clean. | 3, 5, 5, 3 | 5 | RAM suffisante ; CSV sans lignes corrompues ; colonnes JSON (credits, recommendations) complexes à parser. | C |
| US-02 | Mapping & Analyzer : mapping.json explicite pour movies_clean + analyzer custom sur title/overview. | 2, 3, 3, 3 | 3 | Le mapping est poussé via PUT avant que Logstash ne tourne. | A (alternant) |
| US-03 | Recherche & DSL : 12 requêtes Elasticsearch dont 5 bool. | 3, 5, 5, 3 | 5 | Nécessite une bonne compréhension du mapping. | D |
| US-04 | Dashboard Kibana : 6 à 8 visualisations avec analyse métier. | 3, 3, 5, 3 | 3 | On utilise Kibana Lens pour aller plus vite. | A (alternant) |
| US-05 | Mini Moteur de Recherche : UI ou API connectée à ES avec filtres. | 5, 8, 5, 5 | 5 | Utilisation de Python (Flask) ou Node.js. | D |
| US-06 | Documentation & Démo : GIF, Runbook et rapport de 5 pages. | 3, 5, 3, 5 | 5 | Très chronophage sur la fin du projet. | B (alternant) |



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