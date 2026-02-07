import { downloadComparisonPDF, downloadComparisonPPT } from '../services/api';

// Icons
const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PresentationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const MinusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

/**
 * Comparison Results Component
 * Displays the results of file comparison with AI insights
 */
function ComparisonResults({ comparisonId, comparison, aiInsights, files, onReset, darkMode }) {
  const { summary, insights } = comparison;

  // Transform summary object into array for table display
  const metricChanges = Object.entries(summary || {}).map(([metric, data]) => {
    const labels = Object.keys(data).filter(k => !['absoluteChange', 'percentageChange', 'direction'].includes(k));
    return {
      metric: formatColumnName(metric),
      value1: data[labels[0]] || 0,
      value2: data[labels[1]] || 0,
      absoluteChange: data.absoluteChange || 0,
      percentChange: data.percentageChange || 0,
      direction: data.direction || 'neutral',
    };
  });

  // Calculate summary stats
  const summaryStats = {
    totalMetrics: metricChanges.length,
    improved: metricChanges.filter(m => m.direction === 'up').length,
    declined: metricChanges.filter(m => m.direction === 'down').length,
    unchanged: metricChanges.filter(m => m.direction === 'neutral').length,
  };

  const handleDownloadPDF = () => {
    if (comparisonId) {
      downloadComparisonPDF(comparisonId);
    }
  };

  const handleDownloadPPT = () => {
    if (comparisonId) {
      downloadComparisonPPT(comparisonId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <span className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></span>
            Comparison Results
          </h2>
          <p className={`mt-1 flex items-center gap-2 flex-wrap text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {files[0].filename} <span className="text-indigo-500 font-semibold">vs</span> {files[1].filename}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {comparisonId && (
            <>
              <button
                onClick={handleDownloadPDF}
                className="btn btn-primary flex items-center gap-2"
              >
                <DocumentIcon className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handleDownloadPPT}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 ${
                  darkMode
                    ? 'bg-slate-700 text-white hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <PresentationIcon className="w-4 h-4" />
                Download PPT
              </button>
            </>
          )}
          <button
            onClick={onReset}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 ${
              darkMode
                ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            New Comparison
          </button>
        </div>
      </div>

      {/* AI Summary Statement */}
      {aiInsights?.summaryStatement && (
        <div className={`card p-6 border-l-4 border-indigo-500`}>
          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" />
              AI
            </span>
            Analysis Summary
          </h3>
          <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{aiInsights.summaryStatement}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="card p-6">
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></span>
          Metrics Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-xl text-center ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'
          }`}>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{summaryStats.totalMetrics}</p>
            <p className={`text-xs uppercase tracking-wide mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Metrics Compared</p>
          </div>
          <div className={`p-5 rounded-xl text-center ${
            darkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <TrendingUpIcon className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{summaryStats.improved}</p>
            </div>
            <p className={`text-xs uppercase tracking-wide mt-1 ${darkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>Improved</p>
          </div>
          <div className={`p-5 rounded-xl text-center ${
            darkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <TrendingDownIcon className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <p className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{summaryStats.declined}</p>
            </div>
            <p className={`text-xs uppercase tracking-wide mt-1 ${darkMode ? 'text-red-400/70' : 'text-red-600/70'}`}>Declined</p>
          </div>
          <div className={`p-5 rounded-xl text-center ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <MinusIcon className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <p className={`text-3xl font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{summaryStats.unchanged}</p>
            </div>
            <p className={`text-xs uppercase tracking-wide mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Unchanged</p>
          </div>
        </div>
      </div>

      {/* AI Significant Changes */}
      {aiInsights?.significantChanges && aiInsights.significantChanges.length > 0 && (
        <div className="card p-6">
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" />
              AI
            </span>
            Significant Changes
          </h3>
          <ul className="space-y-3">
            {aiInsights.significantChanges.map((change, index) => (
              <li key={index} className={`flex gap-3 p-4 rounded-xl transition-all hover:translate-x-1 ${
                darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {index + 1}
                </span>
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Recommendations & Concerns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        {aiInsights?.recommendations && aiInsights.recommendations.length > 0 && (
          <div className={`card p-6 border-l-4 border-emerald-500`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}>
                <CheckIcon className="w-5 h-5" />
              </div>
              Recommendations
            </h3>
            <ul className="space-y-3">
              {aiInsights.recommendations.map((rec, index) => (
                <li key={index} className={`flex gap-3 p-3 rounded-xl transition-all hover:translate-x-1 ${
                  darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <CheckIcon className="w-3 h-3" />
                  </span>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Areas of Concern */}
        {aiInsights?.areasOfConcern && aiInsights.areasOfConcern.length > 0 && (
          <div className={`card p-6 border-l-4 border-red-500`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <AlertIcon className="w-5 h-5" />
              </div>
              Areas of Concern
            </h3>
            <ul className="space-y-3">
              {aiInsights.areasOfConcern.map((concern, index) => (
                <li key={index} className={`flex gap-3 p-3 rounded-xl transition-all hover:translate-x-1 ${
                  darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>
                    <AlertIcon className="w-3 h-3" />
                  </span>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Basic Key Insights (fallback when no AI) */}
      {(!aiInsights || !aiInsights.significantChanges) && insights && insights.length > 0 && (
        <div className="card p-6">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Key Changes</h3>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li
                key={index}
                className={`flex gap-3 p-4 rounded-xl border-l-4 transition-all hover:translate-x-1 ${
                  insight.type === 'positive'
                    ? darkMode ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50'
                    : insight.type === 'negative'
                      ? darkMode ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'
                      : darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
                }`}
              >
                <span className={`font-bold ${
                  insight.type === 'positive'
                    ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    : insight.type === 'negative'
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {insight.type === 'positive' ? (
                    <TrendingUpIcon className="w-5 h-5" />
                  ) : insight.type === 'negative' ? (
                    <TrendingDownIcon className="w-5 h-5" />
                  ) : (
                    <MinusIcon className="w-5 h-5" />
                  )}
                </span>
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{insight.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Changes Table */}
      {metricChanges && metricChanges.length > 0 && (
        <div className="card p-6">
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></span>
            Detailed Changes
          </h3>
          <div className={`overflow-x-auto rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={darkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                  <th className={`text-left p-4 font-semibold text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Metric</th>
                  <th className={`text-right p-4 font-semibold text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{truncateFilename(files[0].filename)}</th>
                  <th className={`text-right p-4 font-semibold text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{truncateFilename(files[1].filename)}</th>
                  <th className={`text-right p-4 font-semibold text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Change</th>
                  <th className={`text-right p-4 font-semibold text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>% Change</th>
                </tr>
              </thead>
              <tbody>
                {metricChanges.map((change, index) => (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      darkMode ? 'border-t border-slate-700 hover:bg-slate-800/50' : 'border-t border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <td className={`p-4 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{change.metric}</td>
                    <td className={`p-4 text-right tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatValue(change.value1)}</td>
                    <td className={`p-4 text-right tabular-nums ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatValue(change.value2)}</td>
                    <td className={`p-4 text-right tabular-nums font-semibold ${
                      change.absoluteChange > 0
                        ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : change.absoluteChange < 0
                          ? darkMode ? 'text-red-400' : 'text-red-600'
                          : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {change.absoluteChange > 0 ? '+' : ''}{formatValue(change.absoluteChange)}
                    </td>
                    <td className={`p-4 text-right tabular-nums font-semibold ${
                      change.percentChange > 0
                        ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : change.percentChange < 0
                          ? darkMode ? 'text-red-400' : 'text-red-600'
                          : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {change.percentChange > 0 ? '+' : ''}{change.percentChange.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!metricChanges || metricChanges.length === 0) && (!insights || insights.length === 0) && (
        <div className="card p-6 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            darkMode ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <AlertIcon className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>No comparable numeric data found between the files.</p>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Make sure both files have common columns with numeric values.</p>
        </div>
      )}
    </div>
  );
}

function formatValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value;
}

function formatColumnName(col) {
  return col
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function truncateFilename(filename) {
  if (filename.length > 20) {
    return filename.slice(0, 17) + '...';
  }
  return filename;
}

export default ComparisonResults;
