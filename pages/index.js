import { useState } from 'react';
import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import DatePicker from '../components/DatePicker';
import ProgressBar from '../components/ProgressBar';
import ResultDisplay from '../components/ResultDisplay';
import { FiFileText, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';

export default function Home() {
  const [masterFile, setMasterFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [reportDate, setReportDate] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [result, setResult] = useState({ success: null, error: null, downloadUrl: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!masterFile || !dataFile || !reportDate) {
      setResult({
        success: null,
        error: 'Please upload both files and select a date.',
        downloadUrl: null
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(10);
    setStatus('Preparing files...');
    setResult({ success: null, error: null, downloadUrl: null });
    
    // Create form data
    const formData = new FormData();
    formData.append('masterFile', masterFile);
    formData.append('dataFile', dataFile);
    
    // Format date as DD/MM/YY
    const day = reportDate.getDate().toString().padStart(2, '0');
    const month = (reportDate.getMonth() + 1).toString().padStart(2, '0');
    const year = reportDate.getFullYear().toString().substr(-2);
    formData.append('reportDate', `${day}/${month}/${year}`);
    
    try {
      // Update progress
      setProgress(30);
      setStatus('Uploading files...');
      
      // Use our optimized process endpoint
      const response = await axios.post('/api/optimized-process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 30) / progressEvent.total
          ) + 30;
          setProgress(Math.min(percentCompleted, 60));
          setStatus('Processing data...');
        }
      });
      
      setProgress(100);
      setStatus('Report generated and ready for download');

      // Use the download URL from the response
      setResult({
        success: 'Your report has been generated successfully! The download will start automatically.',
        error: null,
        downloadUrl: response.data.downloadUrl,
        fileName: response.data.fileName
      });
    } catch (error) {
      setProgress(0);
      setStatus('Error');
      
      setResult({
        success: null,
        error: error.response?.data?.detail || error.response?.data?.error || 'An error occurred while processing your request.',
        downloadUrl: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Fund Subscription Generator</title>
        <meta name="description" content="Generate fund subscription reports" />
        <link 
          rel="icon" 
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>"
          type="image/svg+xml"
        />
      </Head>

      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="flex items-center justify-center mb-6">
            <FiFileText className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Fund Subscription Generator</h1>
          </div>
          
          <ResultDisplay 
            success={result.success}
            error={result.error}
            downloadUrl={result.downloadUrl}
            fileName={result.fileName}
          />
          
          <form onSubmit={handleSubmit}>
            <FileUpload
              label="Master File (MasterFile.xlsx)"
              fileType="master"
              file={masterFile}
              onFileChange={setMasterFile}
            />
            
            <FileUpload
              label="Data File (Data.xlsx)"
              fileType="data"
              file={dataFile}
              onFileChange={setDataFile}
            />
            
            <DatePicker 
              selectedDate={reportDate}
              onDateChange={setReportDate}
            />
            
            {isProcessing && (
              <ProgressBar progress={progress} status={status} />
            )}
            
            <div className="flex justify-center mt-8">
              <button 
                type="submit"
                disabled={isProcessing}
                className={`btn flex items-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? 'Processing...' : 'Generate Report'}
                {!isProcessing && <FiArrowRight className="ml-2" />}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Upload MasterFile.xlsx and Data.xlsx, select a report date, and generate your report.</p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Fund Subscription Generator &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
} 