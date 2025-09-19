import React, { useState, useEffect } from "react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";

const onLoadComponentError = (errorCode, errorDescription) => {
  console.error(`--- ONLYOFFICE LOAD ERROR ---
    Error Code: ${errorCode}
    Description: ${errorDescription}
    -----------------------------`);
  alert(
    `Could not load document editor. Error code: ${errorCode}. Please check the console for details.`
  );
};

const onDocumentReady = () => {
  console.log("SUCCESS: Document Editor is loaded and ready.");
};

// === DEVICE DETECTION UTILITIES ===
const useDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: "desktop",
    userAgent: "",
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isTouchDevice: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Touch device detection
      const isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;

      // Mobile detection
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
      const isMobileUserAgent = mobileRegex.test(userAgent);

      // Screen size detection
      const isMobileScreen = screenWidth <= 768;
      const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;

      // Combined mobile detection
      const isMobile = isMobileUserAgent || (isMobileScreen && isTouchDevice);
      const isTablet = !isMobile && isTabletScreen && isTouchDevice;
      const isDesktop = !isMobile && !isTablet;

      let deviceType = "desktop";
      if (isMobile) deviceType = "mobile";
      else if (isTablet) deviceType = "tablet";

      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        userAgent,
        screenWidth,
        screenHeight,
        isTouchDevice,
      });

      console.log("--- DEVICE DETECTION ---");
      console.log("Device Type:", deviceType);
      console.log("Screen Size:", `${screenWidth}x${screenHeight}`);
      console.log("Touch Device:", isTouchDevice);
      console.log("User Agent:", userAgent);
      console.log("Is Mobile:", isMobile);
      console.log("Is Tablet:", isTablet);
      console.log("Is Desktop:", isDesktop);
      console.log("----------------------");
    };

    detectDevice();

    // Re-detect on window resize
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return device;
};

