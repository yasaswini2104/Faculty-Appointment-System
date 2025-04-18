
import React from 'react';
import Header from './Header';
import SideNavigation from './SideNavigation';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        {user && <SideNavigation />}
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="university-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
