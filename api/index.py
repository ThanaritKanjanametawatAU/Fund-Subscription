from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create FastAPI app
app = FastAPI(title="Fund Subscription API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Create necessary directories
os.makedirs("/tmp", exist_ok=True)
os.makedirs("public/downloads", exist_ok=True)

@app.get("/")
async def root():
    """Root endpoint to verify API is running."""
    return {"status": "ok", "message": "Fund Subscription API is running"}

@app.get("/api")
async def api_root():
    """API root endpoint to verify API is running."""
    return {"status": "ok", "message": "Fund Subscription API is running"}

# Import the route modules
from api.process import router as process_router
from api.download import router as download_router

# Include the routers with API prefix
app.include_router(process_router, prefix="/api")
app.include_router(download_router, prefix="/api")

# This is required for Vercel serverless deployment
def handler(request: Request):
    return app(request) 