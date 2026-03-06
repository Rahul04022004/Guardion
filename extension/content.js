/**
 * Guardion — Content Script
 * Injected into AI chat sites (ChatGPT, Claude, Gemini).
 * Intercepts prompt submission, sends text to Guardion backend for analysis,
 * and blocks/warns based on the response.
 */

(function () {
  "use strict";

  const SITE = window.location.hostname;
  let isProcessing = false;

  console.log(`[Guardion] Content script loaded on ${SITE}`);

  // ──────────────────── Prompt Interception ────────────────────

  /**
   * Observe the DOM for submit actions. We intercept at the keydown (Enter)
   * and button click level to catch prompts before they are sent.
   */
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("click", handleClick, true);

  /**
   * Intercept Enter key press in chat input areas.
   */
  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !isProcessing) {
      const promptText = getPromptText();
      if (promptText && promptText.trim().length > 0) {
        event.preventDefault();
        event.stopPropagation();
        processPrompt(promptText, event);
      }
    }
  }

  /**
   * Intercept send button clicks.
   */
  function handleClick(event) {
    if (isProcessing) return;

    const button = event.target.closest("button");
    if (button && isSendButton(button)) {
      const promptText = getPromptText();
      if (promptText && promptText.trim().length > 0) {
        event.preventDefault();
        event.stopPropagation();
        processPrompt(promptText, event);
      }
    }
  }

  /**
   * Check if a button element is the send/submit button.
   */
  function isSendButton(button) {
    const ariaLabel = (button.getAttribute("aria-label") || "").toLowerCase();
    const testId = button.getAttribute("data-testid") || "";

    return (
      ariaLabel.includes("send") ||
      ariaLabel.includes("submit") ||
      testId.includes("send") ||
      button.querySelector('svg[data-icon="send"]') !== null ||
      button.classList.toString().toLowerCase().includes("send")
    );
  }

  /**
   * Extract the current prompt text from the chat input.
   * Supports ChatGPT, Claude, and Gemini input selectors.
   */
  function getPromptText() {
    // ChatGPT / chatgpt.com
    const chatgptInput =
      document.querySelector("#prompt-textarea") ||
      document.querySelector("textarea[data-id='root']") ||
      document.querySelector('div[contenteditable="true"][id="prompt-textarea"]');

    // Claude
    const claudeInput =
      document.querySelector('div[contenteditable="true"].ProseMirror') ||
      document.querySelector('fieldset div[contenteditable="true"]');

    // Gemini
    const geminiInput =
      document.querySelector(".ql-editor") ||
      document.querySelector('div[contenteditable="true"][aria-label]');

    // Generic fallback
    const genericInput =
      document.querySelector('textarea') ||
      document.querySelector('div[contenteditable="true"]');

    const input = chatgptInput || claudeInput || geminiInput || genericInput;

    if (!input) return "";

    return input.innerText || input.textContent || input.value || "";
  }

  // ──────────────────── Analysis Pipeline ────────────────────

  /**
   * Send prompt to Guardion backend via the background service worker,
   * then act on the decision: allow, warn, or block.
   */
  async function processPrompt(promptText, originalEvent) {
    isProcessing = true;
    showBanner("Scanning prompt for sensitive data...", "info");

    try {
      const response = await chrome.runtime.sendMessage({
        action: "analyzePrompt",
        prompt: promptText,
        source: SITE,
      });

      if (!response) {
        // No response — allow by default
        allowPrompt(originalEvent);
        return;
      }

      switch (response.decision) {
        case "block":
          showBanner(
            `⛔ BLOCKED — Sensitive data detected: ${response.detected_categories.join(", ")} (Risk: ${(response.risk_score * 100).toFixed(0)}%)`,
            "block"
          );
          // Offer sanitized version if available
          if (response.sanitized_prompt) {
            showSanitizeOption(response.sanitized_prompt);
          }
          break;

        case "warn":
          showBanner(
            `⚠️ WARNING — Possible sensitive data: ${response.detected_categories.join(", ")} (Risk: ${(response.risk_score * 100).toFixed(0)}%)`,
            "warn",
            () => allowPrompt(originalEvent)
          );
          break;

        case "allow":
        default:
          removeBanner();
          allowPrompt(originalEvent);
          break;
      }
    } catch (error) {
      console.error("[Guardion] Error:", error);
      // Fail-open: allow if something goes wrong
      allowPrompt(originalEvent);
    } finally {
      isProcessing = false;
    }
  }

  /**
   * Allow the prompt to go through by re-dispatching the original event.
   */
  function allowPrompt(originalEvent) {
    isProcessing = true; // Prevent re-interception

    // Find and click the send button, or simulate Enter
    const sendBtn =
      document.querySelector('button[data-testid="send-button"]') ||
      document.querySelector('button[aria-label="Send"]') ||
      document.querySelector('button[aria-label="Send message"]') ||
      document.querySelector('button.send-button');

    if (sendBtn) {
      sendBtn.click();
    } else {
      // Simulate Enter keypress
      const input = document.querySelector('textarea') ||
        document.querySelector('div[contenteditable="true"]');
      if (input) {
        input.focus();
        const enterEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
        });
        input.dispatchEvent(enterEvent);
      }
    }

    setTimeout(() => {
      isProcessing = false;
    }, 500);
  }

  // ──────────────────── UI Banners ────────────────────

  /**
   * Show a notification banner at the top of the page.
   * @param {string} message - Banner text
   * @param {string} type - "info" | "warn" | "block"
   * @param {Function|null} onProceed - Callback for "Send Anyway" button (warn only)
   */
  function showBanner(message, type, onProceed = null) {
    removeBanner();

    const banner = document.createElement("div");
    banner.id = "guardion-banner";
    banner.className = `guardion-banner guardion-${type}`;

    const icon = type === "block" ? "🛡️" : type === "warn" ? "⚠️" : "🔍";

    banner.innerHTML = `
      <div class="guardion-banner-content">
        <span class="guardion-icon">${icon}</span>
        <span class="guardion-message">${message}</span>
        <div class="guardion-actions">
          ${
            onProceed
              ? '<button class="guardion-btn guardion-btn-proceed">Send Anyway</button>'
              : ""
          }
          <button class="guardion-btn guardion-btn-dismiss">Dismiss</button>
        </div>
      </div>
    `;

    document.body.prepend(banner);

    // Event listeners
    const dismissBtn = banner.querySelector(".guardion-btn-dismiss");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", removeBanner);
    }

    const proceedBtn = banner.querySelector(".guardion-btn-proceed");
    if (proceedBtn && onProceed) {
      proceedBtn.addEventListener("click", () => {
        removeBanner();
        onProceed();
      });
    }

    // Auto-dismiss info banners after 3s
    if (type === "info") {
      setTimeout(removeBanner, 3000);
    }

    // Auto-dismiss block/warn after 15s
    if (type === "block" || type === "warn") {
      setTimeout(removeBanner, 15000);
    }
  }

  /**
   * Show option to use sanitized prompt.
   */
  function showSanitizeOption(sanitizedPrompt) {
    const banner = document.getElementById("guardion-banner");
    if (!banner) return;

    const sanitizeBtn = document.createElement("button");
    sanitizeBtn.className = "guardion-btn guardion-btn-sanitize";
    sanitizeBtn.textContent = "Send Sanitized Version";
    sanitizeBtn.addEventListener("click", () => {
      // Replace the input text with the sanitized version
      const input =
        document.querySelector("#prompt-textarea") ||
        document.querySelector('div[contenteditable="true"]') ||
        document.querySelector("textarea");

      if (input) {
        if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
          input.value = sanitizedPrompt;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
          input.innerText = sanitizedPrompt;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      removeBanner();
    });

    const actions = banner.querySelector(".guardion-actions");
    if (actions) {
      actions.prepend(sanitizeBtn);
    }
  }

  /**
   * Remove the Guardion banner from the page.
   */
  function removeBanner() {
    const banner = document.getElementById("guardion-banner");
    if (banner) {
      banner.remove();
    }
  }
})();
