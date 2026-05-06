from fastapi import APIRouter, HTTPException
from app.models.trace import Trace, AnalysisResponse
from app.services.elasticsearch_service import es_service
from app.services.ai_service import ai_service
from typing import List

router = APIRouter(prefix="/api", tags=["traces"])

@router.get("/traces", response_model=List[Trace])
def read_traces():
    return es_service.get_traces()

@router.get("/analyze/{trace_id}", response_model=AnalysisResponse)
def analyze(trace_id: str):
    # CORRECTION : On cherche directement la trace par ID dans ES
    trace = es_service.get_trace_by_id(trace_id)

    if not trace:
        raise HTTPException(
            status_code=404,
            detail=f"Trace {trace_id} non trouvée dans l'index Elasticsearch."
        )

    # 2. On lance l'analyse IA
    ai_result = ai_service.generate_diagnostic(trace)

    # 3. Retour à Angular
    return AnalysisResponse(
        trace_id=trace_id,
        diagnostic=ai_result.get("diagnostic", "Diagnostic indisponible"),
        recommandation=ai_result.get("recommandation", "Vérification manuelle requise"),
        suggested_role=ai_result.get("domain", "Backend")
    )