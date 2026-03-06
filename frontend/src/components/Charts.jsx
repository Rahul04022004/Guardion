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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Prompt Risk Distribution */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Prompt Risk Distribution
        </h3>
        {hasPromptData ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={promptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {promptData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
            No prompt data yet. Try analyzing a prompt!
          </div>
        )}
      </div>

      {/* Vulnerability Severity */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Vulnerability Severity
        </h3>
        {hasVulnData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vulnData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {vulnData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
            No vulnerability data yet. Try scanning a repository!
          </div>
        )}
      </div>
    </div>
  );
}