// === CONFIGURATION GENERATOR ===
const generateConfig = (device, documentUrl, fileName) => {
  // Base configuration
  const baseConfig = {
    document: {
      fileType: "xlsx",
      key: "file_" + Date.now(),
      title: fileName,
      url: documentUrl,
      permissions: {
        edit: true,
        comment: false,
        fillForms: false,
        download: false,
        print: false,
        copy: false,
        review: false,
        modifyFilter: true,
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
      onDocumentReady: onDocumentReady,
    },
  };

  // Mobile/Tablet configuration
  if (device.isMobile || device.isTablet) {
    return {
      ...baseConfig,
      width: "100%",
      height: "100%",
      type: "mobile", // Force mobile interface
      editorConfig: {
        ...baseConfig.editorConfig,
        customization: {
          // === MOBILE OPTIMIZED SETTINGS ===
          mobile: {
            forceView: true, // Force mobile view
            info: false, // Hide info panel
            standardView: false, // Use mobile view
          },

          // === COMPACT UI FOR MOBILE ===
          compactToolbar: true, // Compact toolbar
          compactHeader: true, // Compact header
          toolbarNoTabs: device.isMobile, // Hide tabs on mobile only
          toolbarHideFileName: true, // Hide filename

          // === HIDE NON-ESSENTIAL ELEMENTS ===
          comments: false,
          chat: false,
          help: false,
          feedback: false,
          hideRightMenu: true, // Hide format panel
          hideNotes: true,
          hideRulers: true,
          plugins: false,
          macros: false,
          mentionShare: false,

          // === TOUCH OPTIMIZED ===
          features: {
            spellcheck: false,
            chat: false,
            comments: false,
            help: false,
            plugins: false,
            macros: false,
          },

          // === MOBILE SPECIFIC SETTINGS ===
          forcesave: false,
          autosave: false,
          zoom: device.isMobile ? 75 : 85, // Smaller zoom for mobile

          // === UI CUSTOMIZATION ===
          anonymous: {
            request: false,
            label: device.isMobile ? "Mobile User" : "Tablet User",
          },

          logo: {
            visible: false,
          },

          close: {
            visible: false,
          },

          review: {
            hideReviewDisplay: true,
            trackChanges: false,
            showReviewChanges: false,
          },

          // === SCROLLBARS ===
          showHorizontalScroll: true,
          showVerticalScroll: true,

          // === TOUCH INTERFACE ===
          pointerMode: "select",
          integrationMode: "embed",
          uiTheme: "default",
        },
      },
    };
  }

  // Desktop configuration
  return {
    ...baseConfig,
    width: "100%",
    height: "100%",
    type: "desktop", // Desktop interface
    editorConfig: {
      ...baseConfig.editorConfig,
      customization: {
        // === DESKTOP OPTIMIZED SETTINGS ===
        compactToolbar: false, // Full toolbar
        compactHeader: false, // Full header
        toolbarNoTabs: false, // Show all tabs
        toolbarHideFileName: false, // Show filename

        // === FULL FEATURE SET ===
        comments: false, // Still hide non-essential
        chat: false,
        help: true, // Show help on desktop
        feedback: true, // Show feedback
        hideRightMenu: false, // Show format panel
        hideNotes: false,
        hideRulers: false,
        plugins: true, // Enable plugins
        macros: false,
        mentionShare: false,

        // === DESKTOP FEATURES ===
        features: {
          spellcheck: true, // Enable spellcheck
          chat: false,
          comments: false,
          help: true,
          plugins: true,
          macros: false,
        },

        // === SAVE SETTINGS ===
        forcesave: true,
        autosave: true,
        zoom: 100, // Normal zoom

        // === USER SETTINGS ===
        anonymous: {
          request: false,
          label: "Desktop User",
        },

        logo: {
          visible: false, // Hide logo
        },

        close: {
          visible: false,
        },

        review: {
          hideReviewDisplay: false,
          trackChanges: false,
          showReviewChanges: false,
        },

        // === SCROLLBARS ===
        showHorizontalScroll: true,
        showVerticalScroll: true,

        // === DESKTOP INTERFACE ===
        pointerMode: "select",
        integrationMode: "embed",
        uiTheme: "default",
      },
    },
  };
};

export default function App() {
  const device = useDeviceDetection();
  const [isLoading, setIsLoading] = useState(true);

  const documentServerUrl = "http://192.168.100.45:8080/";
  const myMachineLocalIp = "192.168.1.19";
  const fileName = "non-papaer.xlsx";

  const encodedFileName = encodeURIComponent(fileName);
  const documentUrl = `http://${myMachineLocalIp}:3000/files/${encodedFileName}`;

  // Generate config based on device
  const config = generateConfig(device, documentUrl, fileName);

  useEffect(() => {
    // Simulate loading time for device detection
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0f0f0",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
        <p>Detecting device and loading OnlyOffice...</p>
        <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Device Info Banner (removable in production) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: device.isMobile
            ? "#e74c3c"
            : device.isTablet
            ? "#f39c12"
            : "#27ae60",
          color: "white",
          padding: "5px 10px",
          fontSize: "12px",
          zIndex: 9999,
          textAlign: "center",
        }}
      >
        {device.deviceType.toUpperCase()} - {device.screenWidth}x
        {device.screenHeight}
        {device.isTouchDevice ? " (Touch)" : " (Mouse)"} -
        {device.isMobile
          ? " Mobile UI"
          : device.isTablet
          ? " Tablet UI"
          : " Desktop UI"}
      </div>

      {/* Main App Container */}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          paddingTop: device.isMobile || device.isTablet ? "25px" : "30px", // Account for banner
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <DocumentEditor
          id={`${device.deviceType}ExcelEditor`}
          documentServerUrl={documentServerUrl}
          config={config}
          onLoadComponentError={onLoadComponentError}
          type={device.isMobile || device.isTablet ? "mobile" : "desktop"}
          width="100%"
          height={`calc(100vh - ${
            device.isMobile || device.isTablet ? "25px" : "30px"
          })`}
        />
      </div>
    </>
  );
}
