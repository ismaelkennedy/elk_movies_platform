# Documentation du nettoyage des données

Ce documents contient l'explication du traitement de nettoyage de données (movies_raw => movies_clean). 

## 1. Source des données

- Fichier : 'DATA/movies.csv'
- Nombre de lignes brutes : 769 631 films
- Index brut : 'movies_raw' (769 631 documents, sans traitement)
- Index nettoyé : 'movies_clean' (662 083 documents uniques après     suppression des données dupliqué)

---

## 2. Anomalies détectées

| Champ | Anomalie | Fréquence |
|---|---|---|
| 'id' | Doublons dans le CSV | 107 548 doublons supprimés |
| 'title' | Valeurs vides ou nulles | ~4 films |
| 'overview' | Valeurs nulles | ~114 502 films (17.29%) |
| 'genres' | Valeurs nulles | ~212 149 films (32.04%) |
| 'release_date' | Valeurs nulles | ~59 459 films (8.98%) |
| 'tagline' | Valeurs nulles | fréquent |
| 'keywords' | Valeurs nulles | fréquent |
| 'production_companies' | Valeurs nulles | fréquent |



## 3. Règles de nettoyage appliquées (Logstash)

### 3.1 Conversion de types

Les champs numériques sont convertis depuis leur type string CSV vers leur type cible :

| Champ | Type brut | Type nettoyé |
|---|---|---|
| 'id' | string | integer |
| 'popularity' | string | float |
| 'budget' | string | integer |
| 'revenue' | string | integer |
| 'runtime' | string | float |
| 'vote_average' | string | float |
| 'vote_count' | string | integer |

'''
mutate {
  convert => {
    "id"           => "integer"
    "popularity"   => "float"
    "budget"       => "integer"
    "revenue"      => "integer"
    "runtime"      => "float"
    "vote_average" => "float"
    "vote_count"   => "integer"
  }
}
'''

### 3.2 Parsing de la date

'release_date' est parsé depuis le format '%Y-%m-%d' vers un timestamp ISO 8601 :

'''
date {
  match => ["release_date", "yyyy-MM-dd"]
  target => "release_date"
  tag_on_failure => ["_date_parse_failure"]
}
'''

- Films sans date : **59 459** (valeur absente dans le CSV)

### 3.3 Normalisation des champs liste

'genres' et 'keywords' sont stockés en chaîne séparée par '-' dans le CSV. Ils sont splitté en listes :

'''
mutate {
  split => {
    "genres"   => "-"
    "keywords" => "-"
  }
}
'''

**Exemple :**
- Brut : '"Action-Science Fiction-Horror"'
- Nettoyé : '["Action", "Science Fiction", "Horror"]'

### 3.4 Modificaion d'amélioration

Ajout de 'document_id' basé sur le champ 'id' est utilisé pour 'movies_clean' afin d'éviter les doublons en cas de redémarrage :

'''
elasticsearch {
  index       => "movies_clean"
  document_id => "%{id}"
}
'''

Un tag 'missing_title' est ajouté aux films sans titre pour faciliter le filtrage :

'''
if ![title] or [title] == "" {
  mutate { add_tag => ["missing_title"] }
}
'''


## 4. Mesure d'impact avant/après

| Métrique | movies_raw (avant) | movies_clean (après) |
|---|---|---|
| Nombre de documents | 769 631 | 662 083 |
| Doublons | 107 548 | 0 |
| Type de 'release_date' | string | date (timestamp ISO) |
| Type de 'budget' | string | integer |
| Type de 'vote_average' | string | float |
| 'genres' | string '"Action-Drama"' | tableau '["Action", "Drama"]' |
| 'keywords' | string | tableau |
| Titres manquants détectés | non | oui (tag 'missing_title') |
| Champs techniques Logstash | présents | supprimés |


## 5. Analyzer personnalisé

Un analyzer custom 'movies_text_analyzer' est défini dans le mapping de 'movies_clean' et appliqué aux champs 'title' et 'overview' :

| Filtre | Rôle |
|---|---|
| 'html_strip' | Supprime les balises HTML résiduelles |
| 'lowercase' | Normalise la casse |
| 'asciifolding' | Convertit les caractères accentués ('é' → 'e') |
| 'english_stop' | Supprime les mots vides anglais ('the', 'a', 'is'...) |
| 'english_stemmer' | Réduit les mots à leur racine ('running' → 'run') |

**Exemple :**
- Entrée : '"The Amazing Spider-Man returns"'
- Tokens produits : '["amaz", "spider", "man", "return"]'
