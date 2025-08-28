import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <AppHeader />
      <main>
        {children}
      </main>
    </div>
  );
};