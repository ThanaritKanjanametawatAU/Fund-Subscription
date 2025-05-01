/**
 * Utility script to clean up temporary files
 * 
 * This can be run periodically to ensure that 
 * temporary processing directories are removed
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Clean up temporary files older than this time (in milliseconds)
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

function cleanupTempFiles() {
  const tempDir = path.join(os.tmpdir(), 'fund-subscription');
  
  try {
    if (!fs.existsSync(tempDir)) {
      console.log('Temp directory does not exist.');
      return;
    }
    
    const now = Date.now();
    const entries = fs.readdirSync(tempDir);
    
    console.log(`Found ${entries.length} entries in temp directory.`);
    
    let deletedCount = 0;
    
    for (const entry of entries) {
      const entryPath = path.join(tempDir, entry);
      try {
        const stats = fs.statSync(entryPath);
        
        // Check if the entry is older than MAX_AGE
        if (now - stats.mtime.getTime() > MAX_AGE) {
          if (stats.isDirectory()) {
            // If it's a directory, delete all files in it first
            const files = fs.readdirSync(entryPath);
            for (const file of files) {
              fs.unlinkSync(path.join(entryPath, file));
            }
            fs.rmdirSync(entryPath);
          } else {
            // If it's a file, just delete it
            fs.unlinkSync(entryPath);
          }
          
          deletedCount++;
          console.log(`Deleted: ${entryPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${entryPath}:`, error.message);
      }
    }
    
    console.log(`Cleanup completed. Deleted ${deletedCount} entries.`);
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupTempFiles();
}

module.exports = {
  cleanupTempFiles
}; 