import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { HelpCircle, FileEdit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPdfMetadata } from "@/lib/pdf-utils";

export function EditMetadataTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
    creationDate: "",
    modificationDate: "",
  });

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

    setFile(pdfFile);

    try {
      const meta = await getPdfMetadata(pdfFile);
      setMetadata({
        title: meta.title || "",
        author: meta.author || "",
        subject: meta.subject || "",
        keywords: meta.keywords.join(", ") || "",
        creator: meta.creator || "",
        producer: meta.producer || "",
        creationDate: meta.creationDate?.toISOString().split("T")[0] || "",
        modificationDate:
          meta.modificationDate?.toISOString().split("T")[0] || "",
      });
    } catch (error) {
      console.error("Error reading PDF metadata:", error);
      toast({
        title: "Error reading metadata",
        description: "Could not read PDF metadata",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMetadata = async () => {
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

      // Create download link
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_updated.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Metadata updated",
        description: "Your PDF metadata has been updated",
      });
    } catch (error) {
      console.error("Error updating metadata:", error);
      toast({
        title: "Operation failed",
        description:
          error instanceof Error ? error.message : "Failed to update metadata",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit PDF Metadata</h1>
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
            Select a PDF file to edit its metadata.
          </p>

          {!file ? (
            <FileUploader
              onFilesSelected={handleFileSelected}
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
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setMetadata({
                      title: "",
                      author: "",
                      subject: "",
                      keywords: "",
                      creator: "",
                      producer: "",
                      creationDate: "",
                      modificationDate: "",
                    });
                  }}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={metadata.author}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={metadata.subject}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Textarea
                    id="keywords"
                    value={metadata.keywords}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        keywords: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="creator">Creator</Label>
                  <Input
                    id="creator"
                    value={metadata.creator}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        creator: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="producer">Producer</Label>
                  <Input
                    id="producer"
                    value={metadata.producer}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creationDate">Creation Date</Label>
                    <Input
                      id="creationDate"
                      type="date"
                      value={metadata.creationDate}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          creationDate: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="modificationDate">Last Modified</Label>
                    <Input
                      id="modificationDate"
                      type="date"
                      value={metadata.modificationDate}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateMetadata} disabled={processing}>
                  <FileEdit className="h-5 w-5 mr-2" />
                  {processing ? "Updating..." : "Update Metadata"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
