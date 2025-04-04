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
import { PdfThumbnail } from '@/components/ui/pdf-thumbnail';
import { splitPDF } from '@/lib/pdf-utils';
import { HelpCircle, Download, Scissors } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function SplitPdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMethod, setSplitMethod] = useState('range');
  const [pageRanges, setPageRanges] = useState('1-3,4-6');
  const [extractPages, setExtractPages] = useState('1,3,5');
  const [splitAfterPages, setSplitAfterPages] = useState('2');
  const [outputPrefix, setOutputPrefix] = useState('split_');
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
  };
  
  const handleSplit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to split",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      
      let pageNumbers: number[][] = [];
      
      // Parse the page ranges based on the selected split method
      if (splitMethod === 'range') {
        // Parse ranges like "1-3,4-6"
        pageNumbers = pageRanges.split(',').map(range => {
          const [start, end] = range.split('-').map(num => parseInt(num.trim()));
          return end 
            ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
            : [start];
        });
      } else if (splitMethod === 'extract') {
        // Parse individual pages like "1,3,5"
        pageNumbers = extractPages.split(',')
          .map(page => [parseInt(page.trim())])
          .filter(([page]) => !isNaN(page) && page > 0 && page <= totalPages);
      } else if (splitMethod === 'every') {
        // Split after every N pages
        const n = parseInt(splitAfterPages);
        if (!isNaN(n) && n > 0) {
          pageNumbers = Array.from(
            { length: Math.ceil(totalPages / n) },
            (_, i) => Array.from(
              { length: Math.min(n, totalPages - i * n) },
              (_, j) => i * n + j + 1
            )
          );
        }
      }
      
      if (pageNumbers.length === 0) {
        throw new Error('Invalid page selection');
      }

      // Split the PDF
      const splitPdfs = await splitPDF(file, pageNumbers);
      
      // Create zip file or download multiple PDFs
      for (let i = 0; i < splitPdfs.length; i++) {
        const fileName = `${outputPrefix}${i + 1}.pdf`;
        const url = URL.createObjectURL(splitPdfs[i]);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast({
        title: "PDF split successfully",
        description: `Your file has been split into ${splitPdfs.length} PDF files`,
      });
      
    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast({
        title: "Split failed",
        description: error instanceof Error ? error.message : "There was an error splitting your PDF file",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Split PDF</h1>
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
            Select a PDF file that you want to split into multiple PDF documents.
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
            <CardTitle>Split Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={splitMethod} onValueChange={setSplitMethod}>
              <TabsList className="mb-4">
                <TabsTrigger value="range">Split by ranges</TabsTrigger>
                <TabsTrigger value="extract">Extract pages</TabsTrigger>
                <TabsTrigger value="every">Split every N pages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="range" className="space-y-4">
                <div>
                  <Label htmlFor="pageRanges">Page Ranges</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Enter page ranges separated by commas (e.g., 1-3,4-6)
                  </p>
                  <Input 
                    id="pageRanges"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    placeholder="1-3,4-6"
                    className="max-w-xs"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="extract" className="space-y-4">
                <div>
                  <Label htmlFor="extractPages">Pages to Extract</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Enter page numbers separated by commas (e.g., 1,3,5)
                  </p>
                  <Input 
                    id="extractPages"
                    value={extractPages}
                    onChange={(e) => setExtractPages(e.target.value)}
                    placeholder="1,3,5"
                    className="max-w-xs"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="every" className="space-y-4">
                <div>
                  <Label htmlFor="splitAfterPages">Split after every</Label>
                  <div className="flex items-center mt-2">
                    <Input 
                      id="splitAfterPages"
                      value={splitAfterPages}
                      onChange={(e) => setSplitAfterPages(e.target.value)}
                      type="number"
                      min="1"
                      max={totalPages}
                      className="max-w-[100px] mr-2"
                    />
                    <span className="text-sm">page(s)</span>
                  </div>
                </div>
              </TabsContent>
              
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="outputPrefix">Output Filename Prefix</Label>
                  <Input 
                    id="outputPrefix"
                    value={outputPrefix}
                    onChange={(e) => setOutputPrefix(e.target.value)}
                    placeholder="split_"
                    className="max-w-xs mt-1"
                  />
                </div>
                
                <Button 
                  onClick={handleSplit} 
                  disabled={processing}
                  className="mt-4"
                >
                  <Scissors className="h-5 w-5 mr-2" />
                  {processing ? 'Processing...' : 'Split PDF'}
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
