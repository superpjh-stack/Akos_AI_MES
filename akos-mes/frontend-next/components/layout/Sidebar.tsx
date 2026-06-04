"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

// ─── 타입 ─────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  children?: NavItem[];
}

// ─── 사업계획서 p39-42 기능 구성도 기준 메뉴 ──────────────────────────────────

/** 업무 메뉴 — 아코스 제조AI 시스템 기능 구성도 (p39) */
const BUSINESS_MENU: NavItem[] = [
  {
    label: "AI 대시보드",
    icon: HomeIcon,
    children: [
      { label: "생산현황 분석",    href: "/" },
      { label: "품질현황 분석",    href: "/dashboard/quality" },
      { label: "설비상태 모니터링", href: "/production/oee" },
      { label: "프로젝트현황분석", href: "/dashboard/projects" },
    ],
  },
  {
    label: "수주견적관리",
    icon: CurrencyDollarIcon,
    children: [
      { label: "수익성/리스크분석",    href: "/quotation/risk" },
      { label: "유사 프로젝트 조회",   href: "/quotation/similar" },
      { label: "원가납기 예측관리",    href: "/quotation/forecast" },
      { label: "견적데이터관리",       href: "/orders/quotes" },
      { label: "제품별 견적자동화 AI", href: "/quotation/ai-auto" },
    ],
  },
  {
    label: "구매조달관리",
    icon: ShoppingCartIcon,
    children: [
      { label: "발주관리",          href: "/procurement/orders" },
      { label: "자재이력조회",      href: "/bom/materials" },
      { label: "납기리스크분석",    href: "/procurement/risk" },
      { label: "대체품 추천",       href: "/procurement/alternatives" },
      { label: "구매조달 AI Agent", href: "/procurement/ai-agent" },
    ],
  },
  {
    label: "FAT관리",
    icon: BeakerIcon,
    children: [
      { label: "FAT 시험결과관리", href: "/fat/results" },
      { label: "반복 Fail 분석",   href: "/fat/fail" },
      { label: "PLC/알람로그분석", href: "/fat/plc" },
      { label: "사전점검 추천",    href: "/fat/pre-check" },
      { label: "FAT AI Agent",     href: "/fat/ai-agent" },
    ],
  },
  {
    label: "공정관리",
    icon: WrenchScrewdriverIcon,
    children: [
      { label: "공정실적관리",         href: "/production/results" },
      { label: "공정 데이터 모니터링", href: "/production/process-status" },
      { label: "작업조건관리",         href: "/process/conditions" },
      { label: "공정이력조회",         href: "/production/process" },
      { label: "공정데이터분석",       href: "/process/analysis" },
    ],
  },
];

/** 관리 메뉴 — 사업계획서 p42 기준 */
const MGMT_MENU: NavItem[] = [
  {
    label: "AI Agent 통합관리",
    icon: CpuChipIcon,
    children: [
      { label: "통합 AI 질의",   href: "/ai-mgmt/chat" },
      { label: "생산/품질 분석", href: "/ai-mgmt/analysis" },
      { label: "의사결정 지원",  href: "/ai-mgmt/decision" },
      { label: "알림 및 추천",   href: "/ai-mgmt/alerts" },
      { label: "사용자 질문이력", href: "/ai-mgmt/history" },
    ],
  },
  {
    label: "KPI관리",
    icon: ChartPieIcon,
    children: [
      { label: "생산성 KPI 조회", href: "/kpi/productivity" },
      { label: "품질 KPI 조회",   href: "/kpi/quality" },
      { label: "KPI 관리",        href: "/kpi/management" },
    ],
  },
  {
    label: "데이터관리",
    icon: CircleStackIcon,
    children: [
      { label: "데이터통합관리",       href: "/data/integration" },
      { label: "데이터조회",           href: "/data/query" },
      { label: "데이터시각화",         href: "/data/visualization" },
      { label: "데이터 다운로드",      href: "/data/download" },
      { label: "AI학습 데이터관리",    href: "/data/ai-training" },
    ],
  },
  {
    label: "기준정보관리",
    icon: ClipboardDocumentListIcon,
    children: [
      { label: "품질기준 관리",  href: "/master/quality" },
      { label: "작업표준 관리",  href: "/master/standards" },
      { label: "코드 관리",      href: "/master/codes" },
    ],
  },
  {
    label: "사용자/시스템관리",
    icon: UsersIcon,
    children: [
      { label: "사용자 관리", href: "/admin/users" },
      { label: "로그 관리",   href: "/admin/logs" },
      { label: "알림 설정",   href: "/admin/notifications" },
      { label: "시스템 설정", href: "/admin/settings" },
    ],
  },
];

// ─── 개별 메뉴 아이템 ─────────────────────────────────────────────────────────
function NavLeafItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href ?? "#"}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-[#2563eb] text-white font-semibold"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
      <span>{item.label}</span>
    </Link>
  );
}

// ─── 아코디언 그룹 ────────────────────────────────────────────────────────────
function NavGroupItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isChildActive = item.children?.some((c) => pathname === c.href) ?? false;
  const [open, setOpen] = useState(isChildActive);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
          isChildActive
            ? "bg-white/10 text-white font-semibold"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        {open
          ? <ChevronDownIcon className="h-4 w-4 shrink-0" />
          : <ChevronRightIcon className="h-4 w-4 shrink-0" />}
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {item.children?.map((child) => (
            <NavLeafItem key={child.href ?? child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mt-5 mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
      {label}
    </p>
  );
}

// ─── 메인 사이드바 ────────────────────────────────────────────────────────────
interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[#1e3a5f] overflow-y-auto">
      {/* 로고 */}
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <CpuChipIcon className="h-7 w-7 text-[#2563eb]" />
        <div>
          <p className="text-sm font-bold text-white leading-tight">Akos AI MES</p>
          <p className="text-[10px] text-slate-400">스마트 제조 플랫폼</p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {/* 업무 */}
        <SectionHeader label="업무" />
        {BUSINESS_MENU.map((item) =>
          item.children
            ? <NavGroupItem key={item.label} item={item} />
            : <NavLeafItem key={item.href ?? item.label} item={item} />
        )}

        {/* 관리 */}
        <SectionHeader label="관리" />
        {MGMT_MENU.map((item) =>
          item.children
            ? <NavGroupItem key={item.label} item={item} />
            : <NavLeafItem key={item.href ?? item.label} item={item} />
        )}
      </nav>

      {/* 하단 */}
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[10px] text-slate-500">v0.1.0 · 주식회사 아코스</p>
      </div>
    </aside>
  );
}
