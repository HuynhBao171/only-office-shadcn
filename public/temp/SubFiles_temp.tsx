// import React, { useState, useEffect } from "react";
// import { DocumentEditor } from "@onlyoffice/document-editor-react";
// import { FileText, ChevronUp } from "lucide-react";
// import { LuSave } from "react-icons/lu";
// import { Button } from "./ui/button";

// interface SubFilesProps {
//   className?: string;
// }

// interface DeviceInfo {
//   isMobile: boolean;
//   isTablet: boolean;
//   isDesktop: boolean;
//   deviceType: "mobile" | "tablet" | "desktop";
//   screenWidth: number;
//   screenHeight: number;
//   isTouchDevice: boolean;
// }

// interface DocumentPermissions {
//   edit: boolean;
//   comment: boolean;
//   fillForms: boolean;
//   download: boolean;
//   print: boolean;
//   copy: boolean;
//   review: boolean;
//   modifyFilter: boolean;
//   modifyContentControl: boolean;
//   chat: boolean;
//   protect: boolean;
// }

// interface DocumentConfig {
//   document: {
//     fileType: string;
//     key: string;
//     title: string;
//     url: string;
//     permissions: DocumentPermissions;
//   };
//   documentType: string;
//   editorConfig: {
//     mode: string;
//     lang: string;
//     customization: {
//       compactToolbar: boolean;
//       compactHeader: boolean;
//       toolbarNoTabs: boolean;
//       hideRightMenu: boolean;
//       hideNotes: boolean;
//       hideRulers: boolean;
//       comments: boolean;
//       chat: boolean;
//       help: boolean;
//       feedback: boolean;
//       plugins: boolean;
//       macros: boolean;
//       logo: { visible: boolean };
//       close: { visible: boolean };
//       review: {
//         hideReviewDisplay: boolean;
//         trackChanges: boolean;
//         showReviewChanges: boolean;
//       };
//       uiTheme: string;
//       toolbarHideFileName: boolean;
//       hideDocumentTitleBar: boolean;
//       about: boolean;
//       goback: boolean;
//       autosave: boolean;
//       forcesave: boolean;
//     };
//   };
//   events: {
//     onDocumentReady: () => void;
//   };
//   width: string;
//   height: string;
//   type: "mobile" | "tablet" | "desktop";
// }

// // Device detection hook for SubFiles
// const useSubFilesDeviceDetection = (): DeviceInfo => {
//   const [device, setDevice] = useState<DeviceInfo>({
//     isMobile: false,
//     isTablet: false,
//     isDesktop: true,
//     deviceType: "desktop",
//     screenWidth: window.innerWidth,
//     screenHeight: window.innerHeight,
//     isTouchDevice: false,
//   });

//   useEffect(() => {
//     const detectDevice = (): void => {
//       const screenWidth = window.innerWidth;
//       const screenHeight = window.innerHeight;

//       const isTouchDevice =
//         "ontouchstart" in window || navigator.maxTouchPoints > 0;

//       const mobileRegex =
//         /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
//       const isMobileUserAgent = mobileRegex.test(
//         navigator.userAgent.toLowerCase()
//       );

//       const isMobileScreen = screenWidth <= 768;
//       const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;

//       const isMobile = isMobileUserAgent || (isMobileScreen && isTouchDevice);
//       const isTablet = !isMobile && isTabletScreen && isTouchDevice;
//       const isDesktop = !isMobile && !isTablet;

//       let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
//       if (isMobile) deviceType = "mobile";
//       else if (isTablet) deviceType = "tablet";

//       setDevice({
//         isMobile,
//         isTablet,
//         isDesktop,
//         deviceType,
//         screenWidth,
//         screenHeight,
//         isTouchDevice,
//       });
//     };

//     detectDevice();
//     window.addEventListener("resize", detectDevice);
//     return () => window.removeEventListener("resize", detectDevice);
//   }, []);

//   return device;
// };

