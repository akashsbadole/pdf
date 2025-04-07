import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, HelpCircle } from "lucide-react";
// import { getTotalPages } from "@/lib/pdf-utils";
import { getDocument } from "pdfjs-dist";

export async function getTotalPages(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument(arrayBuffer).promise;
  return pdf.numPages;
}

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
type NumberFormat = "arabic" | "roman" | "letters";

export function AddPageNumbersTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [format, setFormat] = useState<NumberFormat>("arabic");
  const [startNumber, setStartNumber] = useState("1");
  const [fontSize, setFontSize] = useState("12");
  const [margin, setMargin] = useState("20");
  const [processing, setProcessing] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

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

  const handleAddNumbers = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    const startNum = parseInt(startNumber);
    if (isNaN(startNum) || startNum < 1) {
      toast({
        title: "Invalid start number",
        description: "Start number must be a positive integer",
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
      a.download = file.name.replace(".pdf", "_numbered.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Page numbers added successfully",
        description: "Your PDF has been updated with page numbers",
      });
    } catch (error) {
      console.error("Error adding page numbers:", error);
      toast({
        title: "Failed to add page numbers",
        description:
          error instanceof Error ? error.message : "Could not add page numbers",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Page Numbers</h1>
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
              Select a PDF file to add page numbers to.
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={position}
                      onValueChange={(value: Position) => setPosition(value)}
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-center">
                          Bottom Center
                        </SelectItem>
                        <SelectItem value="bottom-right">
                          Bottom Right
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="format">Number Format</Label>
                    <Select
                      value={format}
                      onValueChange={(value: NumberFormat) => setFormat(value)}
                    >
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arabic">Arabic (1, 2, 3)</SelectItem>
                        <SelectItem value="roman">
                          Roman (I, II, III)
                        </SelectItem>
                        <SelectItem value="letters">
                          Letters (A, B, C)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="startNumber">Start Number</Label>
                    <Input
                      id="startNumber"
                      type="number"
                      min="1"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fontSize">Font Size (pt)</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      min="6"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="margin">Margin (px)</Label>
                    <Input
                      id="margin"
                      type="number"
                      min="0"
                      max="100"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prefix">Prefix (optional)</Label>
                    <Input
                      id="prefix"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="e.g., Page"
                    />
                  </div>

                  <div>
                    <Label htmlFor="suffix">Suffix (optional)</Label>
                    <Input
                      id="suffix"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      placeholder="e.g., of {totalPages}"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddNumbers}
                  disabled={processing}
                  className="w-full"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  {processing ? "Adding Page Numbers..." : "Add Page Numbers"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
