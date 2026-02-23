import React, { useState, useCallback } from "react";
import { Upload, FileImage, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DropZone({ onFilesSelected, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragging
            ? "border-blue-400 bg-blue-50/50 scale-[1.01]"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
          }
        `}
        onClick={() => document.getElementById("file-input").click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
            ${isDragging ? "bg-blue-100" : "bg-slate-100"}
          `}>
            <Upload className={`w-7 h-7 ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Drop documents here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG, TIFF • Up to 50MB per file</p>
          </div>
        </div>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <FileImage className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
          >
            {isUploading ? "Processing..." : `Analyze ${selectedFiles.length} Document${selectedFiles.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}