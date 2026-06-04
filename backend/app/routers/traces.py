import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from app.models.trace import Trace, AnalysisResponse
from app.services.elasticsearch_service import es_service
from app.services.ai_service import ai_service

# Suppression du préfixe restrictif pour matcher l'URL Angular /api/traces et /api/analyze
router = APIRouter(prefix="/api", tags=["traces"])

SPRING_BOOT_URL = "http://localhost:8088/api/tasks"

async def send_task_to_spring_boot(payload: dict):
    async with httpx.AsyncClient() as client:
        try:
            print(f"🚀 [FastAPI → Spring Boot] Transmission du ticket pour la trace: {payload['traceId']}")
            response = await client.post(SPRING_BOOT_URL, json=payload)
            response.raise_for_status()
            print("✅ [FastAPI] Synchronisation avec Spring Boot réussie.")
        except Exception as e:
            print(f"❌ [FastAPI] Impossible de joindre Spring Boot: {e}")

@router.get("/traces", response_model=list[Trace])
def read_traces():
    return es_service.get_traces()

@router.get("/analyze/{trace_id}", response_model=AnalysisResponse)
async def analyze(trace_id: str, background_tasks: BackgroundTasks, force: bool = Query(False)):
    
    trace_dict = es_service.get_trace_by_id(trace_id)
    if not trace_dict:
        raise HTTPException(status_code=404, detail="Trace introuvable dans le cluster Elasticsearch")

    # Calcul du diagnostic LLM
    ai_result = ai_service.generate_diagnostic(trace_dict, force=force)

    analysis_response = AnalysisResponse(
        trace_id=trace_id,
        diagnostic=ai_result.get("diagnostic"),
        recommandation=ai_result.get("recommandation"),
        suggested_role=ai_result.get("suggested_role")
    )

    # Payload formaté au contrat exact de TaskCreationDTO.java de Spring Boot
    task_payload = {
        "title": f"Incident Majeur - [{trace_dict.get('service', 'UNKNOWN-SERVICE').upper()}]",
        "description": f"DIAGNOSTIC IA :\n{analysis_response.diagnostic}\n\nACTION RECOMMANDÉE :\n{analysis_response.recommandation}",
        "requiredSkill": analysis_response.suggested_role.upper(),
        "priority": 4 if trace_dict.get("status") == "slow" else 5,
        "traceId": trace_id,
        "workflowId": 1,
        "force": force
    }

    # Dispatch asynchrone pour ne pas bloquer le rafraîchissement d'Angular
    background_tasks.add_task(send_task_to_spring_boot, task_payload)

    return analysis_response