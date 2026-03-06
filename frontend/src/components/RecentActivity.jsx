/**
 * RecentActivity Component
 * Displays recent prompt analyses and repository scans.
 */
export default function RecentActivity({ recentPrompts, recentScans }) {
  const decisionBadge = (decision) => {
    const styles = {
      allow: "bg-emerald-500/8 text-emerald-400 border-emerald-500/15",
      warn: "bg-amber-500/8 text-amber-400 border-amber-500/15",
      block: "bg-red-500/8 text-red-400 border-red-500/15",
    };
    return styles[decision] || styles.allow;
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Prompts */}
      <div className="card-glass rounded-lg p-5">
        <h3 className="text-sm font-medium text-slate-400 mb-4">
          Recent Prompt Analyses
        </h3>

        {recentPrompts?.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {recentPrompts.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/40 border border-slate-700/30 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${decisionBadge(
                      p.decision
                    )}`}
                  >
                    {p.decision?.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">{p.source}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {p.prompt_preview}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">
                    Risk: {((p.risk_score || 0) * 100).toFixed(0)}%
                  </span>
                  {p.categories && (
                    <span className="text-[11px] text-red-400/60 truncate max-w-[140px]">
                      {p.categories}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600 text-sm">
            No prompt analyses yet
          </div>
        )}
      </div>

      {/* Recent Scans */}
      <div className="card-glass rounded-lg p-5">
        <h3 className="text-sm font-medium text-slate-400 mb-4">
          Recent Repository Scans
        </h3>

        {recentScans?.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {recentScans.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900/40 border border-slate-700/30 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-blue-400 font-mono truncate max-w-[200px]">
                    {s.repo_url?.replace("https://github.com/", "")}
                  </span>
                  <span
                    className={`text-sm font-semibold ${scoreColor(
                      s.security_score
                    )}`}
                  >
                    {s.security_score}/100
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{s.dependencies_scanned} deps</span>
                  <span>{s.total_vulnerabilities} vulns</span>
                  {s.critical > 0 && (
                    <span className="text-red-400">{s.critical} critical</span>
                  )}
                  {s.high > 0 && (
                    <span className="text-orange-400">{s.high} high</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600 text-sm">
            No repository scans yet
          </div>
        )}
      </div>
    </div>
  );
}
