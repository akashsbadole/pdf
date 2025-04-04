import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileIcon, FileTextIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ensure the PDF worker is loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfThumbnailProps {
  file: File | string;
  width?: number;
  height?: number;
  className?: string;
  pageNumber?: number;
  onClick?: () => void;
}

export function PdfThumbnail({
  file,
  width = 100,
  height = 140,
  className,
  pageNumber = 1,
  onClick
}: PdfThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        // Reset states
        setThumbnail(null);
        setError(false);
        
        let fileData: Uint8Array | ArrayBuffer;
        
        if (typeof file === 'string') {
          // If file is a URL or a file path
          const response = await fetch(file);
          fileData = await response.arrayBuffer();
        } else {
          // If file is a File object
          fileData = await file.arrayBuffer();
        }
        
        // Load the PDF document
        const pdfDoc = await pdfjsLib.getDocument({ data: fileData }).promise;
        
        // Get the specified page
        const page = await pdfDoc.getPage(pageNumber);
        
        // Set the scale to fit the thumbnail dimensions
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        
        // Create a canvas to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          setError(true);
          return;
        }
        
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        
        // Render the page to the canvas
        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise;
        
        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL('image/png');
        setThumbnail(dataUrl);
      } catch (err) {
        console.error('Error generating PDF thumbnail:', err);
        setError(true);
      }
    };
    
    if (file) {
      loadThumbnail();
    }
  }, [file, pageNumber, width, height]);

  return (
    <div 
      className={cn(
        "relative rounded-md overflow-hidden bg-gray-100 flex items-center justify-center",
        onClick && "cursor-pointer",
        className
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={onClick}
    >
      {error ? (
        <FileIcon className="h-12 w-12 text-gray-400" />
      ) : thumbnail ? (
        <img 
          src={thumbnail} 
          alt="PDF thumbnail" 
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <FileTextIcon className="h-12 w-12" />
          <span className="text-xs mt-2">Loading...</span>
        </div>
      )}
    </div>
  );
}
