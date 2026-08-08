import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { ContentWrapper } from '../components/layout/ContentWrapper.jsx';
import { CommandPalette } from '../components/layout/CommandPalette.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut to launch Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation Header (72px height) */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Body Area: Sidebar + Content Canvas */}
      <div className="flex flex-1 w-full">
        {/* Responsive Sidebar (260px expanded / 80px collapsed / Mobile Bottom Bar) */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Dynamic Content Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <ContentWrapper>
            <Outlet />
          </ContentWrapper>
          <Footer />
        </div>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
