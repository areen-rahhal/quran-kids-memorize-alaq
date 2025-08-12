import { Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        {/* Settings Icon */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
        
        {/* App Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold font-arabic text-emerald-700">
            تطبيق حفظ القرآن
          </h1>
          <p className="text-xs text-muted-foreground font-arabic">طريقك لحفظ كلام الله</p>
        </div>
        
        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="text-sm text-muted-foreground font-arabic text-right mr-2">
                <p className="font-semibold">أهلاً {user.user_metadata?.display_name || 'المستخدم'}</p>
                <p className="text-xs">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
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