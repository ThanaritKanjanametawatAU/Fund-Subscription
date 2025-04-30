# Fund Subscription Generator

A Next.js application with a FastAPI backend for generating fund subscription reports.

## Features

- Modern, responsive UI built with Next.js and Tailwind CSS
- Drag and drop file uploads for Excel files
- Date selection with a user-friendly calendar
- Progress tracking during file processing
- Excel report generation using pandas and openpyxl
- FastAPI backend for efficient API processing
- Vercel-compatible deployment with Python serverless functions
- Fallback HTML report generation when Python dependencies are unavailable

## Prerequisites

- Node.js 14.x or higher
- Python 3.9 or higher
- npm or yarn

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Fund-Subscription
```

### 2. Install JavaScript dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Python virtual environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 4. Install Python dependencies

```bash
# Install consolidated dependencies
pip install -r requirements.txt
```

### 5. Create necessary directories

```bash
mkdir -p public/downloads
mkdir -p tmp
mkdir -p test_data
```

## Local Development

### Running the Application

There are two ways to run the application:

#### 1. Using Next.js API Routes (Recommended for local development)

This method uses the Next.js API routes with the virtual environment Python:

```bash
# Make sure your virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Start the Next.js development server
npm run dev
```

The application will be available at http://localhost:3000.

#### 2. Using FastAPI Backend (For production-like testing)

This method runs the FastAPI backend separately:

```bash
# Terminal 1: Start FastAPI backend
python -m uvicorn api.index:app --reload --port 8000

# Terminal 2: Start Next.js frontend
npm run dev
```

The frontend will be available at http://localhost:3000 and the FastAPI backend at http://localhost:8000.

### Testing

Run the unit tests to verify everything is working correctly:

```bash
# Make sure your virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run tests
python -m pytest tests/test_excel_generation.py -v
```

For the Excel generation test to work, you need to place sample files in the test_data directory:
- `test_data/MasterFile.xlsx`
- `test_data/Data.xlsx`

## Usage

1. Upload your MasterFile.xlsx and Data.xlsx files using the drag-and-drop interface
2. Select a report date using the date picker
3. Click "Generate Report" to process the files
4. Once processing is complete, download the generated report

## Project Structure

### Frontend (Next.js)

- `/components` - React components:
  - `FileUpload.js` - Drag and drop file upload component
  - `DatePicker.js` - Date selector for report generation
  - `ProgressBar.js` - Visual indicator of processing status
  - `ResultDisplay.js` - Component to show results and download links

- `/pages` - Next.js pages and API routes:
  - `index.js` - Main application page with form for file uploads
  - `/api/optimized-process.js` - Consolidated API endpoint for file processing
  - `/api/download.js` - Manages file downloads

### FastAPI Backend (for Vercel)

- `/api` - FastAPI serverless functions:
  - `index.py` - Main FastAPI application entry point
  - `process.py` - Handles file uploads and processing
  - `download.py` - Manages file downloads

### Utility Functions

- `/utils` - Python utility functions:
  - `process_files.py` - Core file processing logic

### Testing

- `/tests` - Test directory:
  - `test_excel_generation.py` - Unit tests for the Excel generation process

### Other Directories

- `/public` - Static assets and download files
- `/tmp` - Temporary processing files
- `/test_data` - Sample files for testing

## Deployment on Vercel

This application is designed to be deployed on Vercel with Python serverless functions:

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Build and deploy to Vercel:
```bash
vercel
```

The included `vercel.json` file configures the Python serverless functions with appropriate memory and timeout settings.

### Important Vercel Configuration

The application uses the following Vercel settings:
- Python 3.9+ runtime
- 1GB memory allocation for Python functions
- 60-second timeout for processing large files

## Troubleshooting

### Excel Generation Issues

If you encounter issues with Excel file generation:

1. Verify your Python environment is activated: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (macOS/Linux)
2. Confirm all dependencies are installed: `pip list | grep pandas`
3. Check for error messages in the console
4. Make sure your input files are valid Excel files in the expected format
5. Check that the temporary directories (tmp, public/downloads) exist and have write permissions

### Python Path Issues

If the application can't find the correct Python executable:

1. Verify the path in `pages/api/python-path.txt` points to your virtual environment's Python
2. Make sure the Python in your virtual environment has all required dependencies installed

## Maintenance

### Cleaning Up Temporary Files

Temporary files and generated reports are stored in:
- `/tmp` - Temporary processing files
- `/public/downloads` - Generated reports

For local development, you can manually clean these directories:

```bash
rm -rf tmp/*
rm -rf public/downloads/*
```

In production, consider setting up a scheduled task to clean these directories periodically.

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `python -m pytest tests/`
4. Submit a pull request

## License

[MIT](https://choosealicense.com/licenses/mit/) 