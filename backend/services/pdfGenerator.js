import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTheme } from '../config/colorThemes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PDF Generator Service
 * Creates professional PDF reports from structured data
 *
 * Branding: InsightForge
 */

// Brand name constant
const BRAND_NAME = 'InsightForge';

/**
 * Generate PDF report
 *
 * @param {Object} reportData - Complete report data with insights
 * @param {Object} insights - AI-generated insights
 * @param {string} themeId - Color theme ID (default, emerald, purple, slate, coral)
 * @returns {string} Path to generated PDF file
 */
export async function generatePDF(reportData, insights, themeId = 'default') {
  const { meta, metrics, tables } = reportData;
  const theme = getTheme(themeId);

  // Use theme colors in hex format for PDF
  const COLORS = {
    primary: theme.primaryHex,
    secondary: theme.secondaryHex,
    success: theme.successHex,
    danger: theme.dangerHex,
    text: theme.textHex,
    lightText: theme.lightTextHex,
    border: theme.borderHex,
    background: theme.backgroundHex,
    accent: theme.accentHex,
  };

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `report_${meta.client.replace(/\s+/g, '_')}_${timestamp}.pdf`;
  const filepath = path.join(outputDir, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true, // Required for switchToPage() to work
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `${meta.reportType} Report - ${meta.client}`,
          Author: 'Report Automation System',
          Subject: `${meta.reportType} Report for ${meta.period}`,
        },
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add content with theme colors
      addHeader(doc, meta, COLORS);
      addExecutiveSummary(doc, insights, COLORS);
      addKeyMetrics(doc, metrics, COLORS);
      addInsights(doc, insights, COLORS);
      addDataTable(doc, tables, COLORS);
      addFooter(doc, COLORS);

      doc.end();

      stream.on('finish', () => resolve(filename));
      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add header section with title and metadata
 */
function addHeader(doc, meta, COLORS) {
  // Accent line at top
  doc
    .fillColor(COLORS.primary)
    .rect(50, 40, 200, 4)
    .fill();

  doc.y = 55;

  // Title
  doc
    .fillColor(COLORS.primary)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text(formatReportType(meta.reportType) + ' Report', { align: 'left' });

  doc.moveDown(0.3);

  // Client and period
  doc
    .fillColor(COLORS.text)
    .fontSize(14)
    .font('Helvetica')
    .text(meta.client, { align: 'left' });

  doc
    .fillColor(COLORS.lightText)
    .fontSize(11)
    .text(`Period: ${meta.period}`, { align: 'left' });

  doc
    .fontSize(9)
    .text(`Generated: ${new Date(meta.generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`, { align: 'left' });

  // Divider line
  doc.moveDown(0.5);
  doc
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(1);
}

/**
 * Add executive summary section
 */
function addExecutiveSummary(doc, insights, COLORS) {
  doc
    .fillColor(COLORS.primary)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Executive Summary');

  doc.moveDown(0.3);

  // AI badge
  const badgeY = doc.y;
  doc
    .fillColor(COLORS.accent || COLORS.primary)
    .roundedRect(50, badgeY, 25, 14, 3)
    .fill();

  doc
    .fillColor('#ffffff')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('AI', 50, badgeY + 3, { width: 25, align: 'center' });

  doc.y = badgeY + 20;

  doc
    .fillColor(COLORS.text)
    .fontSize(11)
    .font('Helvetica')
    .text(insights.executiveSummary, {
      align: 'justify',
      lineGap: 3,
    });

  doc.moveDown(1);
}

/**
 * Add key metrics in a grid layout
 */
function addKeyMetrics(doc, metrics, COLORS) {
  // Check if we need a new page
  if (doc.y > 650) {
    doc.addPage();
  }

  doc
    .fillColor(COLORS.primary)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Key Metrics');

  doc.moveDown(0.5);

  // Display metrics in a 2-column grid
  const startX = 50;
  const startY = doc.y;
  const colWidth = 240;
  const rowHeight = 50;
  const maxPerPage = 8;

  const displayMetrics = metrics.slice(0, maxPerPage);

  displayMetrics.forEach((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + (col * (colWidth + 15));
    const y = startY + (row * rowHeight);

    // Check if we need a new page
    if (y > 700) {
      doc.addPage();
      return;
    }

    // Metric box background
    doc
      .fillColor(COLORS.background)
      .roundedRect(x, y, colWidth, rowHeight - 5, 5)
      .fill();

    // Left accent bar
    doc
      .fillColor(COLORS.primary)
      .rect(x, y + 5, 3, rowHeight - 15)
      .fill();

    // Metric name
    doc
      .fillColor(COLORS.lightText)
      .fontSize(9)
      .font('Helvetica')
      .text(metric.name, x + 12, y + 8, { width: colWidth - 24 });

    // Metric value
    const valueText = formatValue(metric.value, metric.unit);
    doc
      .fillColor(COLORS.text)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(valueText, x + 12, y + 24, { width: colWidth - 24 });
  });

  // Move cursor below metrics grid
  const rowsUsed = Math.ceil(displayMetrics.length / 2);
  doc.y = startY + (rowsUsed * rowHeight) + 10;
  doc.moveDown(0.5);
}

/**
 * Add AI-generated insights
 */
function addInsights(doc, insights, COLORS) {
  // Check if we need a new page
  if (doc.y > 600) {
    doc.addPage();
  }

  doc
    .fillColor(COLORS.primary)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('Key Insights');

  doc.moveDown(0.3);

  // Key insights as bullet points
  insights.keyInsights.forEach(insight => {
    doc
      .fillColor(COLORS.text)
      .fontSize(10)
      .font('Helvetica')
      .text(`• ${insight}`, {
        indent: 10,
        lineGap: 2,
      });
    doc.moveDown(0.2);
  });

  doc.moveDown(0.5);

  // Recommendations if present
  if (insights.recommendations && insights.recommendations.length > 0) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fillColor(COLORS.success)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Recommendations');

    doc.moveDown(0.3);

    insights.recommendations.forEach(rec => {
      doc
        .fillColor(COLORS.text)
        .fontSize(10)
        .font('Helvetica')
        .text(`✓ ${rec}`, { indent: 10, lineGap: 2 });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
  }

  // Risk factors if present
  if (insights.riskFactors && insights.riskFactors.length > 0) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fillColor(COLORS.danger)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Risk Factors');

    doc.moveDown(0.3);

    insights.riskFactors.forEach(risk => {
      doc
        .fillColor(COLORS.text)
        .fontSize(10)
        .font('Helvetica')
        .text(`⚠ ${risk}`, { indent: 10, lineGap: 2 });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
  }

  // Opportunities if present
  if (insights.opportunities && insights.opportunities.length > 0) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc
      .fillColor(COLORS.accent || '#7c3aed')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Growth Opportunities');

    doc.moveDown(0.3);

    insights.opportunities.forEach(opp => {
      doc
        .fillColor(COLORS.text)
        .fontSize(10)
        .font('Helvetica')
        .text(`→ ${opp}`, { indent: 10, lineGap: 2 });
      doc.moveDown(0.2);
    });
  }

  doc.moveDown(1);
}

/**
 * Add data preview table
 */
function addDataTable(doc, tables, COLORS) {
  if (!tables || tables.length === 0) return;

  const table = tables[0]; // Use first table (data preview)

  // Check if we need a new page
  if (doc.y > 500) {
    doc.addPage();
  }

  doc
    .fillColor(COLORS.primary)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(table.name || 'Data Preview');

  doc.moveDown(0.5);

  // Calculate column widths (max 5 columns for readability)
  const displayColumns = table.columns.slice(0, 5);
  const tableWidth = 495;
  const colWidth = tableWidth / displayColumns.length;
  const startX = 50;
  let currentY = doc.y;

  // Header row with theme color
  doc
    .fillColor(COLORS.primary)
    .rect(startX, currentY, tableWidth, 20)
    .fill();

  displayColumns.forEach((col, index) => {
    doc
      .fillColor('#ffffff')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(
        truncateText(col, colWidth - 10),
        startX + (index * colWidth) + 5,
        currentY + 6,
        { width: colWidth - 10, height: 14 }
      );
  });

  currentY += 20;

  // Data rows (max 10 rows)
  const displayRows = table.rows.slice(0, 10);

  displayRows.forEach((row, rowIndex) => {
    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc
        .fillColor(COLORS.background)
        .rect(startX, currentY, tableWidth, 18)
        .fill();
    }

    displayColumns.forEach((col, colIndex) => {
      const value = row[col] ?? '-';
      doc
        .fillColor(COLORS.text)
        .fontSize(8)
        .font('Helvetica')
        .text(
          truncateText(String(value), colWidth - 10),
          startX + (colIndex * colWidth) + 5,
          currentY + 5,
          { width: colWidth - 10, height: 14 }
        );
    });

    currentY += 18;

    // Check for page break
    if (currentY > 750) {
      doc.addPage();
      currentY = 50;
    }
  });

  doc.y = currentY + 10;
}

/**
 * Add footer to all pages with branding
 */
function addFooter(doc, COLORS) {
  const pages = doc.bufferedPageRange();

  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    // Footer line
    doc
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .moveTo(50, 780)
      .lineTo(545, 780)
      .stroke();

    // Page number
    doc
      .fillColor(COLORS.lightText)
      .fontSize(8)
      .font('Helvetica')
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        785,
        { align: 'center', width: 495 }
      );

    // Generated by InsightForge branding
    doc
      .fillColor(COLORS.lightText)
      .text(
        `Generated by ${BRAND_NAME}`,
        50,
        785,
        { align: 'left', width: 200 }
      );
  }
}

