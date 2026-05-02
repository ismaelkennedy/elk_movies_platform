# ELK Movies Platform - Stack ELK

Projet de moteur de recherche haute performance basé sur un dataset de films, propulsé par la stack Elasticsearch, Logstash et Kibana (ELK). Ce projet transforme un jeu de données CSV massif et brut en une plateforme de recherche intuitive. Il intègre un pipeline ETL complet, une modélisation de données optimisée et une interface web moderne.


## Architecture

```
movies.csv (769 631 films)
        │
        ▼
   [Logstash]  ── pipeline ETL (parsing CSV, nettoyage, typage)
        │
        ├──► movies_raw   (769 631 docs — données brutes)
        └──► movies_clean (662 083 docs — dédoublonnées et typées)
                │
                ▼
         [Elasticsearch] ◄── Flask Search Engine (port 5000)
                │
                ▼
           [Kibana]  ── Dashboards (port 5601)
```

**Double index :**
- `movies_raw` — archive brute pour audit
- `movies_clean` — 107 548 doublons supprimés, champs typés, analyseur personnalisé



## Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Recherche | Elasticsearch | 8.10.2 |
| Visualisation | Kibana | 8.10.2 |
| Pipeline ETL | Logstash | 8.10.2 |
| Backend search | Python / Flask | 3.10+ / 3.0.3 |
| Driver ES | elasticsearch-py | 8.10.1 |
| Orchestration | Docker Compose | — |


## Équipe

| Membre | Rôle | 
|---|---|
| BENBOUABDELLAH Melissa | Scrum Master| 
| AKOUDAD Elias | Data Vis| 
| CONG Hoa | Lead Technique | 
| KANTE Ismaël Kennedy | Data Engineer & DevOps (Lead ingestion)| 

## Structure du projet

```
elk_movies_platform/
├── DATA/
│   └── movies.csv                  
├── docker-compose.yml
├── elasticsearch/
│   └── mapping.json                
├── logstash/
│   └── pipeline/
│       └── logstash.conf           
├── search_engine/
│   ├── app.py                      
│   ├── templates/index.html        
│   └── static/
│       ├── style.css
│       └── search.js
├── docs/
│   ├── data_cleaning.md            
│   ├── data_dictionary.md          
│   ├── data_quality.ipynb          
│   ├── queries_dsl.ipynb           
│   ├── planning_poker.md           
│   └── demo_script.md              
├── requirements.txt
└── .gitignore
├── README.md

```

## Prérequis

- Docker Desktop 
- Python 3.10+
- ~512 MB RAM disponibles pour Elasticsearch
- ~400 MB d'espace disque


## Installation et démarrage

### 1. Démarrer la stack ELK

```bash
docker compose up -d
```

Les services démarrent dans l'ordre suivant :
1. **elasticsearch** — port 9200
2. **es-init** — crée l'index `movies_clean` avec le mapping
3. **logstash** — ingère `movies.csv` vers `movies_raw` et `movies_clean`
4. **kibana** — port 5601

Vérifier que l'ingestion est terminée :

```bash
# Données brutes
curl http://localhost:9200/movies_raw/_count
# Attendu : {"count":769631,...}

# Données nettoyées
curl http://localhost:9200/movies_clean/_count
# Attendu : {"count":662083,...}
```

### 2. Lancer le moteur de recherche

```bash
cd search_engine
pip install -r requirements.txt
python app.py
```

Interface disponible sur : **http://localhost:5000**



