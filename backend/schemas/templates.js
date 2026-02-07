/**
 * Industry-Specific Report Templates
 *
 * Each template defines:
 * - Required and optional columns
 * - KPIs to calculate
 * - Chart configurations
 * - AI prompt context
 */

export const REPORT_TEMPLATES = {
  // SaaS / Subscription Business Metrics
  saas: {
    name: 'SaaS Metrics',
    description: 'Monthly Recurring Revenue, Churn, LTV, CAC analysis',
    requiredColumns: ['date', 'mrr'],
    optionalColumns: ['new_mrr', 'churned_mrr', 'expansion_mrr', 'customers', 'new_customers', 'churned_customers', 'cac', 'arpu'],
    kpis: [
      { id: 'total_mrr', name: 'Total MRR', formula: 'sum', column: 'mrr', unit: '$' },
      { id: 'mrr_growth', name: 'MRR Growth Rate', formula: 'growth_rate', column: 'mrr', unit: '%' },
      { id: 'net_mrr', name: 'Net New MRR', formula: 'custom', calc: (data) => {
        const newMrr = data.reduce((sum, r) => sum + (parseFloat(r.new_mrr) || 0), 0);
        const churned = data.reduce((sum, r) => sum + (parseFloat(r.churned_mrr) || 0), 0);
        const expansion = data.reduce((sum, r) => sum + (parseFloat(r.expansion_mrr) || 0), 0);
        return newMrr + expansion - churned;
      }, unit: '$' },
      { id: 'churn_rate', name: 'Churn Rate', formula: 'custom', calc: (data) => {
        const startCustomers = parseFloat(data[0]?.customers) || 0;
        const churned = data.reduce((sum, r) => sum + (parseFloat(r.churned_customers) || 0), 0);
        return startCustomers > 0 ? (churned / startCustomers) * 100 : 0;
      }, unit: '%' },
      { id: 'arpu', name: 'Average Revenue Per User', formula: 'custom', calc: (data) => {
        const lastRow = data[data.length - 1];
        const mrr = parseFloat(lastRow?.mrr) || 0;
        const customers = parseFloat(lastRow?.customers) || 1;
        return mrr / customers;
      }, unit: '$' },
    ],
    charts: [
      { type: 'line', title: 'MRR Trend', xColumn: 'date', yColumn: 'mrr' },
      { type: 'bar', title: 'New vs Churned MRR', xColumn: 'date', yColumns: ['new_mrr', 'churned_mrr'] },
    ],
    aiContext: 'SaaS business metrics focusing on recurring revenue health, customer retention, and growth efficiency.',
  },

  // E-commerce Analytics
  ecommerce: {
    name: 'E-commerce Analytics',
    description: 'Sales, conversion rates, AOV, customer acquisition',
    requiredColumns: ['date', 'revenue'],
    optionalColumns: ['orders', 'visitors', 'customers', 'cart_abandonment', 'refunds', 'cogs', 'ad_spend', 'new_customers', 'returning_customers'],
    kpis: [
      { id: 'total_revenue', name: 'Total Revenue', formula: 'sum', column: 'revenue', unit: '$' },
      { id: 'total_orders', name: 'Total Orders', formula: 'sum', column: 'orders', unit: '' },
      { id: 'aov', name: 'Average Order Value', formula: 'custom', calc: (data) => {
        const revenue = data.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0);
        const orders = data.reduce((sum, r) => sum + (parseFloat(r.orders) || 0), 0);
        return orders > 0 ? revenue / orders : 0;
      }, unit: '$' },
      { id: 'conversion_rate', name: 'Conversion Rate', formula: 'custom', calc: (data) => {
        const orders = data.reduce((sum, r) => sum + (parseFloat(r.orders) || 0), 0);
        const visitors = data.reduce((sum, r) => sum + (parseFloat(r.visitors) || 0), 0);
        return visitors > 0 ? (orders / visitors) * 100 : 0;
      }, unit: '%' },
      { id: 'gross_margin', name: 'Gross Margin', formula: 'custom', calc: (data) => {
        const revenue = data.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0);
        const cogs = data.reduce((sum, r) => sum + (parseFloat(r.cogs) || 0), 0);
        return revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
      }, unit: '%' },
      { id: 'roas', name: 'Return on Ad Spend', formula: 'custom', calc: (data) => {
        const revenue = data.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0);
        const adSpend = data.reduce((sum, r) => sum + (parseFloat(r.ad_spend) || 0), 0);
        return adSpend > 0 ? revenue / adSpend : 0;
      }, unit: 'x' },
    ],
    charts: [
      { type: 'line', title: 'Revenue Trend', xColumn: 'date', yColumn: 'revenue' },
      { type: 'bar', title: 'Orders & Visitors', xColumn: 'date', yColumns: ['orders', 'visitors'] },
      { type: 'line', title: 'Conversion Rate Over Time', xColumn: 'date', yColumn: 'conversion_rate', calculated: true },
    ],
    aiContext: 'E-commerce performance metrics focusing on revenue growth, customer acquisition cost efficiency, and conversion optimization.',
  },

  // Marketing Campaign ROI
  marketing_roi: {
    name: 'Marketing ROI',
    description: 'Campaign performance, attribution, channel effectiveness',
    requiredColumns: ['campaign', 'spend'],
    optionalColumns: ['impressions', 'clicks', 'conversions', 'revenue', 'leads', 'channel', 'start_date', 'end_date'],
    kpis: [
      { id: 'total_spend', name: 'Total Ad Spend', formula: 'sum', column: 'spend', unit: '$' },
      { id: 'total_revenue', name: 'Revenue Generated', formula: 'sum', column: 'revenue', unit: '$' },
      { id: 'roi', name: 'Return on Investment', formula: 'custom', calc: (data) => {
        const revenue = data.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0);
        const spend = data.reduce((sum, r) => sum + (parseFloat(r.spend) || 0), 0);
        return spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
      }, unit: '%' },
      { id: 'ctr', name: 'Click-Through Rate', formula: 'custom', calc: (data) => {
        const clicks = data.reduce((sum, r) => sum + (parseFloat(r.clicks) || 0), 0);
        const impressions = data.reduce((sum, r) => sum + (parseFloat(r.impressions) || 0), 0);
        return impressions > 0 ? (clicks / impressions) * 100 : 0;
      }, unit: '%' },
      { id: 'cpc', name: 'Cost Per Click', formula: 'custom', calc: (data) => {
        const spend = data.reduce((sum, r) => sum + (parseFloat(r.spend) || 0), 0);
        const clicks = data.reduce((sum, r) => sum + (parseFloat(r.clicks) || 0), 0);
        return clicks > 0 ? spend / clicks : 0;
      }, unit: '$' },
      { id: 'cpa', name: 'Cost Per Acquisition', formula: 'custom', calc: (data) => {
        const spend = data.reduce((sum, r) => sum + (parseFloat(r.spend) || 0), 0);
        const conversions = data.reduce((sum, r) => sum + (parseFloat(r.conversions) || 0), 0);
        return conversions > 0 ? spend / conversions : 0;
      }, unit: '$' },
    ],
    charts: [
      { type: 'bar', title: 'Spend by Campaign', xColumn: 'campaign', yColumn: 'spend' },
      { type: 'bar', title: 'ROI by Campaign', xColumn: 'campaign', yColumn: 'roi', calculated: true },
      { type: 'pie', title: 'Spend Distribution by Channel', groupBy: 'channel', valueColumn: 'spend' },
    ],
    aiContext: 'Marketing campaign performance analysis focusing on ROI optimization, channel attribution, and budget allocation recommendations.',
  },

  // Financial Statements / P&L
  financial: {
    name: 'Financial Statement',
    description: 'Profit & Loss, expenses, margins analysis',
    requiredColumns: ['category', 'amount'],
    optionalColumns: ['date', 'subcategory', 'department', 'description', 'budget', 'previous_period'],
    kpis: [
      { id: 'total_revenue', name: 'Total Revenue', formula: 'custom', calc: (data) => {
        return data.filter(r => (r.category || '').toLowerCase().includes('revenue'))
          .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
      }, unit: '$' },
      { id: 'total_expenses', name: 'Total Expenses', formula: 'custom', calc: (data) => {
        return Math.abs(data.filter(r => (r.category || '').toLowerCase().includes('expense'))
          .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0));
      }, unit: '$' },
      { id: 'net_profit', name: 'Net Profit', formula: 'custom', calc: (data) => {
        const revenue = data.filter(r => (r.category || '').toLowerCase().includes('revenue'))
          .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const expenses = Math.abs(data.filter(r => (r.category || '').toLowerCase().includes('expense'))
          .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0));
        return revenue - expenses;
      }, unit: '$' },
      { id: 'profit_margin', name: 'Profit Margin', formula: 'custom', calc: (data) => {
        const revenue = data.filter(r => (r.category || '').toLowerCase().includes('revenue'))
          .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const expenses = Math.abs(data.filter(r => (r.category || '').toLowerCase().includes('expense'))
          .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0));
        return revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
      }, unit: '%' },
      { id: 'budget_variance', name: 'Budget Variance', formula: 'custom', calc: (data) => {
        const actual = data.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const budget = data.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0);
        return budget > 0 ? ((actual - budget) / budget) * 100 : 0;
      }, unit: '%' },
    ],
    charts: [
      { type: 'bar', title: 'Revenue vs Expenses', categories: ['Revenue', 'Expenses'] },
      { type: 'pie', title: 'Expense Breakdown', groupBy: 'subcategory', valueColumn: 'amount', filterCategory: 'expense' },
      { type: 'bar', title: 'Budget vs Actual', comparison: true },
    ],
    aiContext: 'Financial statement analysis focusing on profitability, expense management, and budget adherence.',
  },

  // HR / People Analytics
  hr_analytics: {
    name: 'HR Analytics',
    description: 'Headcount, turnover, hiring, compensation',
    requiredColumns: ['department', 'headcount'],
    optionalColumns: ['date', 'hires', 'terminations', 'open_positions', 'avg_salary', 'total_compensation', 'tenure_months', 'performance_score'],
    kpis: [
      { id: 'total_headcount', name: 'Total Headcount', formula: 'sum', column: 'headcount', unit: '' },
      { id: 'turnover_rate', name: 'Turnover Rate', formula: 'custom', calc: (data) => {
        const terminations = data.reduce((sum, r) => sum + (parseFloat(r.terminations) || 0), 0);
        const avgHeadcount = data.reduce((sum, r) => sum + (parseFloat(r.headcount) || 0), 0) / data.length;
        return avgHeadcount > 0 ? (terminations / avgHeadcount) * 100 : 0;
      }, unit: '%' },
      { id: 'hiring_rate', name: 'Hiring Rate', formula: 'custom', calc: (data) => {
        const hires = data.reduce((sum, r) => sum + (parseFloat(r.hires) || 0), 0);
        const avgHeadcount = data.reduce((sum, r) => sum + (parseFloat(r.headcount) || 0), 0) / data.length;
        return avgHeadcount > 0 ? (hires / avgHeadcount) * 100 : 0;
      }, unit: '%' },
      { id: 'avg_tenure', name: 'Average Tenure', formula: 'average', column: 'tenure_months', unit: 'months' },
      { id: 'cost_per_employee', name: 'Cost Per Employee', formula: 'custom', calc: (data) => {
        const totalComp = data.reduce((sum, r) => sum + (parseFloat(r.total_compensation) || 0), 0);
        const headcount = data.reduce((sum, r) => sum + (parseFloat(r.headcount) || 0), 0);
        return headcount > 0 ? totalComp / headcount : 0;
      }, unit: '$' },
    ],
    charts: [
      { type: 'bar', title: 'Headcount by Department', xColumn: 'department', yColumn: 'headcount' },
      { type: 'line', title: 'Headcount Trend', xColumn: 'date', yColumn: 'headcount' },
      { type: 'bar', title: 'Hires vs Terminations', xColumn: 'date', yColumns: ['hires', 'terminations'] },
    ],
    aiContext: 'HR analytics focusing on workforce planning, retention strategies, and compensation optimization.',
  },

  // Project Management
  project: {
    name: 'Project Analytics',
    description: 'Timeline, budget, resources, milestones',
    requiredColumns: ['task', 'status'],
    optionalColumns: ['project', 'assignee', 'start_date', 'due_date', 'completed_date', 'estimated_hours', 'actual_hours', 'budget', 'spent', 'priority'],
    kpis: [
      { id: 'completion_rate', name: 'Completion Rate', formula: 'custom', calc: (data) => {
        const completed = data.filter(r => (r.status || '').toLowerCase() === 'completed').length;
        return data.length > 0 ? (completed / data.length) * 100 : 0;
      }, unit: '%' },
      { id: 'on_time_rate', name: 'On-Time Delivery', formula: 'custom', calc: (data) => {
        const onTime = data.filter(r => {
          if (!r.completed_date || !r.due_date) return false;
          return new Date(r.completed_date) <= new Date(r.due_date);
        }).length;
        const completed = data.filter(r => r.completed_date).length;
        return completed > 0 ? (onTime / completed) * 100 : 0;
      }, unit: '%' },
      { id: 'budget_utilization', name: 'Budget Utilization', formula: 'custom', calc: (data) => {
        const spent = data.reduce((sum, r) => sum + (parseFloat(r.spent) || 0), 0);
        const budget = data.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0);
        return budget > 0 ? (spent / budget) * 100 : 0;
      }, unit: '%' },
      { id: 'hours_variance', name: 'Hours Variance', formula: 'custom', calc: (data) => {
        const actual = data.reduce((sum, r) => sum + (parseFloat(r.actual_hours) || 0), 0);
        const estimated = data.reduce((sum, r) => sum + (parseFloat(r.estimated_hours) || 0), 0);
        return estimated > 0 ? ((actual - estimated) / estimated) * 100 : 0;
      }, unit: '%' },
    ],
    charts: [
      { type: 'pie', title: 'Tasks by Status', groupBy: 'status' },
      { type: 'bar', title: 'Tasks by Assignee', xColumn: 'assignee', count: true },
      { type: 'bar', title: 'Budget vs Spent by Project', xColumn: 'project', yColumns: ['budget', 'spent'] },
    ],
    aiContext: 'Project management analytics focusing on delivery performance, resource utilization, and risk identification.',
  },
};

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  return REPORT_TEMPLATES[templateId] || null;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return Object.entries(REPORT_TEMPLATES).map(([id, template]) => ({
    id,
    name: template.name,
    description: template.description,
    requiredColumns: template.requiredColumns,
  }));
}

/**
 * Auto-detect best matching template based on columns
 */
export function detectTemplate(columns) {
  const normalizedColumns = columns.map(c => c.toLowerCase());

  let bestMatch = null;
  let bestScore = 0;

  for (const [id, template] of Object.entries(REPORT_TEMPLATES)) {
    let score = 0;

    // Check required columns
    const hasRequired = template.requiredColumns.every(col =>
      normalizedColumns.some(c => c.includes(col) || col.includes(c))
    );

    if (!hasRequired) continue;

    score += template.requiredColumns.length * 2;

    // Check optional columns
    for (const col of template.optionalColumns) {
      if (normalizedColumns.some(c => c.includes(col) || col.includes(c))) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = id;
    }
  }

  return bestMatch;
}