// // Config generator for SubFiles với enhanced isolation
// const generateSubFilesConfig = (
//   device: DeviceInfo,
//   documentUrl: string,
//   fileName: string
// ): DocumentConfig => {
//   // Create completely unique key with timestamp and random components
//   const timestamp = Date.now();
//   const randomId = Math.random().toString(36).substr(2, 12);
//   const uniqueKey = `SUBFILES_ISOLATED_${fileName.replace(
//     /[^a-zA-Z0-9]/g,
//     "_"
//   )}_${timestamp}_${randomId}`;

//   const baseConfig = {
//     document: {
//       fileType: "xlsx",
//       key: uniqueKey, // Enhanced unique key
//       title: `SubFiles_${randomId} - ${fileName}`, // More unique title
//       url: documentUrl,
//       permissions: {
//         edit: true,
//         comment: false, // Disable comments to prevent sync
//         fillForms: false,
//         download: false,
//         print: false,
//         copy: false,
//         review: false, // Disable review to prevent sync
//         modifyFilter: true,
//         modifyContentControl: false,
//         chat: false,
//         protect: false,
//       },
//     },
//     documentType: "cell",
//     editorConfig: {
//       mode: "edit",
//       lang: "en", // Different language from MainFiles
//       // Add user isolation
//       user: {
//         id: `subfiles_user_${randomId}`,
//         name: `SubFiles User ${randomId}`,
//         group: "subfiles_group",
//       },
//     },
//     events: {
//       onDocumentReady: () => {
//         console.log(
//           `🟢 SubFiles Document ready: ${fileName} (Key: ${uniqueKey})`
//         );

//         // Additional isolation after document ready
//         setTimeout(() => {
//           const subFilesContainer = document.getElementById(
//             `subFilesEditor_${randomId}`
//           );
//           if (subFilesContainer) {
//             // Add data attributes for isolation
//             subFilesContainer.setAttribute("data-instance", "subfiles");
//             subFilesContainer.setAttribute("data-isolated", "true");
//           }
//         }, 1000);
//       },
//       onDocumentStateChange: (event: unknown) => {
//         console.log(`🟢 SubFiles state change (${uniqueKey}):`, event);
//       },
//     },
//   };

//   return {
//     ...baseConfig,
//     width: "100%",
//     height: "100%",
//     type: device.isMobile || device.isTablet ? "mobile" : "desktop",
//     editorConfig: {
//       ...baseConfig.editorConfig,
//       customization: {
//         compactToolbar: device.isMobile,
//         compactHeader: true,
//         toolbarNoTabs: device.isMobile,
//         hideRightMenu: false,
//         hideNotes: true, // Hide notes to prevent sync
//         hideRulers: false,
//         comments: false, // Disable comments
//         chat: false,
//         help: false,
//         feedback: false,
//         plugins: false, // Disable plugins that might cause sync
//         macros: false, // Disable macros to prevent sync
//         logo: { visible: false },
//         close: { visible: false },
//         review: {
//           hideReviewDisplay: true, // Hide review
//           trackChanges: false,
//           showReviewChanges: false,
//         },
//         uiTheme: "theme-light",
//         toolbarHideFileName: false,
//         hideDocumentTitleBar: false,
//         about: false,
//         goback: false,
//         autosave: false, // Critical: Disable autosave
//         forcesave: false, // Critical: Disable force save

//         // Enhanced isolation settings
//         anonymous: {
//           request: false,
//           label: `SubFiles_${randomId}`,
//         },

//         // Disable collaboration completely
//         coAuthoring: {
//           mode: false,
//           change: false,
//           chat: false,
//           comments: false,
//         },

//         // Disable real-time collaboration
//         collaboration: {
//           mode: false,
//         },

//         // Force offline mode
//         integrationMode: "embed",
//       },
//     },
//   };
// };

