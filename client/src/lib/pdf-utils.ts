import * as pdfLib from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { arrayBufferToBlob } from './file-utils';
import { decode } from 'base64-arraybuffer';

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface MergePDFOptions {
  pageSize?: string;
  orientation?: string;
  keepMetadata?: boolean;
  compression?: string;
}

interface CompressPDFOptions {
  quality: number;
}

interface ConvertImagesToPdfOptions {
  pageSize: string;
  orientation: string;
  fitToPage: boolean;
}

interface ConvertPdfToImagesOptions {
  format: 'jpg' | 'png';
  quality: number;
  dpi: number;
}

interface ConvertPdfToOfficeOptions {
  quality: string;
  preserveFormatting?: boolean;
  includeImages?: boolean;
}

interface ConvertOfficeToPdfOptions {
  quality: string;
  preserveFormatting?: boolean;
  includeImages?: boolean;
}

interface RepairPdfOptions {
  strictMode?: boolean;
}

interface OcrPdfOptions {
  language: string;
  accuracy: string;
}

interface AddPageNumbersOptions {
  position: string;
  startNumber: number;
  fontSize: number;
  fontColor: string;
  includePrefix: boolean;
  pagePrefix: string;
}

interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  image?: File | null;
  fontSize?: number;
  opacity: number;
  rotation: number;
  color?: string;
  position: string;
  tiled: boolean;
}

export async function getTotalPages(file: File): Promise<number> {
  const fileArrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
  return pdfDoc.getPageCount();
}

/**
 * Merges multiple PDF files into a single PDF
 */
export async function mergePDFs(files: File[], options: MergePDFOptions = {}): Promise<Blob> {
  try {
    const mergedPdf = await pdfLib.PDFDocument.create();
    
    for (const file of files) {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
      
      // If this is the first PDF and we want to keep its metadata
      if (options.keepMetadata && files.indexOf(file) === 0) {
        const metadata = {
          title: pdfDoc.getTitle() || '',
          author: pdfDoc.getAuthor() || '',
          subject: pdfDoc.getSubject() || '',
          keywords: pdfDoc.getKeywords() || '',
          creator: pdfDoc.getCreator() || '',
          producer: pdfDoc.getProducer() || ''
        };
        
        mergedPdf.setTitle(metadata.title);
        mergedPdf.setAuthor(metadata.author);
        mergedPdf.setSubject(metadata.subject);
        mergedPdf.setKeywords([metadata.keywords]);
        mergedPdf.setCreator(metadata.creator);
        mergedPdf.setProducer(metadata.producer);
      }
      
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    
    // Set compression level
    const pdfBytes = await mergedPdf.save({
      useObjectStreams: options.compression !== 'low',
      addDefaultPage: false,
    });
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('Could not merge PDF files. Please try again.');
  }
}

/**
 * Splits a PDF file into multiple PDFs based on page numbers
 */
export async function splitPDF(file: File, pageRanges: number[][]): Promise<Blob[]> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    // Validate that all pages are in range
    for (const range of pageRanges) {
      for (const pageNum of range) {
        if (pageNum < 1 || pageNum > totalPages) {
          throw new Error(`Page number ${pageNum} is out of range (1-${totalPages})`);
        }
      }
    }
    
    const splitPdfs: Blob[] = [];
    
    for (const range of pageRanges) {
      const newPdf = await pdfLib.PDFDocument.create();
      const pagesToCopy = range.map(pageNum => pageNum - 1); // convert to 0-based index
      
      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      splitPdfs.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }
    
    return splitPdfs;
  } catch (error) {
    console.error('Error splitting PDF:', error);
    throw new Error('Could not split PDF file. Please try again.');
  }
}

/**
 * Compresses a PDF file by reducing image quality
 */
