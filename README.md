# Report Automation System

AI-powered report automation system that converts Excel/CSV data into professional PDF and PowerPoint reports with AI-generated insights.

## Features

- **File Upload**: Upload `.xlsx`, `.xls`, or `.csv` files (max 10MB)
- **Auto-parsing**: Automatically detects columns and calculates metrics
- **AI Insights**: Generates executive summary and key insights using Gemini API
- **PDF Report**: Professional PDF document with metrics, charts, and insights
- **PowerPoint**: Presentation-ready slides with charts and data visualization
- **Charts**: Automatic chart generation (bar, line, pie) from your data

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Express API   │────▶│   Gemini API    │
│   (Frontend)    │     │   (Backend)     │     │   (AI Insights) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │  PDF/PPT Gen    │
        │               │  (pdfkit/pptx)  │
        │               └─────────────────┘
        │                       │
        └───────────────────────┘
                Download files
```

## Hard Rules (Important!)

1. **AI NEVER calculates numbers** - All metrics are computed in backend code
2. **AI only uses structured JSON** - Pre-calculated data passed to Gemini
3. **Deterministic calculations** - All math happens in `excelParser.js`
4. **Strict schema validation** - Zod validates all data structures

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Charts | Chart.js + react-chartjs-2 |
| File Parsing | xlsx (handles Excel & CSV) |
| PDF Generation | pdfkit |
| PPT Generation | pptxgenjs |
| AI | Gemini API |
| Validation | Zod |

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API key (optional - works without AI)

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# In backend folder, create .env file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### 3. Generate Sample Data (Optional)

```bash
cd backend
node utils/createSampleExcel.js
```

This creates sample Excel files in `sample-data/` folder.

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## API Endpoints

### Upload File
```
POST /api/upload-excel
Content-Type: multipart/form-data

file: <Excel or CSV file>
reportType?: 'sales' | 'financial' | 'marketing' | 'inventory' | 'custom'
client?: string
period?: string
```

### Generate Report
```
POST /api/generate-report
Content-Type: application/json

{
  "sessionId": "report_xxx_xxx",
  "useFallback": false  // Skip AI if true
}
```

### Download Files
```
GET /api/download/pdf/:sessionId
GET /api/download/ppt/:sessionId
```

## File Format (Excel/CSV)

### Sales Report
Required columns: `date`, `product`, `quantity`, `revenue`
Optional: `region`, `salesperson`, `cost`, `profit`

### Financial Report
Required columns: `date`, `category`, `amount`
Optional: `description`, `account`, `department`

### Marketing Report
Required columns: `campaign`, `impressions`, `clicks`, `conversions`
Optional: `cost`, `channel`, `roi`

### Custom Report
Any columns work - system auto-detects numeric columns for metrics.

## Internal JSON Schema

```json
{
  "meta": {
    "client": "Company Name",
    "period": "Q1 2024",
    "reportType": "sales",
    "generatedAt": "2024-01-01T00:00:00Z"
  },
  "metrics": [
    {
      "name": "Total Revenue",
      "value": 50000,
      "unit": "$"
    }
  ],
  "tables": [...],
  "charts": [...],
  "notes": ""
}
```

## Gemini Prompt Rules

The system enforces strict rules for AI:

1. Output must be valid JSON
2. No hallucinated numbers - only use provided data
3. Schema validated with retry on mismatch
4. Low temperature (0.3) for deterministic output
5. Fallback available if AI fails

## Project Structure

```
excleSaaSMVP/
├── backend/
│   ├── routes/
│   │   ├── upload.js      # Excel upload handling
│   │   ├── report.js      # Report generation
│   │   └── download.js    # File downloads
│   ├── services/
│   │   ├── excelParser.js # Excel/CSV parsing & calculations
│   │   ├── geminiService.js # AI integration
│   │   ├── pdfGenerator.js  # PDF creation
│   │   └── pptGenerator.js  # PPT creation
│   ├── schemas/
│   │   └── reportSchema.js  # Zod schemas
│   ├── utils/
│   │   └── createSampleExcel.js
│   ├── generated/         # Output files (gitignored)
│   ├── uploads/           # Temp uploads (gitignored)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── DataPreview.jsx
│   │   │   ├── ReportGenerator.jsx
│   │   │   ├── InsightsDisplay.jsx
│   │   │   └── DownloadButtons.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
├── sample-data/           # Sample Excel files
└── README.md
```

## Assumptions & Decisions

1. **Single-user MVP**: No authentication needed
2. **In-memory sessions**: Reports stored in memory (10 max)
3. **Auto-detect columns**: System infers data types from content
4. **Fallback without AI**: Works even without Gemini API key
5. **First sheet only**: Parses first sheet of Excel workbook
6. **10MB limit**: Maximum file size for uploads

## Error Handling

- Invalid file format: Returns 400 with clear message
- Missing columns: Lists required vs found columns
- AI failure: Falls back to basic insights
- Schema mismatch: Retries AI up to 3 times

## Development

```bash
# Backend with auto-reload
cd backend && npm run dev

# Frontend with HMR
cd frontend && npm run dev
```

## Production Build

```bash
# Frontend build
cd frontend && npm run build

# Serve static files from backend or use nginx
```

## License

MIT
