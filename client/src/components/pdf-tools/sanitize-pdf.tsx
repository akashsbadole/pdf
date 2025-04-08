import React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { PdfThumbnail } from "@/components/ui/pdf-thumbnail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { HelpCircle, FileCog } from "lucide-react";
import { sanitizePdf } from "@/lib/pdf-utils";

const SanitizePdfTool = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState(null);

  const handleFileChange = (file) => {
    setFile(file);
  };

  const handleSanitize = async () => {
    if (!file) return;
    const output = await sanitizePdf(file);
    setOutput(output);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sanitize PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <FileUploader onFileChange={handleFileChange} />
        <Button onClick={handleSanitize}>Sanitize</Button>
        {output && (
          <a href={output} download="sanitized.pdf">
            Download sanitized PDF
          </a>
        )}
        {progress > 0 && <Progress value={progress} />}
      </CardContent>
    </Card>
  );
};

export default SanitizePdfTool;
