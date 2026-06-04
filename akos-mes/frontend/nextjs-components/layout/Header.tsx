'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  BotMessageSquare,
  ChevronRight,
  Home,
  LogOut,
  Settings,
  User,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface HeaderUser {
  name: string;
  role: string;
  email?: string;
}

export interface HeaderProps {
  /** Override breadcrumbs. If omitted they are auto-derived from pathname. */
  breadcrumbs?: BreadcrumbItem[];
  notifications?: Notification[];
  user?: HeaderUser;
  onAIClick?: () => void;
  onNotificationRead?: (id: string) => void;
  onLogout?: () => void;
}

// ---------------------------------------------------------------------------
// Route label map (Korean)
// ---------------------------------------------------------------------------

const ROUTE_LABELS: Record<string, string> = {
  business: '업무메뉴',
  admin: '관리메뉴',
  orders: '수주/견적관리',
  sales: '수주관리',
  quotes: '견적관리',
  costs: '원가관리',
  design: '설계/BOM',
  bom: 'BOM관리',
  materials: '자재관리',
  drawings: '도면관리',
  production: '생산/공정관리',
  plan: '생산계획',
  process: '공정관리',
  'work-orders': '작업지시',
  oee: 'OEE모니터링',
  fat: 'FAT 관리',
  checklist: 'FAT체크리스트',
  results: 'FAT결과관리',
  'fail-judgment': 'Fail판정관리',
  'plc-data': 'PLC/장비데이터',
  'ai-agent': 'AI Agent',
  delivery: '납품/SAT',
  shipment: '납품관리',
  sat: 'SAT관리',
  'after-service': 'A/S관리',
  'ai-solution': 'AI 솔루션',
  prediction: 'AI예측(불량/납기/원가)',
  agent: 'AI Agent',
  rag: 'RAG지식베이스',
  system: '사용자/시스템관리',
  users: '사용자관리',
  logs: '로그관리',
  notifications: '알림설정',
  settings: '시스템설정',
  master: '기준정보관리',
  'quality-standards': '품질기준관리',
  'work-standards': '작업표준관리',
  codes: '코드관리',
  data: '데이터관리',
  integration: '데이터통합관리',
  query: '통합AI질의',
  visualization: '데이터시각화',
  download: '데이터다운로드',
  analysis: '생산/품질분석',
  'decision-support': '의사결정지원',
  alerts: '알림및추천',
  'training-data': 'AI학습데이터관리',
  'question-history': '사용자질문이력',
  kpi: 'KPI 관리',
  productivity: '생산성KPI조회',
  quality: '품질KPI조회',
  management: 'KPI관리',
};

function segmentLabel(seg: string): string {
  return ROUTE_LABELS[seg] ?? seg;
}

// ---------------------------------------------------------------------------
// Auto-breadcrumb from pathname
// ---------------------------------------------------------------------------

function useBreadcrumbs(override?: BreadcrumbItem[]): BreadcrumbItem[] {
  const pathname = usePathname();

  if (override) return override;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: '홈', href: '/' }];

  segments.forEach((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    crumbs.push({ label: segmentLabel(seg), href });
  });

  return crumbs;
}

// ---------------------------------------------------------------------------
// Notification type colours
// ---------------------------------------------------------------------------

const NOTIF_COLORS: Record<Notification['type'], string> = {
  info: '#2563eb',
  warning: '#d97706',
  error: '#dc2626',
  success: '#16a34a',
};

