import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseExcelFile,
  extractMetadata,
  calculateMetrics,
  generateChartData,
  createSummaryTable,
} from '../services/excelParser.js';
import { validateInternalReport } from '../schemas/reportSchema.js';
import { getAllTemplates, getTemplate, detectTemplate } from '../schemas/templates.js';
import { generateTrendAnalysis } from '../services/trendAnalysis.js';
import { compareDatasets, compareTimePeriods } from '../services/comparisonService.js';
import { generateComparisonInsights } from '../services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel and CSV files
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv', // .csv (alternative)
    ];
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed'));
    }
  },
});

/**
 * In-memory storage for parsed report data
 * In production, this would use Redis or a database
 * For MVP, we store in memory with session tracking
 */
const reportStorage = new Map();

/**
 * POST /api/upload-excel
 *
 * Uploads an Excel file, parses it, validates it,
 * and converts it to the internal JSON schema.
 *
 * Body params (optional):
 * - reportType: 'sales' | 'financial' | 'marketing' | 'inventory' | 'custom'
 * - client: string (client name override)
 * - period: string (period override)
 */
router.post('/upload-excel', upload.single('file'), async (req, res, next) => {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file',
      });
    }

    const { originalname, buffer } = req.file;
    const { reportType = 'custom', client, period } = req.body;

    console.log(`📂 Processing file: ${originalname} (${reportType} report)`);

    // Parse Excel file
    const parsedData = parseExcelFile(buffer, reportType);
    console.log(`✅ Parsed ${parsedData.rowCount} rows with ${parsedData.columns.length} columns`);

    // Extract metadata
    const meta = extractMetadata(parsedData, originalname, {
      client,
      period,
      reportType,
    });

    // Calculate metrics (ALL CALCULATIONS HAPPEN HERE)
    const metrics = calculateMetrics(parsedData, reportType);
    console.log(`📊 Calculated ${metrics.length} metrics`);

    // Generate chart data
    const charts = generateChartData(parsedData, reportType);
    console.log(`📈 Generated ${charts.length} charts`);

    // Create summary table
    const tables = [createSummaryTable(parsedData)];

    // Build internal report schema
    const reportData = {
      meta,
      metrics,
      tables,
      charts,
      notes: '',
    };

    // Validate against schema
    const validation = validateInternalReport(reportData);
    if (!validation.success) {
      console.error('Schema validation failed:', validation.error);
      return res.status(400).json({
        error: 'Data validation failed',
        details: validation.error.errors,
      });
    }

    // Generate session ID for this report
    const sessionId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store parsed data for later use
    reportStorage.set(sessionId, {
      reportData: validation.data,
      createdAt: new Date(),
      filename: originalname,
    });

    // Clean up old sessions (keep last 10)
    if (reportStorage.size > 10) {
      const keys = Array.from(reportStorage.keys());
      keys.slice(0, keys.length - 10).forEach(key => reportStorage.delete(key));
    }

    // Return parsed data with session ID
    res.json({
      success: true,
      sessionId,
      data: validation.data,
      summary: {
        rowCount: parsedData.rowCount,
        columnCount: parsedData.columns.length,
        metricsCount: metrics.length,
        chartsCount: charts.length,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);

    // Handle specific error types
    if (error.message.includes('Missing required columns')) {
      return res.status(400).json({
        error: 'Invalid Excel format',
        message: error.message,
      });
    }

    if (error.message.includes('empty')) {
      return res.status(400).json({
        error: 'Empty file',
        message: 'The uploaded Excel file contains no data',
      });
    }

    next(error);
  }
});

/**
 * GET /api/report/:sessionId
 *
 * Retrieves previously parsed report data by session ID
 */
router.get('/report/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const stored = reportStorage.get(sessionId);
  if (!stored) {
    return res.status(404).json({
      error: 'Report not found',
      message: 'Session expired or invalid. Please upload the file again.',
    });
  }

  res.json({
    success: true,
    data: stored.reportData,
    filename: stored.filename,
    createdAt: stored.createdAt,
  });
});

/**
 * GET /api/templates
 *
 * Get all available report templates
 */
