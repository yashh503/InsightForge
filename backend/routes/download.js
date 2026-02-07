import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generatedReports } from './report.js';
import { reportStorage } from './upload.js';
import { generateComparisonPDF } from '../services/pdfGenerator.js';
import { generateComparisonPPT } from '../services/pptGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/download/pdf/:sessionId
 *
 * Downloads the generated PDF report
 */
router.get('/download/pdf/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const generated = generatedReports.get(sessionId);
  if (!generated || !generated.pdfFile) {
    return res.status(404).json({
      error: 'PDF not found',
      message: 'Report not generated or session expired. Please generate the report first.',
    });
  }

  const filepath = path.join(__dirname, '..', 'generated', generated.pdfFile);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      error: 'File not found',
      message: 'PDF file was not found on server. Please regenerate the report.',
    });
  }

  res.download(filepath, generated.pdfFile, (err) => {
    if (err) {
      console.error('PDF download error:', err);
      // Don't send error if headers already sent
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    }
  });
});

/**
 * GET /api/download/ppt/:sessionId
 *
 * Downloads the generated PowerPoint presentation
 */
router.get('/download/ppt/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const generated = generatedReports.get(sessionId);
  if (!generated || !generated.pptFile) {
    return res.status(404).json({
      error: 'PPT not found',
      message: 'Report not generated or session expired. Please generate the report first.',
    });
  }

  const filepath = path.join(__dirname, '..', 'generated', generated.pptFile);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      error: 'File not found',
      message: 'PPT file was not found on server. Please regenerate the report.',
    });
  }

  res.download(filepath, generated.pptFile, (err) => {
    if (err) {
      console.error('PPT download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    }
  });
});

/**
 * GET /api/download/both/:sessionId
 *
 * Returns download URLs for both PDF and PPT
 * (Useful for frontend to show download buttons)
 */
router.get('/download/both/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const generated = generatedReports.get(sessionId);
  if (!generated) {
    return res.status(404).json({
      error: 'Report not found',
      message: 'Report not generated or session expired.',
    });
  }

  res.json({
    success: true,
    downloads: {
      pdf: {
        url: `/api/download/pdf/${sessionId}`,
        filename: generated.pdfFile,
      },
      ppt: {
        url: `/api/download/ppt/${sessionId}`,
        filename: generated.pptFile,
      },
    },
    generatedAt: generated.generatedAt,
  });
});

/**
 * GET /api/download/comparison-pdf/:comparisonId
 *
 * Downloads a generated comparison PDF report
 */
router.get('/download/comparison-pdf/:comparisonId', async (req, res) => {
  const { comparisonId } = req.params;

  const stored = reportStorage.get(comparisonId);
  if (!stored || stored.type !== 'comparison') {
    return res.status(404).json({
      error: 'Comparison not found',
      message: 'Comparison session expired or invalid.',
    });
  }

  try {
    const { comparison, aiInsights, datasets } = stored;
    const files = datasets.map(d => ({ filename: d.filename }));

    console.log('📄 Generating comparison PDF...');
    const pdfFilename = await generateComparisonPDF(comparison, aiInsights, files);

    const filepath = path.join(__dirname, '..', 'generated', pdfFilename);

    res.download(filepath, pdfFilename, (err) => {
      if (err) {
        console.error('Comparison PDF download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
      }
    });
  } catch (error) {
    console.error('Comparison PDF generation error:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/download/comparison-ppt/:comparisonId
 *
 * Downloads a generated comparison PowerPoint presentation
 */
router.get('/download/comparison-ppt/:comparisonId', async (req, res) => {
  const { comparisonId } = req.params;

  const stored = reportStorage.get(comparisonId);
  if (!stored || stored.type !== 'comparison') {
    return res.status(404).json({
      error: 'Comparison not found',
      message: 'Comparison session expired or invalid.',
    });
  }

  try {
    const { comparison, aiInsights, datasets } = stored;
    const files = datasets.map(d => ({ filename: d.filename }));

    console.log('📊 Generating comparison PPT...');
    const pptFilename = await generateComparisonPPT(comparison, aiInsights, files);

    const filepath = path.join(__dirname, '..', 'generated', pptFilename);

    res.download(filepath, pptFilename, (err) => {
      if (err) {
        console.error('Comparison PPT download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
      }
    });
  } catch (error) {
    console.error('Comparison PPT generation error:', error);
    res.status(500).json({
      error: 'PPT generation failed',
      message: error.message,
    });
  }
});

export default router;
