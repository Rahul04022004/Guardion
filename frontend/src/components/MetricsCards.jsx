/**
 * MetricsCards Component
 * Displays key security metrics in a responsive card grid.
 */
export default function MetricsCards({ promptMetrics, repoMetrics }) {
  const cards = [
    {
      label: "Prompts Analyzed",
      value: promptMetrics?.total_prompts || 0,
      icon: "📝",
      color: "blue",
      bgClass: "from-blue-500/10 to-blue-600/5",
      borderClass: "border-blue-500/20",
      textClass: "text-blue-400",
    },
    {
      label: "Prompts Blocked",
      value: promptMetrics?.blocked || 0,
      icon: "🚫",
      color: "red",
      bgClass: "from-red-500/10 to-red-600/5",
      borderClass: "border-red-500/20",
      textClass: "text-red-400",
    },
    {
      label: "Warnings Issued",
      value: promptMetrics?.warnings || 0,
      icon: "⚠️",
      color: "yellow",
      bgClass: "from-yellow-500/10 to-yellow-600/5",
      borderClass: "border-yellow-500/20",
      textClass: "text-yellow-400",
    },
    {
      label: "Credential Leaks",
      value: promptMetrics?.credential_leaks || 0,
      icon: "🔑",
      color: "orange",
      bgClass: "from-orange-500/10 to-orange-600/5",
      borderClass: "border-orange-500/20",
      textClass: "text-orange-400",
    },
    {
      label: "Repos Scanned",
      value: repoMetrics?.total_scans || 0,
      icon: "📦",
      color: "purple",
      bgClass: "from-purple-500/10 to-purple-600/5",
      borderClass: "border-purple-500/20",
      textClass: "text-purple-400",
    },
    {
      label: "Vulnerabilities Found",
      value: repoMetrics?.total_vulnerabilities || 0,
      icon: "🐛",
      color: "pink",
      bgClass: "from-pink-500/10 to-pink-600/5",
      borderClass: "border-pink-500/20",
      textClass: "text-pink-400",
    },
    {
      label: "Critical Issues",
      value: repoMetrics?.critical || 0,
      icon: "🔴",
      color: "red",
      bgClass: "from-red-500/10 to-red-600/5",
      borderClass: "border-red-500/20",
      textClass: "text-red-400",
    },
    {
      label: "High Severity",
      value: repoMetrics?.high || 0,
      icon: "🟠",
      color: "orange",
      bgClass: "from-orange-500/10 to-orange-600/5",
      borderClass: "border-orange-500/20",
      textClass: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.bgClass} border ${card.borderClass} rounded-xl p-4 hover:scale-[1.02] transition-transform`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${card.textClass}`}>
            {card.value}
          </div>
          <div className="text-xs text-slate-400 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
