// import { useState } from 'react';
// import { uploadMedicalRecord } from '../../utils/index2.js'; // Import the function above

// export const FileUploader = () =>{
//   const [uploading, setUploading] = useState(false);

//   const handleProcessAndUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setUploading(true);

//     try {
//       // 1. Create FormData for FastAPI
//       const formData = new FormData();
//       formData.append("file", file);


//       const apiRes = await fetch("http://localhost:8000/process/", {
//         method: "POST",
//         body: formData,
//       });

//       if (!apiRes.ok) throw new Error("FastAPI processing failed");
      
//       const analysisJson = await apiRes.json();
//       console.log("🧠 AI Analysis Complete:", analysisJson);

//       const dbRecord = await uploadMedicalRecord(file, analysisJson);

//       alert("Success! Document processed and saved.");

//     } catch (error) {
//       console.error(error);
//       alert("Error during processing.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Upload Medical Record</h1>
//       <input 
//         type="file" 
//         onChange={handleProcessAndUpload} 
//         disabled={uploading} 
//         accept=".pdf,.png,.jpg"
//       />
//       {uploading && <p>Processing with AI & Uploading...</p>}
//     </div>
//   );
// }

import React, { useState } from 'react';
import { uploadMedicalRecord } from '../../utils/index2';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

export const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, saving, success, error
  const [statusMsg, setStatusMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Handle file selection via drag or click
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setStatus('error');
      setStatusMsg('Invalid file type. Please upload PDF, PNG, or JPG.');
      return;
    }
    setFile(file);
    setStatus('idle');
    setStatusMsg('');
    setAnalysisResult(null);
  };

  const handleProcessAndUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setStatusMsg('Sending document to AI engine...');

    try {
      // 1. Create FormData for FastAPI
      const formData = new FormData();
      formData.append("file", file);

      // 2. Send to FastAPI Backend
      // Ensure this URL matches your running FastAPI server
      const apiRes = await fetch("http://localhost:8000/process/", {
        method: "POST",
        body: formData,
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`FastAPI Error: ${errText}`);
      }

      setStatus('processing');
      setStatusMsg('AI is analyzing medical context...');
      
      const analysisJson = await apiRes.json();
      console.log("🧠 AI Analysis Complete:", analysisJson);
      setAnalysisResult(analysisJson);

      // 3. Upload to Appwrite
      setStatus('saving');
      setStatusMsg('Encrypting and saving to secure storage...');
      
      await uploadMedicalRecord(file, analysisJson);

      setStatus('success');
      setStatusMsg('Document successfully processed and stored.');

    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMsg(error.message || "An unexpected error occurred.");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus('idle');
    setStatusMsg('');
    setAnalysisResult(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Smart Medical Upload
          </h2>
          <p className="text-blue-100 mt-1 text-sm">
            Upload reports or prescriptions for AI analysis and secure archiving.
          </p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Drop Zone */}
          {!file && (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group"
            >
              <input 
                type="file" 
                id="fileInput" 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium text-lg">Click to upload or drag & drop</p>
                <p className="text-gray-400 text-sm mt-1">PDF, JPG, or PNG (Max 10MB)</p>
              </label>
            </div>
          )}

          {/* Selected File Card */}
          {file && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {status === 'idle' && (
                <button 
                  onClick={resetUpload}
                  className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Status & Progress */}
          {status !== 'idle' && (
            <div className={`rounded-xl p-4 border flex items-start gap-3 ${
              status === 'error' ? 'bg-red-50 border-red-200' : 
              status === 'success' ? 'bg-green-50 border-green-200' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="mt-0.5">
                {status === 'error' ? <AlertCircle className="h-5 w-5 text-red-600" /> :
                 status === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                 <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${
                  status === 'error' ? 'text-red-800' : 
                  status === 'success' ? 'text-green-800' : 
                  'text-blue-800'
                }`}>
                  {status === 'uploading' && 'Uploading...'}
                  {status === 'processing' && 'Analyzing...'}
                  {status === 'saving' && 'Saving...'}
                  {status === 'success' && 'Complete'}
                  {status === 'error' && 'Error'}
                </h3>
                <p className={`text-sm mt-1 ${
                  status === 'error' ? 'text-red-600' : 
                  status === 'success' ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {statusMsg}
                </p>

                {/* Analysis Preview (If available) */}
                {analysisResult && status === 'success' && (
                  <div className="mt-3 bg-white/60 rounded p-3 text-xs text-green-900 border border-green-100">
                    <p><strong>Type:</strong> {analysisResult.document_category}</p>
                    <p><strong>Summary:</strong> {analysisResult.executive_summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          {file && status === 'idle' && (
            <button
              onClick={handleProcessAndUpload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Upload className="h-5 w-5" />
              Process & Upload Document
            </button>
          )}
          
          {status === 'success' && (
            <button
              onClick={resetUpload}
              className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Upload Another Document
            </button>
          )}

        </div>
      </div>
    </div>
  );
};