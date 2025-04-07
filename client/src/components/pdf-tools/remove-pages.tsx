import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { HelpCircle, XSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { removePagesFromPdf } from "@/lib/pdf-utils";

export function RemovePagesTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pagesToRemove, setPagesToRemove] = useState("");
  const [outputFilename, setOutputFilename] = useState("");
  const [processing, setProcessing] = useState(false);
  const [previewPages, setPreviewPages] = useState<number[]>([]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const pdfFile = selectedFiles[0];
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

    setFile(pdfFile);

    // Get PDF info
    const fakeTotalPages = Math.floor(Math.random() * 15) + 5;
    setTotalPages(fakeTotalPages);
    setPreviewPages([1, 2, 3].filter((p) => p <= fakeTotalPages));

    // Set default output filename
    if (pdfFile.name.toLowerCase().endsWith(".pdf")) {
      const baseName = pdfFile.name.slice(0, -4);
      setOutputFilename(`${baseName}_reduced.pdf`);
    }
  };

  const handleRemovePages = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Parse pages to remove
      const pages = pagesToRemove
        .split(",")
        .map((page) => {
          const [start, end] = page.trim().split("-").map(Number);
          if (!end) return [start];
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        })
        .flat()
        .filter((page) => page > 0 && page <= totalPages);

      if (pages.length === 0) {
        throw new Error("Please specify valid page numbers to remove");
      }

      const modifiedPdf = await removePagesFromPdf(file, pages);

      // Create download link
      const url = URL.createObjectURL(modifiedPdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Pages removed successfully",
        description: `Removed ${pages.length} page(s) from the PDF`,
      });
    } catch (error) {
      console.error("Error removing pages:", error);
      toast({
        title: "Operation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove pages from PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Remove Pages from PDF
        </h1>
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
            Select a PDF file to remove pages from.
          </p>

          {!file ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={[".pdf"]}
              maxFileSize={50 * 1024 * 1024} // 50MB
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
                    <p className="text-sm text-gray-500">{totalPages} pages</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setTotalPages(0);
                    setPreviewPages([]);
                    setPagesToRemove("");
                  }}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pagesToRemove">Pages to Remove</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Enter page numbers or ranges (e.g., 1,3,5-7)
                  </p>
                  <Input
                    id="pagesToRemove"
                    value={pagesToRemove}
                    onChange={(e) => setPagesToRemove(e.target.value)}
                    placeholder="1,3,5-7"
                    className="max-w-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="outputFilename">Output Filename</Label>
                  <Input
                    id="outputFilename"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="reduced.pdf"
                    className="max-w-xs mt-1"
                  />
                </div>

                <Button onClick={handleRemovePages} disabled={processing}>
                  <XSquare className="h-5 w-5 mr-2" />
                  {processing ? "Processing..." : "Remove Pages"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
