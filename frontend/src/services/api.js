/**
 * API Service
 * Handles all communication with the backend
 */

// Use environment variable or default to localhost:3001 for development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get available report templates
 */
export async function getTemplates() {
  const response = await fetch(`${API_BASE}/templates`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch templates');
  }

  return data.templates;
}

/**
 * Upload Excel file (basic)
 */
export async function uploadExcel(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);

  if (options.reportType) {
    formData.append('reportType', options.reportType);
  }
  if (options.client) {
    formData.append('client', options.client);
  }
  if (options.period) {
    formData.append('period', options.period);
  }

  const response = await fetch(`${API_BASE}/upload-excel`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Upload failed');
  }

  return data;
}

/**
 * Enhanced upload with template detection and trend analysis
 */
export async function uploadExcelEnhanced(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);

  if (options.templateId) {
    formData.append('templateId', options.templateId);
  }
  if (options.client) {
    formData.append('client', options.client);
  }
  if (options.period) {
    formData.append('period', options.period);
  }
  formData.append('enableTrendAnalysis', options.enableTrendAnalysis !== false ? 'true' : 'false');

  const response = await fetch(`${API_BASE}/upload-excel-enhanced`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Upload failed');
  }

  return data;
}

/**
 * Compare two files
 */
export async function compareFiles(file1, file2, options = {}) {
  const formData = new FormData();
  formData.append('files', file1);
  formData.append('files', file2);

  if (options.labels) {
    formData.append('labels', JSON.stringify(options.labels));
  }
  if (options.primaryKey) {
    formData.append('primaryKey', options.primaryKey);
  }
  if (options.compareColumns) {
    formData.append('compareColumns', JSON.stringify(options.compareColumns));
  }

  const response = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Comparison failed');
  }

  return data;
}

/**
 * Compare time periods within a dataset
 */
export async function comparePeriods(sessionId, options = {}) {
  const response = await fetch(`${API_BASE}/period-comparison/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateColumn: options.dateColumn,
      periodType: options.periodType || 'month',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Period comparison failed');
  }

  return data;
}

/**
 * Generate report with AI insights
 */
export async function generateReport(sessionId, useFallback = false) {
  const response = await fetch(`${API_BASE}/generate-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, useFallback }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Report generation failed');
  }

  return data;
}

/**
 * Get report data by session ID
 */
export async function getReport(sessionId) {
  const response = await fetch(`${API_BASE}/report/${sessionId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch report');
  }

  return data;
}

/**
 * Check report generation status
 */
export async function getReportStatus(sessionId) {
  const response = await fetch(`${API_BASE}/report-status/${sessionId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to check status');
  }

  return data;
}

/**
 * Download PDF report
 */
export function downloadPDF(sessionId) {
  window.open(`${API_BASE}/download/pdf/${sessionId}`, '_blank');
}

/**
 * Download PPT report
 */
export function downloadPPT(sessionId) {
  window.open(`${API_BASE}/download/ppt/${sessionId}`, '_blank');
}

/**
 * Download comparison PDF report
 */
export function downloadComparisonPDF(comparisonId) {
  window.open(`${API_BASE}/download/comparison-pdf/${comparisonId}`, '_blank');
}

/**
 * Download comparison PPT report
 */
export function downloadComparisonPPT(comparisonId) {
  window.open(`${API_BASE}/download/comparison-ppt/${comparisonId}`, '_blank');
}

/**
 * Health check
 */
export async function healthCheck() {
  const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
  return response.json();
}
