import { z } from 'zod';

/**
 * Internal JSON Schema for parsed Excel data
 * This schema enforces strict typing to ensure AI receives clean, validated data
 */

// Metadata about the report
export const MetaSchema = z.object({
  client: z.string().min(1, "Client name is required"),
  period: z.string().min(1, "Period is required (e.g., 'Q1 2024', 'January 2024')"),
  reportType: z.enum(['sales', 'financial', 'marketing', 'inventory', 'custom']),
  generatedAt: z.string().datetime().optional(),
});

// Individual metric item - all numbers are pre-calculated in backend
export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string().optional(), // e.g., "$", "%", "units"
  previousValue: z.number().optional(),
  change: z.number().optional(), // percentage change, calculated by backend
  changeDirection: z.enum(['up', 'down', 'neutral']).optional(),
});

// Table row - flexible structure for different report types
export const TableRowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));

// Table structure
export const TableSchema = z.object({
  name: z.string(),
  columns: z.array(z.string()),
  rows: z.array(TableRowSchema),
});

// Chart data point
export const ChartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

// Chart configuration
export const ChartSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['bar', 'line', 'pie', 'doughnut']),
  data: z.array(ChartDataPointSchema),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
});

// Complete internal report schema
export const InternalReportSchema = z.object({
  meta: MetaSchema,
  metrics: z.array(MetricSchema),
  tables: z.array(TableSchema),
  charts: z.array(ChartSchema),
  notes: z.string().optional(),
});

// Schema for Gemini API response - strict format
export const GeminiResponseSchema = z.object({
  executiveSummary: z.string().min(1),
  keyInsights: z.array(z.string()).min(1).max(8),
  recommendations: z.array(z.string()).max(5).optional(),
  riskFactors: z.array(z.string()).max(5).optional(),
  opportunities: z.array(z.string()).max(5).optional(),
  benchmarkContext: z.string().optional(),
});

// Validation helper functions
export function validateInternalReport(data) {
  return InternalReportSchema.safeParse(data);
}

export function validateGeminiResponse(data) {
  return GeminiResponseSchema.safeParse(data);
}

/**
 * Excel column requirements per report type
 * These define what columns are required/optional for each report type
 */
export const REQUIRED_COLUMNS = {
  sales: ['date', 'product', 'quantity', 'revenue'],
  financial: ['date', 'category', 'amount'],
  marketing: ['campaign', 'impressions', 'clicks', 'conversions'],
  inventory: ['product', 'stock', 'reorder_level'],
  custom: [], // Custom reports have flexible columns
};

export const OPTIONAL_COLUMNS = {
  sales: ['region', 'salesperson', 'cost', 'profit'],
  financial: ['description', 'account', 'department'],
  marketing: ['cost', 'channel', 'roi'],
  inventory: ['supplier', 'last_order_date', 'unit_cost'],
  custom: [],
};
