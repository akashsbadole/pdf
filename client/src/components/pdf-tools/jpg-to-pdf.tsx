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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FileList } from '@/components/shared/file-list';
import { convertImagesToPdf } from '@/lib/pdf-utils';
import { HelpCircle, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function JpgToPdfTool() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [outputFilename, setOutputFilename] = useState('converted_document.pdf');
  const [fitToPage, setFitToPage] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    // Filter to only image files
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed",
        variant: "destructive"
      });
    }
    
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === files.length - 1)
    ) {
      return;
    }
    
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image file",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      
      const pdfBlob = await convertImagesToPdf(files, {
        pageSize,
        orientation,
        fitToPage
      });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Images converted successfully",
        description: `Your images have been converted to ${outputFilename}`,
      });
      
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your images to PDF",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">JPG to PDF</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Image Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Select image files (JPG, PNG, etc.) to convert them into a single PDF document.
          </p>
          
          <FileUploader 
            onFilesSelected={handleFilesSelected}
            acceptedFileTypes={['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']}
            maxFileSize={20 * 1024 * 1024} // 20MB
            label="Drag & drop your images here"
          />

          {files.length > 0 && (
            <div className="mt-6">
              <FileList 
                files={files}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
                onMoveFile={handleMoveFile}
                allowReordering
                showThumbnails
              />
              
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="w-full md:w-auto">
                    <Label htmlFor="filename" className="mb-1 block">
                      Output filename
                    </Label>
                    <Input 
                      id="filename" 
                      value={outputFilename}
                      onChange={(e) => setOutputFilename(e.target.value)}
                      placeholder="converted_document.pdf"
                      className="max-w-xs"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleConvert} 
                    disabled={files.length === 0 || processing}
                    className="mt-2 md:mt-0"
                  >
                    <FileType className="h-5 w-5 mr-2" />
                    {processing ? 'Converting...' : 'Convert to PDF'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conversion Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">
                Page Size
              </Label>
              <Select 
                value={pageSize} 
                onValueChange={setPageSize}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="letter">US Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="legal">US Legal (8.5 × 14 in)</SelectItem>
                  <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                  <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="mb-2 block">
                Orientation
              </Label>
              <RadioGroup 
                value={orientation} 
                onValueChange={setOrientation}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="orientation-portrait" />
                  <Label htmlFor="orientation-portrait">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="orientation-landscape" />
                  <Label htmlFor="orientation-landscape">Landscape</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="fit-to-page"
                  checked={fitToPage}
                  onCheckedChange={setFitToPage}
                />
                <Label htmlFor="fit-to-page">
                  Fit images to page
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-14">
                When enabled, images will be resized to fit the page while maintaining aspect ratio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
