import * as XLSX from 'xlsx';
import { REQUIRED_COLUMNS } from '../schemas/reportSchema.js';

/**
 * File Parser Service
 * Handles parsing Excel and CSV files and converting them to internal schema
 * Supports both horizontal (standard) and vertical (report-style) formats
 *
 * IMPORTANT: All numeric calculations happen HERE, not in AI
 */

/**
 * Parse Excel/CSV file buffer to JSON
 * @param {Buffer} fileBuffer - The file buffer (Excel or CSV)
 * @param {string} reportType - Type of report (sales, financial, etc.)
 * @returns {Object} Parsed and validated data
 */
export function parseExcelFile(fileBuffer, reportType = 'custom') {
  // xlsx library handles both Excel and CSV formats
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });

  // Get the first sheet (assumption: main data is in first sheet)
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // First, get raw 2D array to detect format
  const rawArray = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  if (rawArray.length === 0) {
    throw new Error('File is empty or has no data rows');
  }

  // Detect if this is a vertical/report-style format
  const formatInfo = detectDataFormat(rawArray);
  console.log(`📊 Detected format: ${formatInfo.format}`);

  let parsedResult;

  if (formatInfo.format === 'vertical' || formatInfo.format === 'report') {
    // Parse vertical/report-style data
    parsedResult = parseVerticalFormat(rawArray);
  } else {
    // Parse standard horizontal format
    parsedResult = parseHorizontalFormat(worksheet);
  }

  // Validate required columns for the report type (skip for custom/vertical)
  if (reportType !== 'custom' && parsedResult.format !== 'vertical') {
    validateColumns(parsedResult.columns, reportType);
  }

  return {
    ...parsedResult,
    sheetName,
  };
}

/**
 * Detect if data is in horizontal, vertical, or report format
 */
function detectDataFormat(rawArray) {
  if (rawArray.length < 2) return { format: 'horizontal' };

  const firstRow = rawArray[0] || [];

  // Check for report-style indicators
  const reportIndicators = [
    'report', 'summary', 'statistics', 'generated', 'date range',
    'total', 'metric', 'value', 'performance', 'breakdown'
  ];

  // Check first few cells for report title/header patterns
  const firstCellLower = String(firstRow[0] || '').toLowerCase();
  const hasReportIndicator = reportIndicators.some(ind => firstCellLower.includes(ind));

  // Check if Column A contains mostly text labels and Column B contains values
  let labelCount = 0;
  let valueCount = 0;
  let sectionCount = 0;

  for (let i = 0; i < Math.min(30, rawArray.length); i++) {
    const row = rawArray[i] || [];
    const colA = String(row[0] || '').trim();
    const colB = row[1];

    // Check if this looks like a section header (all caps or ends with colon)
    if (colA && (colA === colA.toUpperCase() && colA.length > 3) || colA.endsWith(':')) {
      sectionCount++;
    }

    // Check if colA is text and colB is a value
    if (colA && isNaN(parseFloat(colA))) {
      labelCount++;
      if (colB !== null && colB !== undefined && colB !== '') {
        const parsed = parseFloat(String(colB).replace(/[%,$,]/g, ''));
        if (!isNaN(parsed) || String(colB).includes('%')) {
          valueCount++;
        }
      }
    }
  }

  // Determine format based on patterns
  const verticalRatio = valueCount / Math.max(labelCount, 1);

  if (hasReportIndicator || sectionCount >= 2 || verticalRatio > 0.5) {
    return {
      format: sectionCount >= 2 ? 'report' : 'vertical',
      hasReportIndicator,
      sectionCount,
      verticalRatio,
    };
  }

  return { format: 'horizontal' };
}

/**
 * Parse vertical/report-style format
 * Extracts key-value pairs and sections
 */
