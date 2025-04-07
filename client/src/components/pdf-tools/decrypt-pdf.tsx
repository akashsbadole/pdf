import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { HelpCircle, FileKey } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { isPdfEncrypted, decryptPdf } from "@/lib/pdf-utils";

export function DecryptPdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState("");
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
      const encrypted = await isPdfEncrypted(pdfFile);
      setIsEncrypted(encrypted);
      setFile(pdfFile);

      if (!encrypted) {
        toast({
          title: "File not encrypted",
          description: "This PDF is not password protected",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error checking PDF encryption:", error);
      toast({
        title: "Error checking file",
        description: "Could not determine if the file is encrypted",
        variant: "destructive",
      });
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "No password provided",
        description: "Please enter the password",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      const decryptedPdf = await decryptPdf(file, password);

      // Create download link
      const url = URL.createObjectURL(decryptedPdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_decrypted.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF decrypted successfully",
        description: "Password protection has been removed",
      });
    } catch (error) {
      console.error("Error decrypting PDF:", error);
      toast({
        title: "Decryption failed",
        description:
          error instanceof Error ? error.message : "Could not decrypt PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Decrypt PDF</h1>
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
            <CardTitle>About PDF Decryption</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              This tool removes password protection from PDF files. You'll need
              the correct password to decrypt the document. After decryption,
              anyone will be able to open and edit the PDF without restrictions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload PDF File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Select a password-protected PDF file to decrypt.
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
                      setPassword("");
                      setIsEncrypted(false);
                    }}
                  >
                    Change
                  </Button>
                </div>

                {isEncrypted ? (
                  <div className="space-y-6">
                    <Alert>
                      <FileKey className="h-4 w-4" />
                      <AlertTitle>Password Protected PDF</AlertTitle>
                      <AlertDescription>
                        This PDF is encrypted. Enter the password to decrypt it.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the PDF password"
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={handleDecrypt}
                      disabled={processing || !password}
                      className="w-full"
                    >
                      <FileKey className="h-5 w-5 mr-2" />
                      {processing ? "Decrypting..." : "Decrypt PDF"}
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <FileKey className="h-4 w-4" />
                    <AlertTitle>Not Password Protected</AlertTitle>
                    <AlertDescription>
                      This PDF is not encrypted. No decryption is needed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
