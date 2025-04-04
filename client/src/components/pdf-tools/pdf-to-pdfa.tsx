import { Database } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertPdfToPdfA } from '@/lib/pdf-utils';

export function PdfToPdfaTool() {
  return (
    <PdfConversionTemplate
      title="PDF to PDF/A"
      description="Convert standard PDF files to PDF/A format for long-term archiving. PDF/A ensures your documents will be accessible in the future regardless of software changes."
      sourceFormat="PDF"
      targetFormat="PDF/A"
      acceptedFileTypes={['pdf', 'application/pdf']}
      icon={<Database className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        // Choose the PDF/A standard based on quality setting
        const standard = options.quality === 'high' 
          ? 'PDF/A-3b' 
          : options.quality === 'medium' 
            ? 'PDF/A-2b' 
            : 'PDF/A-1b';
            
        return await convertPdfToPdfA(file, { standard });
      }}
    />
  );
}