function parseVerticalFormat(rawArray) {
  const extractedMetrics = [];
  const sections = {};
  let currentSection = 'main';
  let sectionData = [];
  let reportMeta = {};

  for (let i = 0; i < rawArray.length; i++) {
    const row = rawArray[i] || [];
    const colA = String(row[0] || '').trim();
    const colB = row[1];
    const restOfRow = row.slice(1).filter(v => v !== null && v !== undefined && v !== '');

    // Skip empty rows
    if (!colA && restOfRow.length === 0) {
      continue;
    }

    // Check for section headers (ALL CAPS or specific keywords)
    const isSection = (
      (colA === colA.toUpperCase() && colA.length > 3 && !colA.match(/^\d/)) ||
      colA.toLowerCase().includes('breakdown') ||
      colA.toLowerCase().includes('demographics') ||
      colA.toLowerCase().includes('statistics')
    );

    if (isSection && (colB === null || colB === undefined || colB === '')) {
      // Save previous section data
      if (sectionData.length > 0) {
        sections[currentSection] = sectionData;
      }
      currentSection = colA.toLowerCase().replace(/\s+/g, '_');
      sectionData = [];
      continue;
    }

    // Extract metadata from common fields
    const colALower = colA.toLowerCase();
    if (colALower.includes('generated') || colALower.includes('date:')) {
      reportMeta.generatedDate = colB;
      continue;
    }
    if (colALower.includes('date range') || colALower.includes('period')) {
      reportMeta.period = colB;
      continue;
    }
    if (colALower.includes('advertiser') || colALower.includes('client') || colALower.includes('account')) {
      reportMeta.client = colB;
      continue;
    }

    // Check if this row is a sub-table header (multiple non-empty cells)
    const nonEmptyCells = row.filter(v => v !== null && v !== undefined && v !== '');
    if (nonEmptyCells.length > 2 && i + 1 < rawArray.length) {
      // This might be a table header - check if next row has data
      const nextRow = rawArray[i + 1] || [];
      const nextNonEmpty = nextRow.filter(v => v !== null && v !== undefined && v !== '');

      if (nextNonEmpty.length >= 2) {
        // Extract sub-table
        const tableData = extractSubTable(rawArray, i);
        if (tableData.rows.length > 0) {
          sections[`${currentSection}_table`] = tableData;
          i += tableData.rows.length; // Skip processed rows
          continue;
        }
      }
    }

    // Extract key-value pair
    if (colA && colB !== null && colB !== undefined && colB !== '') {
      const value = parseValue(colB);

      extractedMetrics.push({
        name: colA,
        value: value.numeric,
        rawValue: colB,
        unit: value.unit,
        section: currentSection,
      });

      sectionData.push({
        metric: colA,
        value: colB,
        numericValue: value.numeric,
      });
    }
  }

  // Save last section
  if (sectionData.length > 0) {
    sections[currentSection] = sectionData;
  }

  // Convert to standard format for downstream processing
  const rows = extractedMetrics.map(m => ({
    metric: m.name,
    value: m.value,
    raw_value: m.rawValue,
    unit: m.unit || '',
    section: m.section,
  }));

  return {
    columns: ['metric', 'value', 'raw_value', 'unit', 'section'],
    rows: rows,
    rowCount: rows.length,
    format: 'vertical',
    extractedMetrics,
    sections,
    reportMeta,
  };
}

/**
 * Extract a sub-table from the raw array starting at headerIndex
 */
function extractSubTable(rawArray, headerIndex) {
  const headers = rawArray[headerIndex].filter(h => h !== null && h !== undefined && h !== '');
  const rows = [];

  for (let i = headerIndex + 1; i < rawArray.length; i++) {
    const row = rawArray[i] || [];
    const firstCell = String(row[0] || '').trim();

    // Stop if we hit an empty row or a new section
    if (!firstCell || (firstCell === firstCell.toUpperCase() && firstCell.length > 3)) {
      break;
    }

    const rowData = {};
    headers.forEach((h, idx) => {
      const value = row[idx];
      rowData[String(h).toLowerCase().replace(/\s+/g, '_')] = value;
    });

    rows.push(rowData);
  }

  return { headers, rows };
}

