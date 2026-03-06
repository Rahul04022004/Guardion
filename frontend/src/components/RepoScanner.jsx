import { useState } from "react";
import { scanRepo, getRemediation } from "../api";

/**
 * RepoScanner Component
 * Allows users to input a GitHub repo URL and view vulnerability scan results.
 * Includes AI remediation for individual vulnerabilities.
 */
export default function RepoScanner({ onScanned }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remediations, setRemediations] = useState({});
  const [loadingRemediation, setLoadingRemediation] = useState({});

  const handleScan = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);
    setScanResult(null);
    setRemediations({});

    try {
      const data = await scanRepo(repoUrl);
      setScanResult(data);
      onScanned?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemediate = async (vuln, index) => {
    setLoadingRemediation((prev) => ({ ...prev, [index]: true }));
    try {
      const data = await getRemediation(
        vuln.package,
        vuln.cve,
        vuln.description
      );
      setRemediations((prev) => ({ ...prev, [index]: data }));
    } catch (err) {
      setRemediations((prev) => ({
        ...prev,
        [index]: { error: err.message },
      }));
    } finally {
      setLoadingRemediation((prev) => ({ ...prev, [index]: false }));
    }
  };

  const severityColors = {
    CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
    HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    LOW: "text-green-400 bg-green-500/10 border-green-500/20",
    UNKNOWN: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">
          🔍 Repository Vulnerability Scanner
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Enter a GitHub repository URL to scan for dependency vulnerabilities
          using OSV intelligence.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="flex-1 bg-slate-900/50 border border-slate-600/30 rounded-lg px-4 py-2.5 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={loading || !repoUrl.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Scanning...
              </span>
            ) : (
              "Scan Repository"
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
            ⏳ Cloning repository, extracting dependencies, and querying CVE
            databases... This may take a moment.
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {scanResult && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Scan Results
              </h3>
              <div
                className={`text-3xl font-bold ${scoreColor(
                  scanResult.security_score
                )}`}
              >
                {scanResult.security_score}/100
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {scanResult.dependencies_scanned}
                </div>
                <div className="text-xs text-slate-400">Dependencies</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-red-400">
                  {scanResult.critical_count}
                </div>
                <div className="text-xs text-slate-400">Critical</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-400">
                  {scanResult.high_count}
                </div>
                <div className="text-xs text-slate-400">High</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">
                  {scanResult.medium_count}
                </div>
                <div className="text-xs text-slate-400">Medium</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">
                  {scanResult.low_count}
                </div>
                <div className="text-xs text-slate-400">Low</div>
              </div>
            </div>
          </div>

          {/* Vulnerability List */}
          {scanResult.vulnerabilities?.length > 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Vulnerabilities ({scanResult.vulnerabilities.length})
              </h3>

              <div className="space-y-3">
                {scanResult.vulnerabilities.map((vuln, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-sm text-white font-semibold">
                          {vuln.package}
                        </span>
                        {vuln.version && vuln.version !== "unknown" && (
                          <span className="ml-2 text-xs text-slate-400">
                            v{vuln.version}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          severityColors[vuln.severity] ||
                          severityColors.UNKNOWN
                        }`}
                      >
                        {vuln.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                      <span>CVE: {vuln.cve}</span>
                      {vuln.cvss > 0 && <span>CVSS: {vuln.cvss}</span>}
                    </div>

                    {vuln.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {vuln.description}
                      </p>
                    )}

                    {/* Remediation */}
                    {!remediations[idx] ? (
                      <button
                        onClick={() => handleRemediate(vuln, idx)}
                        disabled={loadingRemediation[idx]}
                        className="text-xs px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300 hover:bg-purple-500/20 transition disabled:opacity-50"
                      >
                        {loadingRemediation[idx]
                          ? "🤖 Getting AI fix..."
                          : "🤖 Get AI Remediation"}
                      </button>
                    ) : remediations[idx].error ? (
                      <div className="text-xs text-red-400 p-2 bg-red-500/10 rounded-lg">
                        Failed to get remediation: {remediations[idx].error}
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg space-y-2">
                        <div className="text-xs">
                          <span className="text-purple-300 font-semibold">
                            Explanation:{" "}
                          </span>
                          <span className="text-slate-300">
                            {remediations[idx].explanation}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-purple-300 font-semibold">
                            Fix:{" "}
                          </span>
                          <span className="text-slate-300">
                            {remediations[idx].suggested_fix}
                          </span>
                        </div>
                        {remediations[idx].recommended_version && (
                          <div className="text-xs">
                            <span className="text-purple-300 font-semibold">
                              Upgrade to:{" "}
                            </span>
                            <span className="text-green-300 font-mono">
                              {remediations[idx].recommended_version}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 text-center">
              <span className="text-4xl">🎉</span>
              <h3 className="text-lg font-semibold text-green-400 mt-2">
                No Vulnerabilities Found!
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                All {scanResult.dependencies_scanned} dependencies passed the
                security check.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
