import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, CheckCircle } from 'lucide-react';
import type { ChildProfile } from '@/pages/OnboardingFlow';

interface ChildrenOverviewProps {
  children: ChildProfile[];
  onAddChild: () => void;
  onEditChild: (index: number) => void;
  onComplete: () => void;
}

const levelLabels = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-blue-100 text-blue-800'
};

export const ChildrenOverview = ({ children, onAddChild, onEditChild, onComplete }: ChildrenOverviewProps) => {
  const canAddMore = children.length < 5;
  const hasChildren = children.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 bg-white shadow-xl border-emerald-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700 font-arabic mb-2">
            ملفات الأطفال
          </h1>
          <p className="text-muted-foreground font-arabic text-sm">
            أضف ملفات أطفالك لبدء رحلة التعلم (حتى 5 أطفال)
          </p>
        </div>

        <div className="space-y-4">
          {/* Children List */}
          {children.map((child, index) => (
            <Card key={index} className="p-4 border border-gray-200 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={child.avatar_url} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 font-arabic">
                      {child.first_name ? child.first_name[0] : '؟'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 font-arabic">
                      {child.first_name || 'بدون اسم'}
                    </h3>
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                      <span className="text-sm text-gray-600 font-arabic">
                        {child.age} سنة
                      </span>
                      <Badge className={`text-xs font-arabic ${levelColors[child.child_level]}`}>
                        {levelLabels[child.child_level]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  {child.first_name && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditChild(index)}
                    className="font-arabic"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    {child.first_name ? 'تعديل' : 'إكمال'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Add Child Button */}
          {canAddMore && (
            <Card 
              className="p-4 border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors cursor-pointer"
              onClick={onAddChild}
            >
              <div className="text-center py-4">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-arabic">إضافة طفل جديد</p>
                <p className="text-xs text-gray-500 font-arabic mt-1">
                  ({children.length}/5 أطفال)
                </p>
              </div>
            </Card>
          )}

          {!canAddMore && (
            <div className="text-center p-4">
              <p className="text-sm text-gray-500 font-arabic">
                تم الوصول للحد الأقصى (5 أطفال)
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="font-arabic"
          >
            رجوع
          </Button>
          
          {hasChildren && (
            <Button
              onClick={onComplete}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
            >
              إنهاء الإعداد
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 font-arabic text-center">
            💡 يمكنك إضافة ملفات أطفالك الآن أو لاحقاً من الإعدادات
          </p>
        </div>
      </Card>
    </div>
  );
};