import { useState, useRef } from 'react';
import { compareFiles } from '../services/api';

// Icons
const CompareIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

function FileComparison({ onComparisonComplete, onError, darkMode }) {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [label1, setLabel1] = useState('Period 1');
  const [label2, setLabel2] = useState('Period 2');
  const [isComparing, setIsComparing] = useState(false);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  const handleFileSelect = (file, setFile) => {
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      onError('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setFile(file);
  };

  const handleCompare = async () => {
    if (!file1 || !file2) {
      onError('Please select two files to compare');
      return;
    }

    setIsComparing(true);

    try {
      const response = await compareFiles(file1, file2, {
        labels: [label1, label2],
      });
      onComparisonComplete(response);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsComparing(false);
    }
  };

  const clearFile = (setFile, inputRef) => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const FileDropZone = ({ file, setFile, inputRef, label, setLabel, colorScheme }) => {
    const colors = colorScheme === 'indigo'
      ? { gradient: 'from-indigo-500 to-blue-600', bg: 'indigo' }
      : { gradient: 'from-purple-500 to-pink-600', bg: 'purple' };

    return (
      <div className="flex-1">
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => handleFileSelect(e.target.files[0], setFile)}
          accept=".xlsx,.xls,.csv"
          hidden
        />

        {file ? (
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                <FileIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{file.name}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatFileSize(file.size)}</p>
              </div>
              <button
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  darkMode ? 'bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
                }`}
                onClick={() => clearFile(setFile, inputRef)}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              className="input mt-3 text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g., Q1 2024)"
            />
          </div>
        ) : (
          <button
            className={`w-full p-6 rounded-xl border-2 border-dashed transition-all duration-200 ${
              darkMode
                ? 'border-slate-700 bg-slate-800/30 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center ${
              darkMode ? 'bg-slate-700' : 'bg-white shadow-md'
            }`}>
              <PlusIcon className={`w-6 h-6 ${darkMode ? 'text-slate-400' : 'text-indigo-500'}`} />
            </div>
            <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Select File</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>.xlsx, .xls, .csv</p>
          </button>
        )}
      </div>
    );
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
          <CompareIcon className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Compare Files
        </h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Upload two files to compare metrics and identify changes
        </p>
      </div>

      {/* File Selection */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        <FileDropZone
          file={file1}
          setFile={setFile1}
          inputRef={fileInput1Ref}
          label={label1}
          setLabel={setLabel1}
          colorScheme="indigo"
        />

        {/* VS Divider */}
        <div className="flex lg:flex-col items-center justify-center py-2 lg:py-0 lg:px-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400 shadow-sm'
          }`}>
            VS
          </div>
        </div>

        <FileDropZone
          file={file2}
          setFile={setFile2}
          inputRef={fileInput2Ref}
          label={label2}
          setLabel={setLabel2}
          colorScheme="purple"
        />
      </div>

      {/* Compare Button */}
      <button
        className="btn btn-primary w-full mt-8 py-4 text-base"
        onClick={handleCompare}
        disabled={!file1 || !file2 || isComparing}
      >
        {isComparing ? (
          <>
            <span className="spinner"></span>
            Comparing files...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Compare with AI
          </>
        )}
      </button>
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

export default FileComparison;
