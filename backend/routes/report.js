import express from 'express';
import { reportStorage } from './upload.js';
import { generateInsights, generateFallbackInsights } from '../services/geminiService.js';
import { generatePDF } from '../services/pdfGenerator.js';
import { generatePPT } from '../services/pptGenerator.js';

const router = express.Router();

/**
 * In-memory storage for generated reports
 * Maps sessionId to { insights, pdfFile, pptFile }
 */
const generatedReports = new Map();

/**
 * POST /api/generate-report
 *
 * Generates a complete report with AI insights, PDF, and PPT.
 *
 * Body params:
 * - sessionId: string (from upload response)
 * - useFallback: boolean (optional, skip AI if true)
 */
router.post('/generate-report', async (req, res, next) => {
  try {
    const { sessionId, useFallback = false } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing sessionId',
        message: 'Please provide the sessionId from the upload response',
      });
    }

    // Get stored report data
    const stored = reportStorage.get(sessionId);
    if (!stored) {
      return res.status(404).json({
        error: 'Report not found',
        message: 'Session expired or invalid. Please upload the file again.',
      });
    }

    const { reportData, parsedData } = stored;

    // Enhance reportData with raw data and parsed data info for better AI analysis
    const enhancedReportData = {
      ...reportData,
      rawData: parsedData?.rows || reportData.rawData || [],
      parsedData: parsedData, // Pass full parsed data including format info
    };

    console.log(`🔄 Generating report for session: ${sessionId}`);
    console.log(`📊 Data format: ${parsedData?.format || 'horizontal'}`);
    console.log(`📊 Raw data rows available: ${enhancedReportData.rawData?.length || 0}`);

    // Generate AI insights (or fallback)
    let insights;
    if (useFallback || !process.env.GEMINI_API_KEY) {
      console.log('📝 Using fallback insights (no AI)');
      insights = generateFallbackInsights(enhancedReportData);
    } else {
      try {
        console.log('🤖 Calling Gemini API for insights...');
        insights = await generateInsights(enhancedReportData);
        console.log('✅ AI insights generated successfully');
      } catch (aiError) {
        console.error('⚠️ AI generation failed, using fallback:', aiError.message);
        insights = generateFallbackInsights(enhancedReportData);
      }
    }

    // Generate PDF
    console.log('📄 Generating PDF...');
    const pdfFilename = await generatePDF(reportData, insights);
    console.log(`✅ PDF generated: ${pdfFilename}`);

    // Generate PPT
    console.log('📊 Generating PPT...');
    const pptFilename = await generatePPT(reportData, insights);
    console.log(`✅ PPT generated: ${pptFilename}`);

    // Store generated report
    generatedReports.set(sessionId, {
      insights,
      pdfFile: pdfFilename,
      pptFile: pptFilename,
      generatedAt: new Date(),
    });

    // Clean up old generated reports (keep last 10)
    if (generatedReports.size > 10) {
      const keys = Array.from(generatedReports.keys());
      keys.slice(0, keys.length - 10).forEach(key => generatedReports.delete(key));
    }

    res.json({
      success: true,
      sessionId,
      insights,
      downloads: {
        pdf: `/api/download/pdf/${sessionId}`,
        ppt: `/api/download/ppt/${sessionId}`,
      },
    });

  } catch (error) {
    console.error('Report generation error:', error);
    next(error);
  }
});

/**
 * GET /api/report-status/:sessionId
 *
 * Check if a report has been generated for a session
 */
router.get('/report-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const generated = generatedReports.get(sessionId);
  if (!generated) {
    return res.json({
      generated: false,
      message: 'Report not yet generated for this session',
    });
  }

  res.json({
    generated: true,
    generatedAt: generated.generatedAt,
    downloads: {
      pdf: `/api/download/pdf/${sessionId}`,
      ppt: `/api/download/ppt/${sessionId}`,
    },
  });
});

// Export for use in download routes
export { generatedReports };
export default router;
