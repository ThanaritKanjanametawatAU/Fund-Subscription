from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import sys
import os
import traceback

# Create the FastAPI app instance first
app = FastAPI()

# Set up error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail}
    )

@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"status": "ok", "message": "Fund Subscription API is running"}

@app.get("/api")
async def api_root():
    """API root endpoint to verify API is running."""
    return {"status": "ok", "message": "Fund Subscription API is running"}

# Debug endpoint to verify imports and environment
@app.get("/api/debug")
async def debug_info():
    """Return debug information about the environment."""
    import os
    import sys
    import platform
    
    # Try importing key dependencies to detect any import issues
    dependencies_status = {}
    for module in ["pandas", "numpy", "openpyxl", "fastapi"]:
        try:
            __import__(module)
            dependencies_status[module] = "ok"
        except ImportError as e:
            dependencies_status[module] = f"error: {str(e)}"
    
    return {
        "status": "ok",
        "python_version": sys.version,
        "platform": platform.platform(),
        "cwd": os.getcwd(),
        "files_in_cwd": os.listdir(os.getcwd()),
        "dependencies": dependencies_status
    }

# Process endpoint with proper error handling
@app.post("/api/process")
async def process_files_endpoint(request: Request):
    """Process files endpoint with proper error handling."""
    try:
        # Import process module dynamically to avoid loading issues
        from api.process import process_files
        return await process_files(request)
    except Exception as e:
        error_detail = f"Error processing files: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

# Download endpoint with proper error handling
@app.post("/api/download")
async def download_files_endpoint(request: Request):
    """Download files endpoint with proper error handling."""
    try:
        # Import download module dynamically
        from api.download import download_files
        return await download_files(request)
    except Exception as e:
        error_detail = f"Error downloading files: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=error_detail)

# No Mangum handler - Vercel will handle it automatically