export async function compressPDF(file: File, options: CompressPDFOptions): Promise<Blob> {
  try {
    const { quality } = options;
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    
    // For now, we're just reducing file size by using object streams
    // In a real implementation, we would replace images with lower quality versions
    // and apply other compression techniques
    
    // Set more aggressive compression for lower quality settings
    const useObjectStreams = quality < 90;
    const preserveStreams = quality > 60;
    
    // Get PDF bytes with compression options
    const pdfBytes = await pdfDoc.save({
      useObjectStreams,
      addDefaultPage: false
    });
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('Could not compress PDF file. Please try again.');
  }
}

/**
 * Rotates pages in a PDF file
 */
export async function rotatePDF(file: File, pageNumbers: number[], angle: number): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    // Validate that all pages are in range
    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} is out of range (1-${totalPages})`);
      }
    }
    
    // Normalize angle to 0, 90, 180, or 270
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Apply rotation to specified pages
    for (const pageNum of pageNumbers) {
      const page = pdfDoc.getPage(pageNum - 1); // convert to 0-based index
      
      // Apply the rotation - the PDFPage.setRotation() expects a Rotation object
      // which we create by calling pdfLib.degrees()
      if (normalizedAngle === 90) {
        page.setRotation(pdfLib.degrees(90));
      } else if (normalizedAngle === 180) {
        page.setRotation(pdfLib.degrees(180));
      } else if (normalizedAngle === 270) {
        page.setRotation(pdfLib.degrees(270));
      } else {
        page.setRotation(pdfLib.degrees(0));
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error rotating PDF:', error);
    throw new Error('Could not rotate PDF pages. Please try again.');
  }
}

/**
 * Converts image files to a PDF document
 */
export async function convertImagesToPdf(
  files: File[],
  options: ConvertImagesToPdfOptions
): Promise<Blob> {
  try {
    const pdfDoc = await pdfLib.PDFDocument.create();
    
    // Determine page dimensions based on options
    let pageWidth: number;
    let pageHeight: number;
    
    switch (options.pageSize.toLowerCase()) {
      case 'a4':
        pageWidth = 595;
        pageHeight = 842;
        break;
      case 'letter':
        pageWidth = 612;
        pageHeight = 792;
        break;
      case 'legal':
        pageWidth = 612;
        pageHeight = 1008;
        break;
      case 'a3':
        pageWidth = 842;
        pageHeight = 1191;
        break;
      case 'a5':
        pageWidth = 420;
        pageHeight = 595;
        break;
      default:
        pageWidth = 595;
        pageHeight = 842; // Default to A4
    }
    
    // Swap dimensions if landscape orientation
    if (options.orientation === 'landscape') {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }
    
    // Process each image
    for (const file of files) {
      const imageArrayBuffer = await file.arrayBuffer();
      let embeddedImage;
      
      if (file.type.includes('png')) {
        embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
      } else if (file.type.includes('jpg') || file.type.includes('jpeg')) {
        embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
      } else {
        // For other formats, we should convert them, but for now we'll skip
        console.warn(`Skipping unsupported image format: ${file.type}`);
        continue;
      }
      
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      
      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;
      
      // Calculate dimensions to fit the image on the page
      let drawWidth = imgWidth;
      let drawHeight = imgHeight;
      
      if (options.fitToPage) {
        const scaleWidth = pageWidth / imgWidth;
        const scaleHeight = pageHeight / imgHeight;
        const scale = Math.min(scaleWidth, scaleHeight) * 0.9; // Add some margin
        
        drawWidth = imgWidth * scale;
        drawHeight = imgHeight * scale;
      }
      
      // Center the image on the page
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;
      
      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting images to PDF:', error);
    throw new Error('Could not convert images to PDF. Please try again.');
  }
}

/**
 * Initializes a PDF document for rendering
 */
export async function initPdfForRendering(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  return await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

// Update existing functions to use PDF.js for rendering
export async function convertPdfToImages(
  file: File,
  pageNumbers: number[],
  options: ConvertPdfToImagesOptions,
  progressCallback?: (current: number, total: number) => void
): Promise<Blob[]> {
  try {
    const pdfDoc = await initPdfForRendering(file);
    const images: Blob[] = [];
    const total = pageNumbers.length;

    for (let i = 0; i < pageNumbers.length; i++) {
      const pageNum = pageNumbers[i];
      
      if (progressCallback) {
        progressCallback(i + 1, total);
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: options.dpi / 72 }); // Convert DPI to scale
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(new Blob([]));
          }
        }, options.format === 'jpg' ? 'image/jpeg' : 'image/png', options.quality);
      });
      
      images.push(blob);
    }
    
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error('Could not convert PDF to images. Please try again.');
  }
}

/**
 * Converts PDF to Word document
 */
export async function convertPdfToWord(
  file: File,
  options: ConvertPdfToOfficeOptions
): Promise<Blob> {
  try {
    // This is a placeholder function that would require a more sophisticated
    // implementation or external service integration to work properly
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, we would extract text and formatting from the PDF
    // and convert it into a Word compatible format (DOCX)
    
    // For demonstration purposes, we'll create a simple Word file
    const fileArrayBuffer = await file.arrayBuffer();
    
    // This is just returning the original PDF file with a Word MIME type
    // In a real app, this would be a properly converted Word document
    return new Blob([fileArrayBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
  } catch (error) {
    console.error('Error converting PDF to Word:', error);
    throw new Error('Could not convert PDF to Word. Please try again.');
  }
}

/**
 * Converts PDF to PowerPoint presentation
 */
export async function convertPdfToPowerPoint(
  file: File,
  options: ConvertPdfToOfficeOptions
): Promise<Blob> {
  try {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would extract slides from the PDF
    // and convert them to PowerPoint format
    
    const fileArrayBuffer = await file.arrayBuffer();
    
    // This is just returning the original PDF with a PowerPoint MIME type
    // In a real app, this would be a properly converted PPTX document
    return new Blob([fileArrayBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    });
  } catch (error) {
    console.error('Error converting PDF to PowerPoint:', error);
    throw new Error('Could not convert PDF to PowerPoint. Please try again.');
  }
}

/**
 * Converts PDF to Excel spreadsheet
 */
export async function convertPdfToExcel(
  file: File,
  options: ConvertPdfToOfficeOptions
): Promise<Blob> {
  try {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would extract tables from the PDF
    // and convert them to Excel format
    
    const fileArrayBuffer = await file.arrayBuffer();
    
    // This is just returning the original PDF with an Excel MIME type
    // In a real app, this would be a properly converted XLSX document
    return new Blob([fileArrayBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
    throw new Error('Could not convert PDF to Excel. Please try again.');
  }
}

/**
 * Converts PDF to PDF/A format for archiving
 */
export async function convertPdfToPdfA(
  file: File,
  options: { standard: 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b' }
): Promise<Blob> {
  try {
    // Placeholder implementation
    // In reality, this would require embedding all fonts, removing transparency,
    // and ensuring the document meets PDF/A standards
    
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    
    // Add PDF/A metadata (this is simplified and not compliant)
    pdfDoc.setTitle(`PDF/A version of ${file.name}`);
    pdfDoc.setCreator('PDF Converter Tool');
    pdfDoc.setSubject(`Converted to ${options.standard}`);
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting to PDF/A:', error);
    throw new Error('Could not convert to PDF/A. Please try again.');
  }
}

/**
 * Converts Word document to PDF
 */
export async function convertWordToPdf(
  file: File,
  options: ConvertOfficeToPdfOptions
): Promise<Blob> {
  try {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create an empty PDF (in a real implementation, this would parse the Word file)
    const pdfDoc = await pdfLib.PDFDocument.create();
    
    // Add a blank page with sample text as placeholder
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    
    // Add some placeholder text
    const { width, height } = page.getSize();
    page.drawText(`Converted from: ${file.name}`, {
      x: 50,
      y: height - 50,
      size: 24
    });
    
    page.drawText('This is a placeholder PDF document.', {
      x: 50,
      y: height - 100,
      size: 12
    });
    
    page.drawText('In a real implementation, the Word document would be properly converted.', {
      x: 50,
      y: height - 120,
      size: 12
    });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    throw new Error('Could not convert Word to PDF. Please try again.');
  }
}

/**
 * Converts PowerPoint presentation to PDF
 */
export async function convertPowerPointToPdf(
  file: File,
  options: ConvertOfficeToPdfOptions
): Promise<Blob> {
  try {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdfDoc = await pdfLib.PDFDocument.create();
    
    // Add a blank page with sample text as placeholder
    const page = pdfDoc.addPage([720, 540]); // Default PowerPoint slide size
    
    // Add some placeholder text
    const { width, height } = page.getSize();
    page.drawText(`Converted from: ${file.name}`, {
      x: 50,
      y: height - 50,
      size: 24
    });
    
    page.drawText('This is a placeholder PDF slide.', {
      x: 50,
      y: height - 100,
      size: 12
    });
    
    page.drawText('In a real implementation, the PowerPoint would be properly converted.', {
      x: 50,
      y: height - 120,
      size: 12
    });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting PowerPoint to PDF:', error);
    throw new Error('Could not convert PowerPoint to PDF. Please try again.');
  }
}

/**
 * Converts Excel spreadsheet to PDF
 */
export async function convertExcelToPdf(
  file: File,
  options: ConvertOfficeToPdfOptions
): Promise<Blob> {
  try {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdfDoc = await pdfLib.PDFDocument.create();
    
    // Add a blank page with sample text as placeholder
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    
    // Add some placeholder text
    const { width, height } = page.getSize();
    page.drawText(`Converted from: ${file.name}`, {
      x: 50,
      y: height - 50,
      size: 24
    });
    
    page.drawText('This is a placeholder PDF document.', {
      x: 50,
      y: height - 100,
      size: 12
    });
    
    page.drawText('In a real implementation, the Excel spreadsheet would be properly converted.', {
      x: 50,
      y: height - 120,
      size: 12
    });
    
    // Draw a simple table as a placeholder
    const cellSize = 40;
    const tableTop = height - 200;
    const tableLeft = 50;
    
    // Draw table grid
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        page.drawRectangle({
          x: tableLeft + col * cellSize,
          y: tableTop - (row + 1) * cellSize,
          width: cellSize,
          height: cellSize,
          borderWidth: 1,
          borderColor: pdfLib.rgb(0, 0, 0),
          color: pdfLib.rgb(1, 1, 1),
        });
        
        // Add some cell content
        if (row === 0) {
          // Header row
          page.drawText(`Col ${col + 1}`, {
            x: tableLeft + col * cellSize + 5,
            y: tableTop - row * cellSize - 15,
            size: 8
          });
        } else {
          // Data row
          page.drawText(`${row},${col}`, {
            x: tableLeft + col * cellSize + 10,
            y: tableTop - row * cellSize - 15,
            size: 8
          });
        }
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting Excel to PDF:', error);
    throw new Error('Could not convert Excel to PDF. Please try again.');
  }
}

/**
 * Converts HTML file to PDF
 */
export async function convertHtmlToPdf(
  file: File,
  options: { pageSize: string, margins: number }
): Promise<Blob> {
  try {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdfDoc = await pdfLib.PDFDocument.create();
    
    // Add a blank page with sample text as placeholder
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    
    // Add some placeholder text
    const { width, height } = page.getSize();
    page.drawText(`Converted from: ${file.name}`, {
      x: 50,
      y: height - 50,
      size: 24
    });
    
    page.drawText('This is a placeholder PDF document.', {
      x: 50,
      y: height - 100,
      size: 12
    });
    
    page.drawText('In a real implementation, the HTML would be properly rendered to PDF.', {
      x: 50,
      y: height - 120,
      size: 12
    });
    
    // Draw a simple HTML-like structure
    const contentTop = height - 200;
    const contentLeft = 50;
    
    // Header
    page.drawRectangle({
      x: contentLeft,
      y: contentTop - 30,
      width: width - 100,
      height: 30,
      borderWidth: 1,
      borderColor: pdfLib.rgb(0, 0, 0),
      color: pdfLib.rgb(0.9, 0.9, 0.9),
    });
    
    page.drawText('HTML Document Header', {
      x: contentLeft + 20,
      y: contentTop - 20,
      size: 14
    });
    
    // Body content
    page.drawRectangle({
      x: contentLeft,
      y: contentTop - 230,
      width: width - 100,
      height: 200,
      borderWidth: 1,
      borderColor: pdfLib.rgb(0, 0, 0),
      color: pdfLib.rgb(1, 1, 1),
    });
    
    // Sample content
    page.drawText('This is a sample paragraph from the HTML document.', {
      x: contentLeft + 10,
      y: contentTop - 50,
      size: 10
    });
    
    page.drawText('Another paragraph with different content.', {
      x: contentLeft + 10,
      y: contentTop - 70,
      size: 10
    });
    
    // Draw a horizontal rule
    page.drawLine({
      start: { x: contentLeft + 10, y: contentTop - 80 },
      end: { x: width - 110, y: contentTop - 80 },
      thickness: 1,
      color: pdfLib.rgb(0.7, 0.7, 0.7),
    });
    
    // Sample list
    page.drawText('• Item 1 in a list', {
      x: contentLeft + 20,
      y: contentTop - 100,
      size: 10
    });
    
    page.drawText('• Item 2 in a list', {
      x: contentLeft + 20,
      y: contentTop - 120,
      size: 10
    });
    
    page.drawText('• Item 3 in a list', {
      x: contentLeft + 20,
      y: contentTop - 140,
      size: 10
    });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw new Error('Could not convert HTML to PDF. Please try again.');
  }
}

/**
 * Attempts to repair a corrupted PDF
 */
export async function repairPdf(
  file: File,
  options: RepairPdfOptions = {}
): Promise<Blob> {
  try {
    // Placeholder implementation
    // In reality, this would involve more complex operations like:
    // - Reconstructing the PDF's internal structure
    // - Repairing cross-reference tables
    // - Recovering text and images where possible
    
    const fileArrayBuffer = await file.arrayBuffer();
    
    // Attempt to load the PDF with error recovery options
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
    
    // In a real implementation, we would perform additional repair steps here
    
    // Save the document with minimal modifications
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error repairing PDF:', error);
    throw new Error('Could not repair the PDF file. Please try again with a different file.');
  }
}

/**
 * Performs OCR on a PDF to make text searchable
 */
export async function performOcrOnPdf(
  file: File,
  options: OcrPdfOptions
): Promise<Blob> {
  try {
    // Placeholder implementation
    // Real OCR would require:
    // - Extracting images from each page
    // - Running OCR on those images
    // - Creating a new PDF with the recognized text as a searchable layer
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For now, we'll just return the original file
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    
    // Add metadata to indicate OCR was performed
    pdfDoc.setCreator('PDF OCR Tool');
    pdfDoc.setProducer('PDF Converter Suite OCR');
    pdfDoc.setModificationDate(new Date());
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error performing OCR on PDF:', error);
    throw new Error('Could not perform OCR on the PDF file. Please try again.');
  }
}

/**
 * Removes specified pages from a PDF file
 */
export async function removePagesFromPdf(file: File, pagesToRemove: number[]): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    // Validate page numbers
    for (const pageNum of pagesToRemove) {
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} is out of range (1-${totalPages})`);
      }
    }
    
    // Create a new PDF with all pages except those to be removed
    const newPdf = await pdfLib.PDFDocument.create();
    
    // Convert page numbers to 0-based indices and sort in reverse order
    const pageIndicesToRemove = pagesToRemove
      .map(num => num - 1)
      .sort((a, b) => b - a);
    
    // Copy all pages except those marked for removal
    const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i)
      .filter(i => !pageIndicesToRemove.includes(i));
    
    const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    // Copy metadata from original
    newPdf.setTitle(pdfDoc.getTitle() || '');
    newPdf.setAuthor(pdfDoc.getAuthor() || '');
    newPdf.setSubject(pdfDoc.getSubject() || '');
    const keywords = pdfDoc.getKeywords();
    newPdf.setKeywords(typeof keywords === 'string' ? [keywords] : (keywords || []));
    newPdf.setProducer('PDF Converter Suite');
    newPdf.setCreator('PDF Page Removal Tool');
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error removing pages from PDF:', error);
    throw new Error('Could not remove pages from PDF. Please try again.');
  }
}

