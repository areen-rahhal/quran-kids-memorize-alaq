import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في تطبيق حفظ القرآن",
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast({
            title: "خطأ في إنشاء الحساب",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "يرجى التحقق من بريدك الإلكتروني",
          });
        }
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute -top-24 -left-16 w-60 h-60 rounded-full bg-emerald-100 opacity-35 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 right-0 w-56 h-56 rounded-full bg-amber-100 opacity-40 blur-2xl pointer-events-none" />
      
      <Card className="w-full max-w-md p-6 bg-white shadow-xl border-emerald-200 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            تطبيق حفظ القرآن
          </h1>
          <p className="text-muted-foreground font-arabic">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-arabic">الاسم</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="أدخل اسمك"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
                className="text-right"
                dir="rtl"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="font-arabic">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-left"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-arabic">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-left"
              dir="ltr"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
            disabled={isLoading}
          >
            {isLoading ? 'جارٍ التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="font-arabic text-emerald-600 hover:text-emerald-700"
          >
            {isLogin ? 'إنشاء حساب جديد' : 'لديك حساب؟ سجل دخولك'}
          </Button>
        </div>

        {/* Test user info */}
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700 font-arabic">
              <p className="font-semibold mb-1">حساب تجريبي:</p>
              <p>البريد: mohammad@example.com</p>
              <p>كلمة المرور: A123456</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;