import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Charts Component
 * Displays prompt risk distribution and vulnerability severity charts.
 */
export default function Charts({ promptMetrics, repoMetrics }) {
  // Prompt decision distribution data
  const promptData = [
    { name: "Allowed", value: promptMetrics?.allowed || 0, color: "#34d399" },
    { name: "Warnings", value: promptMetrics?.warnings || 0, color: "#fbbf24" },
    { name: "Blocked", value: promptMetrics?.blocked || 0, color: "#f87171" },
  ].filter((d) => d.value > 0);

  // Vulnerability severity distribution
  const vulnData = [
    { name: "Critical", count: repoMetrics?.critical || 0, color: "#ef4444" },
    { name: "High", count: repoMetrics?.high || 0, color: "#f97316" },
    { name: "Medium", count: repoMetrics?.medium || 0, color: "#eab308" },
    { name: "Low", count: repoMetrics?.low || 0, color: "#22c55e" },
  ];

  const hasPromptData = promptData.length > 0;
  const hasVulnData = vulnData.some((d) => d.count > 0);

  const tooltipStyle = {
    background: "#111827",
    border: "1px solid rgba(51, 65, 85, 0.5)",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontSize: "12px",
    padding: "8px 12px",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Prompt Risk Distribution */}
      <div className="card-glass rounded-lg p-5">
        <h3 className="text-sm font-medium text-slate-400 mb-4">
          Prompt Risk Distribution
        </h3>
        {hasPromptData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={promptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {promptData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-slate-600 text-sm">
            No prompt data yet
          </div>
        )}
      </div>

      {/* Vulnerability Severity */}
      <div className="card-glass rounded-lg p-5">
        <h3 className="text-sm font-medium text-slate-400 mb-4">
          Vulnerability Severity
        </h3>
        {hasVulnData ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vulnData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(51, 65, 85, 0.2)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {vulnData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-slate-600 text-sm">
            No vulnerability data yet
          </div>
        )}
      </div>
    </div>
  );
}
