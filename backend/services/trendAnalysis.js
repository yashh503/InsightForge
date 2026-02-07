/**
 * Trend Analysis Service
 *
 * Provides:
 * - Period-over-period comparison
 * - Growth rate calculations
 * - Anomaly detection
 * - Simple forecasting
 */

/**
 * Calculate period-over-period comparison
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data (optional)
 * @param {string} valueColumn - Column to compare
 */
export function calculatePeriodComparison(currentData, previousData, valueColumn) {
  const currentTotal = currentData.reduce((sum, r) => sum + (parseFloat(r[valueColumn]) || 0), 0);
  const previousTotal = previousData
    ? previousData.reduce((sum, r) => sum + (parseFloat(r[valueColumn]) || 0), 0)
    : 0;

  const absoluteChange = currentTotal - previousTotal;
  const percentageChange = previousTotal > 0 ? ((absoluteChange / previousTotal) * 100) : 0;

  return {
    current: roundNumber(currentTotal),
    previous: roundNumber(previousTotal),
    absoluteChange: roundNumber(absoluteChange),
    percentageChange: roundNumber(percentageChange),
    direction: absoluteChange > 0 ? 'up' : absoluteChange < 0 ? 'down' : 'neutral',
  };
}

/**
 * Calculate growth rates over time
 * @param {Array} data - Data sorted by date
 * @param {string} dateColumn - Column containing dates
 * @param {string} valueColumn - Column containing values
 */
export function calculateGrowthRates(data, dateColumn, valueColumn) {
  if (data.length < 2) return [];

  const growthRates = [];
  let previousValue = parseFloat(data[0][valueColumn]) || 0;

  for (let i = 1; i < data.length; i++) {
    const currentValue = parseFloat(data[i][valueColumn]) || 0;
    const growthRate = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

    growthRates.push({
      date: data[i][dateColumn],
      value: roundNumber(currentValue),
      previousValue: roundNumber(previousValue),
      growthRate: roundNumber(growthRate),
      direction: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
    });

    previousValue = currentValue;
  }

  // Calculate average and compound growth rates
  const avgGrowthRate = growthRates.length > 0
    ? growthRates.reduce((sum, r) => sum + r.growthRate, 0) / growthRates.length
    : 0;

  const firstValue = parseFloat(data[0][valueColumn]) || 0;
  const lastValue = parseFloat(data[data.length - 1][valueColumn]) || 0;
  const periods = data.length - 1;
  const cagr = firstValue > 0 && periods > 0
    ? (Math.pow(lastValue / firstValue, 1 / periods) - 1) * 100
    : 0;

  return {
    periods: growthRates,
    summary: {
      averageGrowthRate: roundNumber(avgGrowthRate),
      compoundGrowthRate: roundNumber(cagr),
      totalGrowth: roundNumber(firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0),
      startValue: roundNumber(firstValue),
      endValue: roundNumber(lastValue),
    },
  };
}

/**
 * Detect anomalies using statistical methods (Z-score)
 * @param {Array} data - Data array
 * @param {string} valueColumn - Column to analyze
 * @param {number} threshold - Z-score threshold (default 2)
 */
export function detectAnomalies(data, valueColumn, threshold = 2) {
  const values = data.map(r => parseFloat(r[valueColumn]) || 0);

  if (values.length < 3) return { anomalies: [], stats: null };

  // Calculate mean and standard deviation
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Find anomalies
  const anomalies = data
    .map((row, index) => {
      const value = parseFloat(row[valueColumn]) || 0;
      const zScore = stdDev > 0 ? (value - mean) / stdDev : 0;

      if (Math.abs(zScore) > threshold) {
        return {
          index,
          row,
          value: roundNumber(value),
          zScore: roundNumber(zScore),
          type: zScore > 0 ? 'high' : 'low',
          deviation: roundNumber(Math.abs(value - mean)),
          deviationPercent: roundNumber(mean > 0 ? (Math.abs(value - mean) / mean) * 100 : 0),
        };
      }
      return null;
    })
    .filter(Boolean);

  return {
    anomalies,
    stats: {
      mean: roundNumber(mean),
      stdDev: roundNumber(stdDev),
      min: roundNumber(Math.min(...values)),
      max: roundNumber(Math.max(...values)),
      threshold,
    },
  };
}

/**
 * Simple linear regression forecast
 * @param {Array} data - Historical data sorted by date
 * @param {string} dateColumn - Column containing dates
 * @param {string} valueColumn - Column containing values
 * @param {number} periodsAhead - Number of periods to forecast
 */
