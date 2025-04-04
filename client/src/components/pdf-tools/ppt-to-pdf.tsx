import { Layers } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertPowerPointToPdf } from '@/lib/pdf-utils';

export function PptToPdfTool() {
  return (
    <PdfConversionTemplate
      title="PowerPoint to PDF"
      description="Convert PowerPoint presentations to PDF format. Our conversion preserves slide designs, animations as static elements, and ensures your presentation looks professional in PDF format."
      sourceFormat="PowerPoint"
      targetFormat="PDF"
      acceptedFileTypes={['ppt', 'pptx', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']}
      icon={<Layers className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        return await convertPowerPointToPdf(file, {
          quality: options.quality === 'high' ? 'high' : options.quality === 'medium' ? 'medium' : 'low',
          preserveFormatting: true,
          includeImages: true
        });
      }}
    />
  );
}