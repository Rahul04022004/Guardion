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
        className="bg-brand-card border border-white/5 rounded-lg p-5 hover:border-white/8 transition-colors"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-brand-cyan/10 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-400">
            Prompt Risk Distribution
          </h3>
        </div>
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
          <div className="flex flex-col items-center justify-center h-[240px] text-gray-600">
            <svg className="w-10 h-10 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
            </svg>
            <span className="text-sm">No prompt data yet</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-brand-card border border-white/5 rounded-lg p-5 hover:border-white/8 transition-colors"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-brand-orange/10 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-400">
            Vulnerability Severity
          </h3>
        </div>
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
          <div className="flex flex-col items-center justify-center h-[240px] text-gray-600">
            <svg className="w-10 h-10 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" />
            </svg>
            <span className="text-sm">No vulnerability data yet</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
