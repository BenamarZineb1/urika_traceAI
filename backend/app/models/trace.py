from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional

class Trace(BaseModel):
    # Permet de lire "trace_id" depuis ES mais de l'exposer de manière flexible
    trace_id: str = Field(validation_alias="trace_id", serialization_alias="traceId")
    timestamp: str
    service: str
    endpoint: str
    duration_ms: int = Field(validation_alias="duration_ms", serialization_alias="durationMs")
    status: Literal["ok", "slow", "error"]
    message: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

class AnalysisResponse(BaseModel):
    trace_id: str = Field(serialization_alias="traceId")
    diagnostic: str
    recommandation: str
    suggested_role: str

    model_config = ConfigDict(populate_by_name=True)