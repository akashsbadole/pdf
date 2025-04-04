import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FileList } from '@/components/shared/file-list';
import { mergePDFs } from '@/lib/pdf-utils';
import { HelpCircle, Download, PlusCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function MergePdfTool() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [outputFilename, setOutputFilename] = useState('Merged_Files.pdf');
  const [pageSize, setPageSize] = useState('auto');
  const [orientation, setOrientation] = useState('auto');
  const [keepMetadata, setKeepMetadata] = useState(true);
  const [compression, setCompression] = useState('standard');
  const [processing, setProcessing] = useState(false);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    // Filter out non-PDF files
    const pdfFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only PDF files are allowed for merging",
        variant: "destructive"
      });
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
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

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "You need at least 2 PDF files to merge",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      
      // Create a new PDF job in the database
      await apiRequest('POST', '/api/jobs', {
        jobName: outputFilename,
        jobType: 'merge',
        inputFileNames: files.map(f => f.name),
        outputFileName: outputFilename,
        status: 'processing',
        createdAt: new Date().toISOString(),
      });

      // Merge the PDFs client-side
      const mergedPdfBlob = await mergePDFs(files, {
        pageSize,
        orientation,
        keepMetadata,
        compression
      });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(mergedPdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Update the job status
      // In a real app we would update the specific job with its ID
      
      toast({
        title: "PDFs merged successfully",
        description: `Your files have been merged into ${outputFilename}`,
      });
      
      // For demo purposes, add to recent jobs
      setRecentJobs([
        {
          id: Date.now(),
          fileName: outputFilename,
          type: 'Merged PDF',
          date: new Date().toLocaleString(),
          size: `${(mergedPdfBlob.size / (1024 * 1024)).toFixed(1)} MB`
        },
        ...recentJobs.slice(0, 4)
      ]);
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast({
        title: "Merge failed",
        description: "There was an error merging your PDF files",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merge PDF</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
          <Button size="sm">
            <Download className="h-5 w-5 mr-2" />
            Save All PDFs
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload PDF Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Select multiple PDF files to merge them into a single PDF document.
          </p>
          
          <FileUploader 
            onFilesSelected={handleFilesSelected}
            acceptedFileTypes={['.pdf']}
            maxFileSize={50 * 1024 * 1024} // 50MB
          />

          {files.length > 0 && (
            <div className="mt-6">
              <FileList 
                files={files}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
                onMoveFile={handleMoveFile}
                allowReordering
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
                      placeholder="merged_document.pdf"
                      className="max-w-xs"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleMerge} 
                    disabled={files.length < 2 || processing}
                    className="mt-2 md:mt-0"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    {processing ? 'Processing...' : 'Merge PDFs'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Merge Options</CardTitle>
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
                  <SelectItem value="auto">Auto (use first PDF size)</SelectItem>
                  <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="letter">US Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="legal">US Legal (8.5 × 14 in)</SelectItem>
                  <SelectItem value="custom">Custom size</SelectItem>
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
                  <RadioGroupItem value="auto" id="orientation-auto" />
                  <Label htmlFor="orientation-auto">Auto</Label>
                </div>
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
              <div className="flex items-center justify-between">
                <Label>PDF Security</Label>
                <span className="text-xs text-gray-500">Pro feature</span>
              </div>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Add password protection to your merged PDF file.</p>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <Checkbox id="security" disabled />
                <Label htmlFor="security" className="text-gray-500">
                  Add password protection
                </Label>
              </div>
            </div>
            
            <div>
              <Label>Metadata Options</Label>
              <div className="mt-3 flex items-center space-x-2">
                <Checkbox 
                  id="metadata" 
                  checked={keepMetadata}
                  onCheckedChange={(checked) => setKeepMetadata(checked as boolean)}
                />
                <Label htmlFor="metadata">
                  Keep original metadata from first PDF
                </Label>
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">
                Compression
              </Label>
              <Select 
                value={compression} 
                onValueChange={setCompression}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select compression level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard compression</SelectItem>
                  <SelectItem value="low">Low compression (higher quality)</SelectItem>
                  <SelectItem value="high">High compression (smaller file)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">{job.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {job.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-blue-700">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link" className="text-primary">
                View All History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
