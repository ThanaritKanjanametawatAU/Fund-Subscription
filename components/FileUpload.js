import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck } from 'react-icons/fi';

export default function FileUpload({ label, fileType, file, onFileChange }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 
          ${isDragActive ? 'border-primary bg-accent' : 'border-gray-300'}
          ${file ? 'bg-green-50' : 'hover:bg-gray-50'}
          transition-colors duration-200 cursor-pointer`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          {file ? (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-primary mt-2">Click or drag to replace</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-3">
                {fileType === 'master' ? (
                  <FiFile className="h-6 w-6 text-primary" />
                ) : (
                  <FiUpload className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop the file here' : `Upload ${fileType} file`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Only .xlsx files are supported
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 