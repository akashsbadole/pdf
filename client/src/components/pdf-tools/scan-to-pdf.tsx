import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { convertImagesToPdf } from "@/lib/pdf-utils";
import { HelpCircle, Camera, Scan } from "lucide-react";

export function ScanToPdfTool() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedImages, setScannedImages] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [fitToPage, setFitToPage] = useState(true);
  const [outputFilename, setOutputFilename] = useState("scanned_document.pdf");
  const [processing, setProcessing] = useState(false);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description:
          "Could not access your camera. Please make sure you've granted permission.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a file
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `scan_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setScannedImages((prev) => [...prev, file]);

        toast({
          title: "Image captured",
          description: `Captured page ${scannedImages.length + 1}`,
        });
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFilesSelected = (files: File[]) => {
    setScannedImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setScannedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePdf = async () => {
    if (scannedImages.length === 0) {
      toast({
        title: "No images",
        description: "Please scan or upload at least one image",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      const pdf = await convertImagesToPdf(scannedImages, {
        pageSize,
        orientation,
        fitToPage,
      });

      // Create download link
      const url = URL.createObjectURL(pdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = outputFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF created successfully",
        description: `Created PDF with ${scannedImages.length} page(s)`,
      });
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast({
        title: "PDF creation failed",
        description: "There was an error creating your PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scan to PDF</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-5 w-5 mr-2" />
            Help
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={captureImage}>
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Page
                    </Button>
                    <Button variant="outline" onClick={stopScanning}>
                      Stop Scanning
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={startScanning}>
                    <Scan className="h-5 w-5 mr-2" />
                    Start Scanning
                  </Button>
                  <div className="text-sm text-gray-500">
                    Or upload images directly:
                  </div>
                  <FileUploader
                    onFilesSelected={handleFilesSelected}
                    acceptedFileTypes={[".jpg", ".jpeg", ".png"]}
                    maxFileSize={10 * 1024 * 1024} // 10MB
                  />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>PDF Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pageSize">Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger id="pageSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="a3">A3</SelectItem>
                    <SelectItem value="a5">A5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orientation">Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="fitToPage"
                  checked={fitToPage}
                  onCheckedChange={setFitToPage}
                />
                <Label htmlFor="fitToPage">Fit images to page</Label>
              </div>

              <div>
                <Label htmlFor="outputFilename">Output Filename</Label>
                <Input
                  id="outputFilename"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Scanned Pages ({scannedImages.length})</Label>
                <div className="mt-2 space-y-2">
                  {scannedImages.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>Page {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreatePdf}
                disabled={scannedImages.length === 0 || processing}
                className="w-full"
              >
                {processing ? "Creating PDF..." : "Create PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
