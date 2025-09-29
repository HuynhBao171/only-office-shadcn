import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  memo,
} from "react";
import {
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Pen,
  Type,
  Square,
  Circle,
  Highlighter,
  MousePointer2,
} from "lucide-react";
import React from "react";

// --- Library Imports ---
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// --- UI Imports ---
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Slider } from "./ui/slider";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs`;

// --- Type Definitions ---
type AnnotationMode =
  | "select"
  | "drawing"
  | "text"
  | "highlight"
  | "square"
  | "circle";

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  id: string;
  type: AnnotationMode;
  page: number;
  points: Point[];
  text?: string;
  color: string;
  width: number;
  timestamp: number;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PageRef {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  annotationRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface PdfViewerRef {
  getAnnotations: () => Annotation[];
  saveAnnotations: () => void;
  hasUnsavedChanges: () => boolean;
}

interface PdfViewerProps {
  documentUrl: string;
  fileName: string;
  collection: string;
  className?: string;
}

// --- Component ---
export const PdfViewer = memo(
  forwardRef<PdfViewerRef, PdfViewerProps>(
    ({ documentUrl, fileName, collection, className }, ref) => {
      const scrollContainerRef = useRef<HTMLDivElement>(null);

      // PDF states
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [currentPage, setCurrentPage] = useState(1);
      const [numPages, setNumPages] = useState(0);
      const [scale, setScale] = useState(1.0);
      const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
      const pageRefs = useRef<PageRef[]>([]);

      // Annotation states
      const [annotations, setAnnotations] = useState<Annotation[]>([]);
      const [annotationMode, setAnnotationMode] =
        useState<AnnotationMode>("select");
      const [penColor, setPenColor] = useState("#ef4444");
      const [penWidth, setPenWidth] = useState([3]);

      // Drawing states
      const [isDrawing, setIsDrawing] = useState(false);
      const [currentPath, setCurrentPath] = useState<Point[]>([]);
      const [activePageIndex, setActivePageIndex] = useState<number | null>(
        null
      );
      const [textInputVisible, setTextInputVisible] = useState(false);
      const [textInputPos, setTextInputPos] = useState<Point>({ x: 0, y: 0 });
      const [textInputValue, setTextInputValue] = useState("");

      // Render tasks tracking
      const currentRenderTasksRef = useRef<Map<number, RenderTask>>(new Map());

      // Expose ref methods
      useImperativeHandle(ref, () => ({
        getAnnotations: () => annotations,
        saveAnnotations: () => {
          const dataStr = JSON.stringify(annotations, null, 2);
          const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);
          const exportFileDefaultName = `${fileName}_annotations.json`;
          const linkElement = document.createElement("a");
          linkElement.setAttribute("href", dataUri);
          linkElement.setAttribute("download", exportFileDefaultName);
          linkElement.click();
          console.log("Annotations saved:", annotations);
        },
        hasUnsavedChanges: () => annotations.length > 0,
      }));

      // Get coordinates from event (supports both mouse and touch)
      const getEventCoordinates = useCallback(
        (
          event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
          canvas: HTMLCanvasElement
        ): Point => {
          const rect = canvas.getBoundingClientRect();
          let clientX: number, clientY: number;

          if ("touches" in event && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
          } else if (
            "changedTouches" in event &&
            event.changedTouches.length > 0
          ) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
          } else {
            clientX = (event as MouseEvent).clientX;
            clientY = (event as MouseEvent).clientY;
          }

          return {
            x: (clientX - rect.left) / scale,
            y: (clientY - rect.top) / scale,
          };
        },
        [scale]
      );

      // Draw annotation on canvas
      const drawAnnotation = useCallback(
        (canvas: HTMLCanvasElement, annotation: Annotation) => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.save();
          ctx.scale(scale, scale);
          ctx.strokeStyle = annotation.color;
          ctx.fillStyle = annotation.color;
          ctx.lineWidth = annotation.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          switch (annotation.type) {
            case "drawing":
              if (annotation.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
                for (let i = 1; i < annotation.points.length; i++) {
                  ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
                }
                ctx.stroke();
              }
              break;

            case "text":
              if (annotation.text && annotation.points.length > 0) {
                ctx.font = `${annotation.width * 4}px Arial`;
                ctx.fillText(
                  annotation.text,
                  annotation.points[0].x,
                  annotation.points[0].y
                );
              }
              break;

            case "highlight":
              if (annotation.bounds) {
                ctx.globalAlpha = 0.3;
                ctx.fillRect(
                  annotation.bounds.x,
                  annotation.bounds.y,
                  annotation.bounds.width,
                  annotation.bounds.height
                );
              }
              break;

            case "square":
              if (annotation.bounds) {
                ctx.strokeRect(
                  annotation.bounds.x,
                  annotation.bounds.y,
                  annotation.bounds.width,
                  annotation.bounds.height
                );
              }
              break;

            case "circle":
              if (annotation.bounds) {
                const centerX =
                  annotation.bounds.x + annotation.bounds.width / 2;
                const centerY =
                  annotation.bounds.y + annotation.bounds.height / 2;
                const radius =
                  Math.min(annotation.bounds.width, annotation.bounds.height) /
                  2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.stroke();
              }
              break;
          }
          ctx.restore();
        },
        [scale]
      );

      // Redraw all annotations for a page
      const redrawAnnotations = useCallback(
        (pageIndex: number) => {
          const pageRef = pageRefs.current[pageIndex];
          const annotationCanvas = pageRef?.annotationRef.current;
          if (!annotationCanvas) return;

          const ctx = annotationCanvas.getContext("2d");
          if (!ctx) return;

          // Clear canvas
          ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);

          // Draw all annotations for this page
          const pageAnnotations = annotations.filter(
            (ann) => ann.page === pageIndex + 1
          );
          pageAnnotations.forEach((annotation) => {
            drawAnnotation(annotationCanvas, annotation);
          });
        },
        [annotations, drawAnnotation]
      );

      // Handle drawing start
      const handleDrawStart = useCallback(
        (event: React.MouseEvent | React.TouchEvent, pageIndex: number) => {
          event.preventDefault();

          if (annotationMode === "select") return;

          const pageRef = pageRefs.current[pageIndex];
          const canvas = pageRef?.annotationRef.current;
          if (!canvas) return;

          const point = getEventCoordinates(event, canvas);
          setActivePageIndex(pageIndex);
          setIsDrawing(true);

          if (annotationMode === "text") {
            setTextInputPos(point);
            setTextInputVisible(true);
            setTextInputValue("");
            return;
          }

          setCurrentPath([point]);
        },
        [annotationMode, getEventCoordinates]
      );

      // Handle drawing move
      const handleDrawMove = useCallback(
        (event: React.MouseEvent | React.TouchEvent, pageIndex: number) => {
          event.preventDefault();

          if (
            !isDrawing ||
            activePageIndex !== pageIndex ||
            annotationMode === "text"
          )
            return;

          const pageRef = pageRefs.current[pageIndex];
          const canvas = pageRef?.annotationRef.current;
          if (!canvas) return;

          const point = getEventCoordinates(event, canvas);
          const newPath = [...currentPath, point];
          setCurrentPath(newPath);

          // Draw current path in real-time
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Redraw all existing annotations
          redrawAnnotations(pageIndex);

          // Draw current path
          ctx.save();
          ctx.scale(scale, scale);
          ctx.strokeStyle = penColor;
          ctx.lineWidth = penWidth[0];
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (annotationMode === "drawing" && newPath.length > 1) {
            ctx.beginPath();
            ctx.moveTo(newPath[0].x, newPath[0].y);
            for (let i = 1; i < newPath.length; i++) {
              ctx.lineTo(newPath[i].x, newPath[i].y);
            }
            ctx.stroke();
          } else if (
            (annotationMode === "square" ||
              annotationMode === "circle" ||
              annotationMode === "highlight") &&
            newPath.length >= 2
          ) {
            const start = newPath[0];
            const end = newPath[newPath.length - 1];
            const width = end.x - start.x;
            const height = end.y - start.y;

            if (annotationMode === "square" || annotationMode === "highlight") {
              if (annotationMode === "highlight") {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = penColor;
                ctx.fillRect(start.x, start.y, width, height);
              } else {
                ctx.strokeRect(start.x, start.y, width, height);
              }
            } else if (annotationMode === "circle") {
              const centerX = start.x + width / 2;
              const centerY = start.y + height / 2;
              const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
              ctx.beginPath();
              ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
          ctx.restore();
        },
        [
          isDrawing,
          activePageIndex,
          annotationMode,
          currentPath,
          getEventCoordinates,
          redrawAnnotations,
          scale,
          penColor,
          penWidth,
        ]
      );

      // Handle drawing end
      const handleDrawEnd = useCallback(() => {
        if (!isDrawing || activePageIndex === null || annotationMode === "text")
          return;

        if (currentPath.length > 0) {
          const newAnnotation: Annotation = {
            id: `ann_${Date.now()}_${Math.random()}`,
            type: annotationMode,
            page: activePageIndex + 1,
            points: [...currentPath],
            color: penColor,
            width: penWidth[0],
            timestamp: Date.now(),
          };

          // Calculate bounds for shapes
          if (
            annotationMode === "square" ||
            annotationMode === "circle" ||
            annotationMode === "highlight"
          ) {
            if (currentPath.length >= 2) {
              const start = currentPath[0];
              const end = currentPath[currentPath.length - 1];
              newAnnotation.bounds = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y),
              };
            }
          }

          setAnnotations((prev) => [...prev, newAnnotation]);
          console.log(`✅ ${annotationMode} annotation added`, newAnnotation);
        }

        setIsDrawing(false);
        setCurrentPath([]);
        setActivePageIndex(null);
      }, [
        isDrawing,
        activePageIndex,
        annotationMode,
        currentPath,
        penColor,
        penWidth,
      ]);

      // Handle text input submission
      const handleTextSubmit = useCallback(() => {
        if (textInputValue.trim() && activePageIndex !== null) {
          const newAnnotation: Annotation = {
            id: `ann_${Date.now()}_${Math.random()}`,
            type: "text",
            page: activePageIndex + 1,
            points: [textInputPos],
            text: textInputValue.trim(),
            color: penColor,
            width: penWidth[0],
            timestamp: Date.now(),
          };

          setAnnotations((prev) => [...prev, newAnnotation]);
          console.log("✅ Text annotation added", newAnnotation);
        }

        setTextInputVisible(false);
        setTextInputValue("");
        setActivePageIndex(null);
      }, [textInputValue, activePageIndex, textInputPos, penColor, penWidth]);

      // Render PDF page
      const renderPage = useCallback(
        async (pdf: PDFDocumentProxy, pageNumber: number): Promise<void> => {
          const pageRef = pageRefs.current[pageNumber - 1];
          if (!pageRef?.canvasRef.current) return;

          try {
            // Cancel existing render task
            const existingTask = currentRenderTasksRef.current.get(pageNumber);
            if (existingTask) {
              try {
                existingTask.cancel();
              } catch (e) {
                console.warn(`Error cancelling render task: ${e}`);
              }
              currentRenderTasksRef.current.delete(pageNumber);
            }

            const page: PDFPageProxy = await pdf.getPage(pageNumber);
            const canvas = pageRef.canvasRef.current;
            const annotationCanvas = pageRef.annotationRef.current;
            const context = canvas.getContext("2d");

            if (!context || !annotationCanvas) return;

            // Clear and setup canvases
            context.clearRect(0, 0, canvas.width, canvas.height);
            const viewport = page.getViewport({ scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            annotationCanvas.height = viewport.height;
            annotationCanvas.width = viewport.width;

            // Render PDF
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            };

            const renderTask = page.render(renderContext);
            currentRenderTasksRef.current.set(pageNumber, renderTask);

            await renderTask.promise;
            currentRenderTasksRef.current.delete(pageNumber);

            console.log(`📄 Page ${pageNumber} rendered successfully`);
          } catch (error: any) {
            currentRenderTasksRef.current.delete(pageNumber);
            if (error.name !== "RenderingCancelledException") {
              console.error(`Error rendering page ${pageNumber}:`, error);
            }
          }
        },
        [scale]
      );

      // Load PDF
      useEffect(() => {
        const loadPDF = async () => {
          try {
            setIsLoading(true);
            setError(null);
            console.log(`🚀 Loading PDF: ${fileName}`);

            const loadingTask = pdfjsLib.getDocument({
              url: documentUrl,
              disableRange: false,
              disableStream: false,
            });

            loadingTask.onProgress = (progress: {
              loaded: number;
              total?: number;
            }) => {
              if (progress.total) {
                const percent = Math.round(
                  (progress.loaded / progress.total) * 100
                );
                console.log(`📊 PDF loading progress: ${percent}%`);
              }
            };

            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);

            // Initialize refs
            pageRefs.current = Array.from({ length: pdf.numPages }, () => ({
              canvasRef: React.createRef(),
              annotationRef: React.createRef(),
              containerRef: React.createRef(),
            }));

            console.log(`✅ PDF loaded: ${pdf.numPages} pages`);
            setIsLoading(false);
          } catch (err) {
            console.error("❌ PDF loading error:", err);
            setError(err instanceof Error ? err.message : "Failed to load PDF");
            setIsLoading(false);
          }
        };

        if (documentUrl && fileName) {
          loadPDF();
        }
      }, [documentUrl, fileName]);

      // Render pages when PDF loads
      useEffect(() => {
        if (pdfDoc && !isLoading && pageRefs.current.length > 0) {
          const renderAllPages = async () => {
            console.log(`🔄 Rendering ${numPages} pages...`);
            for (let i = 1; i <= numPages; i++) {
              await renderPage(pdfDoc, i);
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
            console.log(`✅ All pages rendered`);
          };
          renderAllPages();
        }
      }, [pdfDoc, isLoading, numPages, renderPage]);

      // Redraw annotations when they change
      useEffect(() => {
        pageRefs.current.forEach((_, index) => {
          redrawAnnotations(index);
        });
      }, [annotations, redrawAnnotations]);

      // Navigation handlers
      const handlePrevPage = () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
          scrollToPage(currentPage - 1);
        }
      };

      const handleNextPage = () => {
        if (currentPage < numPages) {
          setCurrentPage(currentPage + 1);
          scrollToPage(currentPage + 1);
        }
      };

      const scrollToPage = (pageNumber: number) => {
        const pageRef = pageRefs.current[pageNumber - 1];
        if (pageRef?.containerRef.current && scrollContainerRef.current) {
          pageRef.containerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      };

      const handleZoomIn = () => setScale(Math.min(3, scale * 1.2));
      const handleZoomOut = () => setScale(Math.max(0.5, scale / 1.2));

      // Clear annotations
      const clearAnnotations = () => {
        setAnnotations([]);
        console.log("🗑️ All annotations cleared");
      };

      // Cleanup on unmount
      useEffect(() => {
        const tasks = currentRenderTasksRef.current;
        return () => {
          tasks.forEach((task) => {
            try {
              task.cancel();
            } catch (e) {
              console.warn("Error cancelling task on unmount:", e);
            }
          });
          tasks.clear();
        };
      }, []);

      if (error) {
        return (
          <div
            className={`${className} bg-white border border-gray-200 rounded-lg flex-1 overflow-hidden h-full flex flex-col`}
          >
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-full max-w-md mx-4">
                <CardContent className="p-6">
                  <Alert variant="destructive">
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">
                        Error loading {fileName}
                      </div>
                      <div className="text-sm mt-2">{error}</div>
                      <div className="text-xs mt-3 text-gray-500">
                        <div>• Check network connection</div>
                        <div>• Verify file exists on server</div>
                        <div>• Try refreshing the page</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }

      const tools: {
        mode: AnnotationMode;
        icon: React.ElementType;
        label: string;
      }[] = [
        { mode: "select", icon: MousePointer2, label: "Select" },
        { mode: "drawing", icon: Pen, label: "Draw" },
        { mode: "text", icon: Type, label: "Text" },
        { mode: "highlight", icon: Highlighter, label: "Highlight" },
        { mode: "square", icon: Square, label: "Rectangle" },
        { mode: "circle", icon: Circle, label: "Circle" },
      ];

      const colorPresets = [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#3b82f6",
        "#a855f7",
        "#ec4899",
        "#000000",
      ];

      return (
        <div className={`${className} flex flex-col h-full`}>
          {/* Annotation Tools */}
          <div className="mb-4">
            <div className="w-full bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    📝 PDF Annotation Tools
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700"
                  >
                    {annotations.length} annotations
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => ref.current?.saveAnnotations()}
                    disabled={isLoading || annotations.length === 0}
                    title="Export annotations as JSON"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAnnotations}
                    disabled={isLoading || annotations.length === 0}
                    className="text-red-600 hover:text-red-700"
                    title="Clear all annotations"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {/* Tools */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 mr-2">
                    Tools:
                  </span>
                  {tools.map((tool) => (
                    <Button
                      key={tool.mode}
                      variant={
                        annotationMode === tool.mode ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationMode(tool.mode)}
                      disabled={isLoading}
                      className={
                        annotationMode === tool.mode
                          ? "bg-blue-500 hover:bg-blue-600"
                          : ""
                      }
                    >
                      <tool.icon className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{tool.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Colors & Width */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      Color:
                    </span>
                    <div className="flex items-center gap-1">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded border-2 cursor-pointer ${
                            penColor === color
                              ? "border-gray-400 ring-2 ring-blue-300"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setPenColor(color)}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-500">
                      Width:
                    </span>
                    <div className="flex-1 max-w-32">
                      <Slider
                        value={penWidth}
                        onValueChange={setPenWidth}
                        max={10}
                        min={1}
                        step={1}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {penWidth[0]}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 border-b shrink-0">
              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Badge variant="outline" className="mx-2">
                  Page {currentPage} of {numPages}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={isLoading}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <Badge variant="secondary" className="min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={isLoading}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1" />

              {/* File Info */}
              <Badge variant="outline">📄 {fileName}</Badge>
              <Badge
                variant="outline"
                className={
                  collection === "MainFiles"
                    ? "border-blue-500 text-blue-700"
                    : "border-green-500 text-green-700"
                }
              >
                {collection.toUpperCase()}
              </Badge>
            </div>

            {/* PDF Content */}
            <div
              ref={scrollContainerRef}
              // height fix 600px
              className="relative overflow-auto bg-gray-100 "
              style={{ height: 600 }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <div className="mt-2 text-sm text-gray-600">
                      Loading PDF...
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{fileName}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center p-4 space-y-4">
                {/* Render all pages */}
                {pageRefs.current.map((pageRef, index) => {
                  const pageNumber = index + 1;
                  return (
                    <div
                      key={pageNumber}
                      ref={pageRef.containerRef}
                      className="relative bg-white shadow-lg rounded-lg overflow-hidden"
                      style={{
                        border:
                          collection === "MainFiles"
                            ? "2px solid #3b82f6"
                            : "2px solid #10b981",
                      }}
                    >
                      {/* Page number */}
                      <div className="absolute -top-8 left-0 text-sm text-gray-500 font-medium">
                        Page {pageNumber}
                      </div>

                      <div className="relative">
                        {/* PDF Canvas */}
                        <canvas
                          ref={pageRef.canvasRef}
                          className="block max-w-full"
                          style={{ display: isLoading ? "none" : "block" }}
                        />

                        {/* Annotation Canvas (overlay) */}
                        <canvas
                          ref={pageRef.annotationRef}
                          className="absolute top-0 left-0 cursor-crosshair"
                          style={{
                            display: isLoading ? "none" : "block",
                            pointerEvents:
                              annotationMode === "select" ? "none" : "auto",
                          }}
                          onMouseDown={(e) => handleDrawStart(e, index)}
                          onMouseMove={(e) => handleDrawMove(e, index)}
                          onMouseUp={handleDrawEnd}
                          onMouseLeave={handleDrawEnd}
                          onTouchStart={(e) => handleDrawStart(e, index)}
                          onTouchMove={(e) => handleDrawMove(e, index)}
                          onTouchEnd={handleDrawEnd}
                        />
                      </div>

                      {/* Page annotation count */}
                      {/* {annotations.filter((ann) => ann.page === pageNumber)
                        .length > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          {
                            annotations.filter((ann) => ann.page === pageNumber)
                              .length
                          }{" "}
                          annotation(s)
                        </div>
                      )} */}
                    </div>
                  );
                })}
              </div>

              {/* Text Input Modal */}
              {textInputVisible && (
                <div
                  className="absolute bg-white border border-gray-300 rounded p-2 shadow-lg z-20"
                  style={{
                    left: textInputPos.x * scale + 10,
                    top: textInputPos.y * scale + 10,
                  }}
                >
                  <input
                    type="text"
                    value={textInputValue}
                    onChange={(e) => setTextInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTextSubmit();
                      if (e.key === "Escape") setTextInputVisible(false);
                    }}
                    placeholder="Enter text..."
                    className="w-40 px-2 py-1 text-sm border border-gray-300 rounded"
                    autoFocus
                  />
                  <div className="flex gap-1 mt-1">
                    <Button size="sm" onClick={handleTextSubmit}>
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTextInputVisible(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  )
);

PdfViewer.displayName = "PdfViewer";
export default PdfViewer;
