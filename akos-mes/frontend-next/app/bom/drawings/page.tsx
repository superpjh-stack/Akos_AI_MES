"use client";

import { useState } from "react";

// ─── 타입 정의 ───────────────────────────────────────────────
type DrawingStatus = "현행" | "개정중" | "검토중" | "구버전" | "폐기";
type DrawingType = "조립도" | "부품도" | "회로도" | "배선도" | "배치도" | "상세도";
type DrawingFormat = "PDF" | "DWG" | "STEP" | "IGES" | "STP";

interface Drawing {
  id: string;
  drawingNo: string;
  title: string;
  type: DrawingType;
  format: DrawingFormat;
  revision: string;
  linkedBom: string;
  status: DrawingStatus;
  updatedAt: string;
  updatedBy: string;
  fileSize: string;
}

// ─── 목업 데이터 ──────────────────────────────────────────────
const MOCK_DRAWINGS: Drawing[] = [
  {
    id: "1",
    drawingNo: "DRW-2024-001",
    title: "메인 프레임 조립도",
    type: "조립도",
    format: "DWG",
    revision: "Rev.C",
    linkedBom: "BOM-2024-001",
    status: "현행",
    updatedAt: "2024-03-15",
    updatedBy: "김설계",
    fileSize: "4.2 MB",
  },
  {
    id: "2",
    drawingNo: "DRW-2024-002",
    title: "모터 마운트 부품도",
    type: "부품도",
    format: "STEP",
    revision: "Rev.B",
    linkedBom: "BOM-2024-002",
    status: "개정중",
    updatedAt: "2024-03-18",
    updatedBy: "이기구",
    fileSize: "1.8 MB",
  },
  {
    id: "3",
    drawingNo: "DRW-2024-003",
    title: "제어반 회로도",
    type: "회로도",
    format: "PDF",
    revision: "Rev.A",
    linkedBom: "BOM-2024-003",
    status: "검토중",
    updatedAt: "2024-03-20",
    updatedBy: "박전기",
    fileSize: "2.5 MB",
  },
  {
    id: "4",
    drawingNo: "DRW-2024-004",
    title: "배선 경로 배선도",
    type: "배선도",
    format: "PDF",
    revision: "Rev.D",
    linkedBom: "BOM-2024-004",
    status: "현행",
    updatedAt: "2024-02-28",
    updatedBy: "최배선",
    fileSize: "3.1 MB",
  },
  {
    id: "5",
    drawingNo: "DRW-2023-015",
    title: "구형 컨베이어 조립도",
    type: "조립도",
    format: "DWG",
    revision: "Rev.A",
    linkedBom: "BOM-2023-015",
    status: "구버전",
    updatedAt: "2023-11-10",
    updatedBy: "정구형",
    fileSize: "5.0 MB",
  },
  {
    id: "6",
    drawingNo: "DRW-2023-008",
    title: "레거시 유압 회로도",
    type: "회로도",
    format: "PDF",
    revision: "Rev.B",
    linkedBom: "-",
    status: "폐기",
    updatedAt: "2023-06-01",
    updatedBy: "한폐기",
    fileSize: "0.9 MB",
  },
  {
    id: "7",
    drawingNo: "DRW-2024-005",
    title: "설비 배치도 v2",
    type: "배치도",
    format: "DWG",
    revision: "Rev.A",
    linkedBom: "BOM-2024-005",
    status: "현행",
    updatedAt: "2024-03-22",
    updatedBy: "윤배치",
    fileSize: "6.7 MB",
  },
  {
    id: "8",
    drawingNo: "DRW-2024-006",
    title: "스핀들 상세도",
    type: "상세도",
    format: "STEP",
    revision: "Rev.C",
    linkedBom: "BOM-2024-006",
    status: "개정중",
    updatedAt: "2024-03-25",
    updatedBy: "조상세",
    fileSize: "2.2 MB",
  },
];

// ─── KPI 데이터 계산 ──────────────────────────────────────────
function calcKpi(drawings: Drawing[]) {
  const total = drawings.length;
  const current = drawings.filter((d) => d.status === "현행").length;
  const inRevision = drawings.filter(
    (d) => d.status === "개정중" || d.status === "검토중"
  ).length;
  const thisMonthUpdated = drawings.filter((d) => {
    const updated = new Date(d.updatedAt);
    const now = new Date();
    return (
      updated.getFullYear() === now.getFullYear() &&
      updated.getMonth() === now.getMonth()
    );
  }).length;
  return { total, current, inRevision, thisMonthUpdated };
}

