import { LuMessageSquareText } from "react-icons/lu";
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent } from './ui/card'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'
import { ScrollArea } from './ui/scroll-area'

interface Comment {
  id: number
  author: string
  avatar: string
  timestamp: string
  content: string
}

interface FloatingCommentsProps {
  comments?: Comment[]
}

const defaultComments: Comment[] = [
  {
    id: 1,
    author: "박지훈",
    avatar: "박",
    timestamp: "2025-07-10",
    content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다"
  },
  {
    id: 2,
    author: "김민수", 
    avatar: "김",
    timestamp: "2025-07-10",
    content: "문서 검토가 완료되었습니다. 승인 처리 진행해주세요."
  },
  {
    id: 3,
    author: "이수진",
    avatar: "이", 
    timestamp: "2025-07-10",
    content: "부가세 신고서 내용에 오타가 있는 것 같습니다. 다시 한번 확인 부탁드립니다."
  },
  {
    id: 4,
    author: "최영희",
    avatar: "최",
    timestamp: "2025-07-10", 
    content: "모든 서류가 정상적으로 업로드되었습니다."
  },
  {
    id: 5,
    author: "이정민",
    avatar: "이",
    timestamp: "2025-07-10",
    content: "세금계산서 발행이 완료되었습니다."
  },
  {
    id: 6,
    author: "박지훈",
    avatar: "박",
    timestamp: "2025-07-10",
    content: "전자세금계산서/세금계산서 거래처 상태를 확인했습니다"
  }
]

// Mock avatar images for demo
const mockAvatars = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
]

export const FloatingComments: React.FC<FloatingCommentsProps> = ({ 
  comments = defaultComments
}) => {
  return (
    <Popover>
      {/* Floating Trigger Button */}
      <PopoverTrigger asChild>
        <Button
            className="size-20 fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white hover:border-blue-300 text-gray-900 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
            size="icon"
        >
          <LuMessageSquareText className="w-8 h-8 transition-colors duration-300 group-hover:text-blue-600" />
        </Button>
      </PopoverTrigger>

      {/* Comments Popover Content */}
      <PopoverContent 
        className="w-80 h-[800px] p-0 mr-6 mb-4 flex flex-col"
        side="top"
        align="end"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            코멘트 히스토리
          </h3>
        </div>

                {/* Comments List */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-4 space-y-3 max-h-full">
            {comments.map((comment, index) => (
              <Card key={comment.id} className="bg-white border border-gray-200 shadow-s py-0">
                <CardContent className="p-3">
                  {/* Row 1: Avatar (48px) - Left aligned */}
                  <div className="flex justify-start mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={mockAvatars[index % mockAvatars.length]} 
                        alt={comment.author}
                      />
                      <AvatarFallback className="bg-blue-500 text-white text-base font-medium">
                        {comment.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Row 2: Name (bold) and DateTime - 4px gap */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp}
                    </span>
                  </div>
                  
                  {/* Row 3: Content */}
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}