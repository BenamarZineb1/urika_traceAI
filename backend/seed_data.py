from elasticsearch import Elasticsearch
from datetime import datetime, timedelta
import random
import uuid

es = Elasticsearch("http://localhost:9200")
INDEX_NAME = "traces-microservices"

def generate_mock_traces():
    try:
        info = es.info()
        print(f"✅ Connecté à Elasticsearch (Version: {info['version']['number']})")
    except Exception as e:
        print(f"❌ Erreur de communication: {e}")
        return

    services = ["auth-service", "payment-api", "database-core", "notification-worker"]
    endpoints = ["/login", "/process-payment", "/query-user", "/send-email"]
    statuses = ["ok", "ok", "ok", "slow", "error"]

    if not es.indices.exists(index=INDEX_NAME):
        es.indices.create(index=INDEX_NAME)
        print(f"📁 Index '{INDEX_NAME}' créé.")

    for _ in range(20):
        status = random.choice(statuses)
        duration = random.randint(1000, 5000) if status == "slow" else (random.randint(50, 800) if status == "error" else random.randint(20, 300))

        trace_doc = {
            "trace_id": str(uuid.uuid4())[:8],
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 120))).isoformat(),
            "service": random.choice(services),
            "endpoint": random.choice(endpoints),
            "duration_ms": duration,
            "status": status
        }
        es.index(index=INDEX_NAME, document=trace_doc)

    print("✅ 20 Traces de test injectées avec succès !")

if __name__ == "__main__":
    generate_mock_traces()