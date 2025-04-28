import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

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
    const scriptPath = path.join(jobDir, 'process.py');
    const outputPath = path.join(jobDir, 'ProgramFundsubscription.xlsx');
    
    // Write the Python script
    fs.writeFileSync(scriptPath, `
import sys
sys.path.append('${process.cwd()}')
from utils.process_files import process_fund_subscription
import pandas as pd
import numpy as np
import io

# Read the files
with open('${masterFileDestPath}', 'rb') as f:
    master_file_content = f.read()
    
with open('${dataFileDestPath}', 'rb') as f:
    data_file_content = f.read()

# Process the files
report_content = process_fund_subscription(master_file_content, data_file_content, '${reportDate}')

# Save the output
with open('${outputPath}', 'wb') as f:
    f.write(report_content)

print('Done')
`);

    // Execute the Python script
    await executeScript(scriptPath);

    // Check if output file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error('Output file not generated');
    }

    // Copy output file to public directory for download
    const publicDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const publicFileName = `report-${jobId}.xlsx`;
    const publicFilePath = path.join(publicDir, publicFileName);
    fs.copyFileSync(outputPath, publicFilePath);

    // Return download URL
    const downloadUrl = `/downloads/${publicFileName}`;
    return res.status(200).json({
      success: true,
      downloadUrl,
      fileName: 'ProgramFundsubscription.xlsx',
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

// Helper function to execute Python script
const executeScript = async (scriptPath) => {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [scriptPath]);
    
    let errorOutput = '';
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script error: ${errorOutput}`));
      }
    });
  });
}; 