router.get('/templates', (req, res) => {
  res.json({
    success: true,
    templates: getAllTemplates(),
  });
});

/**
 * POST /api/upload-excel-enhanced
 *
 * Enhanced upload with template detection, trend analysis, and KPI calculation
 */
router.post('/upload-excel-enhanced', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file',
      });
    }

    const { originalname, buffer } = req.file;
    const { templateId, client, period, enableTrendAnalysis = 'true' } = req.body;

    console.log(`📂 Processing file: ${originalname}`);

    // Parse file
    const parsedData = parseExcelFile(buffer, 'custom');
    console.log(`✅ Parsed ${parsedData.rowCount} rows with ${parsedData.columns.length} columns`);
    console.log(`📋 Data format: ${parsedData.format || 'horizontal'}`);

    // Auto-detect or use specified template
    const detectedTemplateId = templateId || detectTemplate(parsedData.columns);
    const template = getTemplate(detectedTemplateId);

    console.log(`📋 Using template: ${template?.name || 'Custom'}`);

    // Extract metadata
    const meta = extractMetadata(parsedData, originalname, {
      client,
      period,
      reportType: detectedTemplateId || 'custom',
    });

    // Calculate standard metrics
    let metrics = calculateMetrics(parsedData, detectedTemplateId || 'custom');

    // Calculate template-specific KPIs if template exists
    if (template) {
      const templateKPIs = calculateTemplateKPIs(template, parsedData.rows);
      metrics = [...templateKPIs, ...metrics];
    }

    // Generate chart data
    const charts = generateChartData(parsedData, detectedTemplateId || 'custom');

    // Create summary table
    const tables = [createSummaryTable(parsedData)];

    // Run trend analysis if enabled and date column exists
    let trendAnalysis = null;
    if (enableTrendAnalysis === 'true') {
      const dateColumn = parsedData.columns.find(col =>
        col.includes('date') || col.includes('period') || col.includes('month')
      );
      const valueColumn = parsedData.columns.find(col =>
        col.includes('revenue') || col.includes('amount') || col.includes('mrr') || col.includes('sales')
      ) || parsedData.columns.find(col => {
        const sample = parsedData.rows.slice(0, 5).map(r => r[col]);
        return sample.some(v => !isNaN(parseFloat(v)));
      });

      if (dateColumn && valueColumn) {
        trendAnalysis = generateTrendAnalysis(parsedData.rows, dateColumn, valueColumn);
        console.log(`📈 Trend analysis completed`);
      }
    }

    // Build enhanced report data
    const reportData = {
      meta: {
        ...meta,
        templateUsed: template?.name || 'Custom',
        templateId: detectedTemplateId,
      },
      metrics,
      tables,
      charts,
      trendAnalysis,
      rawData: parsedData.rows, // Store for comparison feature
      notes: '',
    };

    // Generate session ID
    const sessionId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store parsed data
    reportStorage.set(sessionId, {
      reportData,
      parsedData,
      createdAt: new Date(),
      filename: originalname,
    });

    // Clean up old sessions
    if (reportStorage.size > 20) {
      const keys = Array.from(reportStorage.keys());
      keys.slice(0, keys.length - 20).forEach(key => reportStorage.delete(key));
    }

    res.json({
      success: true,
      sessionId,
      data: reportData,
      detectedTemplate: detectedTemplateId,
      templateInfo: template ? {
        name: template.name,
        description: template.description,
      } : null,
      summary: {
        rowCount: parsedData.rowCount,
        columnCount: parsedData.columns.length,
        metricsCount: metrics.length,
        chartsCount: charts.length,
        hasTrendAnalysis: !!trendAnalysis,
      },
    });

  } catch (error) {
    console.error('Enhanced upload error:', error);
    next(error);
  }
});

/**
 * POST /api/compare
 *
 * Compare two uploaded datasets with AI-powered insights
 */