/**
 * Parse a value and extract numeric and unit
 */
function parseValue(value) {
  if (value === null || value === undefined) {
    return { numeric: 0, unit: '' };
  }

  const strValue = String(value).trim();

  // Check for percentage
  if (strValue.includes('%')) {
    const num = parseFloat(strValue.replace(/[%,]/g, ''));
    return { numeric: isNaN(num) ? 0 : num, unit: '%' };
  }

  // Check for currency
  if (strValue.startsWith('$') || strValue.includes('$')) {
    const num = parseFloat(strValue.replace(/[$,]/g, ''));
    return { numeric: isNaN(num) ? 0 : num, unit: '$' };
  }

  // Try to parse as number
  const num = parseFloat(strValue.replace(/,/g, ''));
  return { numeric: isNaN(num) ? 0 : num, unit: '' };
}

/**
 * Parse standard horizontal format (original logic)
 */
function parseHorizontalFormat(worksheet) {
  const rawData = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    raw: false,
  });

  if (rawData.length === 0) {
    throw new Error('File is empty or has no data rows');
  }

  // Normalize column names
  const normalizedData = rawData.map(row => {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
      normalized[normalizedKey] = value;
    }
    return normalized;
  });

  const columns = Object.keys(normalizedData[0] || {});

  return {
    columns,
    rows: normalizedData,
    rowCount: normalizedData.length,
    format: 'horizontal',
  };
}

/**
 * Validate that required columns exist for the report type
 */
function validateColumns(columns, reportType) {
  const required = REQUIRED_COLUMNS[reportType] || [];
  const missing = required.filter(col => !columns.includes(col));

  if (missing.length > 0) {
    throw new Error(
      `Missing required columns for ${reportType} report: ${missing.join(', ')}. ` +
      `Found columns: ${columns.join(', ')}`
    );
  }
}

/**
 * Extract metadata from parsed data or filename
 * @param {Object} parsedData - Parsed Excel data
 * @param {string} filename - Original filename
 * @param {Object} userMeta - User-provided metadata (optional)
 */