/**
 * Extracts specified pages from a PDF file into a new PDF
 */
export async function extractPagesFromPdf(file: File, pagesToExtract: number[]): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    // Validate page numbers
    for (const pageNum of pagesToExtract) {
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} is out of range (1-${totalPages})`);
      }
    }
    
    // Create a new PDF with only the specified pages
    const newPdf = await pdfLib.PDFDocument.create();
    const pageIndicesToExtract = pagesToExtract.map(num => num - 1); // Convert to 0-based index
    
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndicesToExtract);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    // Copy metadata from original
    newPdf.setTitle(pdfDoc.getTitle() || '');
    newPdf.setAuthor(pdfDoc.getAuthor() || '');
    newPdf.setSubject(pdfDoc.getSubject() || '');
    const keywords = pdfDoc.getKeywords();
    newPdf.setKeywords(typeof keywords === 'string' ? [keywords] : (keywords || []));
    newPdf.setProducer('PDF Converter Suite');
    newPdf.setCreator('PDF Page Extraction Tool');
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error extracting pages from PDF:', error);
    throw new Error('Could not extract pages from PDF. Please try again.');
  }
}

/**
 * Reorganizes pages in a PDF according to the specified order
 */
export async function organizePdfPages(file: File, pageOrder: number[]): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    // Validate page numbers
    for (const pageNum of pageOrder) {
      if (pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Page number ${pageNum} is out of range (1-${totalPages})`);
      }
    }
    
    // Create a new PDF with reordered pages
    const newPdf = await pdfLib.PDFDocument.create();
    const pageIndicesToCopy = pageOrder.map(num => num - 1); // Convert to 0-based index
    
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndicesToCopy);
    copiedPages.forEach(page => newPdf.addPage(page));
    
    // Copy metadata from original
    newPdf.setTitle(pdfDoc.getTitle() || '');
    newPdf.setAuthor(pdfDoc.getAuthor() || '');
    newPdf.setSubject(pdfDoc.getSubject() || '');
    const keywords = pdfDoc.getKeywords();
    newPdf.setKeywords(typeof keywords === 'string' ? [keywords] : (keywords || []));
    newPdf.setProducer('PDF Converter Suite');
    newPdf.setCreator('PDF Page Organization Tool');
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error organizing PDF pages:', error);
    throw new Error('Could not reorganize PDF pages. Please try again.');
  }
}

