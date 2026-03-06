import { useState } from "react";
import { analyzePrompt } from "../api";

/**
 * PromptTester Component
 * Allows testing prompt analysis directly from the dashboard.
 * Shows detection results, risk score, and sanitized output.
 */
export default function PromptTester({ onAnalyzed }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const examplePrompts = [
    {
      label: "API Key Leak",
      text: 'Can you help me debug this code? My API key is sk-1234567890abcdefghijklmnop and the endpoint is https://api.example.com',
    },
    {
      label: "Password Exposure",
      text: 'I need to connect to the database. The password="SuperSecret123!" and the host is db.internal.company.com',
    },
    {
      label: "Safe Prompt",
      text: "How do I implement a binary search algorithm in Python? Please show me an example with comments.",
    },
    {
      label: "Multi-sensitive",
      text: 'Here is my AWS key AKIAIOSFODNN7EXAMPLE and my token=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh. My email is john@company.com',
    },
  ];

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await analyzePrompt(prompt);
      setResult(data);
      onAnalyzed?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const decisionStyles = {
    allow: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      label: "✅ ALLOWED",
    },
    warn: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      label: "⚠️ WARNING",
    },
    block: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "🚫 BLOCKED",
    },
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">
          🛡️ Prompt Security Tester
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Test how Guardion detects sensitive information in AI prompts.
        </p>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {examplePrompts.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setPrompt(ex.text)}
              className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 rounded-lg text-slate-300 transition"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to analyze for sensitive data..."
          className="w-full h-32 bg-slate-900/50 border border-slate-600/30 rounded-lg p-4 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
        />

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !prompt.trim()}
          className="mt-3 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Analyzing...
            </span>
          ) : (
            "Analyze Prompt"
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Analysis Result</h3>

          {/* Decision banner */}
          {(() => {
            const style = decisionStyles[result.decision] || decisionStyles.allow;
            return (
              <div
                className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-center justify-between`}
              >
                <span className={`text-lg font-bold ${style.text}`}>
                  {style.label}
                </span>
                <span className={`text-2xl font-bold ${style.text}`}>
                  Risk: {(result.risk_score * 100).toFixed(0)}%
                </span>
              </div>
            );
          })()}

          {/* Detected categories */}
          {result.detected_categories?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">
                Detected Sensitive Data:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.detected_categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-300 font-medium"
                  >
                    {cat.replace(/_/g, " ").toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sanitized prompt */}
          {result.sanitized_prompt && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">
                Sanitized Version:
              </h4>
              <pre className="bg-slate-900/50 border border-slate-600/30 rounded-lg p-4 text-sm text-green-300 whitespace-pre-wrap overflow-auto max-h-48">
                {result.sanitized_prompt}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
