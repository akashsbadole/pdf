import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { PdfThumbnail } from '@/components/ui/pdf-thumbnail';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { compressPDF } from '@/lib/pdf-utils';
import { HelpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function CompressPdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [customQuality, setCustomQuality] = useState(75);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    reduction: number;
    blob: Blob;
  } | null>(null);

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
    
    // Reset previous results
    setResult(null);
    setProgress(0);
    setFile(pdfFile);
  };
  
  const getQualityFromCompressionLevel = () => {
    switch (compressionLevel) {
      case 'low': return 90;
      case 'medium': return 75;
      case 'high': return 50;
      case 'extreme': return 30;
      case 'custom': return customQuality;
      default: return 75;
    }
  };
  
  const handleCompress = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return Math.min(newProgress, 95); // Cap at 95% until complete
        });
      }, 300);
      
      const quality = getQualityFromCompressionLevel();
      const compressedPdf = await compressPDF(file, { quality });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const originalSize = file.size;
      const compressedSize = compressedPdf.size;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;
      
      setResult({
        originalSize,
        compressedSize,
        reduction,
        blob: compressedPdf
      });
      
      toast({
        title: "PDF compressed successfully",
        description: `Reduced by ${reduction.toFixed(2)}%`,
      });
      
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast({
        title: "Compression failed",
        description: "There was an error compressing your PDF file",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    
    const fileName = file?.name ? `compressed_${file.name}` : 'compressed.pdf';
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compress PDF</h1>
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
            Select a PDF file to compress. We'll optimize the file size while maintaining quality.
          </p>
          
          {!file ? (
            <FileUploader 
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={['.pdf']}
              maxFileSize={100 * 1024 * 1024} // 100MB
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
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setProgress(0);
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
            <CardTitle>Compression Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  Compression Level
                </Label>
                <Select 
                  value={compressionLevel} 
                  onValueChange={setCompressionLevel}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select compression level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (better quality, larger size)</SelectItem>
                    <SelectItem value="medium">Medium (recommended)</SelectItem>
                    <SelectItem value="high">High (smaller size, lower quality)</SelectItem>
                    <SelectItem value="extreme">Extreme (smallest possible size)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {compressionLevel === 'custom' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Quality: {customQuality}%</Label>
                  </div>
                  <Slider
                    value={[customQuality]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(values) => setCustomQuality(values[0])}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower quality = smaller file size
                  </p>
                </div>
              )}
              
              <Button 
                onClick={handleCompress} 
                disabled={processing}
                className="mt-4"
              >
                <ArrowDownCircle className="h-5 w-5 mr-2" />
                {processing ? 'Compressing...' : 'Compress PDF'}
              </Button>
              
              {processing && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-500 mb-2">Compressing your PDF...</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Compression Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-lg">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 mr-3">
                    <PdfThumbnail 
                      file={file!} 
                      width={40} 
                      height={40} 
                    />
                  </div>
                  <div>
                    <p className="font-medium">Original Size</p>
                    <p className="text-lg font-bold">{formatFileSize(result.originalSize)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <p className="text-sm text-gray-500 mb-1">Reduced by</p>
                <p className="text-xl font-bold text-green-600">{result.reduction.toFixed(1)}%</p>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 mr-3">
                  <PdfThumbnail 
                    file={URL.createObjectURL(result.blob)} 
                    width={40} 
                    height={40} 
                  />
                </div>
                <div>
                  <p className="font-medium">Compressed Size</p>
                  <p className="text-lg font-bold">{formatFileSize(result.compressedSize)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={handleDownload}>
                <ArrowDownCircle className="h-5 w-5 mr-2" />
                Download Compressed PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
