# Migration to FastAPI Backend & Vercel Deployment Checklist

## Assessment and Planning
- [x] 1. Assess current backend and frontend structure
- [x] 2. Analyze existing FastAPI implementation (utils/fastapi_server.py)
- [x] 3. Identify all API endpoints and routes that need to be migrated

## Backend Migration (FastAPI)
- [x] 4. Create an `/api` directory at the root for Vercel serverless functions
- [x] 5. Create the main FastAPI entry point at `/api/index.py`
- [x] 6. Implement processing endpoint at `/api/process.py`
- [x] 7. Implement download endpoint at `/api/download.py`
- [x] 8. Move necessary utilities from `/utils` to the new API structure
- [x] 9. Create `/api/requirements.txt` with FastAPI dependencies
- [ ] 10. Test the FastAPI endpoints locally with tools like Postman or curl
   - Note: Encountered issues with local FastAPI server not starting. May be related to network/firewall settings.

## Vercel Configuration
- [x] 11. Update `vercel.json` to work with FastAPI:
  - [x] Configure Python serverless functions
  - [x] Set proper memory and timeout limits
  - [x] Define API routes
- [x] 12. Update `build.sh` script to install FastAPI dependencies
- [x] 13. Create proper runtime configurations for Python 3.9+

## Frontend Updates
- [x] 14. Modify `pages/index.js` to call the new FastAPI endpoints
- [x] 15. Update axios request configuration if needed
- [x] 16. Update progress tracking to work with FastAPI responses
- [ ] 17. Test frontend-backend integration locally
   - Note: Unable to test locally due to FastAPI server issues. Will need to test on Vercel deployment.

## Testing and Deployment
- [ ] 18. Complete end-to-end testing locally
   - Note: Local testing blocked. Recommend proceeding with Vercel deployment to test.
- [ ] 19. Deploy to Vercel
- [ ] 20. Verify all functionality on the deployed site
- [ ] 21. Troubleshoot any deployment-specific issues

## Documentation and Cleanup
- [x] 22. Update README.md with new architecture details
- [x] 23. Document any additional setup steps required
- [ ] 24. Remove deprecated files and code (old API routes, etc.)
   - Note: Keep the original Next.js API routes until successful Vercel deployment of FastAPI confirmed.

## Potential Issues to Address
- [ ] Vercel execution time limits for processing large files
- [ ] Memory constraints for Python serverless functions
- [ ] CORS configuration for API access
- [ ] File storage and handling in serverless environment
- [x] Local development environment setup with npm scripts
- [ ] Address issues with running FastAPI locally

## Fix Excel File Generation Issues
- [x] 25. Set up Python virtual environment:
   - [x] a. Activate the existing virtual environment with `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
   - [x] b. If no virtual environment exists, create one with `python -m venv venv`
   - [x] c. Ensure the correct Python version (3.9+) is being used 

- [x] 26. Install all required Python dependencies:
   - [x] a. Install root dependencies: `pip install -r requirements.txt`
   - [x] b. Install API-specific dependencies: `pip install -r api/requirements.txt`
   - [x] c. Verify pandas and openpyxl are properly installed with `pip list | grep pandas` and `pip list | grep openpyxl`

- [x] 27. Ensure Next.js API can detect and use Python with dependencies:
   - [x] a. Review `pages/api/python-finder.js` to ensure it correctly locates the Python executable
   - [x] b. Add better error handling and logging to diagnose Python execution issues
   - [x] c. Test Python execution with a simple script to verify environment setup

- [x] 28. Improve error handling in the Excel generation process:
   - [x] a. Add more detailed error messages in `utils/process_files.py`
   - [x] b. Implement better fallback mechanism when Python execution fails
   - [x] c. Add explicit validation for input files to catch format issues early

- [x] 29. Address Vercel execution limitations:
   - [x] a. Add file size validation to prevent processing files that exceed Vercel limits
   - [x] b. Optimize pandas processing for large files (chunking, streaming, etc.)
   - [x] c. Add timeout handling and progress reporting for large file processing

## Code Cleanup
Now that we have a working solution, let's clean up the codebase:

- [x] 30. Clean up Next.js API routes:
   - [x] a. Consolidate `direct-process.js` and `process.js` into a single optimized file
   - [x] b. Remove redundant code in `python-finder.js`
   - [x] c. Clean up temporary files and console logs

- [x] 31. Clean up test files:
   - [x] a. Organize test files into a dedicated `/tests` directory
   - [ ] b. Remove temporary test scripts like `local_test.py` and `test_api.py`
   - [x] c. Improve `test_excel_generation.py` to work as a proper unit test

- [ ] 32. Clean up FastAPI implementation:
   - [ ] a. Verify all necessary code is properly migrated to FastAPI
   - [ ] b. Remove deprecated utils like `fastapi_server.py` if no longer needed
   - [ ] c. Clean up error handling and logging in FastAPI endpoints

- [ ] 33. Documentation updates:
   - [ ] a. Update README with clear instructions for both local development and deployment
   - [ ] b. Add API documentation for endpoints
   - [ ] c. Document the Excel generation process and formats

- [x] 34. Optimize project structure:
   - [ ] a. Move all Python processing logic to the `/api` directory
   - [x] b. Consolidate requirements files
   - [x] c. Organize temporary directory handling

## Next Steps
For complete deployment and finalization:

- [ ] 35. Clean up temporary files generated during development
- [ ] 36. Perform final round of testing with the optimized codebase
- [ ] 37. Deploy to Vercel with the cleaned-up codebase
- [ ] 38. Finalize documentation

# Project Task Breakdown

## Overview
Fix temporary directory path issues in Vercel serverless environment by replacing hardcoded paths with Node.js's os.tmpdir() function.

## Tasks
### 1. [Update Temporary Directory Paths]
**Status:** Completed

#### Subtasks:
- [x] 1.1. [Analysis] - Identified the root cause of the error in Vercel serverless environment
- [x] 1.2. [Update] - Modified optimized-process.js to use os.tmpdir() 
- [x] 1.3. [Update] - Modified process.js to use os.tmpdir()
- [x] 1.4. [Update] - Modified cleanup.js to use os.tmpdir()
- [x] 1.5. [Update] - Modified public directory path to use os.tmpdir() for file downloads
- [x] 1.6. [Update] - Updated download.js to check new temporary directory location first
- [x] 1.7. [Update] - Updated download URLs to use API endpoint instead of static path

### 2. [Implementation Notes]
**Status:** Completed

#### Key Changes:
- Replaced `path.join(process.cwd(), 'tmp')` with `path.join(os.tmpdir(), 'fund-subscription')` 
- Replaced `path.join(process.cwd(), 'public', 'downloads')` with `path.join(os.tmpdir(), 'fund-subscription-public')`
- Added proper fallbacks in download.js to maintain backward compatibility
- Changed download URLs from `/downloads/${publicFileName}` to `/api/download?file=${publicFileName}`

### 3. [Testing]
**Status:** Not Started

#### Subtasks:
- [ ] 3.1. [Test] - Test the application locally
- [ ] 3.2. [Test] - Deploy to Vercel and verify error is resolved
- [ ] 3.3. [Test] - Confirm file uploads and downloads work correctly in production