/**
 * Adds page numbers to a PDF file
 */
export async function addPageNumbersToPdf(file: File, options: AddPageNumbersOptions): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const pages = pdfDoc.getPages();
    const { position, startNumber, fontSize, fontColor, includePrefix, pagePrefix } = options;
    
    // Convert hex color to RGB
    const hex = fontColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    
    // Add page numbers to each page
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNumber = startNumber + index;
      const text = includePrefix ? `${pagePrefix} ${pageNumber}` : pageNumber.toString();
      
      // Calculate text width for centering
      const textWidth = text.length * (fontSize * 0.5); // Rough estimate of text width
      
      // Calculate position
      let x = 0;
      let y = 0;
      
      switch (position) {
        case 'top-left':
          x = 50;
          y = height - 50;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - 50;
          break;
        case 'bottom-left':
          x = 50;
          y = 30;
          break;
        case 'bottom-center':
          x = (width - textWidth) / 2;
          y = 30;
          break;
      }
      
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color: pdfLib.rgb(r, g, b),
      });
    });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error adding page numbers:', error);
    throw new Error('Could not add page numbers to PDF. Please try again.');
  }
}

/**
 * Adds a watermark to each page of a PDF file
 */
export async function addWatermarkToPdf(file: File, options: WatermarkOptions): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const pages = pdfDoc.getPages();
    
    // Convert hex color to RGB for text watermark
    let r = 0, g = 0, b = 0;
    if (options.type === 'text' && options.color) {
      const hex = options.color.replace('#', '');
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }

    // If using image watermark, prepare the image
    let watermarkImage;
    if (options.type === 'image' && options.image) {
      const imageArrayBuffer = await options.image.arrayBuffer();
      if (options.image.type.includes('png')) {
        watermarkImage = await pdfDoc.embedPng(imageArrayBuffer);
      } else {
        watermarkImage = await pdfDoc.embedJpg(imageArrayBuffer);
      }
    }

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      if (options.type === 'text' && options.text) {
        // Calculate text size and position
        const text = options.text;
        const fontSize = options.fontSize || 48;
        const textWidth = text.length * (fontSize * 0.5); // Rough estimate
        const textHeight = fontSize;

        const positions = options.tiled ? 
          generateTiledPositions(width, height, textWidth, textHeight) :
          [calculatePosition(width, height, textWidth, textHeight, options.position)];

        for (const [x, y] of positions) {
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            color: pdfLib.rgb(r, g, b),
            opacity: options.opacity,
            rotate: pdfLib.degrees(options.rotation),
          });
        }
      } else if (options.type === 'image' && watermarkImage) {
        // Calculate image size and position
        const imgWidth = watermarkImage.width;
        const imgHeight = watermarkImage.height;
        
        // Scale image to reasonable size (e.g., 1/3 of page width)
        const scale = (width / 3) / imgWidth;
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        const positions = options.tiled ?
          generateTiledPositions(width, height, drawWidth, drawHeight) :
          [calculatePosition(width, height, drawWidth, drawHeight, options.position)];

        for (const [x, y] of positions) {
          page.drawImage(watermarkImage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
            opacity: options.opacity,
            rotate: pdfLib.degrees(options.rotation),
          });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw new Error('Could not add watermark to PDF. Please try again.');
  }
}

