import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { createSimplifiedExcelReport } from './no-python-fallback.js';

// Consolidated process API - handles file uploads and processing with Python
// with fallback to simplified Excel generation if Python execution fails

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Get the path to the virtual environment Python
function getVenvPythonPath() {
  // Check for a configured path first
  try {
    const configPath = path.join(process.cwd(), 'pages', 'api', 'python-path.txt');
    if (fs.existsSync(configPath)) {
      const pythonPath = fs.readFileSync(configPath, 'utf8').trim();
      return pythonPath;
    }
  } catch (error) {
    console.warn('Could not load configured Python path:', error.message);
  }
  
  // Fallback to default virtual environment path
  const venvPythonPath = path.join(process.cwd(), 'venv', 'Scripts', 'python.exe');
  return venvPythonPath;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form with files
    const { fields, files } = await parseForm(req);
    const reportDate = fields.reportDate?.[0] || fields.reportDate;
    const masterFile = files.masterFile?.[0] || files.masterFile;
    const dataFile = files.dataFile?.[0] || files.dataFile;

    // Validate inputs
    if (!masterFile || !dataFile || !reportDate) {
      return res.status(400).json({ error: 'Missing required files or date' });
    }

    // Create temporary directory for files
    const tempDir = path.join(os.tmpdir(), 'fund-subscription');
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Create unique ID for this job
    const jobId = uuidv4();
    const jobDir = path.join(tempDir, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    // Get file paths
    const masterFilePath = masterFile.filepath;
    const dataFilePath = dataFile.filepath;

    // Copy files to job directory
    const masterFileDestPath = path.join(jobDir, 'MasterFile.xlsx');
    const dataFileDestPath = path.join(jobDir, 'Data.xlsx');
    fs.copyFileSync(masterFilePath, masterFileDestPath);
    fs.copyFileSync(dataFilePath, dataFileDestPath);

    // Create a Python script to process the files
    const scriptPath = path.join(jobDir, 'process_script.py');
    const outputPath = path.join(jobDir, 'ProgramFundsubscription.xlsx');
    
    // Write the Python script
    fs.writeFileSync(scriptPath, `
import sys
import os

# Debug information
print("Python version:", sys.version)
print("Current working directory:", os.getcwd())

# Add the current working directory to the path
sys.path.append('${process.cwd().replace(/\\/g, '\\\\')}')

try:
    # Import required modules
    import pandas as pd
    import numpy as np
    from utils.process_files import process_fund_subscription
    import io
    import openpyxl
    
    # Read the files
    with open('${masterFileDestPath.replace(/\\/g, '\\\\')}', 'rb') as f:
        master_file_content = f.read()
        
    with open('${dataFileDestPath.replace(/\\/g, '\\\\')}', 'rb') as f:
        data_file_content = f.read()
    
    # Process the files
    report_content = process_fund_subscription(master_file_content, data_file_content, '${reportDate}')
    
    # Save the output
    with open('${outputPath.replace(/\\/g, '\\\\')}', 'wb') as f:
        f.write(report_content)
    
    print("Processing completed successfully")
except Exception as e:
    import traceback
    print(f"Error: {str(e)}")
    print(traceback.format_exc())
    sys.exit(1)
`);

    // Execute the Python script with explicit venv Python path
    let pythonSuccess = false;
    try {
      const pythonPath = getVenvPythonPath();
      
      const result = execSync(`"${pythonPath}" "${scriptPath}"`, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 60000 // 60 seconds timeout
      });
      
      pythonSuccess = true;
    } catch (error) {
      console.error('Python execution failed:', error.message);
      
      // Try creating a fallback report
      try {
        await createSimplifiedExcelReport(masterFileDestPath, dataFileDestPath, reportDate, outputPath);
        console.log('Created fallback Excel report');
      } catch (fallbackError) {
        console.error('Fallback report creation failed:', fallbackError.message);
        return res.status(500).json({ 
          error: 'Failed to generate report. Please make sure your input files are valid Excel files.' 
        });
      }
    }

    // Check if output file exists
    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'Failed to generate output file' });
    }

    // Create public directory for downloads
    const publicDir = path.join(os.tmpdir(), 'fund-subscription-public');
    fs.mkdirSync(publicDir, { recursive: true });
    
    // Generate download file
    const publicFileName = `report-${jobId}.xlsx`;
    const publicFilePath = path.join(publicDir, publicFileName);
    fs.copyFileSync(outputPath, publicFilePath);

    // Return download URL
    const downloadUrl = `/api/download?file=${publicFileName}`;
    return res.status(200).json({
      success: true,
      downloadUrl,
      fileName: 'ProgramFundsubscription.xlsx',
      generationMethod: pythonSuccess ? 'python' : 'fallback'
    });
  } catch (error) {
    console.error('Error processing files:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

// Helper function to parse form data
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}; 