// Helper functions

function formatReportType(type) {
  const types = {
    sales: 'Sales',
    financial: 'Financial',
    marketing: 'Marketing',
    inventory: 'Inventory',
    custom: 'Custom',
  };
  return types[type] || 'Business';
}

function formatValue(value, unit) {
  if (unit === '$') {
    return `$${value.toLocaleString()}`;
  }
  if (unit === '%') {
    return `${value}%`;
  }
  return `${value.toLocaleString()}${unit ? ' ' + unit : ''}`;
}

function truncateText(text, maxWidth) {
  // Rough estimate: 6 pixels per character at font size 8
  const maxChars = Math.floor(maxWidth / 5);
  if (text.length > maxChars) {
    return text.substring(0, maxChars - 2) + '...';
  }
  return text;
}

/**
 * Generate Comparison PDF Report
 *
 * @param {Object} comparison - Comparison data
 * @param {Object} aiInsights - AI-generated comparison insights
 * @param {Array} files - File info array
 * @param {string} themeId - Color theme ID
 * @returns {string} Path to generated PDF file
 */
export async function generateComparisonPDF(comparison, aiInsights, files, themeId = 'default') {
  const theme = getTheme(themeId);

  // Use theme colors in hex format for PDF
  const COLORS = {
    primary: theme.primaryHex,
    secondary: theme.secondaryHex,
    success: theme.successHex,
    danger: theme.dangerHex,
    text: theme.textHex,
    lightText: theme.lightTextHex,
    border: theme.borderHex,
    background: theme.backgroundHex,
    accent: theme.accentHex,
  };

  const outputDir = path.join(__dirname, '..', 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const filename = `comparison_report_${timestamp}.pdf`;
  const filepath = path.join(outputDir, filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: 'Comparison Report',
          Author: BRAND_NAME,
          Subject: `Comparison: ${files[0]?.filename} vs ${files[1]?.filename}`,
        },
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc
        .fillColor(COLORS.primary)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Comparison Report', { align: 'left' });

      doc.moveDown(0.3);

      doc
        .fillColor(COLORS.text)
        .fontSize(12)
        .font('Helvetica')
        .text(`${files[0]?.filename || 'File 1'} vs ${files[1]?.filename || 'File 2'}`, { align: 'left' });

      doc
        .fillColor(COLORS.lightText)
        .fontSize(9)
        .text(`Generated: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`, { align: 'left' });

      // Divider
      doc.moveDown(0.5);
      doc
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
      doc.moveDown(1);

      // AI Summary
      if (aiInsights?.summaryStatement) {
        doc
          .fillColor(COLORS.primary)
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('AI Analysis Summary');

        doc.moveDown(0.3);

        doc
          .fillColor(COLORS.text)
          .fontSize(11)
          .font('Helvetica')
          .text(aiInsights.summaryStatement, { align: 'justify', lineGap: 3 });

        doc.moveDown(1);
      }

      // Summary Stats
      const summary = comparison.summary || {};
      const metricEntries = Object.entries(summary);

      if (metricEntries.length > 0) {
        doc
          .fillColor(COLORS.primary)
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('Metrics Comparison');

        doc.moveDown(0.5);

        // Create table
        const startX = 50;
        let currentY = doc.y;
        const colWidths = [150, 100, 100, 70, 75];
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);

        // Header row
        doc
          .fillColor(COLORS.primary)
          .rect(startX, currentY, tableWidth, 22)
          .fill();

        const headers = ['Metric', 'File 1', 'File 2', 'Change', '% Change'];
        let xPos = startX;
        headers.forEach((header, i) => {
          doc
            .fillColor('#ffffff')
            .fontSize(8)
            .font('Helvetica-Bold')
            .text(header, xPos + 5, currentY + 7, { width: colWidths[i] - 10 });
          xPos += colWidths[i];
        });

        currentY += 22;

        // Data rows
        metricEntries.slice(0, 15).forEach(([metric, data], index) => {
          if (currentY > 720) {
            doc.addPage();
            currentY = 50;
          }

          if (index % 2 === 0) {
            doc
              .fillColor(COLORS.background)
              .rect(startX, currentY, tableWidth, 20)
              .fill();
          }

          const labels = Object.keys(data).filter(k => !['absoluteChange', 'percentageChange', 'direction'].includes(k));
          const val1 = data[labels[0]] || 0;
          const val2 = data[labels[1]] || 0;
          const absChange = data.absoluteChange || 0;
          const pctChange = data.percentageChange || 0;

          xPos = startX;

          // Metric name
          doc
            .fillColor(COLORS.text)
            .fontSize(8)
            .font('Helvetica')
            .text(formatColumnName(metric), xPos + 5, currentY + 6, { width: colWidths[0] - 10 });
          xPos += colWidths[0];

          // Value 1
          doc.text(formatNumber(val1), xPos + 5, currentY + 6, { width: colWidths[1] - 10 });
          xPos += colWidths[1];

          // Value 2
          doc.text(formatNumber(val2), xPos + 5, currentY + 6, { width: colWidths[2] - 10 });
          xPos += colWidths[2];

          // Absolute change
          const changeColor = absChange > 0 ? COLORS.success : absChange < 0 ? COLORS.danger : COLORS.text;
          doc
            .fillColor(changeColor)
            .text((absChange > 0 ? '+' : '') + formatNumber(absChange), xPos + 5, currentY + 6, { width: colWidths[3] - 10 });
          xPos += colWidths[3];

          // Percentage change
          doc
            .fillColor(changeColor)
            .text((pctChange > 0 ? '+' : '') + pctChange.toFixed(1) + '%', xPos + 5, currentY + 6, { width: colWidths[4] - 10 });

          currentY += 20;
        });

        doc.y = currentY + 10;
        doc.moveDown(1);
      }

      // AI Significant Changes
      if (aiInsights?.significantChanges && aiInsights.significantChanges.length > 0) {
        if (doc.y > 600) doc.addPage();

        doc
          .fillColor(COLORS.primary)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Significant Changes');

        doc.moveDown(0.3);

        aiInsights.significantChanges.forEach(change => {
          doc
            .fillColor(COLORS.text)
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${change}`, { indent: 10, lineGap: 2 });
          doc.moveDown(0.2);
        });

        doc.moveDown(0.5);
      }

      // AI Recommendations
      if (aiInsights?.recommendations && aiInsights.recommendations.length > 0) {
        if (doc.y > 650) doc.addPage();

        doc
          .fillColor(COLORS.success)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Recommendations');

        doc.moveDown(0.3);

        aiInsights.recommendations.forEach(rec => {
          doc
            .fillColor(COLORS.text)
            .fontSize(10)
            .font('Helvetica')
            .text(`✓ ${rec}`, { indent: 10, lineGap: 2 });
          doc.moveDown(0.2);
        });

        doc.moveDown(0.5);
      }

      // AI Areas of Concern
      if (aiInsights?.areasOfConcern && aiInsights.areasOfConcern.length > 0) {
        if (doc.y > 650) doc.addPage();

        doc
          .fillColor(COLORS.danger)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Areas of Concern');

        doc.moveDown(0.3);

        aiInsights.areasOfConcern.forEach(concern => {
          doc
            .fillColor(COLORS.text)
            .fontSize(10)
            .font('Helvetica')
            .text(`⚠ ${concern}`, { indent: 10, lineGap: 2 });
          doc.moveDown(0.2);
        });
      }

      // Footer with branding
      addFooter(doc, COLORS);

      doc.end();

      stream.on('finish', () => resolve(filename));
      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
}

function formatColumnName(col) {
  return col
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatNumber(num) {
  if (typeof num !== 'number') return String(num);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
