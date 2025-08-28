import { Settings, User, LogOut, BarChart3, Users, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "إلى اللقاء!",
      });
    }
  };

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">        
        {/* App Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold font-arabic text-emerald-700">
            تطبيق حفظ القرآن
          </h1>
          <p className="text-xs text-muted-foreground font-arabic">طريقك لحفظ كلام الله</p>
        </div>
        
        {/* User Profile Dropdown */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="text-sm text-foreground font-arabic text-right">
                    <p className="font-semibold text-gray-900">{user.user_metadata?.display_name || 'أحمد محمد'}</p>
                    <p className="text-xs text-muted-foreground">ولي أمر</p>
                  </div>
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-blue-500">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg">
                <DropdownMenuItem className="flex items-center gap-3 p-4 cursor-pointer hover:bg-blue-50">
                  <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="font-arabic text-right flex-1">
                    <p className="font-medium text-gray-900">المعلومات الشخصية</p>
                    <p className="text-xs text-muted-foreground">إدارة الملف الشخصي</p>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center gap-3 p-4 cursor-pointer hover:bg-green-50">
                  <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="font-arabic text-right flex-1">
                    <p className="font-medium text-gray-900">ملفات الأطفال</p>
                    <p className="text-xs text-muted-foreground">إدارة حسابات الأطفال</p>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center gap-3 p-4 cursor-pointer hover:bg-purple-50">
                  <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="font-arabic text-right flex-1">
                    <p className="font-medium text-gray-900">تقدم التعلم</p>
                    <p className="text-xs text-muted-foreground">إحصائيات وتقارير</p>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50">
                  <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                    <Cog className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="font-arabic text-right flex-1">
                    <p className="font-medium text-gray-900">الإعدادات</p>
                    <p className="text-xs text-muted-foreground">تخصيص التطبيق</p>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-red-50 text-red-600"
                >
                  <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="font-arabic text-right flex-1">
                    <p className="font-medium">تسجيل الخروج</p>
                    <p className="text-xs text-red-400">إنهاء الجلسة الحالية</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};