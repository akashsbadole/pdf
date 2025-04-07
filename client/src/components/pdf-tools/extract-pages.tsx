import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Scissors } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getTotalPages } from "@/lib/pdf-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ExtractionMethod = "range" | "list" | "interval";

export function ExtractPagesTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [extractionMethod, setExtractionMethod] =
    useState<ExtractionMethod>("range");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [pageList, setPageList] = useState("");
  const [interval, setInterval] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [combineIntoOne, setCombineIntoOne] = useState(true);

  const handleFileSelected = async (selectedFiles: File[]) => {
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

    try {
      const pages = await getTotalPages(pdfFile);
      setTotalPages(pages);
      setFile(pdfFile);
    } catch (error) {
      console.error("Error reading PDF:", error);
      toast({
        title: "Error reading file",
        description: "Could not read the PDF file",
        variant: "destructive",
      });
    }
  };

  const validatePageNumbers = (input: string): boolean => {
    if (!input.trim()) return false;

    const pageNumbers = input
      .split(",")
      .map((part) => {
        const range = part.trim().split("-");
        return range.map((num) => parseInt(num.trim()));
      })
      .flat();

    return pageNumbers.every(
      (num) => !isNaN(num) && num > 0 && num <= totalPages
    );
  };

  const handleExtract = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    let isValid = true;
    let errorMessage = "";

    switch (extractionMethod) {
      case "range":
        const start = parseInt(startPage);
        const end = parseInt(endPage);
        if (
          isNaN(start) ||
          isNaN(end) ||
          start < 1 ||
          end > totalPages ||
          start > end
        ) {
          isValid = false;
          errorMessage = "Invalid page range";
        }
        break;
      case "list":
        if (!validatePageNumbers(pageList)) {
          isValid = false;
          errorMessage = "Invalid page numbers";
        }
        break;
      case "interval":
        const intervalNum = parseInt(interval);
        if (isNaN(intervalNum) || intervalNum < 1) {
          isValid = false;
          errorMessage = "Invalid interval";
        }
        break;
    }

    if (!isValid) {
      toast({
        title: "Validation error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Create download link
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = combineIntoOne
        ? file.name.replace(".pdf", "_extracted.pdf")
        : file.name.replace(".pdf", "_extracted.zip");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Pages extracted successfully",
        description: "Your PDF pages have been extracted",
      });
    } catch (error) {
      console.error("Error extracting pages:", error);
      toast({
        title: "Extraction failed",
        description:
          error instanceof Error ? error.message : "Could not extract pages",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Extract Pages</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Select a PDF file to extract pages from.
            </p>

            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                acceptedFileTypes={[".pdf"]}
                maxFileSize={50 * 1024 * 1024} // 50MB
                maxFiles={1}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="h-14 w-14 mr-4">
                      <PdfThumbnail file={file} width={56} height={56} />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {totalPages} pages
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setTotalPages(0);
                    }}
                  >
                    Change
                  </Button>
                </div>

                <RadioGroup
                  value={extractionMethod}
                  onValueChange={(value) =>
                    setExtractionMethod(value as ExtractionMethod)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="range" />
                    <Label htmlFor="range">Extract page range</Label>
                  </div>

                  {extractionMethod === "range" && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startPage">Start Page</Label>
                        <Input
                          id="startPage"
                          type="number"
                          min="1"
                          max={totalPages}
                          value={startPage}
                          onChange={(e) => setStartPage(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endPage">End Page</Label>
                        <Input
                          id="endPage"
                          type="number"
                          min="1"
                          max={totalPages}
                          value={endPage}
                          onChange={(e) => setEndPage(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="list" id="list" />
                    <Label htmlFor="list">Extract specific pages</Label>
                  </div>

                  {extractionMethod === "list" && (
                    <div className="ml-6">
                      <Label htmlFor="pageList">
                        Page numbers (e.g., 1,3,5-7)
                      </Label>
                      <Input
                        id="pageList"
                        value={pageList}
                        onChange={(e) => setPageList(e.target.value)}
                        placeholder="1,3,5-7"
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Use commas to separate pages and hyphens for ranges
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interval" id="interval" />
                    <Label htmlFor="interval">Extract pages at interval</Label>
                  </div>

                  {extractionMethod === "interval" && (
                    <div className="ml-6">
                      <Label htmlFor="intervalInput">
                        Extract every nth page
                      </Label>
                      <Input
                        id="intervalInput"
                        type="number"
                        min="1"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="w-32 mt-1"
                      />
                      {interval && !isNaN(parseInt(interval)) && (
                        <p className="text-sm text-gray-500 mt-1">
                          Will extract pages{" "}
                          {Array.from(
                            {
                              length: Math.ceil(
                                totalPages / parseInt(interval)
                              ),
                            },
                            (_, i) => i * parseInt(interval) + 1
                          ).join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </RadioGroup>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="combineIntoOne"
                    checked={combineIntoOne}
                    onCheckedChange={setCombineIntoOne}
                  />
                  <Label htmlFor="combineIntoOne">
                    Combine extracted pages into one PDF
                  </Label>
                </div>

                <Button
                  onClick={handleExtract}
                  disabled={processing}
                  className="w-full"
                >
                  <Scissors className="h-5 w-5 mr-2" />
                  {processing ? "Extracting Pages..." : "Extract Pages"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
