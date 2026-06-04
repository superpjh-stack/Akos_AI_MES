"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

// ---------------------------------------------------------------------------
// LayoutContext
// ---------------------------------------------------------------------------

interface LayoutContextValue {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  sidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export const useLayout = () => useContext(LayoutContext);

// ---------------------------------------------------------------------------
// PageCard — lightweight card wrapper used by page-level content
// ---------------------------------------------------------------------------

interface PageCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  actions?: ReactNode;
}

export function PageCard({ title, subtitle, children, className = "", noPadding, actions }: PageCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm border border-gray-100 p-6 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MainLayout
// ---------------------------------------------------------------------------

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <LayoutContext.Provider
      value={{ sidebarOpen, openSidebar, closeSidebar, toggleSidebar }}
    >
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* ----------------------------------------------------------------
            Desktop sidebar (always visible on md+)
        ---------------------------------------------------------------- */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <Sidebar />
        </aside>

        {/* ----------------------------------------------------------------
            Mobile drawer + backdrop
        ---------------------------------------------------------------- */}
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden="true"
          onClick={closeSidebar}
        />

        {/* Drawer panel */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 md:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={closeSidebar} />
        </aside>

        {/* ----------------------------------------------------------------
            Main content area
        ---------------------------------------------------------------- */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={toggleSidebar} />

          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
