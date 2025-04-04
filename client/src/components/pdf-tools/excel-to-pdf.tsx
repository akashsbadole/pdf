import { Table } from 'lucide-react';
import { PdfConversionTemplate } from './pdf-conversion-template';
import { convertExcelToPdf } from '@/lib/pdf-utils';

export function ExcelToPdfTool() {
  return (
    <PdfConversionTemplate
      title="Excel to PDF"
      description="Convert Excel spreadsheets to PDF format. Our conversion preserves cell formatting, formulas display, charts, and tables for professional PDF documents."
      sourceFormat="Excel"
      targetFormat="PDF"
      acceptedFileTypes={['xls', 'xlsx', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']}
      icon={<Table className="h-5 w-5 mr-2" />}
      conversionFunction={async (file, options) => {
        return await convertExcelToPdf(file, {
          quality: options.quality === 'high' ? 'high' : options.quality === 'medium' ? 'medium' : 'low',
          preserveFormatting: true,
          includeImages: true
        });
      }}
    />
  );
}