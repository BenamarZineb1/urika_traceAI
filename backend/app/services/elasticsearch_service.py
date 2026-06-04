from elasticsearch import Elasticsearch
from app.config import settings
from app.models.trace import Trace

class ElasticsearchService:
    def __init__(self):
        self.es = Elasticsearch(settings.ES_URL)
        self.index = settings.INDEX_NAME

    def get_traces(self) -> list[Trace]:
        try:
            res = self.es.search(index=self.index, query={"match_all": {}}, size=20)
            traces = []
            for hit in res['hits']['hits']:
                traces.append(Trace(**hit['_source']))
            return traces
        except Exception as e:
            print(f"❌ Erreur de lecture Elasticsearch: {e}")
            return []

    def get_trace_by_id(self, trace_id: str) -> dict | None:
        try:
            # Modification validée : Utilisation du type 'term' sur le sous-champ '.keyword'
            res = self.es.search(
                index=self.index,
                query={"term": {"trace_id.keyword": trace_id}}
            )
            hits = res['hits']['hits']
            if hits:
                return hits[0]['_source']
            return None
        except Exception as e:
            print(f"❌ Erreur de recherche Elasticsearch pour la trace {trace_id}: {e}")
            return None

es_service = ElasticsearchService()