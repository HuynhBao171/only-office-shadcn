import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import type { IConfig } from "@onlyoffice/document-editor-react";

/**
 * Định nghĩa các hàm mà component này sẽ "phơi bày" (expose) ra cho component cha.
 * Khi component cha có ref trỏ đến wrapper này, nó có thể gọi các hàm được định nghĩa ở đây.
 */
export interface IframeWrapperRef {
  forceSave: () => void;
}

/**
 * Định nghĩa các props mà component này nhận vào từ component cha.
 */
interface OnlyOfficeIframeWrapperProps {
  config: IConfig; // Đối tượng cấu hình đầy đủ cho OnlyOffice, không chứa hàm.
  documentServerUrl: string; // URL trỏ đến Document Server đang chạy.
  onReady?: () => void; // Callback tùy chọn để báo cho cha biết editor đã sẵn sàng.
  onStateChange?: () => void; // Callback tùy chọn để báo cho cha biết nội dung đã thay đổi.
}

/**
 * OnlyOfficeIframeWrapper là một component được bọc trong `forwardRef` của React.
 * Nó render một iframe để cô lập hoàn toàn môi trường của OnlyOffice Editor,
 * đồng thời cung cấp một `ref` để component cha có thể ra lệnh và lắng nghe sự kiện từ nó.
 */
const OnlyOfficeIframeWrapper = forwardRef<
  IframeWrapperRef,
  OnlyOfficeIframeWrapperProps
>(({ config, documentServerUrl, onReady, onStateChange }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * `useImperativeHandle` được sử dụng để tùy chỉnh instance value được phơi bày
   * cho component cha khi sử dụng `ref`.
   */
  useImperativeHandle(ref, () => ({
    /**
     * Hàm `forceSave` được phơi bày ra ngoài.
     * Khi cha gọi `ref.current.forceSave()`, nó sẽ thực thi hàm bên dưới.
     */
    forceSave() {
      if (iframeRef.current?.contentWindow) {
        console.log('[React Parent] Sending "forceSave" command to iframe...');
        // Gửi một thông điệp dạng command vào iframe để yêu cầu lưu file.
        iframeRef.current.contentWindow.postMessage(
          { command: "forceSave" },
          window.location.origin
        );
      } else {
        console.error(
          "[React Parent] Iframe content window is not available to send 'forceSave' command."
        );
      }
    },
  }));

  /**
   * `useEffect` này chịu trách nhiệm gửi cấu hình ban đầu cho iframe
   * khi component được mount hoặc khi `config` thay đổi.
   */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && config) {
      const sendMessage = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { config, documentServerUrl },
            window.location.origin
          );
        }
      };
      // Đảm bảo iframe đã tải xong file `editor-host.html` rồi mới gửi message.
      iframe.onload = sendMessage;
    }
  }, [config, documentServerUrl]);

  /**
   * `useEffect` này chịu trách nhiệm lắng nghe các thông điệp ĐƯỢC GỬI TỪ iframe
   * ngược lại cho component cha (React).
   */

  useEffect(() => {
    const handleMessageFromIframe = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      // 1. Log toàn bộ message nhận được
      console.log("[React Parent] Received raw message:", event.data);

      // 2. Log key mà component này đang mong đợi
      const expectedKey = config.document?.key;
      console.log(
        `[React Parent] This instance is waiting for key: "${expectedKey}"`
      );

      // Lấy ra eventName và key từ message
      const { event: eventName, key: eventKey } = event.data;

      // 3. Kiểm tra key mismatch
      if (eventKey !== expectedKey) {
        console.warn(
          `[React Parent] Key mismatch, SKIPPING. Received key: "${eventKey}" | Expected key: "${expectedKey}"`
        );
        return;
      }

      // Xử lý các events với đúng key
      if (eventName === "editorReady") {
        console.log(
          `[React Parent] Received "editorReady" for key: ${eventKey}`
        );
        if (onReady) onReady();
      }

      if (eventName === "hasChanges") {
        console.log(
          `[React Parent] Received "hasChanges" for key: ${eventKey}`
        );
        if (onStateChange) onStateChange();
      }

      if (eventName === "saveRequested") {
        console.log(`[React Parent] Save was requested for key: ${eventKey}`);
        // Handle save response if needed
      }

      if (eventName === "editorError") {
        console.error(
          `[React Parent] Editor error for key: ${eventKey}:`,
          event.data.error
        );
      }

      if (eventName === "scriptLoadError") {
        console.error(`[React Parent] Script load error for key: ${eventKey}`);
      }
    };

    window.addEventListener("message", handleMessageFromIframe);
    return () => {
      window.removeEventListener("message", handleMessageFromIframe);
    };
  }, [onReady, onStateChange, config.document?.key]);

  return (
    <iframe
      ref={iframeRef}
      src="/editor-host.html" // Trỏ đến file HTML host trong thư mục /public
      style={{ width: "100%", height: "100%", border: "none" }}
      title={`onlyoffice-editor-${config.document?.key}`} // Title duy nhất cho accessibility
    />
  );
});

export default OnlyOfficeIframeWrapper;
