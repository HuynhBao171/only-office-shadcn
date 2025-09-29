import type { IConfig } from "@onlyoffice/document-editor-react";

/**
 * Tạo một đối tượng cấu hình "sạch" (không có hàm) cho OnlyOffice Editor.
 * Các hàm xử lý sự kiện sẽ được thêm vào bên trong iframe host.
 * @param documentUrl - URL mà Document Server có thể truy cập để tải file.
 * @param fileName - Tên file để hiển thị và dùng trong callback.
 * @param instanceName - Tên định danh cho instance (ví dụ: "MainFiles").
 * @param backendUrl - URL của backend server chứa endpoint /api/save.
 * @returns Một đối tượng cấu hình IConfig.
 */
export const generateEditorConfig = (
  documentUrl: string,
  fileName: string,
  instanceName: "MainFiles" | "SubFiles",
  backendUrl: string
): IConfig => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);

  // Key duy nhất cho mỗi phiên làm việc để vô hiệu hóa co-editing
  const uniqueKey = `${instanceName}_${fileName.replace(
    /[^a-zA-Z0-9]/g,
    "_"
  )}_${timestamp}_${randomId}`;

  const config: IConfig = {
    document: {
      fileType: "xlsx",
      key: uniqueKey,
      title: `${instanceName} - ${fileName}`,
      url: documentUrl,
      permissions: {
        edit: true,
        comment: false,
        fillForms: true,
        download: false,
        print: false,
        copy: true,
        review: false,
        modifyFilter: true,
        modifyContentControl: true,
        chat: false,
        protect: false,
      },
    },
    documentType: "cell",
    editorConfig: {
      mode: "edit",
      lang: "en",
      user: {
        id: `${instanceName.toLowerCase()}_user_${randomId}`,
        name: `${instanceName} User ${randomId}`,
      },
      // URL mà OnlyOffice Server sẽ gọi lại khi lưu file
      callbackUrl: `${backendUrl}/api/save?fileName=${encodeURIComponent(
        fileName
      )}`,
      customization: {
        compactHeader: true,
        chat: false,
        comments: false,
        help: false,
        feedback: false,
        logo: { visible: false },
        hideNotes: true,
        hideRightMenu: true,
        hideRulers: true,
        toolbarNoTabs: true,
        review: {
          hideReviewDisplay: true,
          trackChanges: false,
          showReviewChanges: false,
        },
        uiTheme: "theme-light",
        toolbarHideFileName: false,
        // hideDocumentTitleBar: false,
        goback: false,
        autosave: true,
        // Bật forcesave để đảm bảo callback luôn được gọi khi có lệnh
        forcesave: true,
      },
    },
    width: "100%",
    height: "100%",
  };

  return config;
};
