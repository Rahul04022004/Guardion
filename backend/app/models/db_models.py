"""
Guardion Database Models (SQLAlchemy ORM)
Stores prompt analysis logs, repository scan results, and vulnerabilities.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class PromptLog(Base):
    """Stores every prompt analysis request and its result."""

    __tablename__ = "prompt_logs"

    id = Column(Integer, primary_key=True, index=True)
    prompt_text = Column(Text, nullable=False)
    risk_score = Column(Float, default=0.0)
    decision = Column(String(10), default="allow")  # allow / warn / block
    detected_categories = Column(String(500), default="")  # comma-separated
    source_site = Column(String(200), default="unknown")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RepoScan(Base):
    """Stores repository scan metadata and overall security score."""

    __tablename__ = "repo_scans"

    id = Column(Integer, primary_key=True, index=True)
    repo_url = Column(String(500), nullable=False)
    dependencies_scanned = Column(Integer, default=0)
    total_vulnerabilities = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    security_score = Column(Integer, default=100)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship to individual vulnerabilities
    vulnerabilities = relationship("Vulnerability", back_populates="scan")


class Vulnerability(Base):
    """Individual vulnerability found in a repository scan."""

    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("repo_scans.id"), nullable=False)
    package_name = Column(String(200), nullable=False)
    package_version = Column(String(100), default="unknown")
    cve_id = Column(String(50), default="N/A")
    cvss_score = Column(Float, default=0.0)
    severity = Column(String(20), default="UNKNOWN")
    description = Column(Text, default="")
    fix_suggestion = Column(Text, default="")

    scan = relationship("RepoScan", back_populates="vulnerabilities")
