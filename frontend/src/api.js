/**
 * Guardion API Service
 * Centralizes all backend API calls for the dashboard.
 */

const API_BASE = "/api";

/**
 * Fetch dashboard metrics and recent activity.
 */
export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`);
  return res.json();
}

/**
 * Analyze a prompt for sensitive data (for testing from dashboard).
 * @param {string} prompt - The prompt text to analyze.
 * @param {string} source - Origin identifier.
 * @param {boolean} useGemini - Whether to also call Gemini (costs API quota).
 */
export async function analyzePrompt(prompt, source = "dashboard", useGemini = false) {
  const res = await fetch(`${API_BASE}/analyze_prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, source, use_gemini: useGemini }),
  });
  if (!res.ok) throw new Error(`Analyze API error: ${res.status}`);
  return res.json();
}

/**
 * Get Gemini API quota and cache status.
 */
export async function getQuotaStatus() {
  const res = await fetch(`${API_BASE}/quota_status`);
  if (!res.ok) throw new Error(`Quota status API error: ${res.status}`);
  return res.json();
}

/**
 * Scan a GitHub repository for vulnerabilities.
 */
export async function scanRepo(repoUrl) {
  const res = await fetch(`${API_BASE}/scan_repo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  if (!res.ok) throw new Error(`Scan API error: ${res.status}`);
  return res.json();
}

/**
 * Get AI remediation for a vulnerability.
 */
export async function getRemediation(packageName, cveId, description = "") {
  const res = await fetch(`${API_BASE}/remediate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package_name: packageName,
      cve_id: cveId,
      description,
    }),
  });
  if (!res.ok) throw new Error(`Remediation API error: ${res.status}`);
  return res.json();
}

/**
 * Compare prompt classification: Local ML Model vs Gemini API.
 * Returns side-by-side predictions, confidence scores, and a combined decision.
 */
export async function mlCompare(prompt, useGemini = true) {
  const res = await fetch(`${API_BASE}/ml_compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, use_gemini: useGemini }),
  });
  if (!res.ok) throw new Error(`ML Compare API error: ${res.status}`);
  return res.json();
}
