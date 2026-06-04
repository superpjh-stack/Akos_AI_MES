'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header, { HeaderProps, BreadcrumbItem, Notification } from './Header';
import { Menu, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Layout context — lets child pages control header props (breadcrumbs, etc.)
// ---------------------------------------------------------------------------

interface LayoutContextValue {
  setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
  setPageTitle: (title: string) => void;
}

const LayoutContext = createContext<LayoutContextValue>({
  setBreadcrumbs: () => {},
  setPageTitle: () => {},
});

export function useLayout(): LayoutContextValue {
  return useContext(LayoutContext);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MainLayoutProps {
  children: React.ReactNode;
  /** Passed straight through to Header */
  headerProps?: Omit<HeaderProps, 'breadcrumbs'>;
  /** Initial breadcrumbs (optional; pages can override via useLayout()) */
  breadcrumbs?: BreadcrumbItem[];
}

// ---------------------------------------------------------------------------
// Page card helper (exported for use in page components)
// ---------------------------------------------------------------------------

/**
 * Wraps page content in the standard white card container.
 *
 * Usage:
 *   <PageCard title="수주관리">…</PageCard>
 */
export function PageCard({
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** Set true for tables/grids that need to bleed to the card edge */
  noPadding?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-lg w-full"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}
    >
      {(title || actions) && (
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <div>
            {title && (
              <h2 className="text-base font-semibold text-gray-800 leading-tight">{title}</h2>
            )}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile overlay backdrop
// ---------------------------------------------------------------------------

function MobileBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-30 lg:hidden"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// MainLayout
// ---------------------------------------------------------------------------

export default function MainLayout({ children, headerProps, breadcrumbs: breadcrumbsProp }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[] | undefined>(
    breadcrumbsProp
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_pageTitle, setPageTitleState] = useState('');

  const setBreadcrumbs = useCallback((crumbs: BreadcrumbItem[]) => {
    setBreadcrumbsState(crumbs);
  }, []);

  const setPageTitle = useCallback((title: string) => {
    setPageTitleState(title);
    if (typeof document !== 'undefined') {
      document.title = title ? `${title} — Akos AI MES` : 'Akos AI MES';
    }
  }, []);

  return (
    <LayoutContext.Provider value={{ setBreadcrumbs, setPageTitle }}>
      {/*
       * Root shell: full-height flex row
       * Sidebar is fixed on desktop, slide-in drawer on mobile.
       */}
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>

        {/* ------------------------------------------------------------------ */}
        {/* Sidebar — desktop: always visible; mobile: drawer                  */}
        {/* ------------------------------------------------------------------ */}

        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar user={headerProps?.user ?? { name: '박준형', role: '시스템 관리자' }} />
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <>
            <MobileBackdrop onClick={() => setSidebarOpen(false)} />
            <div
              className="fixed inset-y-0 left-0 z-40 flex lg:hidden"
              style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.18)' }}
            >
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 z-50 flex items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                style={{ width: '28px', height: '28px' }}
                aria-label="사이드바 닫기"
              >
                <X size={16} />
              </button>
              <Sidebar user={headerProps?.user ?? { name: '박준형', role: '시스템 관리자' }} />
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Right column: header + scrollable content                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Mobile hamburger row */}
          <div
            className="flex lg:hidden items-center gap-3 px-4 bg-white flex-shrink-0"
            style={{
              height: '48px',
              borderBottom: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              style={{ width: '36px', height: '36px' }}
              aria-label="메뉴 열기"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm" style={{ color: '#1e3a5f' }}>
              Akos AI MES
            </span>
          </div>

          {/* Header — fixed height 60px */}
          <Header
            {...headerProps}
            breadcrumbs={breadcrumbs}
          />

          {/* Scrollable page content */}
          <main
            className="flex-1 overflow-y-auto"
            style={{ padding: '24px', backgroundColor: '#f5f5f5' }}
          >
            {children}
          </main>

        </div>
      </div>
    </LayoutContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Re-export convenience types so consumers import from one place
// ---------------------------------------------------------------------------
export type { BreadcrumbItem, Notification };
