from elasticsearch import Elasticsearch
from datetime import datetime, timedelta
import random
import uuid

# Connexion à Elasticsearch
es = Elasticsearch("http://localhost:9200")

INDEX_NAME = "traces-microservices"

def generate_mock_traces():
    # 1. Vérification de la connexion
    try:
        info = es.info()
        print(f"✅ Connecté avec succès à Elasticsearch (Version: {info['version']['number']})")
    except Exception as e:
        print("❌ Erreur de communication avec Elasticsearch.")
        print(f"Détails : {e}")
        print("Vérifie que le conteneur Docker a bien fini de démarrer !")
        return

    # 2. Injection des données
    services = ["auth-service", "payment-api", "database-core", "notification-worker"]
    endpoints = ["/login", "/process-payment", "/query-user", "/send-email"]
    statuses = ["ok", "ok", "ok", "slow", "error"]

    if not es.indices.exists(index=INDEX_NAME):
        es.indices.create(index=INDEX_NAME)
        print(f"📁 Index '{INDEX_NAME}' créé.")

    print("⏳ Injection de 20 traces de test en cours...")

    for _ in range(20):
        status = random.choice(statuses)

        if status == "slow":
            duration = random.randint(1000, 5000)
        elif status == "error":
            duration = random.randint(50, 800)
        else:
            duration = random.randint(20, 300)

        trace_doc = {
            "trace_id": str(uuid.uuid4())[:8],
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 120))).isoformat(),
            "service": random.choice(services),
            "endpoint": random.choice(endpoints),
            "duration_ms": duration,
            "status": status
        }

        es.index(index=INDEX_NAME, document=trace_doc)

    print("✅ Données injectées avec succès dans Elasticsearch !")

if __name__ == "__main__":
    generate_mock_traces()