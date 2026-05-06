from pydantic import BaseModel
from typing import Literal, Optional

class Trace(BaseModel):
    trace_id: str
    timestamp: str
    service: str
    endpoint: str
    duration_ms: int
    status: Literal["ok", "slow", "error"]
    message: Optional[str] = None  # Le contenu brut du log pour l'IA

class AnalysisResponse(BaseModel):
    trace_id: str
    diagnostic: str
    recommandation: str
    suggested_role: str  # Pour aider le Workflow Java à assigner la tâche