import { FileText } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertPdfToWord } from '@/lib/pdf-utils';

export function PdfToWordTool() {
  return (
    <PdfConversionTemplate
      title="PDF to Word"
      description="Convert your PDF documents to editable Word files. Our conversion maintains formatting, fonts, and images."
      sourceFormat="PDF"
      targetFormat="DOCX"
      acceptedFileTypes={['pdf', 'application/pdf']}
      icon={<FileText className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        return await convertPdfToWord(file, {
          quality: options.quality === 'high' ? 'high' : options.quality === 'medium' ? 'medium' : 'low',
          preserveFormatting: true,
          includeImages: true
        });
      }}
    />
  );
}