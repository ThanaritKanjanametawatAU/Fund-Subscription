const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common paths where Python might be found in various environments
const PYTHON_PATHS = [
  'python3',
  '/var/lang/bin/python3',
  '/var/task/python/bin/python3',
  '/opt/python/bin/python3',
  '/var/runtime/python3',
  '/var/lang/bin/python',
  'python'
];

// Find a working Python executable
function findPythonExecutable() {
  // Check if we've already determined the path
  if (global.cachedPythonPath) {
    return global.cachedPythonPath;
  }

  console.log('Attempting to find Python executable...');
  
  // Try each possible path
  for (const pythonPath of PYTHON_PATHS) {
    try {
      // Check if this python works
      console.log(`Trying ${pythonPath}...`);
      const version = execSync(`${pythonPath} --version`, { 
        encoding: 'utf8',
        timeout: 3000
      });
      console.log(`Found working Python: ${pythonPath} - ${version.trim()}`);
      
      // Create a marker file to remember the working path
      try {
        global.cachedPythonPath = pythonPath;
        const markerPath = path.join('/tmp', 'python-executable-path.txt');
        fs.writeFileSync(markerPath, pythonPath);
        console.log(`Cached Python path to ${markerPath}`);
      } catch (err) {
        console.warn('Could not cache Python path:', err.message);
      }
      
      return pythonPath;
    } catch (error) {
      console.log(`${pythonPath} is not available: ${error.message}`);
    }
  }
  
  // If we get here, no Python was found
  console.error('No working Python found');
  throw new Error('No working Python executable found. Tried: ' + PYTHON_PATHS.join(', '));
}

// Try to load a previously discovered path
function loadCachedPythonPath() {
  try {
    const markerPath = path.join('/tmp', 'python-executable-path.txt');
    if (fs.existsSync(markerPath)) {
      const pythonPath = fs.readFileSync(markerPath, 'utf8').trim();
      console.log(`Loaded cached Python path: ${pythonPath}`);
      global.cachedPythonPath = pythonPath;
      return pythonPath;
    }
  } catch (error) {
    console.warn('Could not load cached Python path:', error.message);
  }
  return null;
}

// Get Python path - use cached if available
function getPythonPath() {
  return loadCachedPythonPath() || findPythonExecutable();
}

module.exports = {
  getPythonPath,
  findPythonExecutable
}; 