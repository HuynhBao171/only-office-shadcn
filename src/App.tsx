import { useState } from "react";
import { Header } from "./components/Header";
import { Checklist } from "./components/Checklist";

import { FloatingComments } from "./components/FloatingComments";
import { Separator } from "./components/ui/separator";
import { DocumentViewer } from "./components/DocumentViewer";

interface Comment {
  id: number;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
}

function App() {
  const [comments] = useState<Comment[]>([
    {
      id: 1,
      author: "박지훈",
      avatar: "박",
      timestamp: "2025-07-10",
      content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다",
    },
    {
      id: 2,
      author: "박지훈",
      avatar: "박",
      timestamp: "2025-07-10",
      content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다",
    },
    {
      id: 3,
      author: "박지훈",
      avatar: "박",
      timestamp: "2025-07-10",
      content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다",
    },
    {
      id: 4,
      author: "박지훈",
      avatar: "박",
      timestamp: "2025-07-10",
      content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다",
    },
    {
      id: 5,
      author: "최영희",
      avatar: "최",
      timestamp: "2025-07-10",
      content: "모든 서류가 정상적으로 업로드되었습니다.",
    },
    {
      id: 6,
      author: "이정민",
      avatar: "이",
      timestamp: "2025-07-10",
      content: "세금계산서 발행이 완료되었습니다.",
    },
    {
      id: 7,
      author: "박지훈",
      avatar: "박",
      timestamp: "2025-07-10",
      content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다",
    },
  ]);

  const mainFilesList = ["부가가치세 신고서4.xlsx", "졸업증 부가세 종료표.pdf"];
  const subFilesList = ["졸업증 부가세 종료표.xlsx", "부가가치세 신고서4.pdf"];

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <Header />

      <div className="flex-1 px-6 pt-4 pb-8">
        <div className="flex gap-6 h-full">
          <div className="flex-[1]">
            <Checklist className="h-full" />
          </div>

          <div className="flex-[2]">
            <DocumentViewer
              instanceName="MainFiles"
              title="업로드 파일 리스트 (Main)"
              initialFiles={mainFilesList}
              initialSelectedFile={mainFilesList[0]}
              documentServerUrl="http://192.168.100.116:8080/" // URL của OnlyOffice Document Server
              fileServerUrl="http://192.168.100.116:8085"
              className="h-full"
            />
          </div>

          <div className="flex items-center">
            <Separator
              orientation="vertical"
              className="h-full w-px bg-gray-200"
            />
          </div>

          <div className="flex-[2]">
            <DocumentViewer
              instanceName="SubFiles"
              title="업로드 파일 리스트 (Sub)"
              initialFiles={subFilesList}
              initialSelectedFile={subFilesList[0]}
              documentServerUrl="http://192.168.100.116:8080/" // URL của OnlyOffice Document Server
              fileServerUrl="http://192.168.100.116:8085"
              className="h-full"
            />
          </div>

          <div className="flex items-center">
            <Separator
              orientation="vertical"
              className="h-full w-px bg-gray-200"
            />
          </div>
        </div>
      </div>

      <FloatingComments comments={comments} />
    </div>
  );
}

export default App;
