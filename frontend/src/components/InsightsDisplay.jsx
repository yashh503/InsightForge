// Icons
const ClipboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const LightBulbIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RocketIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChartBarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

/**
 * Enhanced Insights Display Component
 * Shows AI-generated insights including opportunities and benchmark context
 */
function InsightsDisplay({ insights, darkMode }) {
  const {
    executiveSummary,
    keyInsights,
    recommendations,
    riskFactors,
    opportunities,
    benchmarkContext,
  } = insights;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Summary */}
      <div className="card p-6">
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
          }`}>
            <ClipboardIcon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          Executive Summary
        </h3>
        <p className={`text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{executiveSummary}</p>
      </div>

      {/* Key Insights */}
      <div className="card p-6">
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-amber-500/20' : 'bg-amber-100'
          }`}>
            <LightBulbIcon className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          Key Insights
        </h3>
        <ul className="space-y-3">
          {keyInsights.map((insight, index) => (
            <li
              key={index}
              className={`flex gap-3 p-4 rounded-xl transition-all hover:translate-x-1 ${
                darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                {index + 1}
              </span>
              <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations & Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className={`card p-6 border-l-4 border-emerald-500`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}>
                <CheckIcon className="w-5 h-5" />
              </div>
              Recommendations
            </h3>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className={`flex gap-3 p-3 rounded-xl transition-all hover:translate-x-1 ${
                    darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                  }`}
                >
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

        {/* Opportunities */}
        {opportunities && opportunities.length > 0 && (
          <div className={`card p-6 border-l-4 border-purple-500`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <RocketIcon className="w-5 h-5" />
              </div>
              Growth Opportunities
            </h3>
            <ul className="space-y-3">
              {opportunities.map((opp, index) => (
                <li
                  key={index}
                  className={`flex gap-3 p-3 rounded-xl transition-all hover:translate-x-1 ${
                    darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <ArrowRightIcon className="w-3 h-3" />
                  </span>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
        <div className={`card p-6 border-l-4 border-red-500`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <AlertIcon className="w-5 h-5" />
            </div>
            Risk Factors
          </h3>
          <ul className="space-y-3">
            {riskFactors.map((risk, index) => (
              <li
                key={index}
                className={`flex gap-3 p-3 rounded-xl transition-all hover:translate-x-1 ${
                  darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  <AlertIcon className="w-3 h-3" />
                </span>
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benchmark Context */}
      {benchmarkContext && (
        <div className={`card p-6 border-l-4 border-cyan-500`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'
            }`}>
              <ChartBarIcon className="w-5 h-5" />
            </div>
            Industry Benchmark Context
          </h3>
          <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{benchmarkContext}</p>
        </div>
      )}
    </div>
  );
}

export default InsightsDisplay;
