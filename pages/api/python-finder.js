import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Gets the path to the Python executable to use for processing.
 * Checks in this order:
 * 1. Custom configured path in python-path.txt if it exists
 * 2. Virtual environment path (venv/Scripts/python.exe)
 * 3. System Python if detectable
 * 
 * @returns {string} Path to Python executable
 */
export function getPythonPath() {
  // Check for a configured path first
  try {
    const configPath = path.join(process.cwd(), 'pages', 'api', 'python-path.txt');
    if (fs.existsSync(configPath)) {
      const pythonPath = fs.readFileSync(configPath, 'utf8').trim();
      console.log(`Using configured Python path: ${pythonPath}`);
      return pythonPath;
    }
  } catch (error) {
    console.warn('Could not load configured Python path:', error.message);
  }
  
  // Check for virtual environment
  const venvPythonPath = path.join(process.cwd(), 'venv', 'Scripts', 'python.exe');
  if (fs.existsSync(venvPythonPath)) {
    console.log(`Using virtual environment Python: ${venvPythonPath}`);
    return venvPythonPath;
  }
  
  // Fallback to system Python if available
  try {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    execSync(`${pythonCommand} --version`, { stdio: 'ignore' });
    console.log(`Using system Python: ${pythonCommand}`);
    return pythonCommand;
  } catch (error) {
    console.warn('System Python not found');
  }
  
  // Default to python as a last resort
  console.log('Defaulting to "python" command');
  return 'python';
}

module.exports = {
  getPythonPath
}; 