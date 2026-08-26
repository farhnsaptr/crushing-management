import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NAVIGATION_ITEMS } from '../../config/navigation.config';

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = useLocation();

  // Find active title from navigation items
  const activeNavItem = NAVIGATION_ITEMS.find((item) => item.path === location.pathname);
  const title = activeNavItem ? activeNavItem.title : 'Material Management';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Dynamic Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed((prev) => !prev)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
