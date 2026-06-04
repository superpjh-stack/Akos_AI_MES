"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface HeaderProps {
  onMenuClick?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "대시보드",
  "/orders": "수주/견적관리",
  "/orders/quotes": "견적관리",
  "/orders/cost": "원가관리",
  "/bom": "설계/BOM",
  "/bom/materials": "자재관리",
  "/bom/drawings": "도면관리",
  "/production/plan": "생산계획",
  "/production/process": "공정관리",
  "/production/workorder": "작업지시",
  "/production/oee": "OEE 모니터링",
  "/fat/checklist": "FAT 체크리스트",
  "/fat/results": "FAT 결과관리",
  "/fat/fail": "Fail 판정관리",
  "/fat/plc": "PLC/장비 데이터",
  "/fat/ai-agent": "FAT AI Agent",
  "/delivery": "납품관리",
  "/delivery/sat": "SAT 관리",
  "/delivery/as": "A/S 관리",
  "/ai/prediction": "AI 예측",
  "/ai/agent": "AI Agent",
  "/ai/rag": "RAG 지식베이스",
  "/admin/users": "사용자관리",
  "/admin/logs": "로그관리",
  "/admin/notifications": "알림설정",
  "/admin/settings": "시스템설정",
  "/master/quality": "품질기준관리",
  "/master/standards": "작업표준관리",
  "/master/codes": "코드관리",
  "/data/integration": "데이터 통합관리",
  "/data/query": "데이터 조회",
  "/data/visualization": "데이터 시각화",
  "/data/download": "데이터 다운로드",
  "/ai-mgmt/chat": "통합 AI 질의",
  "/ai-mgmt/analysis": "생산/품질 분석",
  "/ai-mgmt/decision": "의사결정 지원",
  "/ai-mgmt/alerts": "알림 및 추천",
  "/ai-mgmt/training": "AI 학습 데이터",
  "/ai-mgmt/history": "사용자 질문이력",
  "/kpi/productivity": "생산성 KPI",
  "/kpi/quality": "품질 KPI",
  "/kpi/management": "KPI 관리",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = ROUTE_LABELS[pathname] ?? "Akos AI MES";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* 모바일 햄버거 */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
        aria-label="메뉴 열기"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* 페이지 제목 */}
      <h1 className="flex-1 text-base font-semibold text-gray-800 truncate">
        {pageTitle}
      </h1>

      {/* 우측 액션 */}
      <div className="flex items-center gap-1">
        {/* AI 채팅 버튼 */}
        <button
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          title="AI Agent 채팅"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          <span className="hidden sm:inline">AI 질의</span>
        </button>

        {/* 알림 */}
        <button className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="알림">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* 사용자 */}
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-gray-600 hover:bg-gray-100">
          <UserCircleIcon className="h-6 w-6" />
          <span className="hidden text-xs font-medium sm:inline">관리자</span>
        </button>
      </div>
    </header>
  );
}
