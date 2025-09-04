// src/layout/MainContent.tsx
import { type ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50 scrollbar-thin transition-colors">
      {children}
    </div>
  );
};

export default MainContent;
