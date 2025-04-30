from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import os
import sys

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

router = APIRouter()

@router.get("/download")
async def download_file(file: str = Query(..., description="The filename to download")):
    """
    Download a generated report file.
    
    This endpoint checks first in the public/downloads directory,
    then in the /tmp directory if the file is not found in public.
    """
    # First check in public/downloads directory
    public_file_path = Path("public/downloads") / file
    
    if public_file_path.exists():
        return FileResponse(
            path=str(public_file_path),
            filename="ProgramFundsubscription.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    
    # If not found in public, check in tmp directory
    temp_file_path = Path("/tmp") / file
    
    if temp_file_path.exists():
        return FileResponse(
            path=str(temp_file_path),
            filename="ProgramFundsubscription.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    
    # If file not found anywhere, return 404
    raise HTTPException(status_code=404, detail="File not found") 