"use client";

import React, { useState } from "react";

// ──────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────
type Status = "pending" | "approved" | "rejected";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0 ~ 100
  category: string;
  createdAt: string;
  status: Status;
}

// ──────────────────────────────────────────────
// 목업 데이터
// ──────────────────────────────────────────────
const initialRecommendations: Recommendation[] = [
  {
    id: "REC-001",
    title: "라인 3 생산 속도 15% 증가",
    description:
      "현재 가동률 분석 결과 라인 3의 유휴 시간이 과다합니다. 속도를 시간당 85단위에서 97단위로 증가시키면 일일 생산량이 약 180개 증가할 것으로 예측됩니다.",
    confidence: 91,
    category: "생산 최적화",
    createdAt: "2026-06-03 09:14",
    status: "pending",
  },
  {
    id: "REC-002",
    title: "설비 A-07 예방 정비 일정 조정",
    description:
      "센서 데이터 패턴이 향후 72시간 이내 고장 가능성 78%를 나타냅니다. 다음 주 예정된 정기 점검을 오늘 오후로 앞당기는 것을 권고합니다.",
    confidence: 78,
    category: "예지 정비",
    createdAt: "2026-06-03 10:02",
    status: "pending",
  },
  {
    id: "REC-003",
    title: "원자재 재고 20% 증량 발주",
    description:
      "다음 달 수요 예측 모델이 수요 급증(+23%)을 예상합니다. 공급 부족을 방지하기 위해 원자재 M-12, M-15 발주량을 늘릴 것을 권고합니다.",
    confidence: 64,
    category: "공급망",
    createdAt: "2026-06-03 10:45",
    status: "pending",
  },
  {
    id: "REC-004",
    title: "품질 검사 빈도 조정",
    description:
      "최근 7일간 불량률이 목표치 이하(1.2% vs 2.0% 기준)입니다. 검사 빈도를 매 50단위에서 매 75단위로 줄여 처리량을 높일 수 있습니다.",
    confidence: 85,
    category: "품질 관리",
    createdAt: "2026-06-03 11:30",
    status: "approved",
  },
];

// ──────────────────────────────────────────────
// SVG 신뢰도 게이지 컴포넌트
// ──────────────────────────────────────────────
function ConfidenceGauge({ value }: { value: number }) {
  const radius = 36;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (value / 100) * circumference;

  const color =
    value >= 85
      ? "#22c55e"  // 녹색 — 높음
      : value >= 65
      ? "#f59e0b"  // 황색 — 중간
      : "#ef4444"; // 적색 — 낮음

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        {/* 배경 트랙 */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        {/* 진행 호 */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        {/* 중앙 텍스트 */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="700"
          fill={color}
        >
          {value}%
        </text>
      </svg>
      <span className="text-xs text-gray-500">신뢰도</span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 상태 배지 컴포넌트
// ──────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const config: Record<Status, { label: string; className: string }> = {
    pending:  { label: "검토 대기", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    approved: { label: "승인됨",   className: "bg-green-100  text-green-700  border-green-300"  },
    rejected: { label: "반려됨",   className: "bg-red-100    text-red-700    border-red-300"    },
  };
  const { label, className } = config[status];
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}
    >
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────
// 카테고리 배지 컴포넌트
// ──────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
      {category}
    </span>
  );
}

// ──────────────────────────────────────────────
// 권고사항 카드 컴포넌트
// ──────────────────────────────────────────────
function RecommendationCard({
  rec,
  onApprove,
  onReject,
}: {
  rec: Recommendation;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const isPending = rec.status === "pending";

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-5 transition-all duration-200
        ${isPending ? "border-gray-200 hover:shadow-md" : "border-gray-100 opacity-75"}`}
    >
      {/* 게이지 */}
      <div className="shrink-0 flex items-start pt-1">
        <ConfidenceGauge value={rec.confidence} />
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-mono">{rec.id}</span>
          <CategoryBadge category={rec.category} />
          <StatusBadge status={rec.status} />
        </div>

        <h3 className="text-base font-semibold text-gray-800 mb-1 leading-snug">
          {rec.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {rec.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{rec.createdAt}</span>

          {isPending && (
            <div className="flex gap-2">
              <button
                onClick={() => onReject(rec.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium border border-red-300 text-red-600
                           hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                반려
              </button>
              <button
                onClick={() => onApprove(rec.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white
                           hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                승인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 요약 통계 카드
// ──────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 bg-white shadow-sm flex flex-col items-center gap-1 ${colorClass}`}
    >
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ──────────────────────────────────────────────
// 메인 페이지
// ──────────────────────────────────────────────
export default function DecisionSupportPage() {
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>(initialRecommendations);
  const [filter, setFilter] = useState<Status | "all">("all");

  const handleApprove = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  const counts = {
    all:      recommendations.length,
    pending:  recommendations.filter((r) => r.status === "pending").length,
    approved: recommendations.filter((r) => r.status === "approved").length,
    rejected: recommendations.filter((r) => r.status === "rejected").length,
  };

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.status === filter);

  const filterOptions: { value: Status | "all"; label: string }[] = [
    { value: "all",      label: "전체" },
    { value: "pending",  label: "검토 대기" },
    { value: "approved", label: "승인됨" },
    { value: "rejected", label: "반려됨" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">의사결정 지원</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          AI가 생성한 권고사항을 검토하고 승인 또는 반려하세요.
        </p>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="전체 권고사항" value={counts.all}      colorClass="border-gray-200" />
        <SummaryCard label="검토 대기"     value={counts.pending}  colorClass="border-yellow-200 text-yellow-700" />
        <SummaryCard label="승인됨"        value={counts.approved} colorClass="border-green-200 text-green-700" />
        <SummaryCard label="반려됨"        value={counts.rejected} colorClass="border-red-200 text-red-700" />
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${
                filter === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
          >
            {opt.label}
            <span className="ml-1.5 text-xs opacity-75">
              ({opt.value === "all" ? counts.all : counts[opt.value as Status]})
            </span>
          </button>
        ))}
      </div>

      {/* 권고사항 목록 */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16 text-sm">
            해당 상태의 권고사항이 없습니다.
          </div>
        ) : (
          filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </main>
  );
}
