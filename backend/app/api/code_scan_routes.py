"""
Code Scan API Routes
Endpoints for pre-push code vulnerability scanning.
Supports both JSON (paste code) and multipart file upload.
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.code_scanner import scan_code

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Code Scanner"])


# ──────────────────── Request / Response Schemas ────────────────────

class CodeScanRequest(BaseModel):
    """JSON request: paste code directly."""
    code: str
    filename: str = ""  # Optional filename for language detection


class VulnerabilityItem(BaseModel):
    type: str
    severity: str
    line: int
    code_snippet: str
    description: str


class CodeScanResponse(BaseModel):
    """Structured scan results."""
    vulnerabilities: list[VulnerabilityItem]
    security_score: int
    total_lines: int
    language_hint: str
    summary: dict  # {"CRITICAL": n, "HIGH": n, "MEDIUM": n}


# ──────────────────── Endpoints ────────────────────

@router.post("/scan_code", response_model=CodeScanResponse)
async def scan_code_text(request: CodeScanRequest):
    """
    Scan pasted source code for security vulnerabilities.

    Accepts raw code as a JSON string.
    Returns vulnerability findings and a security score (0-100).
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    logger.info(f"Code scan requested — {len(request.code)} chars, filename='{request.filename}'")
    result = scan_code(request.code, filename=request.filename)

    return CodeScanResponse(
        vulnerabilities=[
            VulnerabilityItem(
                type=v.type,
                severity=v.severity,
                line=v.line,
                code_snippet=v.code_snippet,
                description=v.description,
            )
            for v in result.vulnerabilities
        ],
        security_score=result.security_score,
        total_lines=result.total_lines,
        language_hint=result.language_hint,
        summary=result.summary,
    )


@router.post("/scan_code_file", response_model=CodeScanResponse)
async def scan_code_file(file: UploadFile = File(...)):
    """
    Scan an uploaded source code file for security vulnerabilities.

    Accepts a multipart file upload.
    Returns vulnerability findings and a security score (0-100).
    """
    # Validate file size (max 1 MB for source code)
    MAX_SIZE = 1_048_576
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 1 MB)")

    if not contents.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Decode as UTF-8 text
    try:
        code_text = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be a UTF-8 text file")

    filename = file.filename or ""
    logger.info(f"Code file scan — {len(code_text)} chars, file='{filename}'")
    result = scan_code(code_text, filename=filename)

    return CodeScanResponse(
        vulnerabilities=[
            VulnerabilityItem(
                type=v.type,
                severity=v.severity,
                line=v.line,
                code_snippet=v.code_snippet,
                description=v.description,
            )
            for v in result.vulnerabilities
        ],
        security_score=result.security_score,
        total_lines=result.total_lines,
        language_hint=result.language_hint,
        summary=result.summary,
    )
