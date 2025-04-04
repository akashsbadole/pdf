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
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PdfThumbnail } from '@/components/ui/pdf-thumbnail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, Download, FileType } from 'lucide-react';

interface ConversionToolProps {
  title: string;
  description: string;
  sourceFormat: string;
  targetFormat: string;
  acceptedFileTypes: string[];
  icon: React.ReactNode;
  conversionFunction?: (file: File, options: any) => Promise<Blob>;
}

export function PdfConversionTemplate({
  title,
  description,
  sourceFormat,
  targetFormat,
  acceptedFileTypes,
  icon,
  conversionFunction
}: ConversionToolProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [outputFilename, setOutputFilename] = useState(`converted_document.${targetFormat.toLowerCase()}`);
  const [quality, setQuality] = useState('medium');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    
    // Take only the first file
    const selectedFile = selectedFiles[0];
    
    // Check file type compatibility
    const isValidType = acceptedFileTypes.some(type => 
      selectedFile.type.includes(type) || selectedFile.name.toLowerCase().endsWith(`.${type.replace('.', '')}`)
    );
    
    if (!isValidType) {
      toast({
        title: "Invalid file",
        description: `Please select a ${sourceFormat} file`,
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Generate default output filename
    const baseName = selectedFile.name.split('.')[0] || 'converted';
    setOutputFilename(`${baseName}.${targetFormat.toLowerCase()}`);
  };
  
  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: `Please select a ${sourceFormat} file to convert`,
        variant: "destructive"
      });
      return;
    }

    // If we don't have a real conversion function yet
    if (!conversionFunction) {
      toast({
        title: "Coming Soon",
        description: `${title} will be available soon!`,
        variant: "default"
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
      
      // Perform the conversion
      const options = { quality };
      const convertedBlob = await conversionFunction(file, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(convertedBlob);
      
      toast({
        title: "Conversion successful",
        description: `Your ${sourceFormat} has been converted to ${targetFormat}`,
      });
      
    } catch (error) {
      console.error('Error converting file:', error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your file",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (!result) return;
    
    const url = URL.createObjectURL(result);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload {sourceFormat} File</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            {description}
          </p>
          
          {!file ? (
            <FileUploader 
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={acceptedFileTypes.map(type => type.startsWith('.') ? type : `.${type}`)}
              maxFileSize={50 * 1024 * 1024} // 50MB
              maxFiles={1}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="h-14 w-14 mr-4 flex items-center justify-center">
                    {sourceFormat.toLowerCase() === 'pdf' ? (
                      <PdfThumbnail 
                        file={file} 
                        width={56} 
                        height={56} 
                      />
                    ) : (
                      <div className="rounded bg-gray-100 w-14 h-14 flex items-center justify-center text-gray-500">
                        {icon}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
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
            <CardTitle>Conversion Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="outputFilename" className="mb-2 block">
                  Output Filename
                </Label>
                <Input 
                  id="outputFilename"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  placeholder={`converted.${targetFormat.toLowerCase()}`}
                  className="max-w-xs"
                />
              </div>
              
              <div>
                <Label className="mb-2 block">
                  Quality
                </Label>
                <Select 
                  value={quality} 
                  onValueChange={setQuality}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (fastest conversion)</SelectItem>
                    <SelectItem value="medium">Medium (recommended)</SelectItem>
                    <SelectItem value="high">High (best quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleConvert} 
                disabled={processing}
                className="mt-4"
              >
                {icon}
                {processing ? 'Converting...' : `Convert to ${targetFormat}`}
              </Button>
              
              {processing && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-500 mb-2">Converting your file...</Label>
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
            <CardTitle>Conversion Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 bg-gray-50 rounded-lg mb-6">
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-green-100 rounded-full">
                <FileType className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Conversion Complete!</h3>
              <p className="text-gray-500">
                Your {sourceFormat} file has been successfully converted to {targetFormat}.
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleDownload}>
                <Download className="h-5 w-5 mr-2" />
                Download {targetFormat} File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}