export function extractMetadata(parsedData, filename, userMeta = {}) {
  // Check if we have report metadata from vertical format parsing
  if (parsedData.reportMeta) {
    const rm = parsedData.reportMeta;
    return {
      client: userMeta.client || rm.client || extractClientFromFilename(filename),
      period: userMeta.period || rm.period || 'Unknown Period',
      reportType: userMeta.reportType || detectReportType(parsedData) || 'custom',
      generatedAt: new Date().toISOString(),
    };
  }

  // Try to infer period from data if date column exists
  let inferredPeriod = 'Unknown Period';
  const dateColumn = parsedData.columns.find(col =>
    col.includes('date') || col.includes('period') || col.includes('month')
  );

  if (dateColumn && parsedData.rows.length > 0) {
    const dates = parsedData.rows
      .map(row => row[dateColumn])
      .filter(Boolean)
      .sort();

    if (dates.length > 0) {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      inferredPeriod = firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
    }
  }

  // Extract client name from filename if not provided
  // Assumption: filename format might be "ClientName_Report_Date.xlsx" or .csv
  const clientFromFilename = filename
    .replace(/\.(xlsx?|csv)$/i, '')
    .split(/[_-]/)[0] || 'Unknown Client';

  return {
    client: userMeta.client || clientFromFilename,
    period: userMeta.period || inferredPeriod,
    reportType: userMeta.reportType || 'custom',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Extract client name from filename
 */
function extractClientFromFilename(filename) {
  return filename
    .replace(/\.(xlsx?|csv)$/i, '')
    .split(/[_-]/)[0] || 'Unknown Client';
}

/**
 * Detect report type from parsed data
 */
function detectReportType(parsedData) {
  const allText = JSON.stringify(parsedData).toLowerCase();

  if (allText.includes('impression') || allText.includes('click') || allText.includes('ctr') || allText.includes('advertising')) {
    return 'marketing';
  }
  if (allText.includes('revenue') || allText.includes('sales') || allText.includes('quantity')) {
    return 'sales';
  }
  if (allText.includes('expense') || allText.includes('income') || allText.includes('balance')) {
    return 'financial';
  }
  if (allText.includes('stock') || allText.includes('inventory') || allText.includes('warehouse')) {
    return 'inventory';
  }
  return 'custom';
}

/**
 * Calculate metrics from parsed data
 * ALL CALCULATIONS HAPPEN HERE - AI NEVER CALCULATES
 *
 * @param {Object} parsedData - Parsed Excel data
 * @param {string} reportType - Type of report
 * @returns {Array} Calculated metrics
 */
export function calculateMetrics(parsedData, reportType) {
  // Handle vertical format data - metrics are already extracted
  if (parsedData.format === 'vertical' && parsedData.extractedMetrics) {
    return calculateMetricsFromVerticalData(parsedData);
  }

  const { rows, columns } = parsedData;
  const metrics = [];

  // Find numeric columns
  const numericColumns = columns.filter(col => {
    const sampleValues = rows.slice(0, 10).map(row => row[col]);
    return sampleValues.some(val => !isNaN(parseFloat(val)));
  });

  // Calculate sum, average, min, max for each numeric column
  for (const col of numericColumns) {
    const values = rows
      .map(row => parseFloat(row[col]))
      .filter(val => !isNaN(val));

    if (values.length === 0) continue;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Determine unit based on column name
    const unit = inferUnit(col);

    metrics.push({
      name: `Total ${formatColumnName(col)}`,
      value: roundNumber(sum),
      unit,
    });

    metrics.push({
      name: `Average ${formatColumnName(col)}`,
      value: roundNumber(avg),
      unit,
    });

    // Only add min/max if there's meaningful variation
    if (max - min > 0) {
      metrics.push({
        name: `Highest ${formatColumnName(col)}`,
        value: roundNumber(max),
        unit,
      });
      metrics.push({
        name: `Lowest ${formatColumnName(col)}`,
        value: roundNumber(min),
        unit,
      });
    }
  }

  // Report-type specific calculations
  if (reportType === 'sales') {
    metrics.push(...calculateSalesMetrics(rows));
  } else if (reportType === 'financial') {
    metrics.push(...calculateFinancialMetrics(rows));
  } else if (reportType === 'marketing') {
    metrics.push(...calculateMarketingMetrics(rows));
  }

  return metrics;
}

/**
 * Calculate metrics from vertical/report-style data
 * The metrics are already extracted as key-value pairs
 */
function calculateMetricsFromVerticalData(parsedData) {
  const { extractedMetrics, sections } = parsedData;
  const metrics = [];

  // Add all extracted metrics
  for (const m of extractedMetrics) {
    // Skip section headers and non-numeric values
    if (m.value === 0 && m.rawValue && isNaN(parseFloat(String(m.rawValue).replace(/[%,$,]/g, '')))) {
      continue;
    }

    metrics.push({
      name: m.name,
      value: m.value,
      unit: m.unit || '',
      section: m.section,
    });
  }

  // Process any sub-tables in sections
  for (const [sectionName, sectionData] of Object.entries(sections)) {
    if (sectionName.endsWith('_table') && sectionData.rows) {
      // Extract metrics from table data
      const tableRows = sectionData.rows;
      const headers = sectionData.headers || [];

      // Find numeric columns in the table
      const numericHeaders = headers.filter(h => {
        const col = String(h).toLowerCase();
        return col.includes('impression') || col.includes('click') || col.includes('view') ||
               col.includes('ctr') || col.includes('rate') || col.includes('user') ||
               col.includes('total') || col.includes('unique') || col.includes('value') ||
               col.includes('amount') || col.includes('count');
      });

      // Aggregate by first column (category)
      if (tableRows.length > 0 && numericHeaders.length > 0) {
        const labelCol = Object.keys(tableRows[0])[0];

        for (const row of tableRows) {
          const label = row[labelCol];
          if (!label) continue;

          for (const h of numericHeaders) {
            const colKey = String(h).toLowerCase().replace(/\s+/g, '_');
            const value = parseFloat(String(row[colKey] || '0').replace(/[%,$,]/g, ''));

            if (!isNaN(value) && value !== 0) {
              metrics.push({
                name: `${label} - ${h}`,
                value: roundNumber(value),
                unit: String(row[colKey] || '').includes('%') ? '%' : '',
                section: sectionName.replace('_table', ''),
              });
            }
          }
        }
      }
    }
  }

  return metrics;
}

/**
 * Sales-specific metric calculations
 */
function calculateSalesMetrics(rows) {
  const metrics = [];

  // Calculate profit margin if cost and revenue exist
  const hasRevenue = rows[0]?.revenue !== undefined;
  const hasCost = rows[0]?.cost !== undefined;
  const hasProfit = rows[0]?.profit !== undefined;

  if (hasRevenue) {
    const totalRevenue = rows.reduce((sum, row) =>
      sum + (parseFloat(row.revenue) || 0), 0);

    if (hasCost) {
      const totalCost = rows.reduce((sum, row) =>
        sum + (parseFloat(row.cost) || 0), 0);
      const profitMargin = ((totalRevenue - totalCost) / totalRevenue) * 100;

      metrics.push({
        name: 'Profit Margin',
        value: roundNumber(profitMargin),
        unit: '%',
      });
    }
  }

  // Units sold
  const hasQuantity = rows[0]?.quantity !== undefined;
  if (hasQuantity) {
    const totalUnits = rows.reduce((sum, row) =>
      sum + (parseInt(row.quantity) || 0), 0);
    metrics.push({
      name: 'Total Units Sold',
      value: totalUnits,
      unit: 'units',
    });
  }

  return metrics;
}

/**
 * Financial-specific metric calculations
 */
function calculateFinancialMetrics(rows) {
  const metrics = [];

  // Group by category and sum amounts
  const hasCategory = rows[0]?.category !== undefined;
  const hasAmount = rows[0]?.amount !== undefined;

  if (hasCategory && hasAmount) {
    const categoryTotals = {};
    rows.forEach(row => {
      const category = row.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) +
        (parseFloat(row.amount) || 0);
    });

    // Find highest expense/income category
    const categories = Object.entries(categoryTotals);
    if (categories.length > 0) {
      const sorted = categories.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      metrics.push({
        name: 'Largest Category',
        value: roundNumber(Math.abs(sorted[0][1])),
        unit: '$',
      });
    }
  }

  return metrics;
}

/**
 * Marketing-specific metric calculations
 */
function calculateMarketingMetrics(rows) {
  const metrics = [];

  const hasImpressions = rows[0]?.impressions !== undefined;
  const hasClicks = rows[0]?.clicks !== undefined;
  const hasConversions = rows[0]?.conversions !== undefined;

  if (hasImpressions && hasClicks) {
    const totalImpressions = rows.reduce((sum, row) =>
      sum + (parseInt(row.impressions) || 0), 0);
    const totalClicks = rows.reduce((sum, row) =>
      sum + (parseInt(row.clicks) || 0), 0);

    if (totalImpressions > 0) {
      const ctr = (totalClicks / totalImpressions) * 100;
      metrics.push({
        name: 'Click-Through Rate',
        value: roundNumber(ctr, 2),
        unit: '%',
      });
    }
  }

  if (hasClicks && hasConversions) {
    const totalClicks = rows.reduce((sum, row) =>
      sum + (parseInt(row.clicks) || 0), 0);
    const totalConversions = rows.reduce((sum, row) =>
      sum + (parseInt(row.conversions) || 0), 0);

    if (totalClicks > 0) {
      const conversionRate = (totalConversions / totalClicks) * 100;
      metrics.push({
        name: 'Conversion Rate',
        value: roundNumber(conversionRate, 2),
        unit: '%',
      });
    }
  }

  return metrics;
}

/**
 * Generate chart data from parsed data
 */
export function generateChartData(parsedData, reportType) {
  // Handle vertical format data
  if (parsedData.format === 'vertical' && parsedData.extractedMetrics) {
    return generateChartsFromVerticalData(parsedData);
  }

  const { rows, columns } = parsedData;
  const charts = [];

  // Find a good label column (non-numeric, categorical)
  const labelColumn = columns.find(col =>
    col.includes('product') || col.includes('category') ||
    col.includes('campaign') || col.includes('name') ||
    col.includes('region') || col.includes('month')
  ) || columns[0];

  // Find numeric columns for values
  const numericColumns = columns.filter(col => {
    const sampleValues = rows.slice(0, 5).map(row => row[col]);
    return sampleValues.some(val => !isNaN(parseFloat(val)));
  });

  if (numericColumns.length === 0) return charts;

  // Aggregate data by label
  const aggregated = {};
  rows.forEach(row => {
    const label = String(row[labelColumn] || 'Unknown');
    if (!aggregated[label]) {
      aggregated[label] = {};
      numericColumns.forEach(col => aggregated[label][col] = 0);
    }
    numericColumns.forEach(col => {
      aggregated[label][col] += parseFloat(row[col]) || 0;
    });
  });

  // Create bar chart for first numeric column
  const primaryNumeric = numericColumns[0];
  const barChartData = Object.entries(aggregated)
    .slice(0, 10) // Limit to 10 items for readability
    .map(([label, values]) => ({
      label,
      value: roundNumber(values[primaryNumeric]),
    }));

  charts.push({
    id: 'main-bar-chart',
    title: `${formatColumnName(primaryNumeric)} by ${formatColumnName(labelColumn)}`,
    type: 'bar',
    data: barChartData,
    xAxisLabel: formatColumnName(labelColumn),
    yAxisLabel: formatColumnName(primaryNumeric),
  });

  // Create pie chart if we have good categorical data
  if (barChartData.length >= 2 && barChartData.length <= 8) {
    charts.push({
      id: 'distribution-pie-chart',
      title: `${formatColumnName(primaryNumeric)} Distribution`,
      type: 'pie',
      data: barChartData,
    });
  }

  // Create line chart if there's a date/time column
  const dateColumn = columns.find(col =>
    col.includes('date') || col.includes('month') || col.includes('period')
  );

  if (dateColumn && numericColumns.length > 0) {
    const timeSeriesData = Object.entries(
      rows.reduce((acc, row) => {
        const date = String(row[dateColumn] || 'Unknown');
        acc[date] = (acc[date] || 0) + (parseFloat(row[primaryNumeric]) || 0);
        return acc;
      }, {})
    )
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([label, value]) => ({ label, value: roundNumber(value) }));

    if (timeSeriesData.length >= 2) {
      charts.push({
        id: 'trend-line-chart',
        title: `${formatColumnName(primaryNumeric)} Over Time`,
        type: 'line',
        data: timeSeriesData,
        xAxisLabel: formatColumnName(dateColumn),
        yAxisLabel: formatColumnName(primaryNumeric),
      });
    }
  }

  return charts;
}

