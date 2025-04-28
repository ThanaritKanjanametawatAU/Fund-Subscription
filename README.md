# Fund Subscription Generator

A Next.js application with a Python backend for generating fund subscription reports.

## Features

- Modern, responsive UI built with Next.js and Tailwind CSS
- Drag and drop file uploads for Excel files
- Date selection with a user-friendly calendar
- Progress tracking during file processing
- Excel report generation using the same logic as the original Python application

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

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Create necessary directories

```bash
mkdir -p public/downloads
mkdir -p tmp
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Upload your MasterFile.xlsx and Data.xlsx files using the drag-and-drop interface
2. Select a report date using the date picker
3. Click "Generate Report" to process the files
4. Once processing is complete, download the generated report

## Deployment Options

### Option 1: Deploy on Vercel with Python Serverless Functions

This application can be deployed on Vercel with Python serverless functions:

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

The included `vercel.json` file configures the Python serverless functions with appropriate memory and timeout settings.

### Option 2: Separate Frontend and Backend Deployment

#### 1. Deploy the Next.js Frontend on Vercel

```bash
vercel
```

#### 2. Deploy the FastAPI Backend Separately

The project includes a FastAPI server that can be deployed on any Python-friendly platform:

1. Update the API endpoint in `pages/index.js` to point to your backend server:

```javascript
// In pages/index.js, replace this:
const response = await axios.post('/api/process', formData, {
  
// With this:
const response = await axios.post('https://your-backend-url.com/api/process', formData, {
```

2. Run the FastAPI server:

```bash
cd Fund-Subscription
python utils/fastapi_server.py
```

3. Deploy the FastAPI server to a platform like Heroku, Render, or PythonAnywhere:

```bash
# Example for Heroku
heroku create
git push heroku main
```

## File Structure

- `/components` - React components (FileUpload, DatePicker, etc.)
- `/pages` - Next.js pages including the API endpoint
- `/pages/api` - API routes for handling file processing
- `/public` - Static assets and downloaded files
- `/styles` - CSS styles including Tailwind configuration
- `/utils` - Utility functions including Python processing logic
  - `process_files.py` - Core functionality from original script
  - `fastapi_server.py` - Standalone FastAPI server for separate deployment

## Cleaning Up

Temporary files and generated reports are stored in:
- `/tmp` - Temporary processing files
- `/public/downloads` - Generated reports

You may want to set up scheduled cleanup of these directories in production.

## License

[MIT](https://choosealicense.com/licenses/mit/) 