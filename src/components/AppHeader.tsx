import { Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppHeader = () => {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Settings Icon */}
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </Button>
        
        {/* App Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold font-arabic text-emerald-700">
            تطبيق حفظ القرآن
          </h1>
          <p className="text-xs text-gray-500 font-arabic">طريقك لحفظ كلام الله</p>
        </div>
        
        {/* Profile Icon */}
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};