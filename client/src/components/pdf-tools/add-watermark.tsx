import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Type, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WatermarkPosition {
  x: number;
  y: number;
  rotation: number;
}

interface TextWatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  font: string;
}

interface ImageWatermarkOptions {
  image: File | null;
  scale: number;
  opacity: number;
}

export function AddWatermarkTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [processing, setProcessing] = useState(false);
  const [allPages, setAllPages] = useState(true);
  const [position, setPosition] = useState<WatermarkPosition>({
    x: 50,
    y: 50,
    rotation: 45,
  });

  const [textOptions, setTextOptions] = useState<TextWatermarkOptions>({
    text: "CONFIDENTIAL",
    fontSize: 48,
    opacity: 0.3,
    color: "#FF0000",
    font: "helvetica",
  });

  const [imageOptions, setImageOptions] = useState<ImageWatermarkOptions>({
    image: null,
    scale: 50,
    opacity: 0.3,
  });

  const handleFileSelected = (selectedFiles: File[]) => {
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
  };

  const handleImageSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const imageFile = selectedFiles[0];
    if (!imageFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setImageOptions((prev) => ({ ...prev, image: imageFile }));
  };

  const handleAddWatermark = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (watermarkType === "text" && !textOptions.text.trim()) {
      toast({
        title: "No watermark text",
        description: "Please enter the watermark text",
        variant: "destructive",
      });
      return;
    }

    if (watermarkType === "image" && !imageOptions.image) {
      toast({
        title: "No watermark image",
        description: "Please select an image for the watermark",
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
      a.download = file.name.replace(".pdf", "_watermarked.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Watermark added successfully",
        description: "Your PDF has been watermarked",
      });
    } catch (error) {
      console.error("Error adding watermark:", error);
      toast({
        title: "Operation failed",
        description:
          error instanceof Error ? error.message : "Could not add watermark",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Watermark</h1>
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
              Select a PDF file to add a watermark.
            </p>

            {!file ? (
              <FileUploader
                onFilesSelected={handleFileSelected}
                acceptedFileTypes={[".pdf"]}
                maxFileSize={50 * 1024 * 1024} // 50MB
                maxFiles={1}
              />
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <div className="h-14 w-14 mr-4">
                    <PdfThumbnail file={file} width={56} height={56} />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setFile(null)}>
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {file && (
          <Card>
            <CardHeader>
              <CardTitle>Watermark Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={watermarkType}
                onValueChange={(v) => setWatermarkType(v as "text" | "image")}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="text">
                    <Type className="h-4 w-4 mr-2" />
                    Text Watermark
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image Watermark
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-6">
                  <div>
                    <Label htmlFor="watermarkText">Watermark Text</Label>
                    <Input
                      id="watermarkText"
                      value={textOptions.text}
                      onChange={(e) =>
                        setTextOptions((prev) => ({
                          ...prev,
                          text: e.target.value,
                        }))
                      }
                      placeholder="Enter watermark text"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Slider
                      id="fontSize"
                      min={12}
                      max={144}
                      step={1}
                      value={[textOptions.fontSize]}
                      onValueChange={([value]) =>
                        setTextOptions((prev) => ({ ...prev, fontSize: value }))
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {textOptions.fontSize}pt
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Color</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={textOptions.color}
                      onChange={(e) =>
                        setTextOptions((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="textOpacity">Opacity</Label>
                    <Slider
                      id="textOpacity"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[textOptions.opacity]}
                      onValueChange={([value]) =>
                        setTextOptions((prev) => ({ ...prev, opacity: value }))
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(textOptions.opacity * 100)}%
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="font">Font</Label>
                    <Select
                      value={textOptions.font}
                      onValueChange={(value) =>
                        setTextOptions((prev) => ({ ...prev, font: value }))
                      }
                    >
                      <SelectTrigger id="font" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helvetica">Helvetica</SelectItem>
                        <SelectItem value="times">Times New Roman</SelectItem>
                        <SelectItem value="courier">Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-6">
                  <div>
                    <Label>Watermark Image</Label>
                    {!imageOptions.image ? (
                      <FileUploader
                        onFilesSelected={handleImageSelected}
                        acceptedFileTypes={["image/*"]}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                        maxFiles={1}
                      />
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-lg mt-1">
                        <div className="flex items-center">
                          <img
                            src={URL.createObjectURL(imageOptions.image)}
                            alt="Watermark preview"
                            className="h-14 w-14 object-contain mr-4"
                          />
                          <p className="font-medium">
                            {imageOptions.image.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setImageOptions((prev) => ({
                              ...prev,
                              image: null,
                            }))
                          }
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="imageScale">Scale</Label>
                    <Slider
                      id="imageScale"
                      min={10}
                      max={100}
                      step={1}
                      value={[imageOptions.scale]}
                      onValueChange={([value]) =>
                        setImageOptions((prev) => ({ ...prev, scale: value }))
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {imageOptions.scale}%
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="imageOpacity">Opacity</Label>
                    <Slider
                      id="imageOpacity"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[imageOptions.opacity]}
                      onValueChange={([value]) =>
                        setImageOptions((prev) => ({ ...prev, opacity: value }))
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.round(imageOptions.opacity * 100)}%
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-6 mt-6 pt-6 border-t">
                <div>
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <div>
                      <Label htmlFor="xPosition" className="text-sm">
                        Horizontal (%)
                      </Label>
                      <Slider
                        id="xPosition"
                        min={0}
                        max={100}
                        step={1}
                        value={[position.x]}
                        onValueChange={([value]) =>
                          setPosition((prev) => ({ ...prev, x: value }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="yPosition" className="text-sm">
                        Vertical (%)
                      </Label>
                      <Slider
                        id="yPosition"
                        min={0}
                        max={100}
                        step={1}
                        value={[position.y]}
                        onValueChange={([value]) =>
                          setPosition((prev) => ({ ...prev, y: value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rotation">Rotation (degrees)</Label>
                  <Slider
                    id="rotation"
                    min={0}
                    max={360}
                    step={1}
                    value={[position.rotation]}
                    onValueChange={([value]) =>
                      setPosition((prev) => ({ ...prev, rotation: value }))
                    }
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {position.rotation}°
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allPages"
                    checked={allPages}
                    onCheckedChange={setAllPages}
                  />
                  <Label htmlFor="allPages">Apply to all pages</Label>
                </div>

                <Button
                  onClick={handleAddWatermark}
                  disabled={processing}
                  className="w-full"
                >
                  {watermarkType === "text" ? (
                    <Type className="h-5 w-5 mr-2" />
                  ) : (
                    <ImageIcon className="h-5 w-5 mr-2" />
                  )}
                  {processing ? "Adding Watermark..." : "Add Watermark"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
