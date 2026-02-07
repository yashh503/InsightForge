/**
 * Multi-File Comparison Service
 *
 * Enables comparison across:
 * - Time periods (this month vs last month)
 * - Regions/segments
 * - Products
 * - Any categorical dimension
 */

/**
 * Compare two datasets and generate insights
 * @param {Object} dataset1 - First dataset with meta and data
 * @param {Object} dataset2 - Second dataset with meta and data
 * @param {Object} options - Comparison options
 */
export function compareDatasets(dataset1, dataset2, options = {}) {
  const {
    primaryKey = null, // Column to join on (e.g., 'product', 'date')
    compareColumns = [], // Columns to compare
    labels = ['Dataset 1', 'Dataset 2'],
  } = options;

  const comparison = {
    summary: {},
    details: [],
    charts: [],
    insights: [],
  };

  // If no specific columns, find common numeric columns
  const columns1 = Object.keys(dataset1.rows[0] || {});
  const columns2 = Object.keys(dataset2.rows[0] || {});
  const commonColumns = columns1.filter(c => columns2.includes(c));

  const numericColumns = compareColumns.length > 0
    ? compareColumns
    : commonColumns.filter(col => {
        const sample1 = dataset1.rows.slice(0, 5).map(r => r[col]);
        return sample1.some(v => !isNaN(parseFloat(v)));
      });

  // Calculate totals for each numeric column
  for (const col of numericColumns) {
    const total1 = dataset1.rows.reduce((sum, r) => sum + (parseFloat(r[col]) || 0), 0);
    const total2 = dataset2.rows.reduce((sum, r) => sum + (parseFloat(r[col]) || 0), 0);
    const change = total1 > 0 ? ((total2 - total1) / total1) * 100 : 0;

    comparison.summary[col] = {
      [labels[0]]: roundNumber(total1),
      [labels[1]]: roundNumber(total2),
      absoluteChange: roundNumber(total2 - total1),
      percentageChange: roundNumber(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };

    // Generate insight
    if (Math.abs(change) > 10) {
      comparison.insights.push({
        type: change > 0 ? 'positive' : 'negative',
        metric: formatColumnName(col),
        message: `${formatColumnName(col)} ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(roundNumber(change))}% from ${labels[0]} to ${labels[1]}`,
      });
    }
  }

  // If primary key exists, do row-by-row comparison
  if (primaryKey && commonColumns.includes(primaryKey)) {
    const map1 = new Map(dataset1.rows.map(r => [r[primaryKey], r]));
    const map2 = new Map(dataset2.rows.map(r => [r[primaryKey], r]));

    const allKeys = new Set([...map1.keys(), ...map2.keys()]);

    for (const key of allKeys) {
      const row1 = map1.get(key);
      const row2 = map2.get(key);

      const detail = {
        [primaryKey]: key,
        status: row1 && row2 ? 'both' : row1 ? 'only_first' : 'only_second',
        comparisons: {},
      };

      for (const col of numericColumns) {
        if (col === primaryKey) continue;

        const val1 = row1 ? (parseFloat(row1[col]) || 0) : 0;
        const val2 = row2 ? (parseFloat(row2[col]) || 0) : 0;
        const change = val1 > 0 ? ((val2 - val1) / val1) * 100 : (val2 > 0 ? 100 : 0);

        detail.comparisons[col] = {
          [labels[0]]: roundNumber(val1),
          [labels[1]]: roundNumber(val2),
          change: roundNumber(change),
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        };
      }

      comparison.details.push(detail);
    }

    // Sort by biggest changes
    comparison.details.sort((a, b) => {
      const aChange = Object.values(a.comparisons)[0]?.change || 0;
      const bChange = Object.values(b.comparisons)[0]?.change || 0;
      return Math.abs(bChange) - Math.abs(aChange);
    });

    // Highlight top movers
    const topGainers = comparison.details
      .filter(d => Object.values(d.comparisons)[0]?.direction === 'up')
      .slice(0, 3);

    const topDecliners = comparison.details
      .filter(d => Object.values(d.comparisons)[0]?.direction === 'down')
      .slice(0, 3);

    if (topGainers.length > 0) {
      comparison.insights.push({
        type: 'positive',
        metric: 'Top Performers',
        message: `Top gainers: ${topGainers.map(d => d[primaryKey]).join(', ')}`,
      });
    }

    if (topDecliners.length > 0) {
      comparison.insights.push({
        type: 'negative',
        metric: 'Attention Needed',
        message: `Biggest declines: ${topDecliners.map(d => d[primaryKey]).join(', ')}`,
      });
    }
  }

  // Generate comparison charts
  comparison.charts = generateComparisonCharts(comparison, numericColumns, labels, primaryKey);

  return comparison;
}

/**
 * Compare multiple datasets (more than 2)
 */
export function compareMultipleDatasets(datasets, options = {}) {
  const { labels = datasets.map((_, i) => `Dataset ${i + 1}`), compareColumns = [] } = options;

  const results = {
    summary: {},
    rankings: [],
    charts: [],
  };

  // Find common numeric columns
  const allColumns = datasets.map(d => Object.keys(d.rows[0] || {}));
  const commonColumns = allColumns.reduce((common, cols) =>
    common.filter(c => cols.includes(c)), allColumns[0] || []);

  const numericColumns = compareColumns.length > 0
    ? compareColumns
    : commonColumns.filter(col => {
        const sample = datasets[0].rows.slice(0, 5).map(r => r[col]);
        return sample.some(v => !isNaN(parseFloat(v)));
      });

  // Calculate totals for each dataset
  for (const col of numericColumns) {
    const values = datasets.map((dataset, idx) => ({
      label: labels[idx],
      total: roundNumber(dataset.rows.reduce((sum, r) => sum + (parseFloat(r[col]) || 0), 0)),
    }));

    // Rank by total
    values.sort((a, b) => b.total - a.total);

    results.summary[col] = {
      values: values.reduce((obj, v) => ({ ...obj, [v.label]: v.total }), {}),
      ranking: values.map(v => v.label),
      highest: values[0],
      lowest: values[values.length - 1],
      average: roundNumber(values.reduce((sum, v) => sum + v.total, 0) / values.length),
    };
  }

  // Overall ranking
  const scores = {};
  for (const col of numericColumns) {
    const ranking = results.summary[col].ranking;
    ranking.forEach((label, idx) => {
      scores[label] = (scores[label] || 0) + (ranking.length - idx);
    });
  }

  results.rankings = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([label, score], idx) => ({ rank: idx + 1, label, score }));

  return results;
}

