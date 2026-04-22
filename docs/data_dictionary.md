# Dictionnaire de données — movies_clean

Ce document explique ce que contient chaque champ de notre index `movies_clean`, comment il est stocké et ce qu'on en a fait.


## Description des champs

| Champ | Type | Description | Ce qu'on a fait |
|---|---|---|---|
| `id` | entier | Identifiant unique du film sur TMDB | Converti en nombre entier, sert à éviter les doublons |
| `title` | texte | Titre du film | Analysé pour la recherche (stemming, stop words). On peut aussi filtrer par titre exact |
| `overview` | texte | Résumé du film | Analysé pour la recherche full-text |
| `tagline` | texte | Slogan du film | Analysé pour la recherche |
| `genres` | mot-clé | Genres du film | Découpé en liste : `"Action-Drama"` → `["Action", "Drama"]` |
| `original_language` | mot-clé | Langue d'origine (ex: `en`, `fr`) | Tel quel, utilisé pour filtrer par langue |
| `status` | mot-clé | État de sortie (`Released`, `Post Production`...) | Tel quel |
| `release_date` | date | Date de sortie du film | Converti en date pour pouvoir faire des recherches par période |
| `popularity` | décimal | Score de popularité TMDB | Converti en nombre décimal |
| `budget` | entier | Budget du film en dollars | Converti en nombre entier |
| `revenue` | entier | Recettes du film en dollars | Converti en nombre entier |
| `runtime` | décimal | Durée du film en minutes | Converti en nombre décimal |
| `vote_average` | décimal | Note moyenne des utilisateurs (0 à 10) | Converti en nombre décimal |
| `vote_count` | entier | Nombre de votes | Converti en nombre entier |
| `production_companies` | mot-clé | Sociétés de production | Tel quel |
| `credits` | mot-clé | Acteurs principaux | Tel quel |
| `keywords` | mot-clé | Mots-clés du film | Découpé en liste comme `genres` |
| `poster_path` | non indexé | Chemin vers l'affiche | Stocké mais non utilisé pour la recherche |
| `backdrop_path` | non indexé | Chemin vers l'image de fond | Stocké mais non utilisé pour la recherche |
| `recommendations` | non indexé | IDs de films recommandés | Stocké mais non utilisé pour la recherche |