// ─── StatusBadge 컴포넌트 ─────────────────────────────────────
const STATUS_STYLES: Record<DrawingStatus, string> = {
  현행: "bg-green-100 text-green-800 border border-green-200",
  개정중: "bg-blue-100 text-blue-800 border border-blue-200",
  검토중: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  구버전: "bg-gray-100 text-gray-600 border border-gray-200",
  폐기: "bg-red-100 text-red-700 border border-red-200",
};

function StatusBadge({ status }: { status: DrawingStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ─── KPI Card 컴포넌트 ────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  colorClass: string;
  icon: string;
}

function KpiCard({ label, value, unit = "건", colorClass, icon }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${colorClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
          <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

// ─── 포맷 배지 ────────────────────────────────────────────────
const FORMAT_STYLES: Record<DrawingFormat, string> = {
  PDF: "bg-red-50 text-red-700",
  DWG: "bg-purple-50 text-purple-700",
  STEP: "bg-indigo-50 text-indigo-700",
  IGES: "bg-teal-50 text-teal-700",
  STP: "bg-cyan-50 text-cyan-700",
};

function FormatBadge({ format }: { format: DrawingFormat }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${FORMAT_STYLES[format]}`}
    >
      {format}
    </span>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────
export default function DrawingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DrawingStatus | "전체">("전체");
  const [typeFilter, setTypeFilter] = useState<DrawingType | "전체">("전체");

  const kpi = calcKpi(MOCK_DRAWINGS);

  const filtered = MOCK_DRAWINGS.filter((d) => {
    const matchSearch =
      search === "" ||
      d.drawingNo.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.linkedBom.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "전체" || d.status === statusFilter;
    const matchType = typeFilter === "전체" || d.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">도면 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          설계 도면 현황 및 개정 이력을 관리합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="전체 도면수"
          value={kpi.total}
          colorClass="bg-blue-50 text-blue-600"
          icon="📐"
        />
        <KpiCard
          label="현행 도면"
          value={kpi.current}
          colorClass="bg-green-50 text-green-600"
          icon="✅"
        />
        <KpiCard
          label="개정 진행중"
          value={kpi.inRevision}
          colorClass="bg-yellow-50 text-yellow-600"
          icon="🔄"
        />
        <KpiCard
          label="이번달 업데이트"
          value={kpi.thisMonthUpdated}
          colorClass="bg-purple-50 text-purple-600"
          icon="📅"
        />
      </div>

      {/* 필터 & 검색 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="도면번호, 제목, 연결BOM 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DrawingStatus | "전체")
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">상태 전체</option>
            {(
              ["현행", "개정중", "검토중", "구버전", "폐기"] as DrawingStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* 종류 필터 */}
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as DrawingType | "전체")
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="전체">종류 전체</option>
            {(
              [
                "조립도",
                "부품도",
                "회로도",
                "배선도",
                "배치도",
                "상세도",
              ] as DrawingType[]
            ).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* 도면 등록 버튼 */}
          <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <span>+</span>
            <span>도면 등록</span>
          </button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            도면 목록
          </span>
          <span className="text-xs text-gray-400">
            {filtered.length}건 / 전체 {MOCK_DRAWINGS.length}건
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  도면번호
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  제목
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  종류
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  포맷
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  개정
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  연결 BOM
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  상태
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  업데이트
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((drawing) => (
                  <tr
                    key={drawing.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium">
                      {drawing.drawingNo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {drawing.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {drawing.fileSize}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{drawing.type}</td>
                    <td className="px-4 py-3">
                      <FormatBadge format={drawing.format} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {drawing.revision}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {drawing.linkedBom !== "-" ? (
                        <button className="hover:underline">
                          {drawing.linkedBom}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={drawing.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        {drawing.updatedAt}
                      </div>
                      <div className="text-xs text-gray-400">
                        {drawing.updatedBy}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="미리보기"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          👁
                        </button>
                        <button
                          title="다운로드"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          ⬇
                        </button>
                        <button
                          title="개정"
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        >
                          ✏
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>
            현행 {kpi.current}건 · 개정진행 {kpi.inRevision}건 · 구버전/폐기{" "}
            {MOCK_DRAWINGS.filter(
              (d) => d.status === "구버전" || d.status === "폐기"
            ).length}
            건
          </span>
          <span>마지막 갱신: {new Date().toLocaleDateString("ko-KR")}</span>
        </div>
      </div>
    </div>
  );
}
