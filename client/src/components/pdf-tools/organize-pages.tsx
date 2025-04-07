import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import {
  HelpCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { organizePdfPages } from "@/lib/pdf-utils";

export function OrganizePagesTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [outputFilename, setOutputFilename] = useState("");
  const [processing, setProcessing] = useState(false);

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

    // Initialize page order
    const initialOrder = Array.from(
      { length: fakeTotalPages },
      (_, i) => i + 1
    );
    setPageOrder(initialOrder);

    // Set default output filename
    if (pdfFile.name.toLowerCase().endsWith(".pdf")) {
      const baseName = pdfFile.name.slice(0, -4);
      setOutputFilename(`${baseName}_reordered.pdf`);
    }
  };

  const handleMovePage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === pageOrder.length - 1)
    ) {
      return;
    }

    const newOrder = [...pageOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setPageOrder(newOrder);
  };

  const handleOrganizePages = async () => {
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

      const organizedPdf = await organizePdfPages(file, pageOrder);

      // Create download link
      const url = URL.createObjectURL(organizedPdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Pages reorganized successfully",
        description: "Your PDF has been reorganized",
      });
    } catch (error) {
      console.error("Error organizing pages:", error);
      toast({
        title: "Operation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to reorganize PDF pages",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organize PDF Pages</h1>
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
            Select a PDF file to reorganize its pages.
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
                    setPageOrder([]);
                  }}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Page Order</Label>
                  <div className="mt-2 space-y-2">
                    {pageOrder.map((pageNum, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 border rounded"
                      >
                        <div className="flex-1">Page {pageNum}</div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMovePage(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMovePage(index, "down")}
                            disabled={index === pageOrder.length - 1}
                          >
                            <ArrowDownCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="outputFilename">Output Filename</Label>
                  <Input
                    id="outputFilename"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="reordered.pdf"
                    className="max-w-xs mt-1"
                  />
                </div>

                <Button onClick={handleOrganizePages} disabled={processing}>
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  {processing ? "Processing..." : "Reorganize Pages"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
