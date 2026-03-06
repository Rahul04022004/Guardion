import { useState, useRef } from "react";
import { scanCode, scanCodeFile } from "../api";

/**
 * SecureCodePanel — Pre-Push Code Vulnerability Scanner
 * Allows developers to paste code or upload a file, then scans for
 * security vulnerabilities before pushing to GitHub.
 */

// Severity badge styles
const severityStyles = {
  CRITICAL: {
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  HIGH: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  MEDIUM: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
};

// Human-readable vulnerability names
const vulnLabels = {
  hardcoded_secret: "Hardcoded Secret",
  private_key: "Private Key Detected",
  command_injection: "Command Injection",
  unsafe_eval: "Unsafe eval() Usage",
  sql_injection: "SQL Injection Risk",
  insecure_deserialization: "Insecure Deserialization",
  path_traversal: "Path Traversal",
  weak_crypto: "Weak Cryptography",
  hardcoded_config: "Hardcoded Config",
  cloud_key_leak: "Cloud Key Leak",
};

// Score color thresholds
function scoreColor(score) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}
function scoreRingColor(score) {
  if (score >= 80) return "stroke-emerald-400";
  if (score >= 50) return "stroke-amber-400";
  return "stroke-red-400";
}

export default function SecureCodePanel() {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("paste"); // "paste" or "upload"
  const fileRef = useRef(null);

  // Scan pasted code
  const handleScanPaste = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await scanCode(code, filename);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Scan uploaded file
  const handleScanFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await scanCodeFile(file);
      setResult(res);

      // Also load file contents into the textarea for reference
      const text = await file.text();
      setCode(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Example vulnerable code for quick testing
  const loadExample = () => {
    const example = `import os
import subprocess

# Hardcoded credentials
password = "admin123"
API_KEY = "sk-1234567890abcdefghijklmnop"
secret = "my_super_secret_value"

# Command injection
user_input = input("Enter command: ")
os.system(user_input)
subprocess.call(user_input, shell=True)

# Unsafe eval
data = input("Enter expression: ")
result = eval(data)

# SQL injection
user_id = input("Enter user ID: ")
query = "SELECT * FROM users WHERE id=" + user_id
cursor.execute("SELECT * FROM accounts WHERE name='" + name + "'")

# Private key
key = """-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"""

# Weak crypto
import hashlib
hash_val = hashlib.md5(password.encode())
`;
    setCode(example);
    setFilename("example.py");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
            Secure Code Checker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Scan your code for security vulnerabilities before pushing to GitHub
          </p>
        </div>
        <button
          onClick={loadExample}
          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/40 rounded-md transition-all"
        >
          Load Example
        </button>
      </div>

      {/* ── Input Mode Toggle ── */}
      <div className="card-glass rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("paste")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "paste"
                ? "bg-slate-700/60 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/20"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
            Paste Code
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "upload"
                ? "bg-slate-700/60 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/20"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Upload File
          </button>
        </div>

        {/* ── Paste Mode ── */}
        {mode === "paste" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="filename.py (optional, for language detection)"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-md px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <textarea
              rows={14}
              placeholder="Paste your source code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-md p-4 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500/50 resize-y"
              spellCheck={false}
            />
            <button
              onClick={handleScanPaste}
              disabled={loading || !code.trim()}
              className="w-full py-2.5 rounded-md text-sm font-semibold transition-all bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scanning...
                </span>
              ) : (
                "Scan Code"
              )}
            </button>
          </div>
        )}

        {/* ── Upload Mode ── */}
        {mode === "upload" && (
          <div className="space-y-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-slate-700/50 rounded-lg cursor-pointer hover:border-orange-500/40 hover:bg-slate-800/20 transition-all"
            >
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <div className="text-center">
                <span className="text-sm text-slate-400">Click to upload a source code file</span>
                <p className="text-[11px] text-slate-600 mt-1">.py, .js, .ts, .java, .jsx, .tsx — max 1 MB</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".py,.js,.ts,.jsx,.tsx,.java,.mjs,.cjs"
              onChange={handleScanFile}
              className="hidden"
            />
            {filename && (
              <p className="text-xs text-slate-500">
                Selected: <span className="text-slate-300 font-medium">{filename}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/8 border border-red-500/15 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="space-y-5">
          {/* Security Score + Summary Bar */}
          <div className="card-glass rounded-lg p-6">
            <div className="flex items-center gap-6">
              {/* Circular Score */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-800/60" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(result.security_score / 100) * 264} 264`}
                    className={`${scoreRingColor(result.security_score)} transition-all duration-700`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${scoreColor(result.security_score)}`}>
                    {result.security_score}
                  </span>
                  <span className="text-[10px] text-slate-500 -mt-0.5">/ 100</span>
                </div>
              </div>

              {/* Summary */}
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-semibold text-white">Security Score</h3>
                <p className="text-xs text-slate-500">
                  {result.total_lines} lines scanned
                  {result.language_hint && result.language_hint !== "unknown"
                    ? ` — ${result.language_hint}`
                    : ""}
                  {" "}&middot; {result.vulnerabilities.length} issue{result.vulnerabilities.length !== 1 ? "s" : ""} found
                </p>

                {/* Severity breakdown */}
                <div className="flex gap-3 pt-1">
                  {["CRITICAL", "HIGH", "MEDIUM"].map((sev) => {
                    const count = result.summary?.[sev] || 0;
                    const s = severityStyles[sev];
                    return (
                      <div key={sev} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${s.bg} border ${s.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></div>
                        <span className={`text-xs font-semibold ${s.text}`}>{count}</span>
                        <span className="text-[10px] text-slate-500">{sev}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* No Issues */}
          {result.vulnerabilities.length === 0 && (
            <div className="card-glass rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <h3 className="text-sm font-semibold text-emerald-400">No vulnerabilities detected</h3>
              <p className="text-xs text-slate-500 mt-1">Your code looks clean. Safe to push!</p>
            </div>
          )}

          {/* Vulnerability List */}
          {result.vulnerabilities.length > 0 && (
            <div className="card-glass rounded-lg p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                Vulnerabilities Found
              </h3>

              <div className="space-y-2">
                {result.vulnerabilities.map((vuln, i) => {
                  const s = severityStyles[vuln.severity] || severityStyles.MEDIUM;
                  return (
                    <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${s.dot}`}></div>
                          <span className="text-sm font-semibold text-white">
                            {vulnLabels[vuln.type] || vuln.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.bg} border ${s.border} ${s.text}`}>
                            {vuln.severity}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Line {vuln.line}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{vuln.description}</p>
                      <pre className="bg-slate-900/60 border border-slate-700/30 rounded px-3 py-2 text-xs text-red-300/80 font-mono overflow-x-auto">
                        {vuln.code_snippet}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
