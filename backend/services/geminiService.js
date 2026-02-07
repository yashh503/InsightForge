import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateGeminiResponse } from '../schemas/reportSchema.js';

/**
 * Gemini API Service using @google/generative-ai SDK
 *
 * CRITICAL RULES:
 * 1. AI NEVER calculates numbers - all data is pre-computed
 * 2. AI only receives structured JSON with final values
 * 3. AI output must match strict schema
 * 4. Retry on schema mismatch
 */

const MAX_RETRIES = 3;

/**
 * Enhanced system prompt for deeper business analysis
 */
const SYSTEM_PROMPT = `You are an expert business analyst specializing in data-driven insights. You analyze Excel/CSV business data and provide actionable recommendations.

CRITICAL RULES:
1. ONLY reference numbers and values that appear in the provided data
2. Be SPECIFIC - mention actual column names, values, and percentages from the data
3. Identify the TOP performers and BOTTOM performers by name
4. Highlight significant patterns (highest values, lowest values, big gaps)
5. Your response MUST be valid JSON

ANALYSIS REQUIREMENTS:
- Name specific items/categories when discussing performance (e.g., "Product X had the highest revenue at $50,000")
- Calculate relative comparisons (e.g., "A is 3x higher than B")
- Identify outliers and anomalies with specific values
- Consider business implications of the data patterns
- Provide actionable next steps based on what the data shows

RESPONSE FORMAT - Respond with ONLY this JSON (STRICT ARRAY LIMITS):
{
  "executiveSummary": "2-3 sentences highlighting the most important findings with specific numbers and names from the data",
  "keyInsights": ["EXACTLY 4-5 insights (MAX 5) - each MUST reference actual values/names from the data"],
  "recommendations": ["EXACTLY 3 action items (MAX 3) based on what the data shows"],
  "riskFactors": ["1-2 concerns (MAX 3) with specific data points"],
  "opportunities": ["2-3 growth opportunities (MAX 3) identified from data patterns"],
  "benchmarkContext": "brief note on how these metrics look relative to typical business performance"
}

STRICT LIMITS: keyInsights<=5, recommendations<=3, riskFactors<=3, opportunities<=3. DO NOT EXCEED.

Example of GOOD insight: "Product A generated $125,000 (45% of total revenue) while Product D only contributed $8,500 (3%)"
Example of BAD insight: "Some products performed better than others"

DO NOT include any text outside the JSON.`;

/**
 * Generate executive summary and insights using Gemini API
 *
 * @param {Object} reportData - The internal report schema data (pre-calculated)
 * @param {Object} options - Additional context options
 * @returns {Object} Validated Gemini response
 */
export async function generateInsights(reportData, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  // Initialize the Gemini client
  const genAI = new GoogleGenerativeAI(apiKey);

  // Use gemini-2.0-flash model
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.4, // Slightly higher for more nuanced insights
      topP: 0.85,
      topK: 40,
      maxOutputTokens: 2048, // More room for detailed analysis
    },
  });

  // Build the user prompt with enhanced data
  const userPrompt = buildEnhancedPrompt(reportData, options);

  let lastError = null;

  // Retry loop for schema validation
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const textContent = response.text();

      if (!textContent) {
        throw new Error('No text content in Gemini response');
      }

      const parsed = parseGeminiResponse(textContent);

      // Truncate arrays to ensure they meet schema limits
      const truncated = {
        ...parsed,
        keyInsights: (parsed.keyInsights || []).slice(0, 8),
        recommendations: (parsed.recommendations || []).slice(0, 5),
        riskFactors: (parsed.riskFactors || []).slice(0, 5),
        opportunities: (parsed.opportunities || []).slice(0, 5),
      };

      // Validate against our schema (with extended fields)
      const validation = validateGeminiResponse(truncated);

      if (validation.success) {
        return {
          ...validation.data,
          opportunities: truncated.opportunities || [],
          benchmarkContext: truncated.benchmarkContext || null,
        };
      }

      console.warn(`Attempt ${attempt}: Schema validation failed`, validation.error);
      lastError = new Error(`Schema validation failed: ${JSON.stringify(validation.error.errors)}`);

    } catch (error) {
      console.error(`Attempt ${attempt}: API call failed`, error.message);
      lastError = error;
    }

    if (attempt < MAX_RETRIES) {
      await sleep(1000 * attempt);
    }
  }

  throw lastError || new Error('Failed to generate insights after all retries');
}

