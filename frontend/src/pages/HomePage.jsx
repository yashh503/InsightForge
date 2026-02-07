import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import FileComparison from "../components/FileComparison";
import ComparisonResults from "../components/ComparisonResults";
import DataPreview from "../components/DataPreview";
import ReportGenerator from "../components/ReportGenerator";
import InsightsDisplay from "../components/InsightsDisplay";
import DownloadButtons from "../components/DownloadButtons";

// Icons
const ChartIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const CompareIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

/**
 * HomePage - Main Application Dashboard
 */
function HomePage() {
  const [darkMode, setDarkMode] = useState(true);

  const [mode, setMode] = useState("upload");
  const [sessionId, setSessionId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [templateInfo, setTemplateInfo] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [comparisonId, setComparisonId] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonFiles, setComparisonFiles] = useState(null);
  const [comparisonAIInsights, setComparisonAIInsights] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleUploadSuccess = (response) => {
    setSessionId(response.sessionId);
    setReportData(response.data);
    setTemplateInfo(response.templateInfo || null);
    setUploadSummary(response.summary || null);
    setInsights(null);
    setIsGenerated(false);
    setError(null);
  };

  const handleComparisonComplete = (response) => {
    setComparisonId(response.comparisonId);
    setComparisonResult(response.comparison);
    setComparisonFiles(response.files);
    setComparisonAIInsights(response.aiInsights || null);
    setError(null);
  };

  const handleReportGenerated = (response) => {
    setInsights(response.insights);
    setIsGenerated(true);
  };

  const handleReset = () => {
    setSessionId(null);
    setReportData(null);
    setTemplateInfo(null);
    setUploadSummary(null);
    setInsights(null);
    setIsGenerated(false);
    setComparisonId(null);
    setComparisonResult(null);
    setComparisonFiles(null);
    setComparisonAIInsights(null);
    setError(null);
  };

  const switchMode = (newMode) => {
    handleReset();
    setMode(newMode);
  };

  const hasActiveSession = sessionId || comparisonResult;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-slate-950" : "bg-linear-to-br from-slate-50 via-white to-indigo-50/30"}`}
    >
      {/* Premium Header */}
      <header className="relative overflow-hidden bg-gradient-header">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-[600px] bg-indigo-400/10 rounded-full blur-3xl"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Navigation */}
          <nav className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <img
                  src="/icon.svg"
                  alt="InsightForge"
                  className="w-11 h-11 rounded-xl shadow-lg shadow-black/5"
                />
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    InsightForge
                  </h1>
                  <p className="text-[11px] text-white/60 font-medium tracking-wide uppercase">
                    Premium Analytics
                  </p>
                </div>
              </Link>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Status badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="status-dot status-dot-success"></span>
                <span className="text-xs font-medium text-white/80">
                  AI Online
                </span>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto pb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/10">
              <SparklesIcon className="w-4 h-4 text-amber-300" />
              <span>AI-Powered Business Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Transform Data into
              <span className="block mt-1 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h2>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Upload your Excel data and receive AI-powered analysis with
              professional PDF & PowerPoint reports in seconds.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Display */}
          {error && (
            <div
              className={`mb-8 p-4 rounded-2xl flex items-center justify-between animate-fade-in-scale ${
                darkMode
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-red-50 border border-red-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}
                >
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm font-medium ${darkMode ? "text-red-300" : "text-red-700"}`}
                >
                  {error}
                </span>
              </div>
              <button
                onClick={() => setError(null)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  darkMode
                    ? "hover:bg-red-500/20 text-red-400"
                    : "hover:bg-red-100 text-red-500"
                }`}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mode Switcher */}
          {!hasActiveSession && (
            <div className="flex justify-center mb-8">
              <div
                className={`inline-flex p-1.5 rounded-2xl gap-1.5 ${darkMode ? "bg-slate-800/80" : "bg-white shadow-lg shadow-slate-200/50"} border ${darkMode ? "border-slate-700" : "border-slate-200"}`}
              >
                <button
                  onClick={() => switchMode("upload")}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2.5 ${
                    mode === "upload"
                      ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                      : darkMode
                        ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <ChartIcon className="w-4 h-4" />
                  Single Analysis
                </button>
                <button
                  onClick={() => switchMode("compare")}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2.5 ${
                    mode === "compare"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                      : darkMode
                        ? "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <CompareIcon className="w-4 h-4" />
                  Compare Files
                </button>
              </div>
            </div>
          )}

          {/* Upload Mode */}
          {mode === "upload" && !sessionId && (
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onError={setError}
              darkMode={darkMode}
            />
          )}

          {/* Comparison Mode */}
          {mode === "compare" && !comparisonResult && (
            <FileComparison
              onComparisonComplete={handleComparisonComplete}
              onError={setError}
              darkMode={darkMode}
            />
          )}

          {/* Comparison Results */}
          {comparisonResult && comparisonFiles && (
            <ComparisonResults
              comparisonId={comparisonId}
              comparison={comparisonResult}
              aiInsights={comparisonAIInsights}
              files={comparisonFiles}
              onReset={handleReset}
              darkMode={darkMode}
            />
          )}

          {/* Upload Results Workflow */}
          {sessionId && reportData && (
            <div className="space-y-8 animate-fade-in">
              {/* Session Header */}
              <div
                className={`card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      darkMode
                        ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
                        : "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
                    }`}
                  >
                    <DocumentIcon
                      className={`w-7 h-7 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}
                    />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {reportData.meta.client || "Data Analysis"}
                    </h2>
                    {uploadSummary && (
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}
                          >
                            {uploadSummary.rowCount}
                          </span>
                          <span
                            className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                          >
                            rows
                          </span>
                        </div>
                        <span
                          className={`w-1 h-1 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`}
                        ></span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-medium ${darkMode ? "text-purple-400" : "text-purple-600"}`}
                          >
                            {uploadSummary.metricsCount}
                          </span>
                          <span
                            className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                          >
                            metrics
                          </span>
                        </div>
                        {uploadSummary.hasTrendAnalysis && (
                          <>
                            <span
                              className={`w-1 h-1 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`}
                            ></span>
                            <div className="flex items-center gap-1.5">
                              <TrendingUpIcon
                                className={`w-4 h-4 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
                              />
                              <span
                                className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                              >
                                Trend analysis
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className={`btn btn-secondary flex items-center gap-2`}
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  New Analysis
                </button>
              </div>

              {/* Data Preview */}
              <DataPreview
                data={reportData}
                templateInfo={templateInfo}
                darkMode={darkMode}
              />

              {/* Report Generation */}
              {!isGenerated && (
                <ReportGenerator
                  sessionId={sessionId}
                  onGenerated={handleReportGenerated}
                  onError={setError}
                  darkMode={darkMode}
                />
              )}

              {/* Results */}
              {isGenerated && insights && (
                <>
                  <InsightsDisplay insights={insights} darkMode={darkMode} />
                  <DownloadButtons sessionId={sessionId} darkMode={darkMode} />
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Premium Footer */}
      <footer
        className={`py-6 mt-auto border-t ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white/80 border-slate-200"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link
              to="/"
              className="flex items-center gap-4 hover:opacity-90 transition-opacity"
            >
              <img
                src="/icon.svg"
                alt="InsightForge"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <p
                  className={`font-bold text-sm ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  InsightForge
                </p>
                <p
                  className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  AI-Powered Business Intelligence
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-6">
              <p className="text-sm text-slate-600">
                © 2026 InsightForge. All rights reserved. Built by{" "}
                <span className="text-sm text-slate-300">
                  <a
                    href="https://yarvix.space"
                    target="_blank"
                    className="font-bold"
                  >
                    YarvixTech
                  </a>
                </span>{" "}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
