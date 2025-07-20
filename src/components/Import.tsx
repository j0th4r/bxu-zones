import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export const Import: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [aiAutoCorrection, setAiAutoCorrection] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const steps = [
    { number: 1, title: 'Upload', active: currentStep >= 1, completed: currentStep > 1 },
    { number: 2, title: 'Review', active: currentStep >= 2, completed: currentStep > 2 },
    { number: 3, title: 'Import', active: currentStep >= 3, completed: currentStep > 3 }
  ];

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'rgb(3 7 18 / var(--tw-bg-opacity, 1))' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-white text-center">Import Zoning Code</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex-shrink-0 p-6">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.completed 
                    ? 'bg-green-600 text-white' 
                    : step.active 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step.active ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-4 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            {/* Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Upload Zoning Code Files</h2>
              <p className="text-gray-400 mb-6">
                Upload your existing zoning code files. We support PDF, Word documents, HTML, and plain text files.
              </p>

              {/* Drag & Drop Area */}
              <div 
                className={`
                  relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
                  ${isDragOver 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.html,.htm,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Drag and drop files here</h3>
                  <p className="text-gray-400 mb-6">or click the button below to browse files</p>
                  
                  <button
                    onClick={handleBrowseFiles}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Browse Files
                  </button>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6 text-left">
                    <h4 className="text-sm font-medium text-white mb-2">Selected Files:</h4>
                    <ul className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Options */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Processing Options</h3>
              
              <div className="space-y-4">
                {/* AI Auto-Correction Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">AI Auto-Correction</h4>
                    <p className="text-gray-400 text-sm">Allow AI to automatically fix common issues</p>
                  </div>
                  <button
                    onClick={() => setAiAutoCorrection(!aiAutoCorrection)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${aiAutoCorrection ? 'bg-indigo-600' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${aiAutoCorrection ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Preserve Original Formatting Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Preserve Original Formatting</h4>
                    <p className="text-gray-400 text-sm">Maintain the original text formatting where possible</p>
                  </div>
                  <button
                    onClick={() => setPreserveFormatting(!preserveFormatting)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${preserveFormatting ? 'bg-indigo-600' : 'bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${preserveFormatting ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button className="px-6 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={selectedFiles.length === 0}
              >
                <Upload className="w-4 h-4" />
                Process Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 