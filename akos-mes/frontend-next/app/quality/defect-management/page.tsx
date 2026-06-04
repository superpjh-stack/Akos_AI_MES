"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, CheckCircle, Clock, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

// ─── 인라인 공통 컴포넌트 ────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1"
      style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        {icon && <span className="text-gray-300">{icon}</span>}
      </div>
      <span className="text-2xl font-bold" style={{ color: color ?? "#1e3a5f" }}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    처리완료: { bg: "#dcfce7", color: "#16a34a" },
    처리중: { bg: "#dbeafe", color: "#1d4ed8" },
    완료: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    상: { bg: "#fee2e2", color: "#dc2626" },
    중: { bg: "#ffedd5", color: "#ea580c" },
    하: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[severity] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {severity}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    치수불량: { bg: "#fee2e2", color: "#dc2626" },
    조립불량: { bg: "#fef9c3", color: "#a16207" },
    표면불량: { bg: "#ffedd5", color: "#c2410c" },
    기능불량: { bg: "#ede9fe", color: "#7c3aed" },
    누유: { bg: "#cffafe", color: "#0e7490" },
    기타: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[type] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {type}
    </span>
  );
}

function PageHeader({
  title,
  section,
  action,
}: {
  title: string;
  section: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

// ─── 목업 데이터 ─────────────────────────────────────────────────────────────

interface Defect {
  id: string;
  date: string;
  line: string;
  product: string;
  process: string;
  type: string;
  detail: string;
  qty: number;
  cause: string;
  action: string;
  inspector: string;
  severity: string;
  status: string;
  cost: number;
}

const DEFECTS: Defect[] = [
  {
    id: "DF-2026-0124",
    date: "2026-06-04 09:12",
    line: "라인 A",
    product: "자동화 용접라인",
    process: "용접",
    type: "치수불량",
    detail: "전장 치수 초과 (+1.2mm)",
    qty: 1,
    cause: "공구 마모",
    action: "공구 교체",
    inspector: "김품질",
    severity: "중",
    status: "처리완료",
    cost: 150000,
  },
  {
    id: "DF-2026-0123",
    date: "2026-06-04 10:34",
    line: "라인 B",
    product: "PLC 제어반",
    process: "조립",
    type: "조립불량",
    detail: "나사 체결 토크 부족",
    qty: 2,
    cause: "작업자 미숙",
    action: "재교육 실시",
    inspector: "이검사",
    severity: "하",
    status: "처리중",
    cost: 80000,
  },
  {
    id: "DF-2026-0122",
    date: "2026-06-03 14:22",
    line: "라인 C",
    product: "컨베이어",
    process: "도장",
    type: "표면불량",
    detail: "도장 들뜸 발생",
    qty: 3,
    cause: "도료 점도 이상",
    action: "도료 교체",
    inspector: "박품질",
    severity: "중",
    status: "처리완료",
    cost: 240000,
  },
  {
    id: "DF-2026-0121",
    date: "2026-06-03 11:05",
    line: "라인 B",
    product: "비전검사장비",
    process: "기계가공",
    type: "치수불량",
    detail: "구멍 직경 과소 (-0.3mm)",
    qty: 2,
    cause: "CNC 마모",
    action: "CNC 보정",
    inspector: "최검사",
    severity: "상",
    status: "처리중",
    cost: 320000,
  },
  {
    id: "DF-2026-0120",
    date: "2026-06-02 16:48",
    line: "라인 D",
    product: "협동로봇",
    process: "검사",
    type: "기능불량",
    detail: "그리퍼 동작 불량",
    qty: 1,
    cause: "전장 연결 오류",
    action: "재배선",
    inspector: "김품질",
    severity: "상",
    status: "처리완료",
    cost: 180000,
  },
  {
    id: "DF-2026-0119",
    date: "2026-06-02 09:30",
    line: "라인 A",
    product: "유압프레스",
    process: "조립",
    type: "누유",
    detail: "실링 파손으로 유압유 누유",
    qty: 1,
    cause: "불량 부품",
    action: "부품 교체",
    inspector: "정품질",
    severity: "상",
    status: "완료",
    cost: 420000,
  },
];

const DEFECT_BY_TYPE = [
  { type: "치수불량", count: 18, color: "#ef4444" },
  { type: "표면불량", count: 12, color: "#f97316" },
  { type: "조립불량", count: 9, color: "#eab308" },
  { type: "기능불량", count: 6, color: "#8b5cf6" },
  { type: "누유", count: 3, color: "#06b6d4" },
  { type: "기타", count: 5, color: "#6b7280" },
];

const DAILY_DEFECTS = [
  { date: "5/29", count: 6, cost: 480000 },
  { date: "5/30", count: 9, cost: 720000 },
  { date: "5/31", count: 4, cost: 310000 },
  { date: "6/1", count: 11, cost: 890000 },
  { date: "6/2", count: 8, cost: 640000 },
  { date: "6/3", count: 5, cost: 410000 },
  { date: "6/4", count: 7, cost: 570000 },
];

const LINE_DEFECTS = [
  { line: "라인 A", count: 14 },
  { line: "라인 B", count: 22 },
  { line: "라인 C", count: 9 },
  { line: "라인 D", count: 8 },
];

const COST_CUMULATIVE = [
  { date: "5/29", cumCost: 480000 },
  { date: "5/30", cumCost: 1200000 },
  { date: "5/31", cumCost: 1510000 },
  { date: "6/1", cumCost: 2400000 },
  { date: "6/2", cumCost: 3040000 },
  { date: "6/3", cumCost: 3450000 },
  { date: "6/4", cumCost: 4020000 },
];

// ─── 등록 폼 초기값 ──────────────────────────────────────────────────────────

interface DefectForm {
  line: string;
  product: string;
  process: string;
  type: string;
  detail: string;
  qty: number;
  severity: string;
  cause: string;
  action: string;
  inspector: string;
}

const EMPTY_FORM: DefectForm = {
  line: "",
  product: "",
  process: "",
  type: "",
  detail: "",
  qty: 1,
  severity: "",
  cause: "",
  action: "",
  inspector: "",
};

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function DefectManagementPage() {
  const [activeTab, setActiveTab] = useState<"list" | "register" | "stats">("list");

  // 필터
  const [filterDate, setFilterDate] = useState("");
  const [filterLine, setFilterLine] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // 확장 행
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 등록 폼
  const [form, setForm] = useState<DefectForm>(EMPTY_FORM);

  // 필터링된 불량 목록
  const filtered = DEFECTS.filter((d) => {
    if (filterDate && !d.date.startsWith(filterDate)) return false;
    if (filterLine && d.line !== filterLine) return false;
    if (filterType && d.type !== filterType) return false;
    if (filterSeverity && d.severity !== filterSeverity) return false;
    if (filterStatus && d.status !== filterStatus) return false;
    return true;
  });

  function handleRegister() {
    alert("불량이 등록되었습니다.");
    setForm(EMPTY_FORM);
  }

  const TAB_STYLE = (active: boolean) => ({
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: active ? 600 : 400,
    color: active ? "#2563eb" : "#6b7280",
    borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    transition: "color 0.15s",
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="불량 관리"
        section="품질관리 > 불량관리"
        action={
          <button
            onClick={() => setActiveTab("register")}
            className="text-sm text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#2563eb" }}
          >
            + 불량 등록
          </button>
        }
      />

      {/* KPI 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="이번달 불량"
          value="53건"
          sub="전월比 -12% ↓"
          color="#1e3a5f"
          icon={<AlertTriangle size={18} />}
        />
        <KpiCard
          label="처리중"
          value="2건"
          sub="즉시 조치 필요"
          color="#dc2626"
          icon={<Clock size={18} />}
        />
        <KpiCard
          label="처리완료"
          value="51건"
          sub="완료율 96.2%"
          color="#16a34a"
          icon={<CheckCircle size={18} />}
        />
        <KpiCard
          label="불량 손실비용"
          value="₩3.2M"
          sub="이번달 누적"
          color="#b45309"
          icon={<DollarSign size={18} />}
        />
      </div>

      {/* 탭 */}
      <div
        className="bg-white rounded-lg"
        style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex" }}>
          <button style={TAB_STYLE(activeTab === "list")} onClick={() => setActiveTab("list")}>
            불량 목록
          </button>
          <button
            style={TAB_STYLE(activeTab === "register")}
            onClick={() => setActiveTab("register")}
          >
            불량 등록
          </button>
          <button style={TAB_STYLE(activeTab === "stats")} onClick={() => setActiveTab("stats")}>
            통계
          </button>
        </div>

        {/* ── 탭1: 불량 목록 ── */}
        {activeTab === "list" && (
          <div className="p-4">
            {/* 필터 바 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterLine}
                onChange={(e) => setFilterLine(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 라인</option>
                <option>라인 A</option>
                <option>라인 B</option>
                <option>라인 C</option>
                <option>라인 D</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 유형</option>
                <option>치수불량</option>
                <option>조립불량</option>
                <option>표면불량</option>
                <option>기능불량</option>
                <option>누유</option>
                <option>기타</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 심각도</option>
                <option>상</option>
                <option>중</option>
                <option>하</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 상태</option>
                <option>처리완료</option>
                <option>처리중</option>
                <option>완료</option>
              </select>
              {(filterDate || filterLine || filterType || filterSeverity || filterStatus) && (
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterLine("");
                    setFilterType("");
                    setFilterSeverity("");
                    setFilterStatus("");
                  }}
                  className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded border border-gray-200 hover:border-red-300 transition-colors"
                >
                  필터 초기화
                </button>
              )}
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid #e5e7eb" }}>
              <table className="min-w-full text-sm">
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    {[
                      "불량번호",
                      "발생일시",
                      "라인",
                      "제품",
                      "공정",
                      "유형",
                      "상세설명",
                      "수량",
                      "원인",
                      "심각도",
                      "처리상태",
                      "손실비용",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap"
                        style={{ fontSize: "11px", borderBottom: "1px solid #e5e7eb" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center py-10 text-gray-400 text-sm">
                        조건에 맞는 불량 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <>
                        <tr
                          key={row.id}
                          className="hover:bg-blue-50 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedRow(expandedRow === row.id ? null : row.id)
                          }
                        >
                          <td className="px-3 py-2.5 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">
                            {row.id}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                            {row.date}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.line}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.product}</td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.process}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <TypeBadge type={row.type} />
                          </td>
                          <td
                            className="px-3 py-2.5 text-gray-600 max-w-xs truncate"
                            title={row.detail}
                          >
                            {row.detail}
                          </td>
                          <td className="px-3 py-2.5 text-center text-gray-700">{row.qty}</td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.cause}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <SeverityBadge severity={row.severity} />
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap font-medium">
                            ₩{row.cost.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-gray-400">
                            {expandedRow === row.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </td>
                        </tr>

                        {/* 확장 상세 패널 */}
                        {expandedRow === row.id && (
                          <tr key={`${row.id}-expand`}>
                            <td
                              colSpan={13}
                              style={{ backgroundColor: "#f0f7ff", borderBottom: "1px solid #bfdbfe" }}
                            >
                              <div className="px-6 py-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-xs text-gray-400 mb-0.5">담당 검사자</p>
                                    <p className="font-medium text-gray-800">{row.inspector}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-0.5">발생 원인</p>
                                    <p className="font-medium text-gray-800">{row.cause}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-0.5">조치 방법</p>
                                    <p className="font-medium text-gray-800">{row.action}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-0.5">불량 상세</p>
                                    <p className="font-medium text-gray-800">{row.detail}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-400 mb-0.5">손실비용</p>
                                    <p className="font-medium text-gray-800">
                                      ₩{row.cost.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                {row.status === "처리중" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      alert(`${row.id} 조치가 완료 처리되었습니다.`);
                                    }}
                                    className="text-xs text-white px-3 py-1.5 rounded"
                                    style={{ backgroundColor: "#2563eb" }}
                                  >
                                    조치완료 처리
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">총 {filtered.length}건 표시 중</p>
          </div>
        )}

        {/* ── 탭2: 불량 등록 ── */}
        {activeTab === "register" && (
          <div className="p-6 max-w-3xl">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">신규 불량 등록</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 라인 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  라인 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.line}
                  onChange={(e) => setForm({ ...form, line: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택</option>
                  <option>라인 A</option>
                  <option>라인 B</option>
                  <option>라인 C</option>
                  <option>라인 D</option>
                </select>
              </div>

              {/* 제품명 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  제품명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 자동화 용접라인"
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 공정 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  공정 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.process}
                  onChange={(e) => setForm({ ...form, process: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택</option>
                  <option>용접</option>
                  <option>조립</option>
                  <option>도장</option>
                  <option>기계가공</option>
                  <option>검사</option>
                  <option>포장</option>
                </select>
              </div>

              {/* 불량 유형 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  불량 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택</option>
                  <option>치수불량</option>
                  <option>조립불량</option>
                  <option>표면불량</option>
                  <option>기능불량</option>
                  <option>누유</option>
                  <option>기타</option>
                </select>
              </div>

              {/* 불량 수량 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  불량 수량 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 심각도 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  심각도 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택</option>
                  <option>상</option>
                  <option>중</option>
                  <option>하</option>
                </select>
              </div>

              {/* 담당자 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">담당자</label>
                <input
                  type="text"
                  placeholder="검사 담당자 이름"
                  value={form.inspector}
                  onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 불량 상세 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  불량 상세 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="불량 내용을 상세히 입력하세요"
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* 발생 원인 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">발생 원인</label>
                <textarea
                  rows={2}
                  placeholder="불량 발생 원인 분석 내용"
                  value={form.cause}
                  onChange={(e) => setForm({ ...form, cause: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* 조치 방법 */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">조치 방법</label>
                <textarea
                  rows={2}
                  placeholder="처리 조치 방법 및 재발방지 대책"
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRegister}
                className="text-sm text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#2563eb" }}
              >
                등록
              </button>
              <button
                onClick={() => setForm(EMPTY_FORM)}
                className="text-sm px-6 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* ── 탭3: 통계 ── */}
        {activeTab === "stats" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 불량 유형별 PieChart (도넛) */}
              <div
                className="bg-white rounded-lg p-4"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#1e3a5f" }}>
                  불량 유형별 분포
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={DEFECT_BY_TYPE}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {DEFECT_BY_TYPE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}건`, "건수"]}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: "12px", color: "#4b5563" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 최근 7일 불량 발생 추이 BarChart */}
              <div
                className="bg-white rounded-lg p-4"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#1e3a5f" }}>
                  최근 7일 불량 발생 추이
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={DAILY_DEFECTS} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip
                      formatter={(value) => [`${value}건`, "불량건수"]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} name="불량건수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 라인별 불량 건수 수평 BarChart */}
              <div
                className="bg-white rounded-lg p-4"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#1e3a5f" }}>
                  라인별 불량 건수
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={LINE_DEFECTS}
                    layout="vertical"
                    barSize={22}
                    margin={{ left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis
                      type="category"
                      dataKey="line"
                      tick={{ fontSize: 11, fill: "#4b5563" }}
                      width={55}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}건`, "불량건수"]}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[0, 3, 3, 0]} name="불량건수" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 손실비용 누적 AreaChart */}
              <div
                className="bg-white rounded-lg p-4"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: "#1e3a5f" }}>
                  손실비용 누적 추이
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={COST_CUMULATIVE}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(v) => `₩${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₩${Number(value).toLocaleString()}`,
                        "누적 손실비용",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumCost"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#costGrad)"
                      name="누적 손실비용"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