/**
 * Generate charts from vertical/report-style data
 */
function generateChartsFromVerticalData(parsedData) {
  const { extractedMetrics, sections } = parsedData;
  const charts = [];

  // Group metrics by section for potential charts
  const sectionMetrics = {};
  for (const m of extractedMetrics) {
    if (m.value !== 0) {
      if (!sectionMetrics[m.section]) {
        sectionMetrics[m.section] = [];
      }
      sectionMetrics[m.section].push(m);
    }
  }

  // Create bar chart from main summary metrics (non-percentage values)
  const mainMetrics = (sectionMetrics['main'] || sectionMetrics['summary_statistics'] || [])
    .filter(m => m.unit !== '%' && m.value > 0)
    .slice(0, 8);

  if (mainMetrics.length >= 2) {
    charts.push({
      id: 'main-metrics-bar',
      title: 'Key Metrics Overview',
      type: 'bar',
      data: mainMetrics.map(m => ({
        label: m.name,
        value: roundNumber(m.value),
      })),
    });
  }

  // Look for demographic/breakdown data in sections
  for (const [sectionName, data] of Object.entries(sections)) {
    if (sectionName.endsWith('_table') && data.rows && data.rows.length >= 2) {
      const rows = data.rows;
      const firstRow = rows[0];
      const labelKey = Object.keys(firstRow)[0];

      // Find a good numeric column to chart
      const numericKey = Object.keys(firstRow).find(k => {
        const val = firstRow[k];
        return k !== labelKey && !isNaN(parseFloat(String(val).replace(/[%,$,]/g, '')));
      });

      if (numericKey) {
        const chartData = rows.slice(0, 10).map(row => ({
          label: String(row[labelKey] || 'Unknown'),
          value: parseFloat(String(row[numericKey] || '0').replace(/[%,$,]/g, '')) || 0,
        })).filter(d => d.value !== 0);

        if (chartData.length >= 2) {
          const sectionTitle = sectionName.replace('_table', '').replace(/_/g, ' ');
          charts.push({
            id: `${sectionName}-chart`,
            title: `${formatColumnName(sectionTitle)} - ${formatColumnName(numericKey)}`,
            type: chartData.length <= 6 ? 'pie' : 'bar',
            data: chartData,
          });
        }
      }
    }
  }

  // If we have percentage metrics, create a separate chart for them
  const percentMetrics = extractedMetrics
    .filter(m => m.unit === '%' && m.value > 0 && m.value <= 100)
    .slice(0, 6);

  if (percentMetrics.length >= 2) {
    charts.push({
      id: 'percentage-metrics',
      title: 'Rate Metrics (%)',
      type: 'bar',
      data: percentMetrics.map(m => ({
        label: m.name,
        value: roundNumber(m.value),
      })),
    });
  }

  return charts;
}