/**
 * Build enhanced prompt with actual data for better analysis
 */
function buildEnhancedPrompt(reportData, options = {}) {
  const { meta, metrics, charts, trendAnalysis, rawData, tables, parsedData } = reportData;
  const { industryContext } = options;

  // Check if this is vertical/report format data
  const isVerticalFormat = parsedData?.format === 'vertical';

  // Get sample raw data rows for context
  let sampleRows = rawData?.slice(0, 15) || tables?.[0]?.rows?.slice(0, 15) || [];

  // For vertical format, use extracted metrics as the primary data source
  if (isVerticalFormat && parsedData?.extractedMetrics) {
    sampleRows = parsedData.extractedMetrics.slice(0, 20).map(m => ({
      metric: m.name,
      value: m.rawValue || m.value,
      section: m.section,
    }));
  }

  // Calculate additional insights from raw data
  const dataAnalysis = isVerticalFormat ? null : analyzeRawData(sampleRows);

  // Get chart data with actual values
  const chartBreakdowns = charts
    .filter(c => c.data && c.data.length > 0)
    .slice(0, 3)
    .map(c => ({
      title: c.title,
      items: c.data.slice(0, 10).map(d => ({
        name: d.label,
        value: d.value,
      })),
      total: c.data.reduce((sum, d) => sum + (d.value || 0), 0),
    }));

  // Find top and bottom performers for each breakdown
  chartBreakdowns.forEach(breakdown => {
    if (breakdown.items.length > 0) {
      const sorted = [...breakdown.items].sort((a, b) => b.value - a.value);
      breakdown.topPerformer = sorted[0];
      breakdown.bottomPerformer = sorted[sorted.length - 1];
      breakdown.topContribution = breakdown.total > 0
        ? ((sorted[0].value / breakdown.total) * 100).toFixed(1)
        : 0;
    }
  });

  // Build comprehensive data object
  const dataForAI = {
    report: {
      client: meta.client,
      period: meta.period,
      type: meta.reportType,
      totalRows: rawData?.length || sampleRows.length,
    },

    // Aggregated metrics with context
    aggregatedMetrics: metrics.slice(0, 15).map(m => ({
      name: m.name,
      value: m.value,
      unit: m.unit || '',
    })),

    // Breakdowns with rankings
    breakdowns: chartBreakdowns,

    // Raw data analysis
    dataPatterns: dataAnalysis,

    // Sample data for context (first few rows)
    sampleData: sampleRows.slice(0, 8),
  };

  // Add trend analysis if available
  if (trendAnalysis) {
    dataForAI.trends = {
      direction: trendAnalysis.trends?.trend || 'unknown',
      growthRate: trendAnalysis.growthRates?.summary?.averageGrowthRate,
      forecast: trendAnalysis.forecast?.trendDirection,
      anomalyCount: trendAnalysis.anomalies?.anomalies?.length || 0,
    };
  }

  // Add format info for vertical data
  if (isVerticalFormat) {
    dataForAI.dataFormat = 'vertical_report';
    dataForAI.reportStructure = 'This is a performance report with metrics listed as key-value pairs';

    // Group metrics by section for better context
    if (parsedData?.sections) {
      dataForAI.sections = Object.keys(parsedData.sections);
    }
  }

  // Build appropriate prompt based on format
  const formatNote = isVerticalFormat
    ? 'This is a PERFORMANCE REPORT with metrics in key-value format. Analyze the specific metric values provided.'
    : 'Reference SPECIFIC names and values from the data below. Every insight should mention actual items/numbers.';

  return `Analyze this ${meta.reportType || 'business'} data for ${meta.client} (${meta.period}).

${industryContext ? `CONTEXT: ${industryContext}\n` : ''}
IMPORTANT: ${formatNote}

DATA TO ANALYZE:
${JSON.stringify(dataForAI, null, 2)}

Provide detailed analysis as JSON. Each insight MUST reference specific metric names and their exact values from this data.`;
}

/**
 * Analyze raw data to find patterns
 */