router.post('/compare', upload.array('files', 2), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        error: 'Two files required',
        message: 'Please upload exactly 2 files to compare',
      });
    }

    const { labels, primaryKey, compareColumns, enableAIInsights = 'true' } = req.body;
    const parsedLabels = labels ? JSON.parse(labels) : ['Period 1', 'Period 2'];
    const parsedCompareColumns = compareColumns ? JSON.parse(compareColumns) : [];

    // Parse both files
    const datasets = req.files.map((file) => {
      const parsed = parseExcelFile(file.buffer, 'custom');
      return {
        filename: file.originalname,
        rows: parsed.rows,
        columns: parsed.columns,
      };
    });

    console.log(`🔄 Comparing: ${datasets[0].filename} vs ${datasets[1].filename}`);

    // Run comparison
    const comparison = compareDatasets(datasets[0], datasets[1], {
      primaryKey,
      compareColumns: parsedCompareColumns,
      labels: parsedLabels,
    });

    // Generate AI insights for the comparison
    let aiInsights = null;
    if (enableAIInsights === 'true') {
      try {
        console.log('🤖 Generating AI comparison insights...');
        aiInsights = await generateComparisonInsights(comparison, {
          labels: parsedLabels,
          files: datasets.map(d => d.filename),
        });
        console.log('✅ AI insights generated');
      } catch (aiError) {
        console.warn('AI insights generation failed, using basic insights:', aiError.message);
      }
    }

    // Merge AI insights with comparison data
    if (aiInsights) {
      comparison.aiInsights = aiInsights;
    }

    // Store comparison for later use
    const comparisonId = `compare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    reportStorage.set(comparisonId, {
      type: 'comparison',
      datasets,
      comparison,
      aiInsights,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      comparisonId,
      comparison,
      aiInsights,
      files: datasets.map(d => ({ filename: d.filename, columns: d.columns, rowCount: d.rows.length })),
    });

  } catch (error) {
    console.error('Comparison error:', error);
    next(error);
  }
});

/**
 * POST /api/period-comparison/:sessionId
 *
 * Compare time periods within a single dataset
 */
router.post('/period-comparison/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { dateColumn, periodType = 'month' } = req.body;

  const stored = reportStorage.get(sessionId);
  if (!stored || !stored.parsedData) {
    return res.status(404).json({
      error: 'Report not found',
      message: 'Session expired or invalid.',
    });
  }

  const { parsedData } = stored;

  // Find date column
  const actualDateColumn = dateColumn || parsedData.columns.find(col =>
    col.includes('date') || col.includes('period') || col.includes('month')
  );

  if (!actualDateColumn) {
    return res.status(400).json({
      error: 'No date column',
      message: 'Could not find a date column for period comparison',
    });
  }

  const comparison = compareTimePeriods(parsedData.rows, actualDateColumn, periodType);

  res.json({
    success: true,
    periodType,
    dateColumn: actualDateColumn,
    comparison,
  });
});

/**
 * Calculate KPIs based on template definition
 */
function calculateTemplateKPIs(template, rows) {
  const kpis = [];

  for (const kpi of template.kpis) {
    let value;

    switch (kpi.formula) {
      case 'sum':
        value = rows.reduce((sum, r) => sum + (parseFloat(r[kpi.column]) || 0), 0);
        break;
      case 'average':
        const total = rows.reduce((sum, r) => sum + (parseFloat(r[kpi.column]) || 0), 0);
        value = rows.length > 0 ? total / rows.length : 0;
        break;
      case 'count':
        value = rows.length;
        break;
      case 'custom':
        if (typeof kpi.calc === 'function') {
          value = kpi.calc(rows);
        }
        break;
      case 'growth_rate':
        if (rows.length >= 2) {
          const first = parseFloat(rows[0][kpi.column]) || 0;
          const last = parseFloat(rows[rows.length - 1][kpi.column]) || 0;
          value = first > 0 ? ((last - first) / first) * 100 : 0;
        }
        break;
      default:
        value = 0;
    }

    if (value !== undefined && !isNaN(value)) {
      kpis.push({
        name: kpi.name,
        value: Math.round(value * 100) / 100,
        unit: kpi.unit || '',
        isTemplateKPI: true,
      });
    }
  }

  return kpis;
}

// Export storage for use in other routes
export { reportStorage };
export default router;
