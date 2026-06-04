'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  ShoppingCart,
  FileText,
  DollarSign,
  GitBranch,
  Layers,
  Package,
  Pencil,
  Factory,
  CalendarDays,
  Workflow,
  ClipboardCheck,
  BarChart2,
  TestTube2,
  CheckSquare,
  XCircle,
  Cpu,
  Bot,
  Truck,
  PackageCheck,
  Wrench,
  Sparkles,
  TrendingUp,
  Database,
  Users,
  UserCog,
  ScrollText,
  Bell,
  Settings,
  BookOpen,
  ShieldCheck,
  FileCheck,
  Tag,
  DatabaseZap,
  FolderSync,
  Search,
  BarChart3,
  Download,
  BrainCircuit,
  MessageSquare,
  LineChart,
  Lightbulb,
  BellRing,
  GraduationCap,
  History,
  Target,
  Sliders,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Icon map
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ClipboardList,
  ShoppingCart,
  FileText,
  DollarSign,
  GitBranch,
  Layers,
  Package,
  Pencil,
  Factory,
  CalendarDays,
  Workflow,
  ClipboardCheck,
  BarChart2,
  TestTube2,
  CheckSquare,
  XCircle,
  Cpu,
  Bot,
  Truck,
  PackageCheck,
  Wrench,
  Sparkles,
  TrendingUp,
  Database,
  Users,
  UserCog,
  ScrollText,
  Bell,
  Settings,
  BookOpen,
  ShieldCheck,
  FileCheck,
  Tag,
  DatabaseZap,
  FolderSync,
  Search,
  BarChart3,
  Download,
  BrainCircuit,
  MessageSquare,
  LineChart,
  Lightbulb,
  BellRing,
  GraduationCap,
  History,
  Target,
  Sliders,
};

// Types
interface MenuItem {
  icon: string;
  label: string;
  href: string;
  section: 'business' | 'admin';
  children?: ChildMenuItem[];
}

interface ChildMenuItem {
  icon: string;
  label: string;
  href: string;
}

interface UserInfo {
  name: string;
  role: string;
}

interface SidebarProps {
  user?: UserInfo;
}

// Menu data
const menuItems: MenuItem[] = [
  {
    icon: 'ClipboardList',
    label: '수주/견적관리',
    href: '/business/orders',
    section: 'business',
    children: [
      { icon: 'ShoppingCart', label: '수주관리', href: '/business/orders/sales' },
      { icon: 'FileText', label: '견적관리', href: '/business/orders/quotes' },
      { icon: 'DollarSign', label: '원가관리', href: '/business/orders/costs' },
    ],
  },
  {
    icon: 'GitBranch',
    label: '설계/BOM',
    href: '/business/design',
    section: 'business',
    children: [
      { icon: 'Layers', label: 'BOM관리', href: '/business/design/bom' },
      { icon: 'Package', label: '자재관리', href: '/business/design/materials' },
      { icon: 'Pencil', label: '도면관리', href: '/business/design/drawings' },
    ],
  },
  {
    icon: 'Factory',
    label: '생산/공정관리',
    href: '/business/production',
    section: 'business',
    children: [
      { icon: 'CalendarDays', label: '생산계획', href: '/business/production/plan' },
      { icon: 'Workflow', label: '공정관리', href: '/business/production/process' },
      { icon: 'ClipboardCheck', label: '작업지시', href: '/business/production/work-orders' },
      { icon: 'BarChart2', label: 'OEE모니터링', href: '/business/production/oee' },
    ],
  },
  {
    icon: 'TestTube2',
    label: 'FAT 관리',
    href: '/business/fat',
    section: 'business',
    children: [
      { icon: 'CheckSquare', label: 'FAT체크리스트', href: '/business/fat/checklist' },
      { icon: 'ClipboardCheck', label: 'FAT결과관리', href: '/business/fat/results' },
      { icon: 'XCircle', label: 'Fail판정관리', href: '/business/fat/fail-judgment' },
      { icon: 'Cpu', label: 'PLC/장비데이터', href: '/business/fat/plc-data' },
      { icon: 'Bot', label: 'FAT AI Agent', href: '/business/fat/ai-agent' },
    ],
  },
  {
    icon: 'Truck',
    label: '납품/SAT',
    href: '/business/delivery',
    section: 'business',
    children: [
      { icon: 'PackageCheck', label: '납품관리', href: '/business/delivery/shipment' },
      { icon: 'ClipboardList', label: 'SAT관리', href: '/business/delivery/sat' },
      { icon: 'Wrench', label: 'A/S관리', href: '/business/delivery/after-service' },
    ],
  },
  {
    icon: 'Sparkles',
    label: 'AI 솔루션',
    href: '/business/ai-solution',
    section: 'business',
    children: [
      { icon: 'TrendingUp', label: 'AI예측(불량/납기/원가)', href: '/business/ai-solution/prediction' },
      { icon: 'Bot', label: 'AI Agent', href: '/business/ai-solution/agent' },
      { icon: 'Database', label: 'RAG지식베이스', href: '/business/ai-solution/rag' },
    ],
  },
  {
    icon: 'Users',
    label: '사용자/시스템관리',
    href: '/admin/system',
    section: 'admin',
    children: [
      { icon: 'UserCog', label: '사용자관리', href: '/admin/system/users' },
      { icon: 'ScrollText', label: '로그관리', href: '/admin/system/logs' },
      { icon: 'Bell', label: '알림설정', href: '/admin/system/notifications' },
      { icon: 'Settings', label: '시스템설정', href: '/admin/system/settings' },
    ],
  },
  {
    icon: 'BookOpen',
    label: '기준정보관리',
    href: '/admin/master',
    section: 'admin',
    children: [
      { icon: 'ShieldCheck', label: '품질기준관리', href: '/admin/master/quality-standards' },
      { icon: 'FileCheck', label: '작업표준관리', href: '/admin/master/work-standards' },
      { icon: 'Tag', label: '코드관리', href: '/admin/master/codes' },
    ],
  },
  {
    icon: 'DatabaseZap',
    label: '데이터관리',
    href: '/admin/data',
    section: 'admin',
    children: [
      { icon: 'FolderSync', label: '데이터통합관리', href: '/admin/data/integration' },
      { icon: 'Search', label: '데이터조회', href: '/admin/data/query' },
      { icon: 'BarChart3', label: '데이터시각화', href: '/admin/data/visualization' },
      { icon: 'Download', label: '데이터다운로드', href: '/admin/data/download' },
    ],
  },
  {
    icon: 'BrainCircuit',
    label: 'AI Agent 관리',
    href: '/admin/ai-agent',
    section: 'admin',
    children: [
      { icon: 'MessageSquare', label: '통합AI질의', href: '/admin/ai-agent/query' },
      { icon: 'LineChart', label: '생산/품질분석', href: '/admin/ai-agent/analysis' },
      { icon: 'Lightbulb', label: '의사결정지원', href: '/admin/ai-agent/decision-support' },
      { icon: 'BellRing', label: '알림및추천', href: '/admin/ai-agent/alerts' },
      { icon: 'GraduationCap', label: 'AI학습데이터관리', href: '/admin/ai-agent/training-data' },
      { icon: 'History', label: '사용자질문이력', href: '/admin/ai-agent/question-history' },
    ],
  },
  {
    icon: 'Target',
    label: 'KPI 관리',
    href: '/admin/kpi',
    section: 'admin',
    children: [
      { icon: 'TrendingUp', label: '생산성KPI조회', href: '/admin/kpi/productivity' },
      { icon: 'ShieldCheck', label: '품질KPI조회', href: '/admin/kpi/quality' },
      { icon: 'Sliders', label: 'KPI관리', href: '/admin/kpi/management' },
    ],
  },
];

