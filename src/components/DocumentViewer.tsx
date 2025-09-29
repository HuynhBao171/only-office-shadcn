import React, { useState, useMemo, useRef } from "react";
import { FileText, ChevronUp } from "lucide-react";
import { LuSave } from "react-icons/lu";
import { Button } from "./ui/button";

// Import cả hai trình xem
import OnlyOfficeIframeWrapper, {
  type IframeWrapperRef,
} from "./OnlyOfficeIframeWrapper";
import PdfViewer, { type PdfViewerRef } from "./PdfViewer";

import { generateEditorConfig } from "@/lib/onlyoffice-config";

interface DocumentViewerProps {
  className?: string;
  instanceName: "MainFiles" | "SubFiles";
  title: string;
  initialFiles: string[];
  initialSelectedFile: string;
  documentServerUrl: string;
  fileServerUrl: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  className,
  instanceName,
  title,
  initialFiles,
  initialSelectedFile,
  documentServerUrl,
  fileServerUrl,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(initialSelectedFile);
  const [editorKey, setEditorKey] = useState(Date.now());

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const officeRef = useRef<IframeWrapperRef>(null);
  const pdfRef = useRef<PdfViewerRef>(null);

  const handleFileSelect = (fileName: string) => {
    if (fileName === selectedFile) {
      return;
    }

    setSelectedFile(fileName);
    setEditorKey(Date.now());

    setIsEditorReady(false);
    setHasChanges(false);
    console.log(`${instanceName} selected new file: ${fileName}`);
  };

  const handleSave = () => {
    const fileType = selectedFile.split(".").pop()?.toLowerCase();

    if (fileType === "pdf") {
      if (pdfRef.current) {
        const annotations = pdfRef.current.getAnnotations();
        console.log(`[${instanceName}] Saving PDF Annotations:`, annotations);
        alert("PDF annotations saved to console!");
      }
    } else {
      if (officeRef.current) {
        console.log(`[${instanceName}] Triggering OnlyOffice forceSave.`);
        officeRef.current.forceSave();

        setHasChanges(false);
      }
    }
  };

  const fileType = useMemo(
    () => selectedFile.split(".").pop()?.toLowerCase(),
    [selectedFile]
  );
  const encodedFileName = encodeURIComponent(selectedFile);
  const documentUrl = `${fileServerUrl}/files/${encodedFileName}`;

  const officeConfig = useMemo(() => {
    if (fileType !== "pdf") {
      return generateEditorConfig(
        documentUrl,
        selectedFile,
        instanceName,
        fileServerUrl
      );
    }
    return null;
  }, [documentUrl, selectedFile, instanceName, fileServerUrl, fileType]);

  return (
    <div className={`flex flex-col gap-6 ${className || ""}`}>
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronUp
                className={`w-4 h-4 transition-transform ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
          {!isCollapsed && (
            <div className="mt-3 space-y-2">
              {initialFiles.map((file) => (
                <div
                  key={file}
                  onClick={() => handleFileSelect(file)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                    selectedFile === file ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OnlyOffice or PDF.js */}
      <div
        className={`bg-white ${
          fileType !== "pdf" ? "border border-gray-200" : ""
        } rounded-lg flex-1 overflow-hidden`}
        style={{ minHeight: "600px" }}
      >
        {fileType === "pdf" ? (
          <PdfViewer
            key={editorKey}
            ref={pdfRef}
            documentUrl={documentUrl}
            fileName={selectedFile}
            collection={instanceName}
          />
        ) : officeConfig ? (
          <OnlyOfficeIframeWrapper
            key={editorKey}
            ref={officeRef}
            config={officeConfig}
            documentServerUrl={documentServerUrl}
            onReady={() => setIsEditorReady(true)}
            onStateChange={() => setHasChanges(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a file to view.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isEditorReady || !hasChanges}
          variant="outline"
          size="sm"
          className="px-8 py-2 min-w-40"
        >
          <LuSave className="mr-2" /> 저장
        </Button>
      </div>
    </div>
  );
};
