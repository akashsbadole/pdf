import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, Split, FileOutput } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getTotalPages } from "@/lib/pdf-utils";

type SplitMethod = "fixed" | "custom" | "extract";

interface CustomRange {
  start: string;
  end: string;
}

export function SplitPdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("fixed");
  const [pagesPerFile, setPagesPerFile] = useState("1");
  const [customRanges, setCustomRanges] = useState<CustomRange[]>([
    { start: "", end: "" },
  ]);
  const [extractPages, setExtractPages] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const addCustomRange = () => {
    setCustomRanges([...customRanges, { start: "", end: "" }]);
  };

  const removeCustomRange = (index: number) => {
    setCustomRanges(customRanges.filter((_, i) => i !== index));
  };

  const updateCustomRange = (
    index: number,
    field: keyof CustomRange,
    value: string
  ) => {
    const newRanges = [...customRanges];
    newRanges[index][field] = value;
    setCustomRanges(newRanges);
  };

  const handleSplit = async () => {
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

      // Create download link for demonstration
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_split.zip");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF split successfully",
        description: "Your PDF has been split into multiple files",
      });
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast({
        title: "Split failed",
        description:
          error instanceof Error ? error.message : "Could not split PDF",
        variant: "destructive",
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Select a PDF file to split into multiple documents.
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
                  value={splitMethod}
                  onValueChange={(value) =>
                    setSplitMethod(value as SplitMethod)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">
                      Split into fixed-size documents
                    </Label>
                  </div>

                  {splitMethod === "fixed" && (
                    <div className="ml-6">
                      <Label htmlFor="pagesPerFile">Pages per file</Label>
                      <Input
                        id="pagesPerFile"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pagesPerFile}
                        onChange={(e) => setPagesPerFile(e.target.value)}
                        className="w-32 mt-1"
                      />
                      {totalPages > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Will create{" "}
                          {Math.ceil(
                            totalPages / parseInt(pagesPerFile || "1")
                          )}{" "}
                          files
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Split by custom page ranges</Label>
                  </div>

                  {splitMethod === "custom" && (
                    <div className="ml-6 space-y-4">
                      {customRanges.map((range, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <div>
                              <Label htmlFor={`start-${index}`}>
                                Start Page
                              </Label>
                              <Input
                                id={`start-${index}`}
                                type="number"
                                min="1"
                                max={totalPages}
                                value={range.start}
                                onChange={(e) =>
                                  updateCustomRange(
                                    index,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`end-${index}`}>End Page</Label>
                              <Input
                                id={`end-${index}`}
                                type="number"
                                min="1"
                                max={totalPages}
                                value={range.end}
                                onChange={(e) =>
                                  updateCustomRange(
                                    index,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomRange(index)}
                              className="mt-6"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" onClick={addCustomRange}>
                        Add Range
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extract" id="extract" />
                    <Label htmlFor="extract">Extract specific pages</Label>
                  </div>

                  {splitMethod === "extract" && (
                    <div className="ml-6">
                      <Label htmlFor="extractPages">
                        Page numbers (e.g., 1,3,5-7)
                      </Label>
                      <Input
                        id="extractPages"
                        value={extractPages}
                        onChange={(e) => setExtractPages(e.target.value)}
                        placeholder="1,3,5-7"
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Use commas to separate pages and hyphens for ranges
                      </p>
                    </div>
                  )}
                </RadioGroup>

                <Button
                  onClick={handleSplit}
                  disabled={processing}
                  className="w-full"
                >
                  <Split className="h-5 w-5 mr-2" />
                  {processing ? "Splitting PDF..." : "Split PDF"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
