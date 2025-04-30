// Import required modules
const fs = require('fs');
const path = require('path');

// Final fallback method if Python is not available
const createSimplifiedExcelReport = async (masterFilePath, dataFilePath, reportDate, outputPath) => {
  try {
    console.log('Using no-python fallback for Excel generation');
    
    // Create a very basic HTML "report" as a fallback
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fund Subscription Report - ${reportDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2em; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fund Subscription Report</h1>
          <p>Report date: ${reportDate}</p>
          <p>This is a fallback report created when Python processing was unavailable.</p>
        </div>
        <div>
          <h2>Files Processed</h2>
          <ul>
            <li>Master file: ${path.basename(masterFilePath)}</li>
            <li>Data file: ${path.basename(dataFilePath)}</li>
          </ul>
        </div>
        <p>
          <b>Note:</b> This is a simplified HTML version of the report. For the full Excel report, 
          please ensure Python with pandas is properly configured.
        </p>
      </body>
      </html>
    `;
    
    // Ensure the outputPath has HTML extension if we're using the HTML fallback
    let htmlOutputPath = outputPath + '.html';
    
    // Write the HTML fallback
    fs.writeFileSync(htmlOutputPath, html);
    
    // Create an empty file at the original output path
    // with a note that real output is in the HTML file
    const noteText = `This is a placeholder file. The actual report is in: ${path.basename(htmlOutputPath)}`;
    fs.writeFileSync(outputPath, noteText);
    
    console.log(`Created fallback HTML report at ${htmlOutputPath}`);
    return true;
  } catch (error) {
    console.error('Error creating simplified report:', error);
    throw error;
  }
};

module.exports = {
  createSimplifiedExcelReport,
}; 