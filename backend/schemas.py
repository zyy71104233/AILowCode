from pydantic import BaseModel
from typing import Optional, Dict, List

class WSMessage(BaseModel):
    role: str  # pd/architect/developer
    content: str
    actions: List[str]
    metadata: Optional[Dict] = None

class GenerationRequest(BaseModel):
    requirement: str
    stage: str  # prd/design/code
    previous_content: Optional[str] = None
    instruction: Optional[str] = None