import React from 'react';
import { 
  FileText, 
  Scissors, 
  XSquare, 
  FileOutput, 
  SlidersHorizontal, 
  Scan, 
  ArrowDownCircle, 
  Wrench, 
  FileDigit, 
  Layers, 
  RotateCw,
  Image, 
  FileType,
  Plus,
  Code,
  Database,
  Table,
  Check
} from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

// Define all tools with their metadata
const tools: Tool[] = [
  // Organize PDF
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one',
    category: 'organize',
    icon: <Plus className="h-5 w-5 mr-2" />
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split a PDF into multiple files',
    category: 'organize',
    icon: <Scissors className="h-5 w-5 mr-2" />
  },
  {
    id: 'remove-pages',
    name: 'Remove Pages',
    description: 'Delete specific pages from a PDF',
    category: 'organize',
    icon: <XSquare className="h-5 w-5 mr-2" />
  },
  {
    id: 'extract-pages',
    name: 'Extract Pages',
    description: 'Extract specific pages from a PDF',
    category: 'organize',
    icon: <FileOutput className="h-5 w-5 mr-2" />
  },
  {
    id: 'organize-pages',
    name: 'Organize Pages',
    description: 'Rearrange pages within a PDF',
    category: 'organize',
    icon: <SlidersHorizontal className="h-5 w-5 mr-2" />
  },
  {
    id: 'scan-to-pdf',
    name: 'Scan to PDF',
    description: 'Convert scanned images to PDF',
    category: 'organize',
    icon: <Scan className="h-5 w-5 mr-2" />
  },
  
  // Optimize PDF
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce the file size of your PDF',
    category: 'optimize',
    icon: <ArrowDownCircle className="h-5 w-5 mr-2" />
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    description: 'Fix corrupted PDF files',
    category: 'optimize',
    icon: <Wrench className="h-5 w-5 mr-2" />
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Make scanned PDFs searchable',
    category: 'optimize',
    icon: <FileDigit className="h-5 w-5 mr-2" />
  },
  
  // Convert To PDF
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert JPG images to PDF',
    category: 'convert-to',
    icon: <Image className="h-5 w-5 mr-2" />
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF',
    category: 'convert-to',
    icon: <FileText className="h-5 w-5 mr-2" />
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    category: 'convert-to',
    icon: <Layers className="h-5 w-5 mr-2" />
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF',
    category: 'convert-to',
    icon: <Table className="h-5 w-5 mr-2" />
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert HTML pages to PDF',
    category: 'convert-to',
    icon: <Code className="h-5 w-5 mr-2" />
  },
  
  // Convert From PDF
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    category: 'convert-from',
    icon: <Image className="h-5 w-5 mr-2" />
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to Word documents',
    category: 'convert-from',
    icon: <FileText className="h-5 w-5 mr-2" />
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint presentations',
    category: 'convert-from',
    icon: <Layers className="h-5 w-5 mr-2" />
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Convert PDF to Excel spreadsheets',
    category: 'convert-from',
    icon: <Table className="h-5 w-5 mr-2" />
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    description: 'Convert PDF to PDF/A for archiving',
    category: 'convert-from',
    icon: <Database className="h-5 w-5 mr-2" />
  },
  
  // Edit PDF
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate pages in a PDF file',
    category: 'edit',
    icon: <RotateCw className="h-5 w-5 mr-2" />
  },
  {
    id: 'add-page-numbers',
    name: 'Add Page Numbers',
    description: 'Add page numbers to your PDF',
    category: 'edit',
    icon: <FileDigit className="h-5 w-5 mr-2" />
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    description: 'Add text or image watermarks to PDF',
    category: 'edit',
    icon: <FileType className="h-5 w-5 mr-2" />
  }
];

/**
 * Returns all available tools
 */
export function getAllTools(): Tool[] {
  return tools;
}

/**
 * Returns tools filtered by category
 */
export function getToolsByCategory(category: string): Tool[] {
  return tools.filter(tool => tool.category === category);
}

/**
 * Returns a specific tool by ID
 */
export function getTool(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id);
}

/**
 * Returns only enabled tools
 */
export function getEnabledTools(): Tool[] {
  return tools.filter(tool => !tool.disabled);
}

/**
 * Returns all categories
 */
export function getCategories(): { id: string; name: string }[] {
  return [
    { id: 'organize', name: 'Organize PDF' },
    { id: 'optimize', name: 'Optimize PDF' },
    { id: 'convert-to', name: 'Convert To PDF' },
    { id: 'convert-from', name: 'Convert From PDF' },
    { id: 'edit', name: 'Edit PDF' }
  ];
}
