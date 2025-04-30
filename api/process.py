from fastapi import APIRouter, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import uuid
import os
import io
import shutil
from pathlib import Path
import sys
import time
import asyncio

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the process_fund_subscription function from utils
from utils.process_files import process_fund_subscription

router = APIRouter()

# Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_PROCESSING_TIME = 50  # seconds (Vercel has a 60s limit, keeping 10s buffer)

@router.post("/process")
async def process_files(
    masterFile: UploadFile = File(...),
    dataFile: UploadFile = File(...),
    reportDate: str = Form(...),
):
    try:
        start_time = time.time()
        
        # Validate file sizes
        master_size = 0
        master_content = await masterFile.read()
        master_size = len(master_content)
        
        data_size = 0
        data_content = await dataFile.read()
        data_size = len(data_content)
        
        # Check file size limits
        if master_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"Master file too large ({master_size/1024/1024:.2f}MB). Maximum size is {MAX_FILE_SIZE/1024/1024}MB")
            
        if data_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"Data file too large ({data_size/1024/1024:.2f}MB). Maximum size is {MAX_FILE_SIZE/1024/1024}MB")
        
        print(f"File sizes: Master={master_size/1024:.2f}KB, Data={data_size/1024:.2f}KB")
        
        # Generate a unique ID for this job
        job_id = str(uuid.uuid4())
        temp_dir = Path("/tmp") / job_id
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded files to temp directory (for debugging)
        master_file_path = temp_dir / "MasterFile.xlsx"
        data_file_path = temp_dir / "Data.xlsx"
        
        # Write the files to disk
        with open(master_file_path, "wb") as f:
            f.write(master_content)
        
        with open(data_file_path, "wb") as f:
            f.write(data_content)
        
        # Process with timeout
        try:
            # Add timeout handling
            processing_time_left = MAX_PROCESSING_TIME - (time.time() - start_time)
            if processing_time_left < 5:
                raise HTTPException(status_code=408, detail="Not enough time left to process files")
            
            print(f"Processing files with {processing_time_left:.2f} seconds left")
            
            # Process the files using the existing utility function
            report_content = process_fund_subscription(
                master_content,
                data_content,
                reportDate
            )
            
            elapsed_time = time.time() - start_time
            print(f"Processing completed in {elapsed_time:.2f} seconds")
        except Exception as proc_error:
            raise HTTPException(status_code=500, detail=f"Error processing files: {str(proc_error)}")
        
        # Prepare the output file
        try:
            # First try to use public/downloads directory
            public_dir = Path("public/downloads")
            os.makedirs(public_dir, exist_ok=True)
            
            public_file_name = f"report-{job_id}.xlsx"
            public_file_path = public_dir / public_file_name
            
            with open(public_file_path, "wb") as f:
                f.write(report_content)
            
            # Return the download URL for the generated file
            download_url = f"/downloads/{public_file_name}"
            
            total_time = time.time() - start_time
            print(f"Total processing time: {total_time:.2f} seconds")
            
            return JSONResponse({
                "success": True,
                "downloadUrl": download_url,
                "fileName": "ProgramFundsubscription.xlsx",
                "processingTime": f"{total_time:.2f}s"
            })
        except Exception as e:
            # If public directory fails, use tmp directory
            tmp_file_name = f"report-{job_id}.xlsx"
            tmp_file_path = Path("/tmp") / tmp_file_name
            
            with open(tmp_file_path, "wb") as f:
                f.write(report_content)
            
            # Return a special URL for API-based download
            download_url = f"/download?file={tmp_file_name}"
            
            total_time = time.time() - start_time
            print(f"Total processing time (tmp fallback): {total_time:.2f} seconds")
            
            return JSONResponse({
                "success": True,
                "downloadUrl": download_url,
                "fileName": "ProgramFundsubscription.xlsx",
                "tmpPath": str(tmp_file_path),
                "processingTime": f"{total_time:.2f}s"
            })
    
    except Exception as e:
        # Log the error and return an error response
        error_message = str(e)
        print(f"Error processing files: {error_message}")
        raise HTTPException(status_code=500, detail=error_message) 