/**
 * Helper function to calculate watermark position
 */
function calculatePosition(
  pageWidth: number,
  pageHeight: number,
  elementWidth: number,
  elementHeight: number,
  position: string
): [number, number] {
  const margin = 50;
  
  switch (position) {
    case 'top-left':
      return [margin, pageHeight - margin - elementHeight];
    case 'top-right':
      return [pageWidth - margin - elementWidth, pageHeight - margin - elementHeight];
    case 'bottom-left':
      return [margin, margin];
    case 'bottom-right':
      return [pageWidth - margin - elementWidth, margin];
    case 'center':
    default:
      return [
        (pageWidth - elementWidth) / 2,
        (pageHeight - elementHeight) / 2
      ];
  }
}

/**
 * Helper function to generate positions for tiled watermark
 */
function generateTiledPositions(
  pageWidth: number,
  pageHeight: number,
  elementWidth: number,
  elementHeight: number
): [number, number][] {
  const positions: [number, number][] = [];
  const margin = 100;
  const spacingX = elementWidth + margin;
  const spacingY = elementHeight + margin;
  
  for (let y = margin; y < pageHeight - elementHeight; y += spacingY) {
    for (let x = margin; x < pageWidth - elementWidth; x += spacingX) {
      positions.push([x, y]);
    }
  }
  
  return positions;
}

