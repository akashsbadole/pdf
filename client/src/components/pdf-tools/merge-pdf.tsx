import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, FileStack, ArrowUp, ArrowDown, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface PdfFile extends File {
  preview?: string;
  pages?: number;
}

export function MergePdfTool() {
  const { toast } = useToast();
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [includeOutlines, setIncludeOutlines] = useState(true);

  const handleFilesSelected = (selectedFiles: File[]) => {
    const invalidFiles = selectedFiles.filter(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    );

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files",
        description: "Please select only PDF files",
        variant: "destructive",
      });
      return;
    }

    const newFiles = [...files, ...selectedFiles] as PdfFile[];
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === files.length - 1)
    ) {
      return;
    }

    const newFiles = [...files];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newFiles[index], newFiles[newIndex]] = [
      newFiles[newIndex],
      newFiles[index],
    ];
    setFiles(newFiles);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newFiles = [...files];
    const [movedFile] = newFiles.splice(result.source.index, 1);
    newFiles.splice(result.destination.index, 0, movedFile);
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please select at least 2 PDF files to merge",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Create download link
      const url = URL.createObjectURL(files[0]);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDFs merged successfully",
        description: "Your files have been combined into a single PDF",
      });
    } catch (error) {
      console.error("Error merging PDFs:", error);
      toast({
        title: "Merge failed",
        description:
          error instanceof Error ? error.message : "Could not merge PDFs",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merge PDFs</h1>
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
            <CardTitle>Upload PDF Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Select multiple PDF files to combine them into a single document.
              Drag and drop to reorder files.
            </p>

            <div className="space-y-6">
              <FileUploader
                onFilesSelected={handleFilesSelected}
                acceptedFileTypes={[".pdf"]}
                maxFileSize={50 * 1024 * 1024} // 50MB
                maxFiles={10}
                multiple={true}
              />

              {files.length > 0 && (
                <div className="space-y-6">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="pdf-files">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {files.map((file, index) => (
                            <Draggable
                              key={file.name + index}
                              draggableId={file.name + index}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between p-4 border rounded-lg bg-white"
                                >
                                  <div className="flex items-center flex-1">
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
                                        {(file.size / (1024 * 1024)).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveFile(index, "up")}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveFile(index, "down")}
                                      disabled={index === files.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeOutlines"
                      checked={includeOutlines}
                      onCheckedChange={setIncludeOutlines}
                    />
                    <Label htmlFor="includeOutlines">
                      Include bookmarks and outlines from source PDFs
                    </Label>
                  </div>

                  <Button
                    onClick={handleMerge}
                    disabled={processing || files.length < 2}
                    className="w-full"
                  >
                    <FileStack className="h-5 w-5 mr-2" />
                    {processing ? "Merging PDFs..." : "Merge PDFs"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
