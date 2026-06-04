import ollama
import json
import re

class AIService:
    def generate_diagnostic(self, trace_data: dict, force: bool = False) -> dict:
        trace_id = trace_data.get("trace_id") or trace_data.get("traceId")

        if force:
            print(f"🔥 [Ollama] FORCE recalculation pour la trace {trace_id}")

        # Prompt ultra-simplifié et direct, taillé pour Llama 3.2 1B
        prompt_system = (
            "You are a DevOps expert. Analyze this log trace and return ONLY a JSON object.\n"
            "The JSON must contain exactly these 3 keys:\n"
            '- "diagnostic": (Short technical explanation of the failure in French)\n'
            '- "recommandation": (Action to fix the issue in French)\n'
            '- "suggested_role": (Choose exactly one from: BACKEND, DEVOPS, DBA, SECURITY)\n'
            "Do not include any intro, markdown formatting, or outro. Just the raw JSON object."
        )

        try:
            response = ollama.generate(
                model="llama3.2:1b",
                prompt=f"{prompt_system}\n\nTRACE TO ANALYZE:\n{json.dumps(trace_data)}",
                format="json"
            )

            raw_response = response.get("response", "").strip()
            
            # 🔍 Pour t'aider à débugger : on affiche la réponse brute de l'IA dans ton terminal Python
            print(f"🤖 [Ollama Raw Output]: {raw_response}")

            # Nettoyage des backticks si le modèle en a mis malgré l'ordre
            raw_response = re.sub(r"```json|```", "", raw_response).strip()
            parsed = json.loads(raw_response)

            # Normalisation des clés pour éviter les erreurs de casse (ex: Diagnostic vs diagnostic)
            normalized_parsed = {k.lower(): v for k, v in parsed.items()}

            return {
                "diagnostic": normalized_parsed.get("diagnostic", "Erreur d'analyse des clés par le modèle."),
                "recommandation": normalized_parsed.get("recommandation", "Vérifier manuellement le microservice concerné."),
                "suggested_role": str(normalized_parsed.get("suggested_role", "DEVOPS")).upper()
            }

        except Exception as e:
            print(f"❌ Ollama error: {e}")
            return {
                "diagnostic": "Échec critique de l'analyse automatisée par l'I.A.",
                "recommandation": "Analyse manuelle requise via les terminaux système.",
                "suggested_role": "DEVOPS"
            }

ai_service = AIService()