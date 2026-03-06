/**
 * Guardion — Background Service Worker (Manifest V3)
 * Handles communication between content script and the Guardion backend API.
 */

const API_BASE = "http://localhost:8000/api";

/**
 * Listen for messages from the content script.
 * Expected message format: { action: "analyzePrompt", prompt: "...", source: "..." }
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzePrompt") {
    analyzePrompt(message.prompt, message.source)
      .then((result) => sendResponse(result))
      .catch((err) =>
        sendResponse({
          error: true,
          risk_score: 0,
          decision: "allow",
          detected_categories: [],
          message: err.message,
        })
      );

    // Return true to indicate async response
    return true;
  }

  if (message.action === "getStats") {
    getStats()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ error: true, message: err.message }));
    return true;
  }
});

/**
 * Send prompt to Guardion backend for analysis.
 */
async function analyzePrompt(prompt, source) {
  try {
    const response = await fetch(`${API_BASE}/analyze_prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, source }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Update local stats
    await updateLocalStats(data.decision);

    return data;
  } catch (error) {
    console.error("[Guardion] API call failed:", error);
    // Fail-open: allow the prompt if the backend is unreachable
    return {
      risk_score: 0,
      decision: "allow",
      detected_categories: [],
      error: true,
      message: "Backend unreachable — prompt allowed by default",
    };
  }
}

/**
 * Update local extension stats stored in chrome.storage.
 */
async function updateLocalStats(decision) {
  const data = await chrome.storage.local.get("guardion_stats");
  const stats = data.guardion_stats || {
    total: 0,
    allowed: 0,
    warned: 0,
    blocked: 0,
  };

  stats.total++;
  if (decision === "allow") stats.allowed++;
  else if (decision === "warn") stats.warned++;
  else if (decision === "block") stats.blocked++;

  await chrome.storage.local.set({ guardion_stats: stats });
}

/**
 * Get local stats for the popup.
 */
async function getStats() {
  const data = await chrome.storage.local.get("guardion_stats");
  return data.guardion_stats || { total: 0, allowed: 0, warned: 0, blocked: 0 };
}
