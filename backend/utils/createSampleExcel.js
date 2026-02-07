import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to generate sample Excel files for testing
 * Run with: node utils/createSampleExcel.js
 */

// Sample Sales Data
const salesData = [
  { date: '2024-01-05', product: 'Widget A', quantity: 150, revenue: 4500, cost: 2250, region: 'North' },
  { date: '2024-01-05', product: 'Widget B', quantity: 80, revenue: 3200, cost: 1600, region: 'South' },
  { date: '2024-01-10', product: 'Widget A', quantity: 200, revenue: 6000, cost: 3000, region: 'East' },
  { date: '2024-01-10', product: 'Gadget X', quantity: 50, revenue: 5000, cost: 2000, region: 'West' },
  { date: '2024-01-15', product: 'Widget B', quantity: 120, revenue: 4800, cost: 2400, region: 'North' },
  { date: '2024-01-15', product: 'Gadget X', quantity: 75, revenue: 7500, cost: 3000, region: 'South' },
  { date: '2024-01-20', product: 'Widget A', quantity: 180, revenue: 5400, cost: 2700, region: 'East' },
  { date: '2024-01-20', product: 'Widget C', quantity: 90, revenue: 2700, cost: 1350, region: 'West' },
  { date: '2024-01-25', product: 'Gadget X', quantity: 60, revenue: 6000, cost: 2400, region: 'North' },
  { date: '2024-01-25', product: 'Widget C', quantity: 110, revenue: 3300, cost: 1650, region: 'South' },
  { date: '2024-01-30', product: 'Widget A', quantity: 220, revenue: 6600, cost: 3300, region: 'East' },
  { date: '2024-01-30', product: 'Widget B', quantity: 95, revenue: 3800, cost: 1900, region: 'West' },
];

// Sample Marketing Data
const marketingData = [
  { campaign: 'Spring Sale', impressions: 50000, clicks: 2500, conversions: 150, cost: 1500, channel: 'Facebook' },
  { campaign: 'Spring Sale', impressions: 35000, clicks: 1750, conversions: 105, cost: 1200, channel: 'Google' },
  { campaign: 'Email Blast', impressions: 25000, clicks: 3750, conversions: 300, cost: 500, channel: 'Email' },
  { campaign: 'Influencer', impressions: 80000, clicks: 4000, conversions: 200, cost: 3000, channel: 'Instagram' },
  { campaign: 'Summer Promo', impressions: 45000, clicks: 2250, conversions: 135, cost: 1350, channel: 'Facebook' },
  { campaign: 'Summer Promo', impressions: 40000, clicks: 2000, conversions: 120, cost: 1600, channel: 'Google' },
  { campaign: 'Back to School', impressions: 60000, clicks: 3000, conversions: 180, cost: 1800, channel: 'Facebook' },
  { campaign: 'Back to School', impressions: 30000, clicks: 4500, conversions: 360, cost: 600, channel: 'Email' },
];

// Sample Financial Data
const financialData = [
  { date: '2024-01-01', category: 'Revenue', amount: 25000, description: 'Product Sales' },
  { date: '2024-01-01', category: 'Revenue', amount: 8000, description: 'Service Income' },
  { date: '2024-01-05', category: 'Expense', amount: -5000, description: 'Salaries' },
  { date: '2024-01-05', category: 'Expense', amount: -2000, description: 'Rent' },
  { date: '2024-01-10', category: 'Revenue', amount: 15000, description: 'Product Sales' },
  { date: '2024-01-10', category: 'Expense', amount: -3000, description: 'Marketing' },
  { date: '2024-01-15', category: 'Revenue', amount: 20000, description: 'Product Sales' },
  { date: '2024-01-15', category: 'Expense', amount: -1500, description: 'Utilities' },
  { date: '2024-01-20', category: 'Revenue', amount: 12000, description: 'Service Income' },
  { date: '2024-01-20', category: 'Expense', amount: -5000, description: 'Salaries' },
  { date: '2024-01-25', category: 'Revenue', amount: 18000, description: 'Product Sales' },
  { date: '2024-01-25', category: 'Expense', amount: -2500, description: 'Equipment' },
];

function createExcelFile(data, filename, sheetName) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, 12)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const outputPath = path.join(__dirname, '..', '..', 'sample-data', filename);

  // Create sample-data directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  XLSX.writeFile(workbook, outputPath);
  console.log(`Created: ${outputPath}`);
}

// Generate sample files
createExcelFile(salesData, 'sample_sales_report.xlsx', 'Sales Data');
createExcelFile(marketingData, 'sample_marketing_report.xlsx', 'Marketing Data');
createExcelFile(financialData, 'sample_financial_report.xlsx', 'Financial Data');

console.log('\n✅ Sample Excel files created successfully!');
console.log('📁 Location: sample-data/');
