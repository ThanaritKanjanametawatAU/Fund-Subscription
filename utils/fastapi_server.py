import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uuid
import shutil
from pathlib import Path
from process_files import process_fund_subscription

app = FastAPI(title="Fund Subscription API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs("temp", exist_ok=True)
os.makedirs("downloads", exist_ok=True)

@app.post("/api/process")
async def process_files(
    masterFile: UploadFile = File(...),
    dataFile: UploadFile = File(...),
    reportDate: str = Form(...),
):
    try:
        # Generate a unique ID for this job
        job_id = str(uuid.uuid4())
        temp_dir = Path("temp") / job_id
        os.makedirs(temp_dir, exist_ok=True)
        
        # Save uploaded files
        master_file_path = temp_dir / "MasterFile.xlsx"
        data_file_path = temp_dir / "Data.xlsx"
        
        # Write the files to disk
        with open(master_file_path, "wb") as f:
            shutil.copyfileobj(masterFile.file, f)
        
        with open(data_file_path, "wb") as f:
            shutil.copyfileobj(dataFile.file, f)
        
        # Read file contents
        with open(master_file_path, "rb") as f:
            master_file_content = f.read()
        
        with open(data_file_path, "rb") as f:
            data_file_content = f.read()
        
        # Process the files
        report_content = process_fund_subscription(
            master_file_content,
            data_file_content,
            reportDate
        )
        
        # Save the output file
        output_file_name = f"report-{job_id}.xlsx"
        output_file_path = Path("downloads") / output_file_name
        
        with open(output_file_path, "wb") as f:
            f.write(report_content)
        
        # Create a downloadable URL
        download_url = f"/downloads/{output_file_name}"
        
        return JSONResponse({
            "success": True,
            "downloadUrl": download_url,
            "fileName": "ProgramFundsubscription.xlsx"
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/downloads/{file_name}")
async def download_file(file_name: str):
    file_path = Path("downloads") / file_name
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename="ProgramFundsubscription.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 