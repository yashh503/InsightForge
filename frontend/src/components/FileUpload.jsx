import { useState, useRef, useEffect } from 'react';
import { uploadExcelEnhanced, getTemplates } from '../services/api';

// Icons
const CloudUploadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ChartBarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

function FileUpload({ onUploadSuccess, onError, darkMode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [templateId, setTemplateId] = useState('');
  const [clientName, setClientName] = useState('');
  const [enableTrendAnalysis, setEnableTrendAnalysis] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    }
    fetchTemplates();
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      onError('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const response = await uploadExcelEnhanced(selectedFile, {
        templateId: templateId || undefined,
        client: clientName || undefined,
        enableTrendAnalysis,
      });

      onUploadSuccess(response);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card p-6 sm:p-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
          darkMode
            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20'
            : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'
        }`}>
          <CloudUploadIcon className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Upload Your Data
        </h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Drag and drop your Excel or CSV file to get started
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
            : selectedFile
              ? darkMode
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-emerald-400 bg-emerald-50/50'
              : darkMode
                ? 'border-slate-700 bg-slate-800/30 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".xlsx,.xls,.csv"
          hidden
        />

        {selectedFile ? (
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {selectedFile.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span className={`text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Ready to analyze • {formatFileSize(selectedFile.size)}
                </span>
              </div>
            </div>
            <button
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                darkMode
                  ? 'bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                  : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="py-8">
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-float ${
              darkMode ? 'bg-slate-700/50' : 'bg-white shadow-lg'
            }`}>
              <CloudUploadIcon className={`w-10 h-10 ${darkMode ? 'text-slate-400' : 'text-indigo-500'}`} />
            </div>
            <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Drop your file here
            </p>
            <p className={`text-sm mb-6 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              or click to browse
            </p>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </button>
            <div className={`mt-6 flex items-center justify-center gap-4 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                .xlsx, .xls, .csv
              </span>
              <span className="w-1 h-1 rounded-full bg-current"></span>
              <span>Max 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Options Panel */}
      {selectedFile && (
        <div className={`mt-6 p-6 rounded-2xl space-y-6 ${
          darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-100'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template Select */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Report Template
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                disabled={loadingTemplates}
                className="input"
              >
                <option value="">Auto-detect Template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {templateId && templates.find(t => t.id === templateId) && (
                <p className={`mt-2 text-xs p-3 rounded-lg border-l-4 border-indigo-500 ${
                  darkMode ? 'bg-indigo-500/10 text-slate-300' : 'bg-indigo-50 text-slate-600'
                }`}>
                  {templates.find(t => t.id === templateId)?.description}
                </p>
              )}
            </div>

            {/* Client Name */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Client / Project Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter name (optional)"
                className="input"
              />
            </div>
          </div>

          {/* Trend Analysis Toggle */}
          <div className={`p-4 rounded-xl ${
            darkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  enableTrendAnalysis
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                    : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'
                }`}>
                  <ChartBarIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Trend Analysis
                  </span>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Includes growth rates, forecasting & anomaly detection
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enableTrendAnalysis}
                  onChange={(e) => setEnableTrendAnalysis(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full transition-colors peer-checked:bg-indigo-500 ${
                  darkMode ? 'bg-slate-600' : 'bg-slate-300'
                }`}></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <button
          className="btn btn-primary w-full mt-6 py-4 text-base"
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <span className="spinner"></span>
              Analyzing your data...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Analyze with AI
            </>
          )}
        </button>
      )}
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileUpload;
