import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NAVIGATION_ITEMS } from '../../config/navigation.config';

export const MainLayout: React.FC = () => {
  // Default is collapsed (true) - slim 72px rail
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const location = useLocation();

  // Collapse sidebar overlay automatically when route changes
  useEffect(() => {
    setIsCollapsed(true);
  }, [location.pathname]);

  // Find active title from navigation items
  const activeNavItem = NAVIGATION_ITEMS.find((item) => item.path === location.pathname);
  const title = activeNavItem ? activeNavItem.title : 'Material Management';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Slim 72px Rail / Floating 280px Overlay Drawer */}
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed((prev) => !prev)} />

      {/* Main Content Area - Constant 72px left offset, zero layout shift when sidebar opens/closes */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '72px',
          width: 'calc(100% - 72px)',
        }}
      >
        <Header title={title} />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
