import { Layers } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertPdfToPowerPoint } from '@/lib/pdf-utils';

export function PdfToPowerPointTool() {
  return (
    <PdfConversionTemplate
      title="PDF to PowerPoint"
      description="Convert your PDF files to editable PowerPoint presentations. Our conversion maintains slide layouts, images, and text formatting."
      sourceFormat="PDF"
      targetFormat="PPTX"
      acceptedFileTypes={['pdf', 'application/pdf']}
      icon={<Layers className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        return await convertPdfToPowerPoint(file, {
          quality: options.quality === 'high' ? 'high' : options.quality === 'medium' ? 'medium' : 'low',
          preserveFormatting: true,
          includeImages: true
        });
      }}
    />
  );
}