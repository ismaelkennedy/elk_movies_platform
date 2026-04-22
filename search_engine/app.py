from flask import Flask, request, jsonify, render_template
from elasticsearch import Elasticsearch

app = Flask(__name__)
es = Elasticsearch("http://localhost:9200")
INDEX = "movies_clean"

# Mapping des options de tri disponibles dans l'UI
SORT_OPTIONS = {
    "relevance":  [{"_score": "desc"}],
    "popularity": [{"popularity": "desc"}, {"_score": "desc"}],
    "date_desc":  [{"release_date": {"order": "desc", "unmapped_type": "date"}}, {"_score": "desc"}],
    "date_asc":   [{"release_date": {"order": "asc",  "unmapped_type": "date"}}, {"_score": "desc"}],
    "rating":     [{"vote_average": "desc"}, {"vote_count": "desc"}],
}


def build_query(q, genre, language, year_from, year_to, sort, page, page_size):
    filters = []

    if genre:
        filters.append({"term": {"genres": genre}})

    if language:
        filters.append({"term": {"original_language": language}})

    if year_from or year_to:
        date_range = {}
        if year_from:
            date_range["gte"] = f"{year_from}-01-01"
        if year_to:
            date_range["lte"] = f"{year_to}-12-31"
        filters.append({"range": {"release_date": date_range}})

    if q:
        # Requête de base : combinaison de 3 stratégies textuelles
        # 1. multi_match analysé   → "spider man" trouve les films bien indexés
        # 2. match_phrase_prefix   → "spide" trouve "Spider-Man" (préfixe de mot)
        # 3. wildcard sur keyword  → "*spide*" trouve tout ce qui contient la chaîne
        base_query = {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": q,
                            "fields": ["title^4", "overview^2", "tagline"],
                            "type": "best_fields",
                            "analyzer": "movies_search_analyzer",
                            "boost": 3
                        }
                    },
                    {
                        "match_phrase_prefix": {
                            "title": {"query": q, "boost": 2}
                        }
                    },
                    {
                        "wildcard": {
                            "title.keyword": {
                                "value": f"*{q}*",
                                "case_insensitive": True,
                                "boost": 1
                            }
                        }
                    }
                ],
                "minimum_should_match": 1,
                "filter": filters
            }
        }

        # function_score : score final = score textuel × log(popularité)
        # log() évite que les films ultra-populaires écrasent complètement la pertinence textuelle
        query = {
            "function_score": {
                "query": base_query,
                "functions": [
                    {
                        "field_value_factor": {
                            "field":    "popularity",
                            "modifier": "sqrt",
                            "factor":   2.0,
                            "missing":  1
                        }
                    }
                ],
                "boost_mode": "multiply"
            }
        }
    else:
        query = {
            "bool": {
                "must": [{"match_all": {}}],
                "filter": filters
            }
        }

    body = {
        "from": (page - 1) * page_size,
        "size": page_size,
        "query": query,
        "sort": SORT_OPTIONS.get(sort, SORT_OPTIONS["relevance"]),
        "_source": [
            "title", "overview", "genres", "original_language",
            "release_date", "vote_average", "vote_count", "popularity",
            "runtime", "status", "tagline", "poster_path"
        ]
    }

    if q:
        body["highlight"] = {
            "fields": {
                "title":    {"number_of_fragments": 0},
                "overview": {"fragment_size": 200, "number_of_fragments": 1}
            },
            "pre_tags":  ["<mark>"],
            "post_tags": ["</mark>"]
        }

    return body


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/search")
def search():
    q         = request.args.get("q", "").strip()
    genre     = request.args.get("genre", "").strip()
    language  = request.args.get("language", "").strip()
    year_from = request.args.get("year_from", "").strip()
    year_to   = request.args.get("year_to", "").strip()
    sort      = request.args.get("sort", "relevance").strip()
    page      = max(1, int(request.args.get("page", 1)))
    page_size = 10

    body = build_query(q, genre, language, year_from, year_to, sort, page, page_size)

    resp  = es.search(index=INDEX, body=body)
    total = resp["hits"]["total"]["value"]
    hits  = []

    for hit in resp["hits"]["hits"]:
        src        = hit["_source"]
        highlights = hit.get("highlight", {})
        hits.append({
            "id":           hit["_id"],
            "score":        round(hit["_score"] or 0, 2),
            "title":        highlights.get("title",    [src.get("title",    "")])[0],
            "overview":     highlights.get("overview", [src.get("overview", "")])[0],
            "genres":       src.get("genres", []),
            "language":     src.get("original_language", ""),
            "release_date": src.get("release_date", ""),
            "vote_average": src.get("vote_average", 0),
            "vote_count":   src.get("vote_count", 0),
            "popularity":   src.get("popularity", 0),
            "runtime":      src.get("runtime", 0),
            "status":       src.get("status", ""),
            "tagline":      src.get("tagline", ""),
            "poster_path":  src.get("poster_path", ""),
        })

    return jsonify({
        "total":     total,
        "page":      page,
        "page_size": page_size,
        "pages":     (total + page_size - 1) // page_size,
        "hits":      hits
    })


@app.route("/api/aggregations")
def aggregations():
    body = {
        "size": 0,
        "aggs": {
            "genres": {
                "terms": {"field": "genres", "size": 50, "order": {"_count": "desc"}}
            },
            "languages": {
                "terms": {"field": "original_language", "size": 30, "order": {"_count": "desc"}}
            }
        }
    }
    resp = es.search(index=INDEX, body=body)
    return jsonify({
        "genres":    [b["key"] for b in resp["aggregations"]["genres"]["buckets"]],
        "languages": [b["key"] for b in resp["aggregations"]["languages"]["buckets"]]
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
