import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  className?: string;
  label?: string;
  description?: string;
  buttonText?: string;
}

export function FileUploader({
  onFilesSelected,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  acceptedFileTypes = [".pdf"],
  maxFiles = 10,
  className,
  label = "Drag & drop your files here",
  description = "or",
  buttonText = "Browse Files"
}: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const {
    getRootProps,
    getInputProps,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      if (type === '.pdf') acc['application/pdf'] = [];
      if (type === '.jpg' || type === '.jpeg') acc['image/jpeg'] = [];
      if (type === '.png') acc['image/png'] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const hasErrors = isDragReject || fileRejections.length > 0;

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "file-drop-area p-10 text-center border-2 border-dashed rounded-lg cursor-pointer transition-all",
        isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
        hasErrors && "border-red-500 bg-red-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud 
        className={cn(
          "h-12 w-12 mx-auto mb-4",
          hasErrors ? "text-red-500" : "text-gray-400"
        )} 
      />
      <p className="text-gray-700 mb-2 font-medium">{label}</p>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      <div>
        <Button variant="default" className="cursor-pointer">
          <UploadCloud className="h-5 w-5 mr-2" />
          {buttonText}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-4">Maximum file size: {Math.floor(maxFileSize / (1024 * 1024))}MB per file</p>
      
      {fileRejections.length > 0 && (
        <div className="mt-4 text-sm text-red-500">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              {errors.map(e => (
                <p key={e.code}>{e.message}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
