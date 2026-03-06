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
import { motion } from "framer-motion";

/**
 * Charts Component — Cybersecurity themed with orange/cyan palette.
 */
export default function Charts({ promptMetrics, repoMetrics }) {
  const promptData = [
    { name: "Allowed", value: promptMetrics?.allowed || 0, color: "#00FFFF" },
    { name: "Warnings", value: promptMetrics?.warnings || 0, color: "#FF6600" },
    { name: "Blocked", value: promptMetrics?.blocked || 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const vulnData = [
    { name: "Critical", count: repoMetrics?.critical || 0, color: "#ef4444" },
    { name: "High", count: repoMetrics?.high || 0, color: "#FF6600" },
    { name: "Medium", count: repoMetrics?.medium || 0, color: "#eab308" },
    { name: "Low", count: repoMetrics?.low || 0, color: "#00FFFF" },
  ];

  const hasPromptData = promptData.length > 0;
  const hasVulnData = vulnData.some((d) => d.count > 0);

  const tooltipStyle = {
    background: "#121212",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
    padding: "8px 12px",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-brand-card border border-white/5 rounded-lg p-5"
      >
        <h3 className="text-sm font-medium text-gray-400 mb-4">
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
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-gray-600 text-sm">
            No prompt data yet
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-brand-card border border-white/5 rounded-lg p-5"
      >
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          Vulnerability Severity
        </h3>
        {hasVulnData ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vulnData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={{ stroke: "#1a1a1a" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={{ stroke: "#1a1a1a" }}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {vulnData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-gray-600 text-sm">
            No vulnerability data yet
          </div>
        )}
      </motion.div>
    </div>
  );
}
