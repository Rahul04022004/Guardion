/**
 * Header Component
 * Top navigation bar with Guardion branding.
 */
export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 border-b border-blue-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
              🛡️
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                GUARDION
              </h1>
              <p className="text-xs text-blue-300/70">
                Security Intelligence Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              System Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
