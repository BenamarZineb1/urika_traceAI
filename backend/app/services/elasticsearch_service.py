from elasticsearch import Elasticsearch
from app.config import settings

class ElasticsearchService:
    def __init__(self):
        self.es = Elasticsearch(settings.ES_URL)

    def get_traces(self, limit: int = 50):
        try:
            resp = self.es.search(index=settings.INDEX_NAME, query={"match_all": {}}, size=limit)
            return [hit["_source"] for hit in resp["hits"]["hits"]]
        except Exception as e:
            print(f"Erreur ES Search: {e}")
            return []

    def get_trace_by_id(self, trace_id: str):
        # On utilise une requête 'term' pour trouver l'ID exact
        query = {
            "query": {
                "match": { "trace_id": trace_id }
            }
        }
        try:
            resp = self.es.search(index=settings.INDEX_NAME, body=query)
            hits = resp["hits"]["hits"]
            if hits:
                return hits[0]["_source"]
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération de la trace {trace_id}: {e}")
            return None

es_service = ElasticsearchService()