/**
 * Time-based comparison (current vs previous period)
 */
export function compareTimePeriods(data, dateColumn, periodType = 'month') {
  // Sort by date
  const sorted = [...data].sort((a, b) =>
    new Date(a[dateColumn]) - new Date(b[dateColumn]));

  // Split into periods
  const periods = groupByPeriod(sorted, dateColumn, periodType);
  const periodKeys = Object.keys(periods).sort();

  if (periodKeys.length < 2) {
    return { error: 'Need at least 2 periods to compare' };
  }

  const currentPeriod = periodKeys[periodKeys.length - 1];
  const previousPeriod = periodKeys[periodKeys.length - 2];

  return compareDatasets(
    { rows: periods[previousPeriod] },
    { rows: periods[currentPeriod] },
    { labels: [previousPeriod, currentPeriod] }
  );
}

/**
 * Group data by time period
 */
function groupByPeriod(data, dateColumn, periodType) {
  const groups = {};

  for (const row of data) {
    const date = new Date(row[dateColumn]);
    if (isNaN(date.getTime())) continue;

    let key;
    switch (periodType) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Week of ${weekStart.toISOString().split('T')[0]}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()} Q${quarter}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  return groups;
}

/**
 * Generate comparison charts data
 */
function generateComparisonCharts(comparison, columns, labels, primaryKey) {
  const charts = [];

  // Summary comparison bar chart
  const summaryData = columns.slice(0, 5).map(col => ({
    metric: formatColumnName(col),
    [labels[0]]: comparison.summary[col]?.[labels[0]] || 0,
    [labels[1]]: comparison.summary[col]?.[labels[1]] || 0,
  }));

  charts.push({
    id: 'summary-comparison',
    title: 'Key Metrics Comparison',
    type: 'grouped_bar',
    data: summaryData,
    series: labels,
  });

  // Change chart
  const changeData = columns.slice(0, 8).map(col => ({
    metric: formatColumnName(col),
    change: comparison.summary[col]?.percentageChange || 0,
    direction: comparison.summary[col]?.direction || 'neutral',
  }));

  charts.push({
    id: 'change-chart',
    title: 'Percentage Change',
    type: 'bar',
    data: changeData,
  });

  // If we have detailed comparisons, create waterfall-style chart
  if (comparison.details.length > 0 && primaryKey) {
    const topDetails = comparison.details.slice(0, 10);
    const detailColumn = Object.keys(topDetails[0]?.comparisons || {})[0];

    if (detailColumn) {
      const detailData = topDetails.map(d => ({
        label: d[primaryKey],
        [labels[0]]: d.comparisons[detailColumn]?.[labels[0]] || 0,
        [labels[1]]: d.comparisons[detailColumn]?.[labels[1]] || 0,
        change: d.comparisons[detailColumn]?.change || 0,
      }));

      charts.push({
        id: 'detail-comparison',
        title: `${formatColumnName(detailColumn)} by ${formatColumnName(primaryKey)}`,
        type: 'grouped_bar',
        data: detailData,
        series: labels,
      });
    }
  }

  return charts;
}

// Helpers
function roundNumber(num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function formatColumnName(col) {
  return col
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
