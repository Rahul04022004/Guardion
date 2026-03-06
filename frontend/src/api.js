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
 */
export async function analyzePrompt(prompt, source = "dashboard") {
  const res = await fetch(`${API_BASE}/analyze_prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, source }),
  });
  if (!res.ok) throw new Error(`Analyze API error: ${res.status}`);
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