const NOTIF_BG: Record<Notification['type'], string> = {
  info: '#eff6ff',
  warning: '#fffbeb',
  error: '#fef2f2',
  success: '#f0fdf4',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 min-w-0">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isFirst = idx === 0;

        return (
          <React.Fragment key={idx}>
            {isFirst ? (
              <span className="text-gray-400 hover:text-gray-600 transition-colors">
                {item.href ? (
                  <Link href={item.href}>
                    <Home size={15} />
                  </Link>
                ) : (
                  <Home size={15} />
                )}
              </span>
            ) : isLast ? (
              <span
                className="text-sm font-semibold truncate max-w-[200px]"
                style={{ color: '#1e3a5f' }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href ?? '#'}
                className="text-sm text-gray-500 hover:text-gray-700 truncate max-w-[140px] transition-colors"
              >
                {item.label}
              </Link>
            )}
            {!isLast && (
              <ChevronRight size={13} className="flex-shrink-0 text-gray-300" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function NotificationPanel({
  notifications,
  onRead,
  onClose,
}: {
  notifications: Notification[];
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="absolute right-0 top-full mt-2 bg-white rounded-lg overflow-hidden z-50"
      style={{
        width: '360px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">알림</span>
          {unreadCount > 0 && (
            <span
              className="text-xs font-bold text-white rounded-full px-1.5 py-0.5 leading-none"
              style={{ backgroundColor: '#dc2626', minWidth: '18px', textAlign: 'center' }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            알림이 없습니다
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onRead(n.id)}
              className="px-4 py-3 cursor-pointer transition-colors"
              style={{
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: n.read ? '#ffffff' : NOTIF_BG[n.type],
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = n.read
                  ? '#ffffff'
                  : NOTIF_BG[n.type];
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: NOTIF_COLORS[n.type], opacity: n.read ? 0.3 : 1 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-semibold truncate"
                      style={{ color: n.read ? '#6b7280' : '#111827' }}
                    >
                      {n.title}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          className="px-4 py-2.5 text-center"
          style={{ borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}
        >
          <button
            className="text-xs font-medium transition-colors"
            style={{ color: '#2563eb' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#1d4ed8')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#2563eb')}
          >
            모든 알림 보기
          </button>
        </div>
      )}
    </div>
  );
}

function UserDropdown({
  user,
  onLogout,
  onClose,
}: {
  user: HeaderUser;
  onLogout?: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-2 bg-white rounded-lg overflow-hidden z-50"
      style={{
        width: '220px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* User info */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}
      >
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0 text-sm font-bold text-white"
          style={{ width: '40px', height: '40px', backgroundColor: '#1e3a5f' }}
        >
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
          <div className="text-xs text-gray-500 truncate">{user.role}</div>
          {user.email && (
            <div className="text-xs text-gray-400 truncate mt-0.5">{user.email}</div>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {[
          { icon: User, label: '내 프로필' },
          { icon: Settings, label: '설정' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon size={15} className="text-gray-400" />
            {label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div style={{ borderTop: '1px solid #f3f4f6' }} className="py-1">
        <button
          onClick={() => {
            onClose();
            onLogout?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
          style={{ color: '#dc2626' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default mock notifications
// ---------------------------------------------------------------------------

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'FAT 검사 완료',
    message: 'PO-2024-0312 제품의 FAT 검사가 완료되었습니다.',
    time: '방금 전',
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: '불량률 경고',
    message: '라인 A의 불량률이 설정 임계값(3%)을 초과했습니다.',
    time: '12분 전',
    read: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'AI 예측 업데이트',
    message: '이번 주 납기 지연 예측이 업데이트되었습니다.',
    time: '1시간 전',
    read: false,
    type: 'info',
  },
  {
    id: '4',
    title: '시스템 점검',
    message: '오늘 23:00~01:00 정기 시스템 점검이 예정되어 있습니다.',
    time: '3시간 전',
    read: true,
    type: 'info',
  },
];

// ---------------------------------------------------------------------------
// Header component
// ---------------------------------------------------------------------------

export default function Header({
  breadcrumbs: breadcrumbsProp,
  notifications: notifProp,
  user = { name: '박준형', role: '시스템 관리자', email: 'superpjh@gmail.com' },
  onAIClick,
  onNotificationRead,
  onLogout,
}: HeaderProps) {
  const breadcrumbs = useBreadcrumbs(breadcrumbsProp);
  const [notifications, setNotifications] = useState<Notification[]>(
    notifProp ?? DEFAULT_NOTIFICATIONS
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleNotifRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    onNotificationRead?.(id);
  }

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0 bg-white"
      style={{
        height: '60px',
        minHeight: '60px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 40,
        position: 'relative',
      }}
    >
      {/* Left: breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Right: actions */}
      <div className="flex items-center gap-2">

        {/* AI Button */}
        <button
          onClick={onAIClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            boxShadow: '0 1px 4px rgba(37,99,235,0.35)',
          }}
          title="AI Assistant"
        >
          <BotMessageSquare size={15} />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setUserOpen(false);
            }}
            className="relative flex items-center justify-center rounded-md transition-colors duration-150"
            style={{
              width: '36px',
              height: '36px',
              color: '#6b7280',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
            }
            title="알림"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center text-white font-bold rounded-full leading-none"
                style={{
                  fontSize: '9px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  backgroundColor: '#dc2626',
                  transform: 'translate(25%, -25%)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onRead={handleNotifRead}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* User avatar */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => {
              setUserOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-150"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
            }
            title={user.name}
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ width: '30px', height: '30px', backgroundColor: '#1e3a5f' }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</div>
              <div className="text-xs text-gray-400 leading-tight">{user.role}</div>
            </div>
          </button>

          {userOpen && (
            <UserDropdown
              user={user}
              onLogout={onLogout}
              onClose={() => setUserOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
