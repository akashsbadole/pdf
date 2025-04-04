import { FileText } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertWordToPdf } from '@/lib/pdf-utils';

export function WordToPdfTool() {
  return (
    <PdfConversionTemplate
      title="Word to PDF"
      description="Convert Microsoft Word documents to PDF format. Our conversion preserves formatting, fonts, and layouts for professional-looking PDFs."
      sourceFormat="Word"
      targetFormat="PDF"
      acceptedFileTypes={['doc', 'docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
      icon={<FileText className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        return await convertWordToPdf(file, {
          quality: options.quality === 'high' ? 'high' : options.quality === 'medium' ? 'medium' : 'low',
          preserveFormatting: true,
          includeImages: true
        });
      }}
    />
  );
}