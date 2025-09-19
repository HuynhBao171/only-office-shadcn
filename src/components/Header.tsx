import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Separator } from './ui/separator'
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Menu } from 'lucide-react'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <div className={`bg-white ${className || ''}`}>
      {/* Main Header */}
      <header className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-4">
            
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-gray-600 hover:text-gray-900">
                    결재 관리
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900 font-medium">
                    (선택된 업체명) (선택된 목록 EX) 원전세
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right side - User info and settings */}
          <div className="flex items-center gap-5">
            {/* User avatars */}
            <div className="flex items-center -space-x-2">
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarFallback className="bg-blue-500 text-white text-xs">박</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarFallback className="bg-green-500 text-white text-xs">김</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarFallback className="bg-purple-500 text-white text-xs">이</AvatarFallback>
              </Avatar>
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarFallback className="bg-orange-500 text-white text-xs">최</AvatarFallback>
              </Avatar>
            </div>

            {/* Settings and notifications */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">결재자 채지윤</span>
              <img 
                src="/GitCompareArrows.svg" 
                alt="Git Compare Arrows"
                className="w-5 h-5 text-gray-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <h1 className="text-xl font-semibold text-gray-900">
            (선택된 업체명) (선택된 목록 EX) 원전세
          </h1>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="bg-red-500 hover:bg-red-700 text-white px-22 py-2"
            >
              반려
            </Button>
            <Button 
              variant="outline" 
              className="bg-gray-900 hover:bg-gray-600 text-white hover:text-white px-22 py-2"
            >
              승인
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}