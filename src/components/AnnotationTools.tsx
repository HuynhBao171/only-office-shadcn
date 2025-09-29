import React from "react";
import {
  Eraser,
  Pen,
  Highlighter,
  Type,
  FileDown,
  Square,
  Circle,
  MousePointer2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export type AnnotationMode =
  | "select"
  | "drawing"
  | "text"
  | "highlight"
  | "square"
  | "circle";

interface AnnotationToolsProps {
  annotationMode: AnnotationMode;
  setAnnotationMode: (mode: AnnotationMode) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  penWidth: number[];
  setPenWidth: (width: number[]) => void;
  onClearAnnotations: () => void;
  onExportAnnotations: () => void;
  annotationCount: number;
  disabled?: boolean;
}

export const AnnotationTools: React.FC<AnnotationToolsProps> = ({
  annotationMode,
  setAnnotationMode,
  penColor,
  setPenColor,
  penWidth,
  setPenWidth,
  onClearAnnotations,
  onExportAnnotations,
  annotationCount,
  disabled = false,
}) => {
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

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Annotation Tools
          </span>
          <Badge variant="secondary">{annotationCount} annotations</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportAnnotations}
            disabled={disabled}
          >
            <FileDown className="h-4 w-4 mr-1" /> Export Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAnnotations}
            disabled={disabled}
          >
            <Eraser className="h-4 w-4 mr-1" /> Clear Page
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500 mr-2">Tools:</span>
          {tools.map((tool) => (
            <Button
              key={tool.mode}
              variant={annotationMode === tool.mode ? "default" : "outline"}
              size="sm"
              onClick={() => setAnnotationMode(tool.mode)}
              disabled={disabled}
              title={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
          <span className="text-xs font-medium text-gray-500">Style:</span>
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            disabled={disabled}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <div className="flex-1">
            <Slider
              value={penWidth}
              onValueChange={setPenWidth}
              max={20}
              min={1}
              step={1}
              disabled={disabled}
            />
          </div>
          <span className="text-xs text-gray-500 w-8 text-right">
            {penWidth[0]}px
          </span>
        </div>
      </div>
    </div>
  );
};
