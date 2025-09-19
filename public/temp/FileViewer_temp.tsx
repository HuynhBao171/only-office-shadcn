import { useState, useEffect } from "react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { FileText, ChevronUp } from "lucide-react";
import { LuSave } from "react-icons/lu";
import { Button } from "./ui/button";
import React from "react";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: "mobile" | "tablet" | "desktop";
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
}

interface DocumentPermissions {
  edit: boolean;
  comment: boolean;
  fillForms: boolean;
  download: boolean;
  print: boolean;
  copy: boolean;
  review: boolean;
  modifyFilter: boolean;
  modifyContentControl: boolean;
  chat: boolean;
  protect: boolean;
}

interface DocumentConfig {
  document: {
    fileType: string;
    key: string;
    title: string;
    url: string;
    permissions: DocumentPermissions;
  };
  documentType: string;
  editorConfig: {
    mode: string;
    lang: string;
    customization: {
      compactToolbar: boolean;
      compactHeader: boolean;
      toolbarNoTabs: boolean;
      hideRightMenu: boolean;
      hideNotes: boolean;
      hideRulers: boolean;
      comments: boolean;
      chat: boolean;
      help: boolean;
      feedback: boolean;
      plugins: boolean;
      macros: boolean;
      logo: { visible: boolean };
      close: { visible: boolean };
      review: {
        hideReviewDisplay: boolean;
        trackChanges: boolean;
        showReviewChanges: boolean;
      };
      uiTheme: string;
      toolbarHideFileName: boolean;
      hideDocumentTitleBar: boolean;
      about: boolean;
      goback: boolean;
      autosave: boolean;
      forcesave: boolean;
      // Excel specific settings
      toolbar?: {
        file?: { visible: boolean };
        home?: { visible: boolean };
        insert?: { visible: boolean };
        formulas?: { visible: boolean };
        data?: { visible: boolean };
        view?: { visible: boolean };
      };
      features?: {
        spellcheck: boolean;
        comments: boolean;
        chat: boolean;
        help: boolean;
        plugins: boolean;
        macros: boolean;
      };
    };
  };
  events: {
    onDocumentReady: () => void;
  };
  width: string;
  height: string;
  type: "mobile" | "tablet" | "desktop";
}

interface FileViewerProps {
  className?: string;
  title: string;
  files: string[];
  showEditor?: boolean;
  editorConfig?: {
    documentServerUrl: string;
    fileName: string;
    myMachineLocalIp: string;
  };
  collection: string;
}

// Device detection hook (simplified from example.js)
const useDeviceDetection = (): DeviceInfo => {
  const [device, setDevice] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: "desktop",
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isTouchDevice: false,
  });

  useEffect(() => {
    const detectDevice = (): void => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
      const isMobileUserAgent = mobileRegex.test(
        navigator.userAgent.toLowerCase()
      );

      const isMobileScreen = screenWidth <= 768;
      const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;

      const isMobile = isMobileUserAgent || (isMobileScreen && isTouchDevice);
      const isTablet = !isMobile && isTabletScreen && isTouchDevice;
      const isDesktop = !isMobile && !isTablet;

      let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
      if (isMobile) deviceType = "mobile";
      else if (isTablet) deviceType = "tablet";

      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        screenWidth,
        screenHeight,
        isTouchDevice,
      });
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  return device;
};

