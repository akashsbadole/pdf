import { useState } from 'react';
import { X, ChevronUp, ChevronDown, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onMoveFile?: (index: number, direction: 'up' | 'down') => void;
  allowReordering?: boolean;
  showThumbnails?: boolean;
  className?: string;
}

export function FileList({
  files,
  onRemoveFile,
  onClearAll,
  onMoveFile,
  allowReordering = false,
  showThumbnails = false,
  className
}: FileListProps) {
  
  const getFileIcon = (file: File) => {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      if (showThumbnails) {
        return (
          <img 
            src={URL.createObjectURL(file)} 
            alt={file.name} 
            className="h-10 w-10 object-cover rounded"
          />
        );
      }
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };
  
  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto"
          >
            <Trash className="h-4 w-4 mr-1" />
            <span>Clear All</span>
          </Button>
        </div>
      </div>
      
      {files.map((file, index) => (
        <div 
          key={`${file.name}-${index}`} 
          className={cn(
            "p-4 border-b border-gray-200 last:border-0",
            index % 2 === 1 && "bg-gray-50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getFileIcon(file)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{getFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center ml-4 space-x-1">
              {allowReordering && onMoveFile && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMoveFile(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMoveFile(index, 'down')}
                    disabled={index === files.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Move down</span>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-500"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
