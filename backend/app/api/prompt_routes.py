"""
Prompt Security API Routes
Handles prompt analysis requests from the Chrome extension.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import PromptAnalysisRequest, PromptAnalysisResponse
from app.models.db_models import PromptLog
from app.services.prompt_analyzer import analyze_prompt, analyze_prompt_combined

router = APIRouter(prefix="/api", tags=["Prompt Security"])


@router.post("/analyze_prompt", response_model=PromptAnalysisResponse)
async def analyze_prompt_endpoint(
    request: PromptAnalysisRequest,
    db: Session = Depends(get_db),
):
    """
    Analyze a prompt for sensitive information.

    Pipeline:
      1. Regex pattern matching (fast, deterministic)
      2. Gemini contextual analysis (catches obfuscated/novel leaks)
      3. Merge: stricter decision wins, categories unioned

    Falls back to regex-only if Gemini is unavailable.
    Called by the Chrome extension before a prompt is sent to an AI chat tool.
    """
    # Combined analysis: regex + Gemini (regex is always the fallback)
    result = await analyze_prompt_combined(request.prompt, sanitize=True)

    # Log the analysis to the database
    log = PromptLog(
        prompt_text=request.prompt[:2000],  # Truncate for storage
        risk_score=result.risk_score,
        decision=result.decision,
        detected_categories=",".join(result.detected_categories),
        source_site=request.source,
    )
    db.add(log)
    db.commit()

    return PromptAnalysisResponse(
        risk_score=result.risk_score,
        decision=result.decision,
        detected_categories=result.detected_categories,
        sanitized_prompt=result.sanitized_prompt,
        reason=result.gemini_reason,
    )
