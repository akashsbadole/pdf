import { Code } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertHtmlToPdf } from '@/lib/pdf-utils';

export function HtmlToPdfTool() {
  return (
    <PdfConversionTemplate
      title="HTML to PDF"
      description="Convert HTML pages to PDF format. Our conversion preserves layouts, styles, images, and formatting from your web pages to create high-quality PDF documents."
      sourceFormat="HTML"
      targetFormat="PDF"
      acceptedFileTypes={['html', 'htm', 'text/html']}
      icon={<Code className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        // Determine page size based on quality
        const pageSize = options.quality === 'high' ? 'letter' : 'a4';
        
        return await convertHtmlToPdf(file, {
          pageSize,
          margins: options.quality === 'high' ? 36 : 24 // 0.5 inch for high quality, 0.333 inch for others
        });
      }}
    />
  );
}