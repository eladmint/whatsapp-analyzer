import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [onFileSelect]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
    >
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        id="file-upload"
        accept=".txt"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700">
          Drop your WhatsApp chat export here
        </p>
        <p className="text-sm text-gray-500 mt-2">
          or click to select file
        </p>
      </label>
    </div>
  );
}