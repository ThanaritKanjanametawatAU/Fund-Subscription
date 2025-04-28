import { FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useEffect, useRef } from 'react';

export default function ResultDisplay({ success, error, downloadUrl, fileName }) {
  const downloadLinkRef = useRef(null);
  
  // Auto-download when a successful result with downloadUrl comes in
  useEffect(() => {
    if (success && downloadUrl && downloadLinkRef.current) {
      // Small delay to ensure browser is ready to handle the download
      // especially helpful for larger files and some browsers
      const timer = setTimeout(() => {
        downloadLinkRef.current.click();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [success, downloadUrl]);
  
  if (!success && !error) return null;
  
  return (
    <div className={`rounded-lg p-4 mb-6 ${success ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {success ? (
            <FiCheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <FiAlertCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>
            {success ? 'Report Generated Successfully!' : 'Error'}
          </h3>
          <div className={`mt-2 text-sm ${success ? 'text-green-700' : 'text-red-700'}`}>
            <p>{success || error}</p>
          </div>
          {success && downloadUrl && (
            <div className="mt-4">
              <a
                ref={downloadLinkRef}
                href={downloadUrl}
                download={fileName || "ProgramFundsubscription.xlsx"}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={(e) => {
                  // For browsers that may block automatic download,
                  // this ensures the download happens on manual click too
                  e.stopPropagation();
                }}
              >
                <FiDownload className="-ml-0.5 mr-2 h-4 w-4" />
                Download Report
              </a>
              <p className="text-xs text-gray-500 mt-2">
                If the download doesn't start automatically, click the button above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 