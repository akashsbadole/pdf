import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PdfThumbnail } from '@/components/ui/pdf-thumbnail';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { convertPdfToImages } from '@/lib/pdf-utils';
import { HelpCircle, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PdfToJpgTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('1-3');
  const [imageFormat, setImageFormat] = useState('jpg');
  const [quality, setQuality] = useState(80);
  const [dpi, setDpi] = useState(150);
  const [outputPrefix, setOutputPrefix] = useState('page_');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<Blob[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    
    // Take only the first file
    const pdfFile = selectedFiles[0];
    
    // Check if it's a PDF
    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }
    
    setFile(pdfFile);
    
    // Get PDF info - In a real app, we would extract the actual page count
    // For now, just simulate with a random number between 5-20
    const fakeTotalPages = Math.floor(Math.random() * 15) + 5;
    setTotalPages(fakeTotalPages);
  };

  const getPagesToConvert = (): number[] => {
    if (pageRange === 'all') {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (pageRange === 'custom') {
      try {
        const pages: number[] = [];
        
        customRange.split(',').forEach(part => {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(p => parseInt(p.trim()));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= end; i++) {
                if (i > 0 && i <= totalPages && !pages.includes(i)) {
                  pages.push(i);
                }
              }
            }
          } else {
            const page = parseInt(part.trim());
            if (!isNaN(page) && page > 0 && page <= totalPages && !pages.includes(page)) {
              pages.push(page);
            }
          }
        });
        
        return pages.sort((a, b) => a - b);
      } catch (error) {
        return [1];
      }
    }
    
    return [1]; // Fallback
  };
  
  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert",
        variant: "destructive"
      });
      return;
    }

    const pagesToConvert = getPagesToConvert();
    if (pagesToConvert.length === 0) {
      toast({
        title: "Invalid page range",
        description: "Please specify valid page numbers to convert",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);
      setConvertedImages([]);
      
      const conversionOptions = {
        format: imageFormat as 'jpg' | 'png',
        quality: quality / 100,
        dpi
      };
      
      const images = await convertPdfToImages(
        file, 
        pagesToConvert, 
        conversionOptions,
        (currentPage, totalPages) => {
          const progressPercent = (currentPage / totalPages) * 100;
          setProgress(progressPercent);
        }
      );
      
      setConvertedImages(images);
      
      // If images array is empty, throw an error
      if (images.length === 0) {
        throw new Error('Failed to extract images from PDF');
      }
      
      toast({
        title: "PDF converted successfully",
        description: `Extracted ${images.length} images from your PDF`,
      });
      
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "There was an error converting your PDF to images",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const downloadImage = (image: Blob, index: number) => {
    const url = URL.createObjectURL(image);
    const a = document.createElement('a');
    const ext = imageFormat.toLowerCase();
    a.href = url;
    a.download = `${outputPrefix}${index + 1}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadAllImages = () => {
    // In a real app, we'd create a zip file
    // For now, download each image individually with a small delay
    convertedImages.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image, index);
      }, index * 300);
    });
    
    toast({
      title: "Downloading images",
      description: `${convertedImages.length} images will be downloaded`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">PDF to JPG</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload PDF File</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Select a PDF file to convert its pages to image files.
          </p>
          
          {!file ? (
            <FileUploader 
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={['.pdf']}
              maxFileSize={50 * 1024 * 1024} // 50MB
              maxFiles={1}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="h-14 w-14 mr-4">
                    <PdfThumbnail 
                      file={file} 
                      width={56} 
                      height={56} 
                    />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {totalPages} pages
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setFile(null);
                    setTotalPages(0);
                    setConvertedImages([]);
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {file && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversion Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  Pages to Convert
                </Label>
                <RadioGroup 
                  value={pageRange} 
                  onValueChange={setPageRange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="page-all" />
                    <Label htmlFor="page-all">All pages ({totalPages} pages)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="page-custom" />
                    <Label htmlFor="page-custom">Custom range</Label>
                  </div>
                </RadioGroup>
                
                {pageRange === 'custom' && (
                  <div className="mt-2 pl-6">
                    <Input 
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      placeholder="e.g., 1-3,5,7-9"
                      className="max-w-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter page numbers and/or ranges separated by commas
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="mb-2 block">
                  Image Format
                </Label>
                <Select 
                  value={imageFormat} 
                  onValueChange={setImageFormat}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select image format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPG (smaller file size)</SelectItem>
                    <SelectItem value="png">PNG (better quality, larger size)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Quality: {quality}%</Label>
                </div>
                <Slider
                  value={[quality]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={(values) => setQuality(values[0])}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher quality = larger file size
                </p>
              </div>
              
              <div>
                <Label className="mb-2 block">
                  DPI (Resolution)
                </Label>
                <Select 
                  value={dpi.toString()} 
                  onValueChange={(value) => setDpi(parseInt(value))}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="72">72 DPI (screen resolution)</SelectItem>
                    <SelectItem value="150">150 DPI (document quality)</SelectItem>
                    <SelectItem value="300">300 DPI (print quality)</SelectItem>
                    <SelectItem value="600">600 DPI (high quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="outputPrefix" className="mb-2 block">
                  Output Filename Prefix
                </Label>
                <Input 
                  id="outputPrefix"
                  value={outputPrefix}
                  onChange={(e) => setOutputPrefix(e.target.value)}
                  placeholder="page_"
                  className="max-w-xs"
                />
              </div>
              
              <Button 
                onClick={handleConvert} 
                disabled={processing}
              >
                <Image className="h-5 w-5 mr-2" />
                {processing ? 'Converting...' : 'Convert to Images'}
              </Button>
              
              {processing && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-500 mb-2">Converting page {Math.ceil(progress / 100 * getPagesToConvert().length)} of {getPagesToConvert().length}</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {convertedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Converted Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={downloadAllImages}>
                Download All Images
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {convertedImages.map((image, index) => (
                <div key={index} className="border rounded-md p-2 text-center">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Page ${index + 1}`} 
                    className="w-full aspect-[3/4] object-contain mb-2"
                  />
                  <p className="text-sm">Page {index + 1}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => downloadImage(image, index)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
