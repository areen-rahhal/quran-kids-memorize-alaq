import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Database } from '@/integrations/supabase/types';

type ChildProfile = Database['public']['Tables']['child_profiles']['Row'];

interface ChildProfileSwitcherProps {
  children: ChildProfile[];
  selectedChild: ChildProfile | null;
  onSelectChild: (child: ChildProfile) => void;
  loading?: boolean;
}

export const ChildProfileSwitcher = ({
  children,
  selectedChild,
  onSelectChild,
  loading = false
}: ChildProfileSwitcherProps) => {
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
        <div className="w-8 h-8 bg-emerald-200 rounded-full animate-pulse" />
        <span className="text-sm font-arabic text-emerald-700">جارٍ التحميل...</span>
      </div>
    );
  }

  if (!selectedChild || children.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
        <User className="h-4 w-4 text-emerald-700" />
        <span className="text-sm font-arabic text-emerald-700">لا يوجد طفل</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full border-2 border-emerald-300 h-auto"
        >
          <Avatar className="w-8 h-8 border-2 border-emerald-400">
            <AvatarImage src={selectedChild.avatar_url || undefined} />
            <AvatarFallback className="bg-white text-emerald-600 text-xs font-bold">
              {selectedChild.first_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-arabic text-emerald-700 font-medium">
            {selectedChild.first_name}
          </span>
          <ChevronDown className="h-3 w-3 text-emerald-700" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg z-50"
      >
        {children.map((child) => (
          <DropdownMenuItem
            key={child.id}
            onClick={() => {
              onSelectChild(child);
              setOpen(false);
            }}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
              selectedChild.id === child.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
            }`}
          >
            <Avatar className="w-10 h-10 border-2 border-gray-200">
              <AvatarImage src={child.avatar_url || undefined} />
              <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">
                {child.first_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-gray-900 font-arabic">
                {child.first_name}
              </div>
              <div className="text-xs text-gray-500 font-arabic">
                {child.age} سنوات • {child.child_level === 'beginner' ? 'مبتدئ' : 
                 child.child_level === 'intermediate' ? 'متوسط' : 'متقدم'}
              </div>
            </div>
            {selectedChild.id === child.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};