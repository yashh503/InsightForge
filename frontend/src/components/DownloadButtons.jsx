import { downloadPDF, downloadPPT } from '../services/api';

// Icons
const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const DocumentIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const PresentationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function DownloadButtons({ sessionId, darkMode }) {
  const handleDownloadPDF = () => {
    downloadPDF(sessionId);
  };

  const handleDownloadPPT = () => {
    downloadPPT(sessionId);
  };

  return (
    <div className="card p-6 animate-fade-in">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
        }`}>
          <CheckCircleIcon className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        </div>
        <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Report Ready!
        </h3>
        <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Your AI-powered analysis is complete. Download your files below.
        </p>
      </div>

      {/* Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Download */}
        <button
          onClick={handleDownloadPDF}
          className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
            darkMode
              ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10'
              : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-100'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              darkMode ? 'bg-red-500/20' : 'bg-white shadow-md'
            }`}>
              <DocumentIcon className={`w-7 h-7 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                PDF Report
              </h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Professional document with full analysis
              </p>
              <div className={`inline-flex items-center gap-2 mt-3 text-sm font-semibold ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                <DownloadIcon className="w-4 h-4" />
                Download PDF
              </div>
            </div>
          </div>
        </button>

        {/* PPT Download */}
        <button
          onClick={handleDownloadPPT}
          className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
            darkMode
              ? 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10'
              : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              darkMode ? 'bg-orange-500/20' : 'bg-white shadow-md'
            }`}>
              <PresentationIcon className={`w-7 h-7 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                PowerPoint
              </h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Ready-to-present slide deck
              </p>
              <div className={`inline-flex items-center gap-2 mt-3 text-sm font-semibold ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`}>
                <DownloadIcon className="w-4 h-4" />
                Download PPTX
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Success Badge */}
      <div className={`mt-6 flex items-center justify-center gap-3 p-4 rounded-xl ${
        darkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'
      }`}>
        <span className="status-dot status-dot-success"></span>
        <span className={`font-semibold text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
          Analysis complete with AI insights
        </span>
      </div>
    </div>
  );
}

export default DownloadButtons;
