import { useState, useEffect } from "react";
import { fetchDashboard } from "./api";
import Header from "./components/Header";
import MetricsCards from "./components/MetricsCards";
import PromptTester from "./components/PromptTester";
import RepoScanner from "./components/RepoScanner";
import RecentActivity from "./components/RecentActivity";
import Charts from "./components/Charts";

/**
 * Guardion Dashboard — Main App Component
 * Single-page dashboard with security metrics, prompt tester, and repo scanner.
 */
export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard data on mount and after actions
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError("Failed to connect to Guardion backend. Is the server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "prompts", label: "Prompt Security", icon: "🛡️" },
    { id: "repos", label: "Repo Scanner", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !dashboard ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && dashboard && (
              <div className="space-y-6">
                <MetricsCards
                  promptMetrics={dashboard.prompt_metrics}
                  repoMetrics={dashboard.repo_metrics}
                />
                <Charts
                  promptMetrics={dashboard.prompt_metrics}
                  repoMetrics={dashboard.repo_metrics}
                />
                <RecentActivity
                  recentPrompts={dashboard.recent_prompts}
                  recentScans={dashboard.recent_scans}
                />
              </div>
            )}

            {/* Prompt Security Tab */}
            {activeTab === "prompts" && (
              <PromptTester onAnalyzed={loadDashboard} />
            )}

            {/* Repo Scanner Tab */}
            {activeTab === "repos" && (
              <RepoScanner onScanned={loadDashboard} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-600 text-xs">
        Guardion v1.0.0 — AI Prompt Security & Repository Vulnerability Scanner
      </footer>
    </div>
  );
}
