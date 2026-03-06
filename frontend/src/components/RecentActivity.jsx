/**
 * RecentActivity Component — Cybersecurity themed.
 */
export default function RecentActivity({ recentPrompts, recentScans }) {
  const decisionBadge = (decision) => {
    const styles = {
      allow: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
      warn: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
      block: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return styles[decision] || styles.allow;
  };

  const scoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-brand-orange";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Prompts */}
      <div className="bg-brand-card border border-white/5 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          Recent Prompt Analyses
        </h3>

        {recentPrompts?.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {recentPrompts.map((p) => (
              <div
                key={p.id}
                className="bg-brand-dark border border-white/5 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${decisionBadge(
                      p.decision
                    )}`}
                  >
                    {p.decision?.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-gray-600 font-medium">{p.source}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {p.prompt_preview}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">
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
          <div className="text-center py-8 text-gray-600 text-sm">
            No prompt analyses yet
          </div>
        )}
      </div>

      {/* Recent Scans */}
      <div className="bg-brand-card border border-white/5 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          Recent Repository Scans
        </h3>

        {recentScans?.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {recentScans.map((s) => (
              <div
                key={s.id}
                className="bg-brand-dark border border-white/5 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-brand-cyan font-mono truncate max-w-[200px]">
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
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span>{s.dependencies_scanned} deps</span>
                  <span>{s.total_vulnerabilities} vulns</span>
                  {s.critical > 0 && (
                    <span className="text-red-400">{s.critical} critical</span>
                  )}
                  {s.high > 0 && (
                    <span className="text-brand-orange">{s.high} high</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 text-sm">
            No repository scans yet
          </div>
        )}
      </div>
    </div>
  );
}
