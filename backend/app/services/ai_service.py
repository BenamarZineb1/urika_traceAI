import ollama
import json
import re
import time

class AIService:
    def generate_diagnostic(self, trace_data: dict):
        start_time = time.time()
        trace_id = trace_data.get('trace_id', 'unknown')

        print(f"🤖 [IA] Début de l'analyse pour la trace : {trace_id}")

        error_msg = trace_data.get('message') or "Aucun message d'erreur spécifique trouvé dans les logs."

        # Prompt ultra-strict pour forcer le format JSON
        prompt = f"""
        Tu es un expert SRE et DevOps. Analyse cette erreur technique :
        - Service : {trace_data.get('service')}
        - Endpoint : {trace_data.get('endpoint')}
        - Erreur : {error_msg}

        Réponds EXCLUSIVEMENT sous ce format JSON, sans texte avant ou après :
        {{
            "diagnostic": "Explication courte de la cause",
            "recommandation": "Solution précise",
            "domain": "SECURITY" | "DATABASE" | "FRONTEND" | "INFRA"
        }}
        """

        try:
            # Appel à Ollama
            print(f"⏳ [IA] Llama 3 réfléchit... (cela peut prendre 10-30s)")
            response = ollama.chat(
                model='llama3',
                messages=[{'role': 'user', 'content': prompt}]
            )

            content = response['message']['content']
            print(f"✅ [IA] Réponse brute reçue de Llama.")

            # Nettoyage de la réponse (pour extraire le JSON même si Llama "bavarde")
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(content)

            duration = round(time.time() - start_time, 2)
            print(f"✨ [IA] Analyse terminée en {duration}s pour {trace_id}")
            return result

        except Exception as e:
            print(f"❌ [IA] Erreur critique : {str(e)}")
            return {
                "diagnostic": "Erreur lors de la génération du diagnostic IA.",
                "recommandation": "Veuillez vérifier les logs serveur manuellement.",
                "domain": "INFRA"
            }

ai_service = AIService()