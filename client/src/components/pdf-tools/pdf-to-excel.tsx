import { Table } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertPdfToExcel } from '@/lib/pdf-utils';

export function PdfToExcelTool() {
  return (
    <PdfConversionTemplate
      title="PDF to Excel"
      description="Convert PDF tables and data to editable Excel spreadsheets. Our conversion detects tables, numbers, and text to create properly formatted Excel files."
      sourceFormat="PDF"
      targetFormat="XLSX"
      acceptedFileTypes={['pdf', 'application/pdf']}
      icon={<Table className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        return await convertPdfToExcel(file, {
          quality: options.quality === 'high' ? 'high' : options.quality === 'medium' ? 'medium' : 'low',
          preserveFormatting: true,
          includeImages: true
        });
      }}
    />
  );
}