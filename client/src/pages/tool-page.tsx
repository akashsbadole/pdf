import { useEffect } from "react";
import { useLocation } from "wouter";
import { getTool } from "@/lib/tools-config";

// Organize PDF tools
import { MergePdfTool } from "@/components/pdf-tools/merge-pdf";
import { SplitPdfTool } from "@/components/pdf-tools/split-pdf";
import { RemovePagesTool } from "@/components/pdf-tools/remove-pages";
import { ExtractPagesTool } from "@/components/pdf-tools/extract-pages";
import { OrganizePagesTool } from "@/components/pdf-tools/organize-pages";
import { ScanToPdfTool } from "@/components/pdf-tools/scan-to-pdf";

// Optimize PDF tools
import { CompressPdfTool } from "@/components/pdf-tools/compress-pdf";
import { RepairPdfTool } from "@/components/pdf-tools/repair-pdf";
import { OcrPdfTool } from "@/components/pdf-tools/ocr-pdf";

// Convert To PDF tools
import { JpgToPdfTool } from "@/components/pdf-tools/jpg-to-pdf";
import { WordToPdfTool } from "@/components/pdf-tools/word-to-pdf";
import { PptToPdfTool } from "@/components/pdf-tools/ppt-to-pdf";
import { ExcelToPdfTool } from "@/components/pdf-tools/excel-to-pdf";
import { HtmlToPdfTool } from "@/components/pdf-tools/html-to-pdf";

// Convert From PDF tools
import { PdfToJpgTool } from "@/components/pdf-tools/pdf-to-jpg";
import { PdfToWordTool } from "@/components/pdf-tools/pdf-to-word";
import { PdfToPowerPointTool } from "@/components/pdf-tools/pdf-to-powerpoint";
import { PdfToExcelTool } from "@/components/pdf-tools/pdf-to-excel";
import { PdfToPdfaTool } from "@/components/pdf-tools/pdf-to-pdfa";

// Edit PDF tools
import { RotatePdfTool } from "@/components/pdf-tools/rotate-pdf";
import { AddPageNumbersTool } from "@/components/pdf-tools/add-page-numbers";
import { AddWatermarkTool } from "@/components/pdf-tools/add-watermark";
import { EditMetadataTool } from "@/components/pdf-tools/edit-metadata";

// Security tools
import { EncryptPdfTool } from "@/components/pdf-tools/encrypt-pdf";
import { DecryptPdfTool } from "@/components/pdf-tools/decrypt-pdf";
import { ValidatePdfaTool } from "@/components/pdf-tools/validate-pdfa";
import SanitizePdfTool from "@/components/pdf-tools/sanitize-pdf";

interface ToolPageProps {
  toolId: string;
}

export default function ToolPage({ toolId }: ToolPageProps) {
  const [, setLocation] = useLocation();
  const tool = getTool(toolId);

  useEffect(() => {
    if (!tool) {
      setLocation("/404");
    }
  }, [tool, setLocation]);

  if (!tool) {
    return null;
  }

  // Render the appropriate tool component based on the tool ID
  switch (toolId) {
    // Organize PDF
    case "merge-pdf":
      return <MergePdfTool />;
    case "split-pdf":
      return <SplitPdfTool />;
    case "remove-pages":
      return <RemovePagesTool />;
    case "extract-pages":
      return <ExtractPagesTool />;
    case "organize-pages":
      return <OrganizePagesTool />;
    case "scan-to-pdf":
      return <ScanToPdfTool />;

    // Optimize PDF
    case "compress-pdf":
      return <CompressPdfTool />;
    case "repair-pdf":
      return <RepairPdfTool />;
    case "ocr-pdf":
      return <OcrPdfTool />;

    // Convert To PDF
    case "jpg-to-pdf":
      return <JpgToPdfTool />;
    case "word-to-pdf":
      return <WordToPdfTool />;
    case "ppt-to-pdf":
      return <PptToPdfTool />;
    case "excel-to-pdf":
      return <ExcelToPdfTool />;
    case "html-to-pdf":
      return <HtmlToPdfTool />;

    // Convert From PDF
    case "pdf-to-jpg":
      return <PdfToJpgTool />;
    case "pdf-to-word":
      return <PdfToWordTool />;
    case "pdf-to-ppt":
      return <PdfToPowerPointTool />;
    case "pdf-to-excel":
      return <PdfToExcelTool />;
    case "pdf-to-pdfa":
      return <PdfToPdfaTool />;

    // Edit PDF
    case "rotate-pdf":
      return <RotatePdfTool />;
    case "add-page-numbers":
      return <AddPageNumbersTool />;
    case "add-watermark":
      return <AddWatermarkTool />;
    case "edit-metadata":
      return <EditMetadataTool />;

    // Security
    case "encrypt-pdf":
      return <EncryptPdfTool />;
    case "decrypt-pdf":
      return <DecryptPdfTool />;
    case "validate-pdfa":
      return <ValidatePdfaTool />;
    case "sanitize-pdf":
      return <SanitizePdfTool />;

    default:
      setLocation("/404");
      return null;
  }
}
