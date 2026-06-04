"use client";

import { useState } from "react";

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

type SatStatus = "예정" | "진행중" | "합격" | "조건부합격" | "불합격";

interface SatRecord {
  id: string;
  satNumber: string;
  installSite: string;
  checkItems: number;
  passed: number;
  status: SatStatus;
  scheduledDate: string;
}

// ─── 목업 데이터 ──────────────────────────────────────────────────────────────

const MOCK_DATA: SatRecord[] = [
  {
    id: "1",
    satNumber: "SAT-2026-001",
    installSite: "현대자동차 울산공장",
    checkItems: 48,
    passed: 48,
    status: "합격",
    scheduledDate: "2026-05-12",
  },
  {
    id: "2",
    satNumber: "SAT-2026-002",
    installSite: "삼성전자 수원사업장",
    checkItems: 52,
    passed: 49,
    status: "조건부합격",
    scheduledDate: "2026-05-20",
  },
  {
    id: "3",
    satNumber: "SAT-2026-003",
    installSite: "LG화학 청주공장",
    checkItems: 44,
    passed: 32,
    status: "불합격",
    scheduledDate: "2026-05-28",
  },
  {
    id: "4",
    satNumber: "SAT-2026-004",
    installSite: "포스코 포항제철소",
    checkItems: 60,
    passed: 38,
    status: "진행중",
    scheduledDate: "2026-06-05",
  },
  {
    id: "5",
    satNumber: "SAT-2026-005",
    installSite: "SK하이닉스 이천캠퍼스",
    checkItems: 56,
    passed: 0,
    status: "예정",
    scheduledDate: "2026-06-15",
  },
  {
    id: "6",
    satNumber: "SAT-2026-006",
    installSite: "기아자동차 광명공장",
    checkItems: 50,
    passed: 0,
    status: "예정",
    scheduledDate: "2026-06-22",
  },
  {
    id: "7",
    satNumber: "SAT-2026-007",
    installSite: "롯데케미칼 여수공장",
    checkItems: 46,
    passed: 46,
    status: "합격",
    scheduledDate: "2026-04-30",
  },
  {
    id: "8",
    satNumber: "SAT-2026-008",
    installSite: "한화에어로스페이스 창원",
    checkItems: 58,
    passed: 55,
    status: "합격",
    scheduledDate: "2026-05-08",
  },
];

// ─── StatusBadge 컴포넌트 ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SatStatus }) {
  const styles: Record<SatStatus, string> = {
    예정: "bg-gray-100 text-gray-700 border-gray-200",
    진행중: "bg-blue-100 text-blue-700 border-blue-200",
    합격: "bg-green-100 text-green-700 border-green-200",
    조건부합격: "bg-yellow-100 text-yellow-700 border-yellow-200",
    불합격: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ─── PassedCount 컴포넌트 (색상 코딩) ────────────────────────────────────────

function PassedCount({
  passed,
  total,
}: {
  passed: number;
  total: number;
}) {
  const ratio = total > 0 ? passed / total : 0;

  let colorClass = "text-gray-500";
  if (ratio === 1) colorClass = "text-green-600 font-semibold";
  else if (ratio >= 0.9) colorClass = "text-yellow-600 font-semibold";
  else if (ratio > 0) colorClass = "text-red-600 font-semibold";

  return (
    <span className={colorClass}>
      {passed}
      <span className="text-gray-400 font-normal"> / {total}</span>
    </span>
  );
}

// ─── KPI 카드 컴포넌트 ────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "green" | "blue" | "orange";
}

function KpiCard({ label, value, sub, accent = "default" }: KpiCardProps) {
  const accentMap: Record<string, string> = {
    default: "border-t-gray-300",
    green: "border-t-green-500",
    blue: "border-t-blue-500",
    orange: "border-t-orange-400",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${accentMap[accent]} p-5 flex flex-col gap-1`}
    >
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function SatPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SatStatus | "전체">("전체");

  // KPI 계산
  const total = MOCK_DATA.length;
  const passed = MOCK_DATA.filter((r) => r.status === "합격").length;
  const inProgress = MOCK_DATA.filter((r) => r.status === "진행중").length;
  const scheduledThisMonth = MOCK_DATA.filter((r) => {
    const d = new Date(r.scheduledDate);
    return d.getFullYear() === 2026 && d.getMonth() === 5; // June (0-indexed)
  }).length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  // 필터링
  const filtered = MOCK_DATA.filter((r) => {
    const matchSearch =
      r.satNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.installSite.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "전체" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_OPTIONS: Array<SatStatus | "전체"> = [
    "전체",
    "예정",
    "진행중",
    "합격",
    "조건부합격",
    "불합격",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SAT 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          Site Acceptance Test — 설치현장 인수시험 현황
        </p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="전체 SAT"
          value={total}
          sub="등록된 전체 건수"
          accent="default"
        />
        <KpiCard
          label="합격률"
          value={`${passRate}%`}
          sub={`합격 ${passed}건`}
          accent="green"
        />
        <KpiCard
          label="진행중"
          value={inProgress}
          sub="현재 점검 진행 중"
          accent="blue"
        />
        <KpiCard
          label="이번달 예정"
          value={scheduledThisMonth}
          sub="2026년 6월 예정"
          accent="orange"
        />
      </div>

      {/* 필터 & 검색 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="SAT번호 또는 설치현장 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  SAT번호
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  설치현장
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  점검항목
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  통과
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  예정일
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-700">
                      {row.satNumber}
                    </td>
                    <td className="px-5 py-3.5 text-gray-800 font-medium">
                      {row.installSite}
                    </td>
                    <td className="px-5 py-3.5 text-center text-gray-600">
                      {row.checkItems}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <PassedCount
                        passed={row.passed}
                        total={row.checkItems}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {row.scheduledDate}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            총 {filtered.length}건 표시 (전체 {total}건)
          </p>
          <p className="text-xs text-gray-400">
            마지막 업데이트: 2026-06-03
          </p>
        </div>
      </div>
    </div>
  );
}