/**
 * Create summary table from data
 */
export function createSummaryTable(parsedData) {
  // Handle vertical format
  if (parsedData.format === 'vertical' && parsedData.extractedMetrics) {
    const metrics = parsedData.extractedMetrics.filter(m => m.value !== 0 || m.rawValue);
    return {
      name: 'Extracted Metrics',
      columns: ['Metric', 'Value', 'Section'],
      rows: metrics.slice(0, 30).map(m => ({
        'Metric': m.name,
        'Value': m.rawValue || m.value,
        'Section': formatColumnName(m.section || 'main'),
      })),
    };
  }

  const { rows, columns } = parsedData;

  // Return first 20 rows as preview table
  return {
    name: 'Data Preview',
    columns: columns.map(formatColumnName),
    rows: rows.slice(0, 20).map(row => {
      const formatted = {};
      columns.forEach(col => {
        formatted[formatColumnName(col)] = row[col];
      });
      return formatted;
    }),
  };
}

// Helper functions

function roundNumber(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function formatColumnName(col) {
  return col
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function inferUnit(columnName) {
  const lower = columnName.toLowerCase();
  if (lower.includes('revenue') || lower.includes('cost') ||
      lower.includes('price') || lower.includes('amount') ||
      lower.includes('profit') || lower.includes('sales')) {
    return '$';
  }
  if (lower.includes('percent') || lower.includes('rate') ||
      lower.includes('margin')) {
    return '%';
  }
  if (lower.includes('quantity') || lower.includes('count') ||
      lower.includes('units') || lower.includes('stock')) {
    return 'units';
  }
  return '';
}
