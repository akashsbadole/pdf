import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { getTool } from '@/lib/tools-config';
// Organize PDF tools
import { MergePdfTool } from '@/components/pdf-tools/merge-pdf';
import { SplitPdfTool } from '@/components/pdf-tools/split-pdf';

// Optimize PDF tools
import { CompressPdfTool } from '@/components/pdf-tools/compress-pdf';

// Convert To PDF tools
import { JpgToPdfTool } from '@/components/pdf-tools/jpg-to-pdf';
import { WordToPdfTool } from '@/components/pdf-tools/word-to-pdf';
import { PptToPdfTool } from '@/components/pdf-tools/ppt-to-pdf';
import { ExcelToPdfTool } from '@/components/pdf-tools/excel-to-pdf';
import { HtmlToPdfTool } from '@/components/pdf-tools/html-to-pdf';

// Convert From PDF tools
import { PdfToJpgTool } from '@/components/pdf-tools/pdf-to-jpg';
import { PdfToWordTool } from '@/components/pdf-tools/pdf-to-word';
import { PdfToPowerPointTool } from '@/components/pdf-tools/pdf-to-powerpoint';
import { PdfToExcelTool } from '@/components/pdf-tools/pdf-to-excel';
import { PdfToPdfaTool } from '@/components/pdf-tools/pdf-to-pdfa';

// Edit PDF tools
import { RotatePdfTool } from '@/components/pdf-tools/rotate-pdf';

interface ToolPageProps {
  toolId: string;
}

export default function ToolPage({ toolId }: ToolPageProps) {
  const [_, navigate] = useLocation();
  const tool = getTool(toolId);
  
  useEffect(() => {
    // Redirect to home if tool not found
    if (!tool) {
      navigate('/');
    }
  }, [tool, navigate]);
  
  if (!tool) return null;
  
  // Render the appropriate tool component based on tool.id
  const renderTool = () => {
    switch (tool.id) {
      // Organize PDF tools
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'split-pdf':
        return <SplitPdfTool />;
        
      // Optimize PDF tools
      case 'compress-pdf':
        return <CompressPdfTool />;
      
      // Convert To PDF tools
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'word-to-pdf':
        return <WordToPdfTool />;
      case 'ppt-to-pdf':
        return <PptToPdfTool />;
      case 'excel-to-pdf':
        return <ExcelToPdfTool />;
      case 'html-to-pdf':
        return <HtmlToPdfTool />;
      
      // Convert From PDF tools
      case 'pdf-to-jpg':
        return <PdfToJpgTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'pdf-to-ppt':
        return <PdfToPowerPointTool />;
      case 'pdf-to-excel':
        return <PdfToExcelTool />;
      case 'pdf-to-pdfa':
        return <PdfToPdfaTool />;
      
      // Edit PDF tools
      case 'rotate-pdf':
        return <RotatePdfTool />;
        
      default:
        return (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold">
              {tool.name} tool is coming soon!
            </h2>
            <p className="text-gray-500 mt-2">
              This functionality is under development.
            </p>
          </div>
        );
    }
  };
  
  return renderTool();
}
