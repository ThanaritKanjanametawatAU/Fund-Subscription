#!/bin/bash
set -e

# Print Python and environment information
echo "Python information:"
which python3 || echo "python3 not found in PATH"
python3 --version || echo "python3 --version failed"
echo "Current directory: $(pwd)"
echo "PATH: $PATH"

# Install Python dependencies using python3 module mode
echo "Installing Python dependencies..."
python3 -m pip install --upgrade pip

# Install main requirements
python3 -m pip install -r requirements.txt

# Install API-specific requirements for FastAPI
python3 -m pip install -r api/requirements.txt

# Install legacy API requirements (for compatibility during transition)
[ -f pages/api/requirements.txt ] && python3 -m pip install -r pages/api/requirements.txt

# Run npm build
echo "Running npm build..."
npm run build

echo "Build completed successfully!" 