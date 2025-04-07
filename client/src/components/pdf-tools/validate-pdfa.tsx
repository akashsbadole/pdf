import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Label } from "@/components/ui/label";
import { HelpCircle, FileSearch, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ValidationResult {
  isCompliant: boolean;
  issues: string[];
}

export function ValidatePdfaTool() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

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
    setValidationResult(null);
  };

  const handleValidate = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setValidating(true);

      // Simulate validation (in a real app, this would perform actual PDF/A validation)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Example validation result
      const result: ValidationResult = {
        isCompliant: Math.random() > 0.5, // Randomly pass/fail for demo
        issues: [],
      };

      if (!result.isCompliant) {
        result.issues = [
          "Fonts are not embedded",
          "Document contains transparency",
          "Color spaces are not device-independent",
          "Document contains JavaScript",
        ];
      }

      setValidationResult(result);

      toast({
        title: result.isCompliant ? "Validation passed" : "Validation failed",
        description: result.isCompliant
          ? "Document is PDF/A compliant"
          : "Document is not PDF/A compliant",
        variant: result.isCompliant ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error validating PDF/A:", error);
      toast({
        title: "Validation failed",
        description: "Could not validate PDF/A compliance",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Validate PDF/A</h1>
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
            <CardTitle>About PDF/A Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              PDF/A is an ISO-standardized version of PDF specialized for use in
              the archiving and long-term preservation of electronic documents.
              PDF/A differs from regular PDF by prohibiting features unsuitable
              for long-term archiving, such as font linking and encryption.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload PDF File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Select a PDF file to check its PDF/A compliance.
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
                      setValidationResult(null);
                    }}
                  >
                    Change
                  </Button>
                </div>

                <Button
                  onClick={handleValidate}
                  disabled={validating}
                  className="w-full"
                >
                  <FileSearch className="h-5 w-5 mr-2" />
                  {validating ? "Validating..." : "Validate PDF/A Compliance"}
                </Button>

                {validationResult && (
                  <div className="mt-6 space-y-4">
                    <Alert
                      variant={
                        validationResult.isCompliant ? "default" : "destructive"
                      }
                    >
                      {validationResult.isCompliant ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <ShieldAlert className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {validationResult.isCompliant
                          ? "Document is PDF/A compliant"
                          : "Document is not PDF/A compliant"}
                      </AlertTitle>
                      <AlertDescription>
                        {validationResult.isCompliant
                          ? "This document meets all requirements for long-term archival storage."
                          : "This document needs to be converted to PDF/A format for archival storage."}
                      </AlertDescription>
                    </Alert>

                    {!validationResult.isCompliant &&
                      validationResult.issues.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Issues Found:</Label>
                          <ul className="list-disc pl-5 space-y-1">
                            {validationResult.issues.map((issue, index) => (
                              <li key={index} className="text-red-600">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
