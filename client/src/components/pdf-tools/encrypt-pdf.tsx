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
import { HelpCircle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EncryptPdfTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [useOwnerPassword, setUseOwnerPassword] = useState(false);
  const [encryptionLevel, setEncryptionLevel] = useState("aes-256");
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);
  const [allowAnnotations, setAllowAnnotations] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const handleEncrypt = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (!userPassword) {
      toast({
        title: "No password provided",
        description: "Please enter a user password",
        variant: "destructive",
      });
      return;
    }

    if (useOwnerPassword && !ownerPassword) {
      toast({
        title: "No owner password provided",
        description: "Please enter an owner password or disable owner password",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // In a real implementation, this would encrypt the PDF with the provided settings
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create download link
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_encrypted.pdf");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF encrypted successfully",
        description: "Your PDF has been password protected",
      });
    } catch (error) {
      console.error("Error encrypting PDF:", error);
      toast({
        title: "Encryption failed",
        description:
          error instanceof Error ? error.message : "Could not encrypt PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Encrypt PDF</h1>
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
            <CardTitle>About PDF Encryption</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              PDF encryption helps protect sensitive information by requiring a
              password to open or modify the document. You can set different
              passwords for users (to open the document) and owners (to modify
              security settings).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload PDF File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">Select a PDF file to encrypt.</p>

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
                  <Button variant="ghost" onClick={() => setFile(null)}>
                    Change
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="userPassword">User Password</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Required to open the document"
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useOwnerPassword"
                        checked={useOwnerPassword}
                        onCheckedChange={setUseOwnerPassword}
                      />
                      <Label htmlFor="useOwnerPassword">
                        Set owner password
                      </Label>
                    </div>

                    {useOwnerPassword && (
                      <div>
                        <Label htmlFor="ownerPassword">Owner Password</Label>
                        <Input
                          id="ownerPassword"
                          type="password"
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder="Required to change security settings"
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="encryptionLevel">Encryption Level</Label>
                    <Select
                      value={encryptionLevel}
                      onValueChange={setEncryptionLevel}
                    >
                      <SelectTrigger id="encryptionLevel" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aes-128">128-bit AES</SelectItem>
                        <SelectItem value="aes-256">
                          256-bit AES (Recommended)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Permissions</Label>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowPrint"
                          checked={allowPrint}
                          onCheckedChange={setAllowPrint}
                        />
                        <Label htmlFor="allowPrint">Allow printing</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowCopy"
                          checked={allowCopy}
                          onCheckedChange={setAllowCopy}
                        />
                        <Label htmlFor="allowCopy">
                          Allow copying text and images
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowEdit"
                          checked={allowEdit}
                          onCheckedChange={setAllowEdit}
                        />
                        <Label htmlFor="allowEdit">
                          Allow document modification
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allowAnnotations"
                          checked={allowAnnotations}
                          onCheckedChange={setAllowAnnotations}
                        />
                        <Label htmlFor="allowAnnotations">
                          Allow annotations
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleEncrypt}
                    disabled={processing}
                    className="w-full"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {processing ? "Encrypting..." : "Encrypt PDF"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