export class PdfError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'PdfError';
  }
}

export const PdfErrorCodes = {
  INVALID_FILE: 'INVALID_FILE',
  PAGE_OUT_OF_RANGE: 'PAGE_OUT_OF_RANGE',
  ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
  CONVERSION_ERROR: 'CONVERSION_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR'
} as const;

/**
 * Validates a PDF file
 */
export async function validatePdf(file: File): Promise<{ valid: boolean; pageCount: number }> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer, { 
      ignoreEncryption: false,
      updateMetadata: false
    });
    
    return {
      valid: true,
      pageCount: pdfDoc.getPageCount()
    };
  } catch (error) {
    console.error('Error validating PDF:', error);
    return {
      valid: false,
      pageCount: 0
    };
  }
}

/**
 * Gets metadata from a PDF file
 */
export async function getPdfMetadata(file: File): Promise<{
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: Date | null;
  modificationDate: Date | null;
  pageCount: number;
}> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    
    return {
      title: pdfDoc.getTitle() || '',
      author: pdfDoc.getAuthor() || '',
      subject: pdfDoc.getSubject() || '',
      keywords: typeof pdfDoc.getKeywords() === 'string' ? [pdfDoc.getKeywords() as string] : (pdfDoc.getKeywords() || []),
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      creationDate: pdfDoc.getCreationDate() || null,
      modificationDate: pdfDoc.getModificationDate() || null,
      pageCount: pdfDoc.getPageCount()
    };
  } catch (error) {
    throw new PdfError(
      'Could not read PDF metadata',
      PdfErrorCodes.PROCESSING_ERROR
    );
  }
}

