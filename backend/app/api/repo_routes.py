"""
Repository Scanner API Routes
Handles repository vulnerability scanning and AI remediation requests.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import (
    RepoScanRequest, RepoScanResponse, VulnerabilityItem,
    RemediationRequest, RemediationResponse,
)
from app.models.db_models import RepoScan, Vulnerability
from app.services.repo_scanner import scan_repository
from app.services.gemini_service import get_remediation

router = APIRouter(prefix="/api", tags=["Repository Scanner"])


@router.post("/scan_repo", response_model=RepoScanResponse)
async def scan_repo_endpoint(
    request: RepoScanRequest,
    db: Session = Depends(get_db),
):
    """
    Scan a GitHub repository for dependency vulnerabilities.

    Pipeline:
      1. Clone the repo (shallow)
      2. Extract dependencies from package.json, requirements.txt, pom.xml
      3. Query OSV API for each dependency
      4. Calculate security score
      5. Store results in database
      6. Return full vulnerability report
    """
    # Run the scan pipeline
    result = await scan_repository(request.repo_url)

    # Persist scan results to database
    scan = RepoScan(
        repo_url=result["repo_url"],
        dependencies_scanned=result["dependencies_scanned"],
        total_vulnerabilities=len(result["vulnerabilities"]),
        critical_count=result["critical_count"],
        high_count=result["high_count"],
        medium_count=result["medium_count"],
        low_count=result["low_count"],
        security_score=result["security_score"],
    )
    db.add(scan)
    db.flush()  # Get scan.id

    # Store individual vulnerabilities
    for vuln in result["vulnerabilities"]:
        v = Vulnerability(
            scan_id=scan.id,
            package_name=vuln["package"],
            package_version=vuln.get("version", "unknown"),
            cve_id=vuln.get("cve_id", "N/A"),
            cvss_score=vuln.get("cvss_score", 0.0),
            severity=vuln.get("severity", "UNKNOWN"),
            description=vuln.get("description", ""),
        )
        db.add(v)

    db.commit()

    # Build response
    vuln_items = [
        VulnerabilityItem(
            package=v["package"],
            version=v.get("version", "unknown"),
            cve=v.get("cve_id", "N/A"),
            cvss=v.get("cvss_score", 0.0),
            severity=v.get("severity", "UNKNOWN"),
            description=v.get("description", ""),
        )
        for v in result["vulnerabilities"]
    ]

    return RepoScanResponse(
        repo_url=result["repo_url"],
        dependencies_scanned=result["dependencies_scanned"],
        vulnerabilities=vuln_items,
        critical_count=result["critical_count"],
        high_count=result["high_count"],
        medium_count=result["medium_count"],
        low_count=result["low_count"],
        security_score=result["security_score"],
    )


@router.post("/remediate", response_model=RemediationResponse)
async def remediation_endpoint(request: RemediationRequest):
    """
    Get AI-powered remediation suggestions for a specific vulnerability.

    Pipeline:
      1. Try Gemini context-aware analysis (gemini-1.5-flash)
      2. Fall back to template if Gemini is unavailable
    """
    result = await get_remediation(
        package_name=request.package_name,
        cve_id=request.cve_id,
        description=request.description,
        version=getattr(request, 'version', 'unknown'),
        cvss_score=getattr(request, 'cvss_score', 0.0),
    )

    return RemediationResponse(
        explanation=result["explanation"],
        suggested_fix=result["suggested_fix"],
        recommended_version=result.get("recommended_version", "latest"),
        summary=result.get("summary", ""),
        impact=result.get("impact", ""),
        remediation=result.get("remediation", ""),
        recommended_upgrade=result.get("recommended_upgrade", ""),
    )