// const onSubFilesLoadComponentError = (
//   errorCode: string | number,
//   errorDescription: string
// ): void => {
//   console.error(
//     `SubFiles OnlyOffice Load Error: ${errorCode} - ${errorDescription}`
//   );
// };

// export const SubFiles: React.FC<SubFilesProps> = ({ className }) => {
//   const device = useSubFilesDeviceDetection();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [selectedFile, setSelectedFile] = useState("졸업증 부가세 종료표.xlsx");

//   // SubFiles specific data
//   const files = ["부가가치세 신고서4.xlsx", "졸업증 부가세 종료표.xlsx"];
//   const title = "업로드 파일 리스트";

//   // SubFiles specific config with different file
//   const editorConfig = {
//     documentServerUrl: "http://192.168.100.116:8080/",
//     fileName: "졸업증 부가세 종료표.xlsx", // Different file from MainFiles
//     myMachineLocalIp: "192.168.100.116",
//   };

//   // Generate unique instance ID with more randomness
//   const instanceId = React.useMemo(() => {
//     const timestamp = Date.now();
//     const randomPart = Math.random().toString(36).substr(2, 12);
//     return `SubFiles_${timestamp}_${randomPart}`;
//   }, []);

//   // Generate document URL
//   const fileServerUrl = "http://192.168.100.116:8080";
//   const encodedFileName = encodeURIComponent(editorConfig.fileName);
//   const documentUrl = `${fileServerUrl}/files/${encodedFileName}`;

//   // Generate config
//   const config = generateSubFilesConfig(
//     device,
//     documentUrl,
//     editorConfig.fileName
//   );

//   const handleFileSelect = (fileName: string) => {
//     setSelectedFile(fileName);
//     console.log(`SubFiles selected: ${fileName}`);
//   };

//   const handleSave = () => {
//     console.log(`SubFiles 저장 버튼 클릭 - Instance: ${instanceId}`);
//     // SubFiles specific save logic
//   };

//   console.log(`SubFiles config generated:`, {
//     instanceId,
//     documentKey: config.document.key,
//     documentUrl,
//   });

//   return (
//     <div className={`flex flex-col gap-6 ${className || ""}`}>
//       {/* SubFiles Header with File List */}
//       <div className="bg-white border border-gray-200 rounded-lg">
//         <div className="p-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setIsCollapsed(!isCollapsed)}
//               className="p-1"
//             >
//               <ChevronUp
//                 className={`w-4 h-4 transition-transform duration-300 ${
//                   isCollapsed ? "rotate-180" : ""
//                 }`}
//               />
//             </Button>
//           </div>

//           {!isCollapsed && (
//             <div className="mt-3 space-y-2">
//               {files.map((file, index) => (
//                 <div
//                   key={index}
//                   onClick={() => handleFileSelect(file)}
//                   className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
//                     selectedFile === file ? "bg-gray-100" : "hover:bg-gray-50"
//                   }`}
//                 >
//                   <FileText className="w-4 h-4 text-gray-500" />
//                   <span className="text-sm text-gray-700">{file}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* SubFiles OnlyOffice Document Editor */}
//       <div className="bg-white border border-gray-200 rounded-lg flex-1 overflow-hidden">
//         <div className="h-full" style={{ minHeight: "600px" }}>
//           <DocumentEditor
//             id={`subFilesEditor_${instanceId}`} // Unique ID for SubFiles
//             documentServerUrl={editorConfig.documentServerUrl}
//             config={config}
//             onLoadComponentError={onSubFilesLoadComponentError}
//             type={device.isMobile || device.isTablet ? "mobile" : "desktop"}
//             width="100%"
//             height="100%"
//           />
//         </div>
//       </div>

//       {/* SubFiles Save Button */}
//       <div className="flex justify-end">
//         <Button
//           onClick={handleSave}
//           variant="outline"
//           size="sm"
//           className="px-8 py-2 min-w-40"
//         >
//           <LuSave className="mr-2" /> 저장
//         </Button>
//       </div>
//     </div>
//   );
// };