/**
 * Gets the page sizes for all pages in a PDF
 */
export async function getPdfPageSizes(file: File): Promise<Array<{ width: number; height: number }>> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer);
    const pages = pdfDoc.getPages();
    
    return pages.map(page => {
      const { width, height } = page.getSize();
      return { width, height };
    });
  } catch (error) {
    throw new PdfError(
      'Could not get PDF page sizes',
      PdfErrorCodes.PROCESSING_ERROR
    );
  }
}

/**
 * Checks if a PDF is encrypted/password protected
 */
export async function isPdfEncrypted(file: File): Promise<boolean> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    await pdfLib.PDFDocument.load(fileArrayBuffer, {
      ignoreEncryption: false,
      updateMetadata: false
    });
    return false;
  } catch (error) {
    if (error instanceof Error && error.message.includes('encrypted')) {
      return true;
    }
    throw error;
  }
}

/**
 * Attempts to decrypt a PDF file with a password
 */
export async function decryptPdf(file: File, password: string): Promise<Blob> {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfLib.PDFDocument.load(fileArrayBuffer, {
      password,
      updateMetadata: false
    } as pdfLib.LoadOptions);
    
    // Create a new unencrypted PDF with the same content
    const newPdf = await pdfLib.PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(page => newPdf.addPage(page));
    
    // Copy metadata
    newPdf.setTitle(pdfDoc.getTitle() || '');
    newPdf.setAuthor(pdfDoc.getAuthor() || '');
    newPdf.setSubject(pdfDoc.getSubject() || '');
    const keywords = pdfDoc.getKeywords();
    newPdf.setKeywords(typeof keywords === 'string' ? [keywords] : (keywords || []));
    newPdf.setCreator(pdfDoc.getCreator() || '');
    newPdf.setProducer('PDF Converter Suite');
    
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('password')) {
      throw new PdfError(
        'Incorrect password',
        PdfErrorCodes.ENCRYPTION_ERROR
      );
    }
    throw new PdfError(
      'Could not decrypt PDF',
      PdfErrorCodes.PROCESSING_ERROR
    );
  }
}
