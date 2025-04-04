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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RotateCw, RotateCcw, HelpCircle, RotateCw as RotateIcon } from 'lucide-react';
import { rotatePDF } from '@/lib/pdf-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RotatePdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [rotationAngle, setRotationAngle] = useState('90');
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('1-3');
  const [outputFilename, setOutputFilename] = useState('rotated.pdf');
  const [processing, setProcessing] = useState(false);
  const [previewPages, setPreviewPages] = useState<number[]>([]);

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
    
    // Set preview pages (first 3 pages)
    setPreviewPages([1, 2, 3].filter(p => p <= fakeTotalPages));
    
    // Set default output filename
    if (pdfFile.name.toLowerCase().endsWith('.pdf')) {
      const baseName = pdfFile.name.slice(0, -4);
      setOutputFilename(`${baseName}_rotated.pdf`);
    }
  };

  const getPagesToRotate = (): number[] => {
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
  
  const handleRotate = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to rotate",
        variant: "destructive"
      });
      return;
    }

    const pagesToRotate = getPagesToRotate();
    if (pagesToRotate.length === 0) {
      toast({
        title: "Invalid page range",
        description: "Please specify valid page numbers to rotate",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      
      const angle = parseInt(rotationAngle);
      const rotatedPdf = await rotatePDF(file, pagesToRotate, angle);
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(rotatedPdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF rotated successfully",
        description: `${pagesToRotate.length} pages rotated by ${angle} degrees`,
      });
      
    } catch (error) {
      console.error('Error rotating PDF:', error);
      toast({
        title: "Rotation failed",
        description: "There was an error rotating your PDF file",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rotate PDF</h1>
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
            Select a PDF file to rotate its pages.
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
                    setPreviewPages([]);
                  }}
                >
                  Change
                </Button>
              </div>
              
              {previewPages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Preview:</h3>
                  <div className="flex flex-wrap gap-4">
                    {previewPages.map((pageNum) => (
                      <div key={pageNum} className="text-center">
                        <PdfThumbnail 
                          file={file} 
                          pageNumber={pageNum}
                          width={100} 
                          height={140} 
                          className="border border-gray-200"
                        />
                        <p className="text-xs mt-1">Page {pageNum}</p>
                      </div>
                    ))}
                    {totalPages > previewPages.length && (
                      <div className="flex items-center justify-center h-[140px] w-[100px] bg-gray-100 rounded-md">
                        <p className="text-sm text-gray-500">+{totalPages - previewPages.length} more</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {file && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rotation Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  Rotation Angle
                </Label>
                <div className="flex space-x-4">
                  <Button 
                    variant={rotationAngle === '90' ? "default" : "outline"} 
                    onClick={() => setRotationAngle('90')}
                    className="h-20 w-20 flex-col"
                  >
                    <RotateCw className="h-8 w-8 mb-1" />
                    <span>90°</span>
                  </Button>
                  <Button 
                    variant={rotationAngle === '180' ? "default" : "outline"} 
                    onClick={() => setRotationAngle('180')}
                    className="h-20 w-20 flex-col"
                  >
                    <div className="relative">
                      <RotateCw className="h-8 w-8" />
                      <RotateCw className="h-8 w-8 absolute top-0 left-0 opacity-50" />
                    </div>
                    <span className="mt-1">180°</span>
                  </Button>
                  <Button 
                    variant={rotationAngle === '270' ? "default" : "outline"} 
                    onClick={() => setRotationAngle('270')}
                    className="h-20 w-20 flex-col"
                  >
                    <RotateCcw className="h-8 w-8 mb-1" />
                    <span>270°</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">
                  Pages to Rotate
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
                <Label htmlFor="outputFilename" className="mb-2 block">
                  Output Filename
                </Label>
                <Input 
                  id="outputFilename"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  placeholder="rotated.pdf"
                  className="max-w-xs"
                />
              </div>
              
              <Button 
                onClick={handleRotate} 
                disabled={processing}
              >
                <RotateIcon className="h-5 w-5 mr-2" />
                {processing ? 'Rotating...' : 'Rotate PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
