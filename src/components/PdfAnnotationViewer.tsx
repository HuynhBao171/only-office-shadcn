import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Card } from "./ui/card";

// Import PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PdfAnnotationViewerProps {
  fileUrl: string;
  className?: string;
  title?: string;
}

export const PdfAnnotationViewer: React.FC<PdfAnnotationViewerProps> = ({
  fileUrl,
  className,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePdfViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!containerRef.current || !viewerRef.current) return;

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        // Clear previous content
        viewerRef.current.innerHTML = "";

        // Create PDF viewer container
        const viewerContainer = document.createElement("div");
        viewerContainer.style.cssText = `
          width: 100%;
          height: 100%;
          overflow: auto;
          background: #f5f5f5;
          position: relative;
        `;

        // Render each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          // Create canvas for page
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.cssText = `
            display: block;
            margin: 10px auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
            background: white;
          `;

          // Create page container
          const pageContainer = document.createElement("div");
          pageContainer.style.cssText = `
            position: relative;
            margin: 20px 0;
          `;
          pageContainer.appendChild(canvas);

          // Create annotation layer container
          const annotationContainer = document.createElement("div");
          annotationContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: auto;
          `;
          pageContainer.appendChild(annotationContainer);

          viewerContainer.appendChild(pageContainer);

          // Render PDF page
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };
          await page.render(renderContext).promise;

          // TODO: Initialize annotation extension for this page
          // This is where you would initialize the annotation tools
          initializeAnnotationLayer(annotationContainer, pageNum);
        }

        viewerRef.current.appendChild(viewerContainer);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF document");
      } finally {
        setIsLoading(false);
      }
    };

    if (fileUrl) {
      initializePdfViewer();
    }
  }, [fileUrl]);

  const initializeAnnotationLayer = (
    container: HTMLElement,
    pageNum: number
  ) => {
    // TODO: Initialize PDF.js annotation extension here
    // This would be where you integrate the annotation functionality
    console.log(`Initializing annotation layer for page ${pageNum}`);

    // For now, just add a simple overlay to show it's working
    container.innerHTML = `
      <div style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        pointer-events: none;
      ">
        Page ${pageNum} - Annotations Ready
      </div>
    `;
  };

  if (error) {
    return (
      <Card className={`${className} p-4`}>
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      {title && (
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}

      <div ref={containerRef} className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        <div
          ref={viewerRef}
          className="w-full h-full"
          style={{ display: isLoading ? "none" : "block" }}
        />
      </div>
    </Card>
  );
};