// Config generator (simplified from example.js)
const generateConfig = (
  device: DeviceInfo,
  documentUrl: string,
  fileName: string,
  // instanceId: string, // Add unique instance ID
  // componentTitle: string, // Add component title for more uniqueness
  collection: string
): DocumentConfig => {
  // const uniqueKey = `file_${componentTitle.replace(
  //   /\s+/g,
  //   "_"
  // )}_${instanceId}_${fileName.replace(
  //   /[^a-zA-Z0-9]/g,
  //   "_"
  // )}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const baseConfig = {
    document: {
      fileType: "xlsx",
      key: `file_${collection}_${Date.now()}`,
      // key: uniqueKey,
      title: fileName,
      url: documentUrl,
      permissions: {
        edit: true,
        comment: true,
        fillForms: false,
        download: false,
        print: false,
        copy: false,
        review: true,
        modifyFilter: false,
        modifyContentControl: false,
        chat: false,
        protect: false,
      },
    },
    documentType: "cell",
    editorConfig: {
      mode: "edit",
      lang: "en",
    },
    events: {
      onDocumentReady: () => console.log(`Document ready: ${fileName}`),
    },
  };

  return {
    ...baseConfig,
    width: "100%",
    height: "100%",
    type: device.isMobile || device.isTablet ? "mobile" : "desktop",
    editorConfig: {
      ...baseConfig.editorConfig,
      customization: {
        compactToolbar: device.isMobile,
        compactHeader: true,
        toolbarNoTabs: device.isMobile,
        hideRightMenu: true,
        hideNotes: true,
        hideRulers: true,
        comments: false,
        chat: false,
        help: false,
        feedback: false,
        plugins: false,
        macros: false,
        logo: { visible: false },
        close: { visible: false },
        review: {
          hideReviewDisplay: false,
          trackChanges: false,
          showReviewChanges: true,
        },
        uiTheme: "theme-light",
        toolbarHideFileName: true,
        hideDocumentTitleBar: true,
        about: false,
        goback: false,
        autosave: false,
        forcesave: false,
      },
    },
  };
};

const onLoadComponentError = (
  errorCode: string | number,
  errorDescription: string
): void => {
  console.error(`OnlyOffice Load Error: ${errorCode} - ${errorDescription}`);
};

export const FileViewer: React.FC<FileViewerProps> = ({
  className,
  title,
  files,
  showEditor = false,
  editorConfig,
  collection,
}) => {
  const device = useDeviceDetection();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(files[0] || "");

  // Generate unique instance ID for this component
  const instanceId = React.useMemo(() => {
    return `${title.replace(/\s+/g, "_")}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }, [title]);

  // Generate unique container ID
  const containerId = React.useMemo(() => {
    return `container_${instanceId}`;
  }, [instanceId]);

  let config: DocumentConfig | undefined;
  let documentUrl: string | undefined;

  if (showEditor && editorConfig) {
    // const testDocumentUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    // const localDocumentUrl = `${window.location.origin}/${encodeURIComponent(editorConfig.fileName)}`;

    const fileServerUrl = "http://192.168.100.116:8080";
    const fileName = editorConfig.fileName;

    const encodedFileName = encodeURIComponent(fileName);
    documentUrl = `${fileServerUrl}/files/${encodedFileName}`;
    // For testing, use the test URL first
    // documentUrl = testDocumentUrl; // Change this to localDocumentUrl once it works

    config = generateConfig(
      device,
      documentUrl,
      editorConfig.fileName,
      // instanceId,
      // title,
      collection
    );
  }

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const handleSave = () => {
    console.log("FileViewer 저장 버튼 클릭");
    // Add save functionality here
  };

  return (
    <div className={`flex flex-col gap-6 ${className || ""}`}>
      {/* Header with File List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1"
            >
              <ChevronUp
                className={`w-4 h-4 transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {!isCollapsed && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileSelect(file)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
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

      {/* OnlyOffice Document Editor - Only show if enabled */}
      {showEditor && editorConfig && (
        <div className="bg-white border border-gray-200 rounded-lg flex-1 overflow-hidden">
          <div id={containerId} className="h-full">
            <DocumentEditor
              id={`documetEditor_${title.replace(/\s+/g, "_")}`}
              documentServerUrl={editorConfig.documentServerUrl}
              config={config}
              onLoadComponentError={onLoadComponentError}
              type={device.isMobile || device.isTablet ? "mobile" : "desktop"}
              width="100%"
              height="100%"
            />
          </div>
        </div>
      )}

      {/* Save Button below DocumentEditor - Only show if editor is enabled */}
      {showEditor && editorConfig && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="px-8 py-2 min-w-40"
          >
            <LuSave className="mr-2" /> 저장
          </Button>
        </div>
      )}
    </div>
  );
};
