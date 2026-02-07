import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Icons
const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

const ChartBarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CubeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const ArrowUpRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

const ArrowDownRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-10 10M17 7v10M17 7H7" />
  </svg>
);

/**
 * Enhanced Data Preview Component
 * Shows parsed data, metrics, charts, trend analysis, and template info
 */
function DataPreview({ data, templateInfo, darkMode }) {
  const { meta, metrics, tables, charts, trendAnalysis } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metadata & Template Info */}
      <div className="card p-6">
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
          }`}>
            <InfoIcon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          Report Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Client</span>
            <p className={`font-semibold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{meta.client}</p>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Period</span>
            <p className={`font-semibold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{meta.period}</p>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Report Type</span>
            <p className={`font-semibold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatReportType(meta.reportType)}</p>
          </div>
          {meta.templateUsed && (
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Template</span>
              <p className="font-semibold mt-1">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500">
                  {meta.templateUsed}
                </span>
              </p>
            </div>
          )}
        </div>
        {templateInfo && (
          <p className={`mt-4 text-sm p-4 rounded-xl border-l-4 border-indigo-500 ${
            darkMode ? 'bg-indigo-500/10 text-slate-300' : 'bg-indigo-50 text-slate-600'
          }`}>
            {templateInfo.description}
          </p>
        )}
      </div>

      {/* Trend Analysis Summary */}
      {trendAnalysis && trendAnalysis.trends && (
        <div className={`card p-6 border-l-4 border-cyan-500`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'
            }`}>
              <TrendingUpIcon className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            Trend Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${getTrendBgClass(trendAnalysis.trends.trend, darkMode)}`}>
                {getTrendIcon(trendAnalysis.trends.trend, darkMode)} {formatTrendLabel(trendAnalysis.trends.trend)}
              </span>
              {trendAnalysis.trends.changePercent !== undefined && (
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {trendAnalysis.trends.changePercent > 0 ? '+' : ''}
                  {trendAnalysis.trends.changePercent.toFixed(1)}% change
                </span>
              )}
            </div>

            {trendAnalysis.growthRates?.summary && (
              <div className={`flex flex-wrap gap-6 p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div>
                  <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Avg Growth Rate</span>
                  <p className={`text-xl font-bold mt-1 ${
                    trendAnalysis.growthRates.summary.averageGrowthRate > 0
                      ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                      : trendAnalysis.growthRates.summary.averageGrowthRate < 0
                        ? darkMode ? 'text-red-400' : 'text-red-600'
                        : darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {trendAnalysis.growthRates.summary.averageGrowthRate > 0 ? '+' : ''}
                    {trendAnalysis.growthRates.summary.averageGrowthRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Growth</span>
                  <p className={`text-xl font-bold mt-1 ${
                    trendAnalysis.growthRates.summary.totalGrowth > 0
                      ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                      : trendAnalysis.growthRates.summary.totalGrowth < 0
                        ? darkMode ? 'text-red-400' : 'text-red-600'
                        : darkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {trendAnalysis.growthRates.summary.totalGrowth > 0 ? '+' : ''}
                    {trendAnalysis.growthRates.summary.totalGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {trendAnalysis.forecast && trendAnalysis.forecast.confidence !== 'low' && (
              <div className={`text-sm p-4 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Forecast:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  trendAnalysis.forecast.trendDirection === 'upward'
                    ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                    : trendAnalysis.forecast.trendDirection === 'downward'
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {trendAnalysis.forecast.trendDirection === 'upward' ? (
                    <><ArrowUpRightIcon className="w-4 h-4" /> Upward</>
                  ) : trendAnalysis.forecast.trendDirection === 'downward' ? (
                    <><ArrowDownRightIcon className="w-4 h-4" /> Downward</>
                  ) : (
                    <><ArrowRightIcon className="w-4 h-4" /> Flat</>
                  )}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                }`}>
                  {trendAnalysis.forecast.confidence} confidence
                </span>
              </div>
            )}

            {trendAnalysis.anomalies?.anomalies?.length > 0 && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>
                <AlertIcon className="w-4 h-4" />
                {trendAnalysis.anomalies.anomalies.length} anomal{trendAnalysis.anomalies.anomalies.length === 1 ? 'y' : 'ies'} detected
              </div>
            )}

            {trendAnalysis.trends.patterns?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trendAnalysis.trends.patterns.map((pattern, idx) => (
                  <span key={idx} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPatternClass(pattern.type, darkMode)}`}>
                    {pattern.description}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {metrics.length > 0 && (
        <div className="card p-6">
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <CubeIcon className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            Key Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.slice(0, 10).map((metric, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl transition-all hover:-translate-y-1 ${
                  metric.isTemplateKPI
                    ? 'border-l-4 border-indigo-500'
                    : ''
                } ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              >
                <span className={`text-sm flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {metric.isTemplateKPI && (
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500">
                      KPI
                    </span>
                  )}
                  {metric.name}
                </span>
                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {formatMetricValue(metric.value, metric.unit)}
                </p>
              </div>
            ))}
          </div>
          {metrics.length > 10 && (
            <p className={`mt-4 text-sm px-4 py-2 rounded-lg inline-block ${
              darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              +{metrics.length - 10} more metrics
            </p>
          )}
        </div>
      )}

      {/* Charts */}
      {charts.length > 0 && (
        <div className="card p-6">
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
            }`}>
              <ChartBarIcon className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            Charts
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <div key={chart.id} className={`h-72 p-4 rounded-xl ${
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'
              }`}>
                <ChartComponent chart={chart} darkMode={darkMode} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Chart Component - Renders the appropriate chart type
 */
function ChartComponent({ chart, darkMode }) {
  const { type, title, data: chartData, xAxisLabel, yAxisLabel } = chart;

  const labels = chartData.map((d) => d.label);
  const values = chartData.map((d) => d.value);

  const colors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#8b5cf6',
  ];

  const baseData = {
    labels,
    datasets: [
      {
        label: yAxisLabel || 'Value',
        data: values,
        backgroundColor: type === 'pie' || type === 'doughnut'
          ? colors.slice(0, labels.length)
          : colors[0],
        borderColor: type === 'line' ? colors[0] : undefined,
        borderWidth: type === 'line' ? 2 : 0,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'pie' || type === 'doughnut',
        position: 'right',
        labels: {
          color: darkMode ? '#94a3b8' : '#64748b',
        },
      },
      title: {
        display: true,
        text: title,
        font: { size: 14, weight: '600' },
        color: darkMode ? '#f1f5f9' : '#1e293b',
      },
    },
    scales: type === 'pie' || type === 'doughnut' ? undefined : {
      x: {
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          color: darkMode ? '#94a3b8' : '#64748b',
        },
        ticks: {
          color: darkMode ? '#94a3b8' : '#64748b',
        },
        grid: {
          color: darkMode ? '#334155' : '#e2e8f0',
        },
      },
      y: {
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: darkMode ? '#94a3b8' : '#64748b',
        },
        ticks: {
          color: darkMode ? '#94a3b8' : '#64748b',
        },
        grid: {
          color: darkMode ? '#334155' : '#e2e8f0',
        },
        beginAtZero: true,
      },
    },
  };

  const ChartTypes = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
  };

  const ChartType = ChartTypes[type] || Bar;

  return <ChartType data={baseData} options={options} />;
}

// Helper functions
function formatReportType(type) {
  const types = {
    sales: 'Sales Report',
    financial: 'Financial Report',
    marketing: 'Marketing Report',
    inventory: 'Inventory Report',
    saas: 'SaaS Metrics',
    ecommerce: 'E-commerce Analytics',
    marketing_roi: 'Marketing ROI',
    hr_analytics: 'HR Analytics',
    project: 'Project Analytics',
    custom: 'Custom Report',
  };
  return types[type] || 'Report';
}

function formatMetricValue(value, unit) {
  if (unit === '$') {
    return `$${value.toLocaleString()}`;
  }
  if (unit === '%') {
    return `${value}%`;
  }
  return `${value.toLocaleString()}${unit ? ' ' + unit : ''}`;
}

function getTrendBgClass(trend, darkMode) {
  const classes = {
    strong_growth: darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
    moderate_growth: darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
    stable: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600',
    moderate_decline: darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
    strong_decline: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
  };
  return classes[trend] || classes.stable;
}

function getTrendIcon(trend, darkMode) {
  const iconClass = "w-4 h-4";
  const icons = {
    strong_growth: <TrendingUpIcon className={iconClass} />,
    moderate_growth: <ArrowUpRightIcon className={iconClass} />,
    stable: <ArrowRightIcon className={iconClass} />,
    moderate_decline: <ArrowDownRightIcon className={iconClass} />,
    strong_decline: <TrendingDownIcon className={iconClass} />,
  };
  return icons[trend] || <ChartBarIcon className={iconClass} />;
}

function formatTrendLabel(trend) {
  const labels = {
    strong_growth: 'Strong Growth',
    moderate_growth: 'Moderate Growth',
    stable: 'Stable',
    moderate_decline: 'Moderate Decline',
    strong_decline: 'Declining',
    insufficient_data: 'Insufficient Data',
  };
  return labels[trend] || 'Analyzing';
}

function getPatternClass(type, darkMode) {
  const classes = {
    momentum: darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
    warning: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
    volatility: darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
  };
  return classes[type] || (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600');
}

export default DataPreview;
