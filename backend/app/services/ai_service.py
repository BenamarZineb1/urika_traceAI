import ollama
import json
import re

class AIService:

    def generate_diagnostic(self, trace_data: dict, force: bool = False) -> dict:
        trace_id = trace_data.get("trace_id") or trace_data.get("traceId") or "unknown"

        if force:
            print(f"🔥 [Ollama] FORCE recalculation pour la trace {trace_id}")

        # 1. Amélioration radicale du Prompt pour un modèle 1B (Direct, simple, avec des exemples)
        prompt_system = """You are an SRE Assistant. Analyze the JSON trace and map it to ONE team.

CRITICAL RULES:
- If status is 'error' -> suggested_role must be 'BACKEND'
- If status is 'slow' -> suggested_role must be 'DEVOPS'
- If endpoint contains 'query' or 'database' -> suggested_role must be 'DBA'
- If endpoint contains 'login' or 'auth' -> suggested_role must be 'SECURITY'

Choose ONLY ONE role from this list: "BACKEND", "DEVOPS", "DBA", "SECURITY". Do not combine them.

Return ONLY this JSON format:
{
  "diagnostic": "Short technical description based on status",
  "recommandation": "Action item",
  "suggested_role": "BACKEND"
}"""

        try:
            # Appel à Ollama avec le format JSON activé
            response = ollama.generate(
                model="llama3.2:1b",
                prompt=(
                    f"{prompt_system}\n\n"
                    f"TRACE TO ANALYZE:\n"
                    f"{json.dumps(trace_data, ensure_ascii=False)}"
                ),
                format="json"
            )

            raw_response = response.get("response", "").strip()
            print(f"🤖 [Ollama Raw Output]: {raw_response}")

            # Nettoyage des backticks Markdown si présents
            raw_response = re.sub(r"```json|```", "", raw_response).strip()
            parsed = json.loads(raw_response)

            # Normalisation des clés en minuscules
            normalized_parsed = {str(k).lower(): v for k, v in parsed.items()}

            # Récupération sécurisée du diagnostic et de la recommandation
            diagnostic = normalized_parsed.get("diagnostic", "Diagnostic indisponible.")
            recommendation = (
                normalized_parsed.get("recommandation")
                or normalized_parsed.get("recommendation")
                or "Analyse manuelle requise."
            )

            # 2. Extraction et nettoyage intelligent du rôle
            raw_role = str(normalized_parsed.get("suggested_role", "")).upper()
            
            # Si le modèle renvoie "BACKEND|DEVOPS", on extrait le premier élément valide
            if "|" in raw_role:
                raw_role = raw_role.split("|")[0].strip()

            # 3. Système d'Heuristique de secours (Le filet de sécurité anti-hallucination)
            # Puisque llama3.2:1b se trompe souvent, Python prend le relais si le rôle est invalide
            allowed_roles = {"BACKEND", "DEVOPS", "DBA", "SECURITY"}
            
            if raw_role not in allowed_roles:
                # Analyse dynamique par mots-clés en Python (Zéro latence)
                endpoint = str(trace_data.get("endpoint", "")).lower()
                status = str(trace_data.get("status", "")).lower()
                service = str(trace_data.get("service", "")).lower()

                if "auth" in endpoint or "login" in endpoint or "auth" in service:
                    final_role = "SECURITY"
                elif "query" in endpoint or "database" in service or "db" in endpoint:
                    final_role = "DBA"
                elif status == "error":
                    final_role = "BACKEND"
                else:
                    final_role = "DEVOPS"
            else:
                final_role = raw_role

            return {
                "diagnostic": diagnostic,
                "recommandation": recommendation,
                "suggested_role": final_role
            }

        except Exception as e:
            print(f"❌ Ollama error: {e}")
            
            # Fallback intelligent même en cas de crash
            status = str(trace_data.get("status", "")).lower()
            return {
                "diagnostic": "Échec critique de l'analyse automatisée.",
                "recommandation": "Analyse manuelle requise.",
                "suggested_role": "BACKEND" if status == "error" else "DEVOPS"
            }
ai_service = AIService()