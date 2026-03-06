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
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      label: "ALLOWED",
    },
    warn: {
      bg: "bg-amber-500/8",
      border: "border-amber-500/20",
      text: "text-amber-400",
      label: "WARNING",
    },
    block: {
      bg: "bg-red-500/8",
      border: "border-red-500/20",
      text: "text-red-400",
      label: "BLOCKED",
    },
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="card-glass rounded-lg p-6">
        <h2 className="text-base font-semibold text-white mb-0.5">
          Prompt Security Tester
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Test how Guardion detects sensitive information and injection attacks in AI prompts.
        </p>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {examplePrompts.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setPrompt(ex.text)}
              className="px-3 py-1.5 text-xs bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 rounded-md text-slate-400 hover:text-slate-300 transition font-medium"
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
          className="w-full h-32 bg-slate-900/60 border border-slate-700/40 rounded-md p-4 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none"
        />

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !prompt.trim()}
          className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Prompt"
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="card-glass rounded-lg p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Analysis Result</h3>

          {/* Decision banner */}
          {(() => {
            const style = decisionStyles[result.decision] || decisionStyles.allow;
            return (
              <div
                className={`${style.bg} ${style.border} border rounded-md p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-2">
                  {result.decision === "allow" && (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {result.decision === "warn" && (
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  )}
                  {result.decision === "block" && (
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                  <span className={`text-sm font-semibold ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                <span className={`text-xl font-bold ${style.text}`}>
                  {(result.risk_score * 100).toFixed(0)}%
                </span>
              </div>
            );
          })()}

          {/* Detected categories */}
          {result.detected_categories?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Detected Categories
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.detected_categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 bg-red-500/8 border border-red-500/15 rounded-md text-xs text-red-300 font-medium"
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
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Sanitized Output
              </h4>
              <pre className="bg-slate-900/60 border border-slate-700/40 rounded-md p-4 text-sm text-emerald-300/90 whitespace-pre-wrap overflow-auto max-h-48 font-mono">
                {result.sanitized_prompt}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