export function simpleForecast(data, dateColumn, valueColumn, periodsAhead = 3) {
  if (data.length < 3) return { forecast: [], confidence: 'low' };

  const values = data.map(r => parseFloat(r[valueColumn]) || 0);
  const n = values.length;

  // Simple linear regression
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, v) => sum + v, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }

  const slope = denominator > 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared for confidence
  const ssTotal = values.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0);
  const ssResidual = values.reduce((sum, v, i) => {
    const predicted = intercept + slope * i;
    return sum + Math.pow(v - predicted, 2);
  }, 0);
  const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;

  // Generate forecast
  const forecast = [];
  for (let i = 1; i <= periodsAhead; i++) {
    const predictedValue = intercept + slope * (n - 1 + i);
    forecast.push({
      period: i,
      predictedValue: roundNumber(Math.max(0, predictedValue)), // Ensure non-negative
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    });
  }

  return {
    forecast,
    model: {
      slope: roundNumber(slope),
      intercept: roundNumber(intercept),
      rSquared: roundNumber(rSquared),
    },
    confidence: rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'medium' : 'low',
    trendDirection: slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'flat',
  };
}

/**
 * Calculate moving averages
 * @param {Array} data - Data array
 * @param {string} valueColumn - Column to analyze
 * @param {number} window - Moving average window size
 */
export function calculateMovingAverage(data, valueColumn, window = 3) {
  const values = data.map(r => parseFloat(r[valueColumn]) || 0);
  const movingAverages = [];

  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      movingAverages.push(null);
    } else {
      const windowValues = values.slice(i - window + 1, i + 1);
      const avg = windowValues.reduce((sum, v) => sum + v, 0) / window;
      movingAverages.push(roundNumber(avg));
    }
  }

  return movingAverages;
}

/**
 * Identify trends and patterns
 * @param {Array} data - Data sorted by date
 * @param {string} valueColumn - Column to analyze
 */
export function identifyTrends(data, valueColumn) {
  if (data.length < 3) {
    return { trend: 'insufficient_data', patterns: [] };
  }

  const values = data.map(r => parseFloat(r[valueColumn]) || 0);
  const n = values.length;

  // Calculate trend direction
  const firstHalf = values.slice(0, Math.floor(n / 2));
  const secondHalf = values.slice(Math.floor(n / 2));
  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  let trend;
  const changePercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  if (changePercent > 10) trend = 'strong_growth';
  else if (changePercent > 3) trend = 'moderate_growth';
  else if (changePercent > -3) trend = 'stable';
  else if (changePercent > -10) trend = 'moderate_decline';
  else trend = 'strong_decline';

  // Detect patterns
  const patterns = [];

  // Check for seasonality (simplified)
  if (n >= 6) {
    const diffs = [];
    for (let i = 1; i < n; i++) {
      diffs.push(values[i] - values[i - 1]);
    }
    const positiveDiffs = diffs.filter(d => d > 0).length;
    const negativeDiffs = diffs.filter(d => d < 0).length;

    if (Math.abs(positiveDiffs - negativeDiffs) < n / 4) {
      patterns.push({ type: 'volatility', description: 'High variability in values' });
    }
  }

  // Check for consistent growth
  let consecutiveGrowth = 0;
  let consecutiveDecline = 0;
  for (let i = 1; i < n; i++) {
    if (values[i] > values[i - 1]) {
      consecutiveGrowth++;
      consecutiveDecline = 0;
    } else if (values[i] < values[i - 1]) {
      consecutiveDecline++;
      consecutiveGrowth = 0;
    }
  }

  if (consecutiveGrowth >= 3) {
    patterns.push({ type: 'momentum', description: `${consecutiveGrowth} consecutive periods of growth` });
  }
  if (consecutiveDecline >= 3) {
    patterns.push({ type: 'warning', description: `${consecutiveDecline} consecutive periods of decline` });
  }

  return {
    trend,
    changePercent: roundNumber(changePercent),
    patterns,
    summary: {
      firstPeriodAvg: roundNumber(firstAvg),
      secondPeriodAvg: roundNumber(secondAvg),
      periodCount: n,
    },
  };
}

/**
 * Generate comprehensive trend analysis
 */
export function generateTrendAnalysis(data, dateColumn, valueColumn, previousData = null) {
  const analysis = {
    periodComparison: previousData
      ? calculatePeriodComparison(data, previousData, valueColumn)
      : null,
    growthRates: calculateGrowthRates(data, dateColumn, valueColumn),
    anomalies: detectAnomalies(data, valueColumn),
    forecast: simpleForecast(data, dateColumn, valueColumn),
    trends: identifyTrends(data, valueColumn),
    movingAverage: calculateMovingAverage(data, valueColumn),
  };

  return analysis;
}

// Helper
function roundNumber(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
