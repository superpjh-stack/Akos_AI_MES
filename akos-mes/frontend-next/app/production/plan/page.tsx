"use client";

import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Status = "계획" | "진행중" | "완료" | "지연" | "보류";

interface ProductionPlan {
  id: string;
  product: string;
  line: string;
  targetQty: number;
  completedQty: number;
  startDate: string;
  endDate: string;
  status: Status;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const plans: ProductionPlan[] = [
  {
    id: "PP-2026-001",
    product: "A형 모터 케이스",
    line: "라인 1",
    targetQty: 500,
    completedQty: 500,
    startDate: "2026-05-26",
    endDate: "2026-05-30",
    status: "완료",
  },
  {
    id: "PP-2026-002",
    product: "B형 기어박스",
    line: "라인 2",
    targetQty: 300,
    completedQty: 210,
    startDate: "2026-06-01",
    endDate: "2026-06-07",
    status: "진행중",
  },
  {
    id: "PP-2026-003",
    product: "C형 샤프트 어셈블리",
    line: "라인 3",
    targetQty: 200,
    completedQty: 40,
    startDate: "2026-06-02",
    endDate: "2026-06-06",
    status: "지연",
  },
  {
    id: "PP-2026-004",
    product: "D형 베어링 유닛",
    line: "라인 1",
    targetQty: 800,
    completedQty: 0,
    startDate: "2026-06-05",
    endDate: "2026-06-15",
    status: "계획",
  },
  {
    id: "PP-2026-005",
    product: "E형 커넥터 모듈",
    line: "라인 4",
    targetQty: 150,
    completedQty: 0,
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    status: "보류",
  },
];

// ── KPI helpers ────────────────────────────────────────────────────────────────
const totalTarget = plans.reduce((s, p) => s + p.targetQty, 0);
const totalCompleted = plans.reduce((s, p) => s + p.completedQty, 0);
const overallRate = Math.round((totalCompleted / totalTarget) * 100);
const delayedCount = plans.filter((p) => p.status === "지연").length;
const inProgressCount = plans.filter((p) => p.status === "진행중").length;

// ── Sub-components ─────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="kpi-card" style={{ borderTop: `4px solid ${accent ?? "#3b82f6"}` }}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      {sub && <p className="kpi-sub">{sub}</p>}
    </div>
  );
}

const STATUS_META: Record<Status, { bg: string; color: string }> = {
  계획: { bg: "#dbeafe", color: "#1d4ed8" },
  진행중: { bg: "#dcfce7", color: "#15803d" },
  완료: { bg: "#f3f4f6", color: "#374151" },
  지연: { bg: "#fee2e2", color: "#b91c1c" },
  보류: { bg: "#fef9c3", color: "#92400e" },
};

function StatusBadge({ status }: { status: Status }) {
  const { bg, color } = STATUS_META[status];
  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        padding: "2px 10px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function ProgressBar({ pct, status }: { pct: number; status: Status }) {
  const barColor =
    status === "완료"
      ? "#22c55e"
      : status === "지연"
      ? "#ef4444"
      : status === "진행중"
      ? "#3b82f6"
      : "#d1d5db";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: 4,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "#6b7280", minWidth: 34, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProductionPlanPage() {
  return (
    <>
      {/* Scoped styles */}
      <style>{`
        .plan-page { padding: 24px; font-family: 'Pretendard', 'Noto Sans KR', sans-serif; color: #111827; }
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        .page-desc  { font-size: 13px; color: #6b7280; margin: 0; }
        .kpi-grid   { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .kpi-card   { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .kpi-label  { font-size: 12px; color: #6b7280; margin: 0 0 6px; text-transform: uppercase; letter-spacing: .05em; }
        .kpi-value  { font-size: 28px; font-weight: 700; margin: 0 0 2px; }
        .kpi-sub    { font-size: 12px; color: #9ca3af; margin: 0; }
        .table-wrap { background: #fff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.08); overflow: hidden; }
        .table-head { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
        .table-head h2 { font-size: 15px; font-weight: 600; margin: 0; }
        table       { width: 100%; border-collapse: collapse; }
        thead th    { font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb;
                      padding: 10px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
        tbody td    { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background: #f9fafb; }
        .id-cell    { font-family: monospace; color: #6b7280; font-size: 12px; }
        .qty-cell   { text-align: right; }
      `}</style>

      <div className="plan-page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">생산 계획</h1>
          <p className="page-desc">전체 생산 계획 현황 및 진행률을 확인합니다.</p>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard label="전체 계획 건수" value={plans.length} sub="개 계획" accent="#3b82f6" />
          <KpiCard
            label="전체 달성률"
            value={`${overallRate}%`}
            sub={`${totalCompleted.toLocaleString()} / ${totalTarget.toLocaleString()} 개`}
            accent="#22c55e"
          />
          <KpiCard label="진행중" value={inProgressCount} sub="개 계획" accent="#6366f1" />
          <KpiCard label="지연" value={delayedCount} sub="개 계획" accent="#ef4444" />
        </div>

        {/* Data Table */}
        <div className="table-wrap">
          <div className="table-head">
            <h2>생산 계획 목록</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>계획 ID</th>
                <th>제품명</th>
                <th>라인</th>
                <th style={{ minWidth: 160 }}>진행률</th>
                <th className="qty-cell">목표 수량</th>
                <th className="qty-cell">완료 수량</th>
                <th>시작일</th>
                <th>종료일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => {
                const pct = Math.round((p.completedQty / p.targetQty) * 100);
                return (
                  <tr key={p.id}>
                    <td className="id-cell">{p.id}</td>
                    <td style={{ fontWeight: 500 }}>{p.product}</td>
                    <td>{p.line}</td>
                    <td>
                      <ProgressBar pct={pct} status={p.status} />
                    </td>
                    <td className="qty-cell">{p.targetQty.toLocaleString()}</td>
                    <td className="qty-cell">{p.completedQty.toLocaleString()}</td>
                    <td>{p.startDate}</td>
                    <td>{p.endDate}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