// Accordion menu item component
function AccordionMenuItem({ item }: { item: MenuItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const [isOpen, setIsOpen] = useState<boolean>(isActive);

  const IconComponent = iconMap[item.icon];

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      {/* Parent menu item */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 rounded-md mx-1"
        style={{
          backgroundColor: isActive && !hasChildren ? '#2563eb' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!(isActive && !hasChildren)) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(isActive && !hasChildren)) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
      >
        <span className="flex items-center gap-3">
          {IconComponent && <IconComponent size={16} className="flex-shrink-0 opacity-90" />}
          <span className="text-left leading-tight">{item.label}</span>
        </span>
        {hasChildren && (
          <span className="flex-shrink-0 opacity-70">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="mt-0.5 mb-1">
          {item.children!.map((child) => {
            const ChildIcon = iconMap[child.icon];
            const isChildActive = pathname === child.href;

            return (
              <Link
                key={child.href}
                href={child.href}
                className="flex items-center gap-3 pl-10 pr-4 py-2 text-xs font-normal text-white/80 transition-colors duration-150 rounded-md mx-1"
                style={{
                  backgroundColor: isChildActive ? '#2563eb' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isChildActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isChildActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                {ChildIcon && <ChildIcon size={14} className="flex-shrink-0 opacity-80" />}
                <span className="leading-tight">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Section divider
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">
          {label}
        </span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
    </div>
  );
}

// Main Sidebar component
export default function Sidebar({ user = { name: '박준형', role: '시스템 관리자' } }: SidebarProps) {
  const businessItems = menuItems.filter((item) => item.section === 'business');
  const adminItems = menuItems.filter((item) => item.section === 'admin');

  return (
    <aside
      className="flex flex-col h-screen"
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#1e3a5f',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo / Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-2xl leading-none">&#127981;</span>
        <div>
          <div className="text-white font-bold text-base leading-tight tracking-tight">
            Akos AI MES
          </div>
          <div className="text-white/40 text-[10px] tracking-wide mt-0.5">
            Smart Factory System
          </div>
        </div>
      </div>

      {/* Scrollable menu area */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Business section */}
        <SectionDivider label="업무메뉴" />
        <div className="mt-1 space-y-0.5 px-1">
          {businessItems.map((item) => (
            <AccordionMenuItem key={item.href} item={item} />
          ))}
        </div>

        {/* Admin section */}
        <SectionDivider label="관리메뉴" />
        <div className="mt-1 space-y-0.5 px-1">
          {adminItems.map((item) => (
            <AccordionMenuItem key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* User info footer */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0 text-sm font-bold text-white"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#2563eb',
          }}
        >
          {user.name.charAt(0)}
        </div>
        {/* Name and role */}
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">{user.name}</div>
          <div className="text-white/50 text-xs truncate">{user.role}</div>
        </div>
        {/* Settings shortcut */}
        <button
          className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
          title="설정"
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
}
