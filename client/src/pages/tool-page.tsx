import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { getTool } from '@/lib/tools-config';
import { MergePdfTool } from '@/components/pdf-tools/merge-pdf';
import { SplitPdfTool } from '@/components/pdf-tools/split-pdf';
import { CompressPdfTool } from '@/components/pdf-tools/compress-pdf';
import { JpgToPdfTool } from '@/components/pdf-tools/jpg-to-pdf';
import { PdfToJpgTool } from '@/components/pdf-tools/pdf-to-jpg';
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
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'split-pdf':
        return <SplitPdfTool />;
      case 'compress-pdf':
        return <CompressPdfTool />;
      case 'jpg-to-pdf':
        return <JpgToPdfTool />;
      case 'pdf-to-jpg':
        return <PdfToJpgTool />;
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
