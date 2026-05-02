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
| US-01 | Bootstrap, Ingestion & Nettoyage : Docker-compose ELK opérationnel + lecture CSV, indexation dans movies_raw, puis pipeline Logstash de nettoyage (types, dates, listes, valeurs manquantes) vers movies_clean. | 3, 5, 5, 3 | 5 | RAM suffisante ; CSV sans lignes corrompues ; colonnes JSON (credits, recommendations) complexes à parser. | Membre 4 |
| US-02 | Mapping & Analyzer : mapping.json explicite pour movies_clean + analyzer custom sur title/overview. | 2, 3, 3, 3 | 3 | Le mapping est poussé via PUT avant que Logstash ne tourne. | Membre 3|
| US-03 | Recherche & DSL : 12 requêtes Elasticsearch dont 5 bool. | 3, 5, 5, 3 | 5 | Nécessite une bonne compréhension du mapping. | Membre 2 & Membre 4 |
| US-04 | Dashboard Kibana : 6 à 8 visualisations avec analyse métier. | 3, 3, 5, 3 | 3 | On utilise Kibana Lens pour aller plus vite. | Membre 2 |
| US-05 | Mini Moteur de Recherche : UI ou API connectée à ES avec filtres. | 5, 8, 5, 5 | 5 | Utilisation de Python (Flask) ou Node.js. | Membre 2 |
| US-06 | Documentation & Démo : GIF, Runbook et rapport de 5 pages. | 3, 5, 3, 5 | 5 | Très chronophage sur la fin du projet. | Membre 1 |



## 4) Décisions de découpage
- Story: US-01
  - Découpage: Séparation du montage Docker (infrastructure) et de la configuration du pipeline Logstash (logique).
  - Risque: Saturation de la RAM lors de l'ingestion massive des 1.5M de lignes.
  - Action: Limitation des ressources dans le docker-compose.yml et utilisation d'un échantillon réduit pour les premiers tests.

- Story: US-02
  - Découpage: Définition de la structure de l'index et de l'intelligence textuelle.
  - Risque: Conflit de type si Logstash envoie des données avant que le mapping ne soit appliqué.
  - Action: Création manuelle (PUT) de l'index avec son mapping avant de lancer l'ingestion Logstash.

- Story: US-03
  - Découpage: Groupement des tests par complexité (recherche simple vs filtres booléens vs flou/fuzziness).
  - Risque: Résultats non pertinents si les champs .keyword et text sont confondus.
  - Action: Validation systématique de chaque requête dans le notebook de QA.

- Story: US-04
  - Découpage: 8 visualisations réparties en 4 lignes : métriques globales, top 10 au box-office, répartition par genre/année/    langue, et note moyenne par genre et popularité.
  - Risque: Kibana ne permet pas d'afficher du texte dans une métrique, les notes moyennes par genre sont très proches (autour de 4) ce qui rend la visualisation peu différenciante.
  - Action: Filtrer vote_count >= 1000 pour que le film le mieux noté soit représentatif, Exporter le dashboard en .ndjson et le versionner dans kibana/exports/.

- Story: US-05
  - Découpage: Développement du backend (API de liaison) séparé du frontend (affichage des résultats).
  - Risque: Difficulté de connexion entre l'application et Elasticsearch dans le réseau Docker.
  - Action: Utilisation de localhost plutôt que du nom de service Docker elasticsearch:9200.

- Story: US-06
  - Découpage: Rédaction technique (Runbook) dissociée de la rédaction fonctionnelle (Rapport final).
  - Risque: Manque de temps pour illustrer le bon fonctionnement du nettoyage (US-02).
  - Action: Capture de GIFs et screenshots dès la validation de chaque étape intermédiaire.

## 5) Répartition finale des features
- Membre 1: US -06
- Membre 2: US -03 & US -04
- Membre 3: US -02 & US -05
- Membre 4: US -01 & US -03