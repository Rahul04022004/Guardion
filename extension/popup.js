/**
 * Guardion — Popup Script
 * Loads stats from chrome.storage and displays them in the popup UI.
 * Handles toggle settings for protection and auto-sanitize.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // ── Load Stats ──
  try {
    const response = await chrome.runtime.sendMessage({ action: "getStats" });
    if (response) {
      document.getElementById("totalCount").textContent = response.total || 0;
      document.getElementById("allowedCount").textContent = response.allowed || 0;
      document.getElementById("warnedCount").textContent = response.warned || 0;
      document.getElementById("blockedCount").textContent = response.blocked || 0;
    }
  } catch (err) {
    console.error("[Guardion] Failed to load stats:", err);
  }

  // ── Load Settings ──
  const settings = await chrome.storage.local.get("guardion_settings");
  const config = settings.guardion_settings || {
    protection: true,
    sanitize: false,
  };

  const toggleProtection = document.getElementById("toggleProtection");
  const toggleSanitize = document.getElementById("toggleSanitize");
  const statusBadge = document.getElementById("statusBadge");

  toggleProtection.checked = config.protection;
  toggleSanitize.checked = config.sanitize;

  updateStatusBadge(config.protection);

  // ── Settings Change Handlers ──
  toggleProtection.addEventListener("change", async () => {
    config.protection = toggleProtection.checked;
    await chrome.storage.local.set({ guardion_settings: config });
    updateStatusBadge(config.protection);
  });

  toggleSanitize.addEventListener("change", async () => {
    config.sanitize = toggleSanitize.checked;
    await chrome.storage.local.set({ guardion_settings: config });
  });

  function updateStatusBadge(isActive) {
    if (isActive) {
      statusBadge.textContent = "● Protected";
      statusBadge.className = "status-badge status-active";
    } else {
      statusBadge.textContent = "● Disabled";
      statusBadge.className = "status-badge status-inactive";
    }
  }
});
