"use client";

import React, { useState } from "react";

// ───────────────────────────────────────────────
// 타입 정의
// ───────────────────────────────────────────────
type PredictionCategory = "불량" | "납기" | "원가";

interface PredictionRecord {
  id: string;
  category: PredictionCategory;
  target: string;
  predictedAt: string;
  predictedValue: string;
  actualValue: string | null;
  accuracy: number | null;
  status: "완료" | "진행중" | "대기";
}

// ───────────────────────────────────────────────
// 더미 데이터
// ───────────────────────────────────────────────
const SUMMARY_STATS = [
  { label: "총 예측 건수", value: "1,284", unit: "건", trend: "+12%", trendUp: true },
  { label: "불량 예측 정확도", value: "94.3", unit: "%", trend: "+1.2%", trendUp: true },
  { label: "납기 예측 정확도", value: "91.7", unit: "%", trend: "-0.5%", trendUp: false },
  { label: "원가 예측 정확도", value: "88.9", unit: "%", trend: "+2.1%", trendUp: true },
  { label: "이번 달 절감 비용", value: "32.4", unit: "백만원", trend: "+8%", trendUp: true },
];

const PREDICTION_HISTORY: PredictionRecord[] = [
  { id: "P-2026-0603-001", category: "불량", target: "라인 A — 사출 공정", predictedAt: "2026-06-03 08:00", predictedValue: "불량률 2.3%", actualValue: "2.1%", accuracy: 97.8, status: "완료" },
  { id: "P-2026-0603-002", category: "납기", target: "수주 #38412", predictedAt: "2026-06-03 08:15", predictedValue: "2026-06-10 완료", actualValue: null, accuracy: null, status: "진행중" },
  { id: "P-2026-0603-003", category: "원가", target: "제품 K-501", predictedAt: "2026-06-03 08:30", predictedValue: "₩148,000 / 개", actualValue: "₩151,200 / 개", accuracy: 97.9, status: "완료" },
  { id: "P-2026-0602-014", category: "불량", target: "라인 B — 도장 공정", predictedAt: "2026-06-02 14:00", predictedValue: "불량률 4.1%", actualValue: "4.5%", accuracy: 91.1, status: "완료" },
  { id: "P-2026-0602-015", category: "납기", target: "수주 #38390", predictedAt: "2026-06-02 09:00", predictedValue: "2026-06-08 완료", actualValue: "2026-06-08 완료", accuracy: 100.0, status: "완료" },
  { id: "P-2026-0602-016", category: "원가", target: "제품 M-220", predictedAt: "2026-06-02 10:00", predictedValue: "₩78,500 / 개", actualValue: null, accuracy: null, status: "대기" },
  { id: "P-2026-0601-027", category: "불량", target: "라인 C — 조립 공정", predictedAt: "2026-06-01 07:30", predictedValue: "불량률 1.8%", actualValue: "1.9%", accuracy: 94.7, status: "완료" },
  { id: "P-2026-0601-028", category: "납기", target: "수주 #38350", predictedAt: "2026-06-01 08:00", predictedValue: "2026-06-07 완료", actualValue: "2026-06-06 완료", accuracy: 98.5, status: "완료" },
];

// ───────────────────────────────────────────────
// 배지 컬러
// ───────────────────────────────────────────────
const categoryColor: Record<PredictionCategory, string> = {
  불량: "bg-red-100 text-red-700",
  납기: "bg-blue-100 text-blue-700",
  원가: "bg-yellow-100 text-yellow-700",
};

const statusColor: Record<PredictionRecord["status"], string> = {
  완료: "bg-green-100 text-green-700",
  진행중: "bg-blue-100 text-blue-700",
  대기: "bg-gray-100 text-gray-500",
};

// ───────────────────────────────────────────────
// 컴포넌트
// ───────────────────────────────────────────────
export default function AIPredictionPage() {
  const [filterCategory, setFilterCategory] = useState<PredictionCategory | "전체">("전체");
  const [filterStatus, setFilterStatus] = useState<PredictionRecord["status"] | "전체">("전체");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const filtered = PREDICTION_HISTORY.filter((r) => {
    const matchCat = filterCategory === "전체" || r.category === filterCategory;
    const matchStat = filterStatus === "전체" || r.status === filterStatus;
    const matchSearch =
      search === "" ||
      r.id.includes(search) ||
      r.target.includes(search) ||
      r.predictedValue.includes(search);
    return matchCat && matchStat && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 예측 분석</h1>
          <p className="text-sm text-gray-500 mt-0.5">불량 · 납기 · 원가 예측 현황 및 이력 관리</p>
        </div>
        <span className="text-xs text-gray-400">기준일: 2026-06-03</span>
      </div>

      {/* 요약 통계 카드 5개 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {SUMMARY_STATS.map((s) => (
          <div key={s.label} className="rounded-xl bg-white shadow-sm border border-gray-100 p-4 space-y-1">
            <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {s.value}
              <span className="text-sm font-medium text-gray-400 ml-1">{s.unit}</span>
            </p>
            <p className={`text-xs font-medium ${s.trendUp ? "text-green-600" : "text-red-500"}`}>
              {s.trend} <span className="text-gray-400 font-normal">전월 대비</span>
            </p>
          </div>
        ))}
      </div>

      {/* 예측 이력 DataTable */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {/* 테이블 헤더 / 필터 */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mr-auto">예측 이력</h2>

          {/* 검색 */}
          <input
            type="text"
            placeholder="ID / 대상 / 예측값 검색"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {/* 카테고리 필터 */}
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value as typeof filterCategory); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {(["전체", "불량", "납기", "원가"] as const).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {(["전체", "완료", "진행중", "대기"] as const).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">예측 ID</th>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">예측 대상</th>
                <th className="px-4 py-3 text-left font-medium">예측 시각</th>
                <th className="px-4 py-3 text-left font-medium">예측값</th>
                <th className="px-4 py-3 text-left font-medium">실제값</th>
                <th className="px-4 py-3 text-right font-medium">정확도</th>
                <th className="px-4 py-3 text-center font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    조건에 맞는 예측 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                paged.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{r.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor[r.category]}`}>
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.target}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.predictedAt}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{r.predictedValue}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.actualValue ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.accuracy !== null ? (
                        <span className={`font-semibold ${r.accuracy >= 95 ? "text-green-600" : r.accuracy >= 90 ? "text-yellow-600" : "text-red-500"}`}>
                          {r.accuracy.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>
            {filtered.length}건 중 {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(page * PAGE_SIZE, filtered.length)}번째
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg border ${p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:bg-gray-50"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
