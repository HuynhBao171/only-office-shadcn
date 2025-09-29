import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";

interface ChecklistItem {
  id: number;
  title: string;
  checked: boolean;
}

interface ChecklistProps {
  className?: string;
}

export const Checklist: React.FC<ChecklistProps> = ({ className }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: "전자세금계산서/세금계산서 후폐업 거래처 확인 여부",
      checked: true,
    },
    { id: 2, title: "현금영수증/세금계산서/계산서 발급 여부", checked: true },
    { id: 3, title: "매입세금계산서/계산서 합계표 제출 여부", checked: true },
    { id: 4, title: "공통매입세액 안분 여부 확인", checked: false },
    {
      id: 5,
      title: "고객지식 확인 필요 자료 거래처 체크 여부",
      checked: false,
    },
    {
      id: 6,
      title: "고객지식 확인 필요 자료 거래처 체크 여부",
      checked: false,
    },
    {
      id: 7,
      title: "매출세금계산서 합계표 확인 여부 (부분도 체크)",
      checked: false,
    },
    {
      id: 8,
      title: "신카드매입세액 합계표 제출 여부 (10건 체크",
      checked: false,
    },
    {
      id: 9,
      title: "고객지식 확인 필요 자료 거래처 체크 여부",
      checked: false,
    },
    {
      id: 10,
      title: "매입자발행세금계산서 합계표 제출 여부 확인 여부",
      checked: false,
    },
    {
      id: 11,
      title: "전자세금계산서 발급 건 중 가산세 적용 여부 확인",
      checked: false,
    },
    { id: 12, title: "사업자등록증사본 작성 여부", checked: false },
  ]);

  const handleCheckboxChange = (itemId: number, checked: boolean) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked } : item))
    );
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg flex flex-col ${
        className || ""
      }`}
    >
      {/* Header - Fixed height */}
      <div className="p-4 bg-gray-50 rounded-t-lg flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">
          (선택된 목록 EX) 원전세 체크리스트
        </h3>
      </div>

      {/* Content - Flexible height */}
      <div className="flex-1 p-4 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`checkbox-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(item.id, checked as boolean)
                  }
                  className="mt-0.5 flex-shrink-0"
                />
                <label
                  htmlFor={`checkbox-${item.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <span className="text-sm font-medium text-gray-700 leading-relaxed">
                    {item.title}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
