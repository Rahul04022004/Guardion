"""
Dashboard API Routes
Provides aggregated metrics and recent activity for the React dashboard.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.schemas import DashboardResponse, PromptMetrics, RepoMetrics
from app.models.db_models import PromptLog, RepoScan

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: Session = Depends(get_db)):
    """
    Return aggregated security metrics for the admin dashboard.
    Combines prompt analysis stats and repository scan stats.
    """

    # ── Prompt Metrics ──
    total_prompts = db.query(func.count(PromptLog.id)).scalar() or 0
    blocked = db.query(func.count(PromptLog.id)).filter(PromptLog.decision == "block").scalar() or 0
    warnings = db.query(func.count(PromptLog.id)).filter(PromptLog.decision == "warn").scalar() or 0
    allowed = db.query(func.count(PromptLog.id)).filter(PromptLog.decision == "allow").scalar() or 0

    # Count prompts with credential-related detections
    credential_leaks = db.query(func.count(PromptLog.id)).filter(
        PromptLog.detected_categories.like("%api_key%")
        | PromptLog.detected_categories.like("%password%")
        | PromptLog.detected_categories.like("%auth_token%")
        | PromptLog.detected_categories.like("%private_key%")
        | PromptLog.detected_categories.like("%aws_key%")
        | PromptLog.detected_categories.like("%github_token%")
        | PromptLog.detected_categories.like("%generic_secret%")
    ).scalar() or 0

    prompt_metrics = PromptMetrics(
        total_prompts=total_prompts,
        blocked=blocked,
        warnings=warnings,
        allowed=allowed,
        credential_leaks=credential_leaks,
    )

    # ── Repo Metrics ──
    total_scans = db.query(func.count(RepoScan.id)).scalar() or 0
    total_vulns = db.query(func.sum(RepoScan.total_vulnerabilities)).scalar() or 0
    critical = db.query(func.sum(RepoScan.critical_count)).scalar() or 0
    high = db.query(func.sum(RepoScan.high_count)).scalar() or 0
    medium = db.query(func.sum(RepoScan.medium_count)).scalar() or 0
    low = db.query(func.sum(RepoScan.low_count)).scalar() or 0

    repo_metrics = RepoMetrics(
        total_scans=total_scans,
        total_vulnerabilities=total_vulns,
        critical=critical,
        high=high,
        medium=medium,
        low=low,
    )

    # ── Recent Activity ──
    recent_prompts_db = (
        db.query(PromptLog)
        .order_by(PromptLog.created_at.desc())
        .limit(10)
        .all()
    )
    recent_prompts = [
        {
            "id": p.id,
            "prompt_preview": p.prompt_text[:100] + "..." if len(p.prompt_text) > 100 else p.prompt_text,
            "risk_score": p.risk_score,
            "decision": p.decision,
            "categories": p.detected_categories,
            "source": p.source_site,
            "created_at": p.created_at.isoformat() if p.created_at else "",
        }
        for p in recent_prompts_db
    ]

    recent_scans_db = (
        db.query(RepoScan)
        .order_by(RepoScan.created_at.desc())
        .limit(10)
        .all()
    )
    recent_scans = [
        {
            "id": s.id,
            "repo_url": s.repo_url,
            "dependencies_scanned": s.dependencies_scanned,
            "total_vulnerabilities": s.total_vulnerabilities,
            "security_score": s.security_score,
            "critical": s.critical_count,
            "high": s.high_count,
            "medium": s.medium_count,
            "low": s.low_count,
            "created_at": s.created_at.isoformat() if s.created_at else "",
        }
        for s in recent_scans_db
    ]

    return DashboardResponse(
        prompt_metrics=prompt_metrics,
        repo_metrics=repo_metrics,
        recent_prompts=recent_prompts,
        recent_scans=recent_scans,
    )
