# Script de démonstration — ELK Movies Platform

## Prérequis
- Docker Desktop démarré
- Stack ELK opérationnelle (`docker compose up -d`)
- Python 3.10+ installé

---

## Étape 1 — Démarrer la stack ELK

```bash
docker compose up -d
```

Vérifier que les services sont actifs :
- Elasticsearch : http://localhost:9200
- Kibana : http://localhost:5601

---

## Étape 2 — Vérifier l'ingestion des données

```bash
# Shape de movie_raw
curl.exe http://localhost:9200/movies_raw/_count

# Shape de movie_clean
curl.exe http://localhost:9200/movies_clean/_count
```

---

## Étape 3 — Mini Moteur de Recherche (US-05)

### Lancer l'application

```bash
pip install -r requirements.txt
cd search_engine
python app.py
```

L'application est accessible sur : **http://localhost:5000**

### Parcours de démonstration

#### 3.1 Recherche full-text simple
1. Ouvrir http://localhost:5000
2. Taper **"space adventure"** dans la barre de recherche
3. Cliquer sur **Rechercher**
4. Observer les résultats avec mise en surbrillance des termes trouvés dans le titre et la description

#### 3.2 Filtre par genre
1. Sélectionner le genre **"Action"** dans le menu déroulant
2. Lancer la recherche (champ texte vide = tous les films du genre)
3. Vérifier que tous les résultats appartiennent au genre Action

#### 3.3 Filtre par langue
1. Sélectionner la langue **"fr"** (Français)
2. Observer les films en langue française

#### 3.4 Filtre par période
1. Saisir **2000** dans "Année de" et **2010** dans "Année à"
2. Combiner avec une recherche texte **"drama"**
3. Vérifier que les dates de sortie sont bien dans la plage 2000–2010

#### 3.5 Combinaison de filtres
1. Recherche : **"love"**
2. Genre : **"Romance"**
3. Langue : **"en"**
4. Période : **1990** à **2005**


## Étape 4 — Dashboard Kibana

1. Ouvrir http://localhost:5601
2. Naviguer vers **Analytics > Dashboard**
3. Ouvrir le dashboard **"Movies Analysis"**
4. En haut à droite, le filtre de temps est par défaut sur 
   "Last 15 minutes" — les graphiques apparaissent vides.
   Cliquer dessus et sélectionner **"Last 50 years"** pour 
   afficher toutes les données.

### Parcours de démonstration

#### 4.1 Métriques globales
Observer en haut du dashboard :
- **662 079 films** indexés
- **Budget moyen** à 406k
- **The Godfather** comme film le mieux noté (filtré sur vote_count >= 1000)

#### 4.2 Top 10 au box-office
Avatar en tête avec 2.8 milliards de revenue, 
suivi d'Avengers: Endgame et The Lion King.

#### 4.3 Répartition par genre
Le Drama domine à 30%, suivi du Documentary à 20% 
et de la Comedy à 18%.

#### 4.4 Évolution de la production par année
Croissance claire depuis les années 90, pic autour de 2020.

#### 4.5 Note moyenne par genre
Tous les genres tournent autour de 4/5. 
Le Thriller est légèrement devant.

#### 4.6 Top 10 films les plus populaires
Les grandes franchises comme Marvel dominent le classement.


---

## Points clés à montrer lors de la démo

| Fonctionnalité | Endpoint / URL |
|---|---|
| Interface de recherche | http://localhost:5000 |
| API de recherche | http://localhost:5000/api/search |
| API aggrégations | http://localhost:5000/api/aggregations |
| Elasticsearch | http://localhost:9200 |
| Kibana | http://localhost:5601 |