function analyzeRawData(rows) {
  if (!rows || rows.length === 0) return null;

  const columns = Object.keys(rows[0] || {});
  const analysis = {
    rowCount: rows.length,
    columns: columns,
  };

  // Find numeric columns and their ranges
  const numericStats = {};
  columns.forEach(col => {
    const values = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      numericStats[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: Math.round((sum / values.length) * 100) / 100,
        total: Math.round(sum * 100) / 100,
      };
    }
  });

  if (Object.keys(numericStats).length > 0) {
    analysis.numericColumns = numericStats;
  }

  // Find categorical breakdowns
  const categoricalColumns = columns.filter(col => {
    const sample = rows.slice(0, 10).map(r => r[col]);
    return sample.every(v => isNaN(parseFloat(v)) || typeof v === 'string');
  }).slice(0, 3);

  categoricalColumns.forEach(col => {
    const counts = {};
    rows.forEach(r => {
      const val = r[col] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });
    if (Object.keys(counts).length <= 20) {
      analysis[`${col}_distribution`] = counts;
    }
  });

  return analysis;
}

/**
 * Parse Gemini response and extract JSON
 */
function parseGeminiResponse(textContent) {
  // Try to parse as JSON directly
  try {
    return JSON.parse(textContent.trim());
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to find JSON object in the text
    const objectMatch = textContent.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not parse JSON from Gemini response');
  }
}

/**
 * Generate insights for comparison reports
 */
