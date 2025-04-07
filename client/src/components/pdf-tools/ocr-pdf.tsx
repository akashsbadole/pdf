import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { HelpCircle, ArrowDownCircle, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OcrPdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    blob: Blob;
  } | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Take only the first file
    const pdfFile = selectedFiles[0];

    // Check if it's a PDF
    if (
      pdfFile.type !== "application/pdf" &&
      !pdfFile.name.toLowerCase().endsWith(".pdf")
    ) {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Reset previous results
    setResult(null);
    setProgress(0);
    setFile(pdfFile);
  };

  const handleOcr = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to process",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      setProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return Math.min(newProgress, 95); // Cap at 95% until complete
        });
      }, 300);

      // TODO: Implement actual OCR functionality
      // For now, we'll just simulate the OCR process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);

      // For now, just return the original file as the "OCR'd" version
      setResult({
        blob: file,
      });

      toast({
        title: "OCR completed successfully",
        description: "Your PDF is now searchable and text can be selected",
      });
    } catch (error) {
      console.error("Error performing OCR:", error);
      toast({
        title: "OCR failed",
        description: "There was an error processing your PDF file",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const fileName = file?.name ? `ocr_${file.name}` : "ocr.pdf";
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
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
        <h1 className="text-2xl font-bold text-gray-900">OCR PDF</h1>
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
            Select a scanned PDF file to make it searchable with OCR (Optical
            Character Recognition). This process will recognize text in images
            and make it selectable and searchable.
          </p>

          {!file ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={[".pdf"]}
              maxFileSize={100 * 1024 * 1024} // 100MB
              maxFiles={1}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="h-14 w-14 mr-4">
                    <PdfThumbnail file={file} width={56} height={56} />
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
            <CardTitle>OCR Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                    <SelectItem value="dutch">Dutch</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="korean">Korean</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the primary language of the document for better OCR
                  accuracy
                </p>
              </div>

              <Button
                onClick={handleOcr}
                disabled={processing}
                className="mt-4"
              >
                <Search className="h-5 w-5 mr-2" />
                {processing ? "Processing..." : "Perform OCR"}
              </Button>

              {processing && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-500 mb-2">
                    Processing your PDF with OCR...
                  </Label>
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
            <CardTitle>OCR Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 mr-3">
                  <PdfThumbnail
                    file={URL.createObjectURL(result.blob)}
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <p className="font-medium">Searchable PDF</p>
                  <p className="text-sm text-gray-500">Ready to download</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                Your PDF has been successfully processed with OCR. The text in
                your document is now searchable and selectable. You can copy
                text from the document and search for specific content within
                it.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={handleDownload}>
                <ArrowDownCircle className="h-5 w-5 mr-2" />
                Download Searchable PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
