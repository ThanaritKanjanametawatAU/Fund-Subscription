# Fund Subscription Generator API Documentation

This document provides detailed information about the available API endpoints in the Fund Subscription Generator application.

## API Endpoints Overview

The application provides two sets of API endpoints:

1. **Next.js API Routes** - Used for local development and as a fallback in production
2. **FastAPI Endpoints** - Used in production on Vercel

Both sets of endpoints provide similar functionality but are implemented differently.

## Common Request Parameters

All processing endpoints require the following inputs:

| Parameter   | Type   | Description                            |
|-------------|--------|----------------------------------------|
| masterFile  | File   | Master file in Excel (.xlsx) format    |
| dataFile    | File   | Data file in Excel (.xlsx) format      |
| reportDate  | String | Report date in DD/MM/YY format         |

## Next.js API Routes

### Process Files

Process uploaded Excel files and generate a report.

- **URL**: `/api/optimized-process`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

#### Request Example

```javascript
// Using fetch API
const formData = new FormData();
formData.append('masterFile', masterFileBlob);
formData.append('dataFile', dataFileBlob);
formData.append('reportDate', '01/01/23');

fetch('/api/optimized-process', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

#### Success Response

```json
{
  "success": true,
  "downloadUrl": "/downloads/report-a1b2c3d4-e5f6-7890-abcd-ef1234567890.xlsx",
  "fileName": "ProgramFundsubscription.xlsx",
  "generationMethod": "python"
}
```

#### Error Response

```json
{
  "error": "Error message details"
}
```

### Download File

Download a generated report file.

- **URL**: `/api/download`
- **Method**: `GET`
- **Query Parameters**: `file=<filename>`

#### Example

```
GET /api/download?file=report-a1b2c3d4-e5f6-7890-abcd-ef1234567890.xlsx
```

This will download the file directly.

## FastAPI Endpoints

### Process Files

Process uploaded Excel files and generate a report.

- **URL**: `/api/process`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

#### Request Example

```python
import requests

url = "https://your-vercel-deployment.vercel.app/api/process"
files = {
    'masterFile': open('MasterFile.xlsx', 'rb'),
    'dataFile': open('Data.xlsx', 'rb')
}
data = {
    'reportDate': '01/01/23'
}

response = requests.post(url, files=files, data=data)
print(response.json())
```

#### Success Response

```json
{
  "success": true,
  "downloadUrl": "/downloads/report-a1b2c3d4-e5f6-7890-abcd-ef1234567890.xlsx",
  "fileName": "ProgramFundsubscription.xlsx"
}
```

#### Error Response

```json
{
  "detail": "Error message details"
}
```

### Download File

Download a generated report file.

- **URL**: `/download`
- **Method**: `GET`
- **Query Parameters**: `file=<filename>`

#### Example

```
GET /download?file=report-a1b2c3d4-e5f6-7890-abcd-ef1234567890.xlsx
```

This will download the file directly.

## File Format Requirements

### MasterFile.xlsx

The Master file should contain the following columns:

| Column           | Description                       |
|------------------|-----------------------------------|
| Name             | Bank name                         |
| AccountNumber    | Account number for DR transactions|
| BankAccountNumber| Bank account details              |

### Data.xlsx

The Data file should:

1. Have headers in row 3
2. Include a "Fund / Bank" column identifying the fund/bank
3. Include a "Total by Fund" column
4. Have column headers as bank names that match the "Name" column in MasterFile.xlsx
5. Include a "Total by Bank" row at the bottom

### Generated Report Format

The generated Excel report will contain:

1. Header with company name and information
2. Date information based on the reportDate parameter
3. Accounting entries with DR and CR columns
4. Proper formatting for currency values
5. Summary totals at the bottom

## Error Handling

The API returns detailed error messages for various scenarios:

- Missing or invalid files
- File format errors
- Processing errors
- File size limitations (5MB per file)

## Deployment Considerations

When deploying to Vercel:

1. The FastAPI endpoint is the primary endpoint
2. The Next.js API routes are used as fallbacks
3. File size is limited to 5MB per file
4. Processing time is limited to 60 seconds per request

## Local Development Testing

You can test the API endpoints locally using tools like:

1. Postman - For manual testing
2. curl - For command-line testing

### Example curl command:

```bash
curl -X POST http://localhost:3000/api/optimized-process \
  -F "masterFile=@/path/to/MasterFile.xlsx" \
  -F "dataFile=@/path/to/Data.xlsx" \
  -F "reportDate=01/01/23"
```

## Python Dependencies

The Excel processing requires the following Python dependencies:

- pandas >= 2.0.0
- numpy >= 1.22.0
- openpyxl >= 3.1.0

These are automatically installed in the Vercel deployment but need to be installed manually for local development. 