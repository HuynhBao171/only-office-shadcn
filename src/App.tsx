import { useState } from "react";
import { Header } from "./components/Header";
import { Checklist } from "./components/Checklist";
import { MainFiles } from "./components/MainFiles";
import { SubFiles } from "./components/SubFiles";
import { FloatingComments } from "./components/FloatingComments";
import { Separator } from "./components/ui/separator";

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

  return (
    <div className="flex flex-col h-screen bg-white relative">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 px-6 pt-4 pb-8">
        <div className="flex gap-6 h-full">
          {/* Checklist Column - 1/2 width of MainFiles */}
          <div className="flex-[1]">
            <Checklist className="h-full" />
          </div>

          {/* MainFiles Column - Full width */}
          <div className="flex-[2]">
            <MainFiles className="h-full" />
          </div>

          {/* Separator between MainFiles and SubFiles */}
          <div className="flex items-center">
            <Separator
              orientation="vertical"
              className="h-full w-px bg-gray-200"
            />
          </div>

          {/* SubFiles Column - Same width as MainFiles */}
          <div className="flex-[2]">
            <SubFiles className="h-full" />
          </div>

          {/* Right Separator */}
          <div className="flex items-center">
            <Separator
              orientation="vertical"
              className="h-full w-px bg-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Floating Comments Component - Read Only */}
      <FloatingComments comments={comments} />
    </div>
  );
}

export default App;
