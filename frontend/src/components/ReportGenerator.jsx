import { useState } from 'react';
import { generateReport } from '../services/api';
import ColorThemePicker from './ColorThemePicker';

// Icons
const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

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

const LightBulbIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const BoltIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

function ReportGenerator({ sessionId, onGenerated, onError, darkMode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await generateReport(sessionId, useFallback, selectedTheme);
      onGenerated(response);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const features = [
    {
      icon: LightBulbIcon,
      title: 'AI Executive Summary',
      description: 'Intelligent insights and recommendations',
      color: 'amber'
    },
    {
      icon: DocumentIcon,
      title: 'Professional PDF',
      description: 'Beautifully formatted document',
      color: 'red'
    },
    {
      icon: PresentationIcon,
      title: 'PowerPoint Slides',
      description: 'Ready-to-present deck',
      color: 'blue'
    }
  ];

  const getColorClasses = (color) => ({
    amber: darkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100',
    red: darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100',
    blue: darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100',
  }[color]);

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          darkMode
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20'
            : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100'
        }`}>
          <SparklesIcon className={`w-7 h-7 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Generate AI Report
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Create professional reports with AI-powered insights
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all hover:-translate-y-1 ${
                darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${getColorClasses(feature.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {feature.title}
              </h4>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Color Theme Selection */}
      <div className="mb-6">
        <ColorThemePicker
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
          darkMode={darkMode}
        />
      </div>

      {/* Skip AI Option */}
      <div className={`p-4 rounded-xl mb-6 ${
        darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-100'
      }`}>
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              useFallback
                ? darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-500'
                : darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <BoltIcon className="w-5 h-5" />
            </div>
            <div>
              <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Quick Mode (Skip AI)
              </span>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Generate basic summary without AI analysis
              </p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={useFallback}
              onChange={(e) => setUseFallback(e.target.checked)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full transition-colors peer-checked:bg-slate-500 ${
              darkMode ? 'bg-indigo-500' : 'bg-indigo-500'
            }`}></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      {/* Generate Button */}
      <button
        className="btn btn-primary w-full py-4 text-base"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span>
            Generating your report...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Generate Report
          </>
        )}
      </button>

      {/* Processing Message */}
      {isGenerating && (
        <div className={`mt-6 p-4 rounded-xl text-center ${
          darkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <span className="status-dot status-dot-success"></span>
            <p className={`text-sm font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
              AI is analyzing your data and generating insights...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportGenerator;