export async function generateComparisonInsights(comparisonData, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateFallbackComparisonInsights(comparisonData);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2000,
    },
  });

  // Build detailed comparison data for AI
  const { summary, details, insights } = comparisonData;
  const { labels = ['Period 1', 'Period 2'], files = [] } = options;

  // Transform summary into readable format with rankings
  const metricsAnalysis = Object.entries(summary || {}).map(([metric, data]) => {
    const val1 = data[labels[0]] || 0;
    const val2 = data[labels[1]] || 0;
    return {
      metric: formatMetricName(metric),
      [labels[0]]: val1,
      [labels[1]]: val2,
      change: data.absoluteChange || 0,
      percentChange: data.percentageChange || 0,
      direction: data.direction,
      interpretation: data.direction === 'up'
        ? `Increased by ${Math.abs(data.percentageChange || 0).toFixed(1)}%`
        : data.direction === 'down'
          ? `Decreased by ${Math.abs(data.percentageChange || 0).toFixed(1)}%`
          : 'No change',
    };
  });

  // Sort by absolute change to find biggest movers
  const sortedByChange = [...metricsAnalysis].sort((a, b) =>
    Math.abs(b.percentChange) - Math.abs(a.percentChange)
  );

  const biggestGains = sortedByChange.filter(m => m.direction === 'up').slice(0, 3);
  const biggestDeclines = sortedByChange.filter(m => m.direction === 'down').slice(0, 3);

  const dataForAI = {
    comparison: {
      file1: files[0] || labels[0],
      file2: files[1] || labels[1],
    },
    allMetrics: metricsAnalysis,
    highlights: {
      biggestGains: biggestGains.map(m => ({
        metric: m.metric,
        from: m[labels[0]],
        to: m[labels[1]],
        percentChange: `+${m.percentChange.toFixed(1)}%`,
      })),
      biggestDeclines: biggestDeclines.map(m => ({
        metric: m.metric,
        from: m[labels[0]],
        to: m[labels[1]],
        percentChange: `${m.percentChange.toFixed(1)}%`,
      })),
    },
    summary: {
      totalMetrics: metricsAnalysis.length,
      improved: metricsAnalysis.filter(m => m.direction === 'up').length,
      declined: metricsAnalysis.filter(m => m.direction === 'down').length,
      unchanged: metricsAnalysis.filter(m => m.direction === 'neutral').length,
    },
    existingInsights: insights?.slice(0, 5) || [],
  };

  // Add row-level details if available
  if (details && details.length > 0) {
    dataForAI.topMovers = details.slice(0, 5).map(d => {
      const firstComparison = Object.entries(d.comparisons || {})[0];
      return {
        item: Object.values(d)[0],
        metric: firstComparison?.[0],
        change: firstComparison?.[1]?.change,
      };
    });
  }

  const prompt = `You are analyzing a comparison between two Excel files/data periods.

FILES COMPARED:
- ${files[0] || labels[0]}
- ${files[1] || labels[1]}

DETAILED COMPARISON DATA:
${JSON.stringify(dataForAI, null, 2)}

Analyze this comparison and provide SPECIFIC insights. Reference actual metric names, values, and percentages.

Required JSON response:
{
  "summaryStatement": "2-3 sentences summarizing the KEY findings. Mention the most significant change by name and percentage.",
  "significantChanges": [
    "Each item should name a specific metric and its exact change (e.g., 'Revenue increased from $50,000 to $65,000, a 30% gain')"
  ],
  "recommendations": [
    "Specific actions based on the data. Reference which metrics need attention and why."
  ],
  "areasOfConcern": [
    "Specific declining metrics with their values that warrant attention"
  ]
}

Every insight MUST include specific metric names and numbers from the data above.
DO NOT include any text outside the JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseGeminiResponse(response.text());
  } catch (error) {
    console.error('Comparison insights error:', error);
    return generateFallbackComparisonInsights(comparisonData);
  }
}

/**
 * Format metric name for readability
 */
function formatMetricName(name) {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a fallback response if API fails - now with better specificity
 */
export function generateFallbackInsights(reportData) {
  const { meta, metrics, charts, rawData, trendAnalysis } = reportData;

  const keyInsights = [];
  const recommendations = [];
  const riskFactors = [];
  const opportunities = [];

  // Find the highest value metrics
  const sortedMetrics = [...metrics]
    .filter(m => typeof m.value === 'number' && m.value > 0)
    .sort((a, b) => b.value - a.value);

  // Add top metrics with context
  if (sortedMetrics.length > 0) {
    const top = sortedMetrics[0];
    keyInsights.push(`${top.name} is ${top.unit === '$' ? '$' : ''}${top.value.toLocaleString()}${top.unit && top.unit !== '$' ? ' ' + top.unit : ''}`);
  }

  // Find totals and averages
  const totals = metrics.filter(m => m.name.toLowerCase().includes('total'));
  const averages = metrics.filter(m => m.name.toLowerCase().includes('average'));

  if (totals.length > 0) {
    const mainTotal = totals[0];
    keyInsights.push(`${mainTotal.name}: ${mainTotal.unit === '$' ? '$' : ''}${mainTotal.value.toLocaleString()}`);
  }

  if (averages.length > 0) {
    const mainAvg = averages[0];
    keyInsights.push(`${mainAvg.name}: ${mainAvg.unit === '$' ? '$' : ''}${mainAvg.value.toLocaleString()}`);
  }

  // Analyze chart data for top/bottom performers
  if (charts && charts.length > 0) {
    const mainChart = charts.find(c => c.data && c.data.length > 1);
    if (mainChart) {
      const sorted = [...mainChart.data].sort((a, b) => b.value - a.value);
      if (sorted.length >= 2) {
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];
        keyInsights.push(`Top performer: ${top.label} with ${top.value.toLocaleString()}`);
        if (bottom.value < top.value * 0.5) {
          riskFactors.push(`${bottom.label} is significantly lower at ${bottom.value.toLocaleString()}`);
        }
      }
    }
  }

  // Add trend insight if available
  if (trendAnalysis?.trends?.trend) {
    const trendMap = {
      strong_growth: 'Data shows strong growth momentum',
      moderate_growth: 'Data shows moderate growth trend',
      stable: 'Performance is stable with minimal variation',
      moderate_decline: 'There is a moderate declining trend',
      strong_decline: 'Data shows significant decline requiring attention',
    };
    keyInsights.push(trendMap[trendAnalysis.trends.trend] || 'Trend analysis completed');
  }

  // Calculate row count for context
  const rowCount = rawData?.length || 0;

  // Generate recommendations based on data
  if (sortedMetrics.length > 5) {
    recommendations.push('Focus on the top-performing metrics to understand success factors');
  }
  recommendations.push('Consider comparing with previous periods to identify trends');
  if (rowCount > 50) {
    recommendations.push(`With ${rowCount} data points, consider segmenting by category for deeper analysis`);
  }

  // Ensure we have enough insights
  while (keyInsights.length < 3 && metrics.length > keyInsights.length) {
    const m = metrics[keyInsights.length];
    if (m && m.value) {
      keyInsights.push(`${m.name}: ${m.unit === '$' ? '$' : ''}${m.value.toLocaleString()}${m.unit && m.unit !== '$' ? ' ' + m.unit : ''}`);
    }
  }

  // Build executive summary with actual numbers
  let summary = `This ${meta.reportType || 'business'} report for ${meta.client} covers ${meta.period}.`;
  if (totals.length > 0) {
    const mainTotal = totals[0];
    summary += ` ${mainTotal.name} reached ${mainTotal.unit === '$' ? '$' : ''}${mainTotal.value.toLocaleString()}.`;
  }
  summary += ` Analysis covers ${metrics.length} calculated metrics${rowCount > 0 ? ` from ${rowCount} data rows` : ''}.`;

  return {
    executiveSummary: summary,
    keyInsights: keyInsights.slice(0, 5),
    recommendations: recommendations.slice(0, 3),
    riskFactors: riskFactors.slice(0, 2),
    opportunities: opportunities,
  };
}

/**
 * Fallback for comparison insights - now with specific data
 */
function generateFallbackComparisonInsights(comparisonData) {
  const { summary, insights } = comparisonData;
  const significantChanges = [];
  const areasOfConcern = [];
  const recommendations = [];

  // Analyze summary data for specific insights
  const summaryEntries = Object.entries(summary || {});

  // Sort by absolute percentage change
  const sortedChanges = summaryEntries
    .map(([metric, data]) => ({
      metric: formatMetricName(metric),
      ...data,
    }))
    .sort((a, b) => Math.abs(b.percentageChange || 0) - Math.abs(a.percentageChange || 0));

  // Find biggest gains
  const gains = sortedChanges.filter(c => c.direction === 'up');
  const declines = sortedChanges.filter(c => c.direction === 'down');

  // Build significant changes with actual values
  gains.slice(0, 2).forEach(g => {
    const labels = Object.keys(g).filter(k => !['metric', 'absoluteChange', 'percentageChange', 'direction'].includes(k));
    significantChanges.push(
      `${g.metric} increased by ${Math.abs(g.percentageChange || 0).toFixed(1)}% (from ${g[labels[0]]} to ${g[labels[1]]})`
    );
  });

  declines.slice(0, 2).forEach(d => {
    const labels = Object.keys(d).filter(k => !['metric', 'absoluteChange', 'percentageChange', 'direction'].includes(k));
    significantChanges.push(
      `${d.metric} decreased by ${Math.abs(d.percentageChange || 0).toFixed(1)}% (from ${d[labels[0]]} to ${d[labels[1]]})`
    );
    areasOfConcern.push(`${d.metric} declined by ${Math.abs(d.percentageChange || 0).toFixed(1)}% and needs attention`);
  });

  // Add from existing insights if we need more
  if (significantChanges.length < 3 && insights) {
    insights.slice(0, 3 - significantChanges.length).forEach(i => {
      if (i.message && !significantChanges.includes(i.message)) {
        significantChanges.push(i.message);
      }
    });
  }

  // Generate recommendations
  if (gains.length > 0) {
    recommendations.push(`Investigate what drove the increase in ${gains[0].metric} to replicate success`);
  }
  if (declines.length > 0) {
    recommendations.push(`Address the decline in ${declines[0].metric} as a priority`);
  }
  recommendations.push('Continue monitoring these metrics to track improvement');

  // Build summary statement
  let summaryStatement = `Comparison analysis complete. `;
  if (gains.length > 0 && declines.length > 0) {
    summaryStatement += `${gains.length} metric(s) improved while ${declines.length} declined. `;
    summaryStatement += `Biggest gain: ${gains[0].metric} (+${gains[0].percentageChange?.toFixed(1)}%). `;
    summaryStatement += `Biggest decline: ${declines[0].metric} (${declines[0].percentageChange?.toFixed(1)}%).`;
  } else if (gains.length > 0) {
    summaryStatement += `All changed metrics showed improvement, led by ${gains[0].metric} (+${gains[0].percentageChange?.toFixed(1)}%).`;
  } else if (declines.length > 0) {
    summaryStatement += `Several metrics declined, led by ${declines[0].metric} (${declines[0].percentageChange?.toFixed(1)}%).`;
  } else {
    summaryStatement += `Metrics remained relatively stable with no significant changes.`;
  }

  return {
    summaryStatement,
    significantChanges: significantChanges.slice(0, 5),
    recommendations: recommendations.slice(0, 3),
    areasOfConcern: areasOfConcern.slice(0, 2),
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
