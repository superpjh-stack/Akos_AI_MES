'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  Activity,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Period = '일' | '주' | '월' | '년';

interface ProductionRow {
  id: string;
  date: string;
  plan: number;
  actual: number;
  achievement: number;
  shift: string;
  line: string;
}

interface DefectRow {
  id: string;
  date: string;
  totalProduced: number;
  defectCount: number;
  defectRate: number;
  mainCause: string;
  line: string;
}

interface EquipmentRow {
  id: string;
  equipmentName: string;
  equipmentId: string;
  operatingHours: number;
  plannedHours: number;
  utilizationRate: number;
  downtime: number;
  status: 'normal' | 'warning' | 'down' | 'maintenance';
}

// ---------------------------------------------------------------------------
// Sample Data — 12 rows each
// ---------------------------------------------------------------------------

const PRODUCTION_DATA: ProductionRow[] = [
  { id: '1',  date: '2026-05-26', plan: 480, actual: 465, achievement: 96.9,  shift: '주간', line: 'A라인' },
  { id: '2',  date: '2026-05-27', plan: 480, actual: 491, achievement: 102.3, shift: '주간', line: 'A라인' },
  { id: '3',  date: '2026-05-28', plan: 480, actual: 448, achievement: 93.3,  shift: '주간', line: 'B라인' },
  { id: '4',  date: '2026-05-29', plan: 480, actual: 476, achievement: 99.2,  shift: '주간', line: 'A라인' },
  { id: '5',  date: '2026-05-30', plan: 480, actual: 502, achievement: 104.6, shift: '야간', line: 'C라인' },
  { id: '6',  date: '2026-05-31', plan: 480, actual: 455, achievement: 94.8,  shift: '주간', line: 'B라인' },
  { id: '7',  date: '2026-06-01', plan: 480, actual: 488, achievement: 101.7, shift: '주간', line: 'A라인' },
  { id: '8',  date: '2026-06-02', plan: 480, actual: 472, achievement: 98.3,  shift: '야간', line: 'C라인' },
  { id: '9',  date: '2026-06-03', plan: 480, actual: 460, achievement: 95.8,  shift: '주간', line: 'B라인' },
  { id: '10', date: '2026-06-04', plan: 480, actual: 495, achievement: 103.1, shift: '주간', line: 'A라인' },
  { id: '11', date: '2026-06-05', plan: 500, actual: 485, achievement: 97.0,  shift: '야간', line: 'A라인' },
  { id: '12', date: '2026-06-06', plan: 500, actual: 512, achievement: 102.4, shift: '주간', line: 'C라인' },
];

const DEFECT_DATA: DefectRow[] = [
  { id: '1',  date: '2026-05-26', totalProduced: 465, defectCount: 9,  defectRate: 1.94, mainCause: '치수불량', line: 'A라인' },
  { id: '2',  date: '2026-05-27', totalProduced: 491, defectCount: 8,  defectRate: 1.63, mainCause: '표면불량', line: 'A라인' },
  { id: '3',  date: '2026-05-28', totalProduced: 448, defectCount: 14, defectRate: 3.13, mainCause: '조립불량', line: 'B라인' },
  { id: '4',  date: '2026-05-29', totalProduced: 476, defectCount: 7,  defectRate: 1.47, mainCause: '치수불량', line: 'A라인' },
  { id: '5',  date: '2026-05-30', totalProduced: 502, defectCount: 11, defectRate: 2.19, mainCause: '도장불량', line: 'C라인' },
  { id: '6',  date: '2026-05-31', totalProduced: 455, defectCount: 12, defectRate: 2.64, mainCause: '표면불량', line: 'B라인' },
  { id: '7',  date: '2026-06-01', totalProduced: 488, defectCount: 6,  defectRate: 1.23, mainCause: '치수불량', line: 'A라인' },
  { id: '8',  date: '2026-06-02', totalProduced: 472, defectCount: 10, defectRate: 2.12, mainCause: '조립불량', line: 'C라인' },
  { id: '9',  date: '2026-06-03', totalProduced: 460, defectCount: 8,  defectRate: 1.74, mainCause: '표면불량', line: 'B라인' },
  { id: '10', date: '2026-06-04', totalProduced: 495, defectCount: 7,  defectRate: 1.41, mainCause: '치수불량', line: 'A라인' },
  { id: '11', date: '2026-06-05', totalProduced: 485, defectCount: 13, defectRate: 2.68, mainCause: '도장불량', line: 'A라인' },
  { id: '12', date: '2026-06-06', totalProduced: 512, defectCount: 5,  defectRate: 0.98, mainCause: '표면불량', line: 'C라인' },
];

const EQUIPMENT_DATA: EquipmentRow[] = [
  { id: '1',  equipmentName: 'CNC 가공기 #1',    equipmentId: 'CNC-001', operatingHours: 21.2, plannedHours: 24, utilizationRate: 88.3, downtime: 2.8,  status: 'normal' },
  { id: '2',  equipmentName: 'CNC 가공기 #2',    equipmentId: 'CNC-002', operatingHours: 22.6, plannedHours: 24, utilizationRate: 94.2, downtime: 1.4,  status: 'normal' },
  { id: '3',  equipmentName: '용접 로봇 #1',      equipmentId: 'WLD-001', operatingHours: 18.4, plannedHours: 24, utilizationRate: 76.7, downtime: 5.6,  status: 'warning' },
  { id: '4',  equipmentName: '도장 부스 #1',      equipmentId: 'PNT-001', operatingHours: 20.1, plannedHours: 24, utilizationRate: 83.8, downtime: 3.9,  status: 'normal' },
  { id: '5',  equipmentName: '프레스 #1',         equipmentId: 'PRS-001', operatingHours: 0,    plannedHours: 24, utilizationRate: 0.0,  downtime: 24.0, status: 'down' },
  { id: '6',  equipmentName: '조립 컨베이어 A',   equipmentId: 'CVR-001', operatingHours: 23.1, plannedHours: 24, utilizationRate: 96.3, downtime: 0.9,  status: 'normal' },
  { id: '7',  equipmentName: '검사 장비 #1',      equipmentId: 'INS-001', operatingHours: 16.0, plannedHours: 24, utilizationRate: 66.7, downtime: 8.0,  status: 'maintenance' },
  { id: '8',  equipmentName: '레이저 절단기 #1',  equipmentId: 'LSR-001', operatingHours: 22.0, plannedHours: 24, utilizationRate: 91.7, downtime: 2.0,  status: 'normal' },
  { id: '9',  equipmentName: '용접 로봇 #2',      equipmentId: 'WLD-002', operatingHours: 21.5, plannedHours: 24, utilizationRate: 89.6, downtime: 2.5,  status: 'normal' },
  { id: '10', equipmentName: '조립 컨베이어 B',   equipmentId: 'CVR-002', operatingHours: 19.8, plannedHours: 24, utilizationRate: 82.5, downtime: 4.2,  status: 'warning' },
  { id: '11', equipmentName: '드릴링 머신 #1',    equipmentId: 'DRL-001', operatingHours: 20.8, plannedHours: 24, utilizationRate: 86.7, downtime: 3.2,  status: 'normal' },
  { id: '12', equipmentName: '포장 자동화 라인',   equipmentId: 'PKG-001', operatingHours: 23.5, plannedHours: 24, utilizationRate: 97.9, downtime: 0.5,  status: 'normal' },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERIOD_OPTIONS: Period[] = ['일', '주', '월', '년'];
const PAGE_SIZE = 8;

const EQUIPMENT_STATUS_MAP: Record<EquipmentRow['status'], { label: string; bg: string; text: string }> = {
  normal:      { label: '정상',   bg: '#f0fdf4', text: '#16a34a' },
  warning:     { label: '주의',   bg: '#fffbeb', text: '#d97706' },
  down:        { label: '비가동', bg: '#fef2f2', text: '#dc2626' },
  maintenance: { label: '정비중', bg: '#f5f3ff', text: '#7c3aed' },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: EquipmentRow['status'] }) {
  const { label, bg, text } = EQUIPMENT_STATUS_MAP[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

function TrendBadge({ value, target, invert = false }: { value: number; target: number; invert?: boolean }) {
  const diff = value - target;
  const good = invert ? diff <= 0 : diff >= 0;
  const color = good ? '#16a34a' : '#dc2626';
  const Icon = diff > 0.001 ? TrendingUp : diff < -0.001 ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color }}>
      <Icon size={12} />
      {diff > 0 ? '+' : ''}{diff.toFixed(1)}
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-10 text-right" style={{ color }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function KpiCard({
  title, value, unit, sub, icon: Icon, iconBg, iconColor, trend,
}: {
  title: string;
  value: string | number;
  unit?: string;
  sub?: React.ReactNode;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <div
          className="flex items-center justify-center rounded-lg w-9 h-9"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={18} color={iconColor} />
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
      <div className="flex items-center justify-between">
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
        {trend}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center gap-1">
      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="상세">
        <Eye size={14} />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors" title="수정">
        <Edit2 size={14} />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="삭제">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function Pagination({
  total, page, pageSize, onChange,
}: {
  total: number; page: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-500">
        전체 {total}건 중 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}건
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 text-xs rounded border transition-colors ${
              p === page
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DataVisualizationPage() {
  const [period, setPeriod] = useState<Period>('일');
  const [prodSearch, setProdSearch] = useState('');
  const [defectSearch, setDefectSearch] = useState('');
  const [eqSearch, setEqSearch] = useState('');
  const [prodPage, setProdPage] = useState(1);
  const [defectPage, setDefectPage] = useState(1);
  const [eqPage, setEqPage] = useState(1);

  // Filtered data
  const filteredProduction = useMemo(
    () =>
      PRODUCTION_DATA.filter(
        (r) =>
          r.date.includes(prodSearch) ||
          r.line.includes(prodSearch) ||
          r.shift.includes(prodSearch),
      ),
    [prodSearch],
  );

  const filteredDefect = useMemo(
    () =>
      DEFECT_DATA.filter(
        (r) =>
          r.date.includes(defectSearch) ||
          r.line.includes(defectSearch) ||
          r.mainCause.includes(defectSearch),
      ),
    [defectSearch],
  );

  const filteredEquipment = useMemo(
    () =>
      EQUIPMENT_DATA.filter(
        (r) =>
          r.equipmentName.includes(eqSearch) ||
          r.equipmentId.includes(eqSearch),
      ),
    [eqSearch],
  );

  // Paginated slices
  const prodRows = filteredProduction.slice((prodPage - 1) * PAGE_SIZE, prodPage * PAGE_SIZE);
  const defectRows = filteredDefect.slice((defectPage - 1) * PAGE_SIZE, defectPage * PAGE_SIZE);
  const eqRows = filteredEquipment.slice((eqPage - 1) * PAGE_SIZE, eqPage * PAGE_SIZE);

  // Summary KPIs
  const avgAchievement = (
    PRODUCTION_DATA.reduce((s, r) => s + r.achievement, 0) / PRODUCTION_DATA.length
  ).toFixed(1);
  const avgDefectRate = (
    DEFECT_DATA.reduce((s, r) => s + r.defectRate, 0) / DEFECT_DATA.length
  ).toFixed(2);
  const avgUtilization = (
    EQUIPMENT_DATA.reduce((s, r) => s + r.utilizationRate, 0) / EQUIPMENT_DATA.length
  ).toFixed(1);
  const alertEquipment = EQUIPMENT_DATA.filter(
    (r) => r.status === 'down' || r.status === 'warning',
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">데이터 시각화</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            생산량 트렌드 · 불량률 추이 · 설비 가동률 종합 분석
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} />
            내보내기
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-sm text-white font-semibold transition-colors shadow-sm">
            <RefreshCw size={14} />
            데이터 갱신
          </button>
        </div>
      </div>

      {/* ── Period Selector ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              조회 기간 단위
            </p>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-sm rounded-lg border transition-colors font-medium ${
                    period === p
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Activity size={12} />
              실시간 업데이트 활성
            </span>
            <span>최종 갱신: 2026-06-04 09:15</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="평균 생산달성률"
          value={avgAchievement}
          unit="%"
          sub="기간 내 평균"
          icon={BarChart2}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          trend={<TrendBadge value={Number(avgAchievement)} target={98} />}
        />
        <KpiCard
          title="평균 불량률"
          value={avgDefectRate}
          unit="%"
          sub="목표: 2.0% 이하"
          icon={AlertTriangle}
          iconBg="#fffbeb"
          iconColor="#d97706"
          trend={<TrendBadge value={Number(avgDefectRate)} target={2.0} invert />}
        />
        <KpiCard
          title="평균 설비가동률"
          value={avgUtilization}
          unit="%"
          sub="목표: 92.0% 이상"
          icon={Activity}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          trend={<TrendBadge value={Number(avgUtilization)} target={92} />}
        />
        <KpiCard
          title="이상 설비"
          value={alertEquipment}
          unit="대"
          sub={`전체 ${EQUIPMENT_DATA.length}대 중`}
          icon={Settings}
          iconBg="#fef2f2"
          iconColor="#dc2626"
          trend={
            <span className="text-xs text-gray-500">비가동 + 주의</span>
          }
        />
      </div>

      {/* ── 생산량 트렌드 테이블 ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <SectionHeader
          title="생산량 트렌드"
          subtitle={`${period} 단위 조회 | 총 ${filteredProduction.length}건`}
        />
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            value={prodSearch}
            onChange={(e) => {
              setProdSearch(e.target.value);
              setProdPage(1);
            }}
            placeholder="날짜 / 라인 / 교대 검색..."
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['날짜', '라인', '교대', '계획 (EA)', '실적 (EA)', '달성률', '목표 대비', '액션'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prodRows.map((row) => {
                const achColor =
                  row.achievement >= 98
                    ? '#16a34a'
                    : row.achievement >= 90
                    ? '#d97706'
                    : '#dc2626';
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.line}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          row.shift === '주간'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {row.shift}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-600">
                      {row.plan.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-gray-900">
                      {row.actual.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 w-36">
                      <MiniBar value={row.achievement} max={110} color={achColor} />
                    </td>
                    <td className="px-4 py-3">
                      <TrendBadge value={row.achievement} target={98} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons />
                    </td>
                  </tr>
                );
              })}
              {prodRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          total={filteredProduction.length}
          page={prodPage}
          pageSize={PAGE_SIZE}
          onChange={setProdPage}
        />
      </div>

      {/* ── 불량률 추이 테이블 ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <SectionHeader
          title="불량률 추이"
          subtitle={`${period} 단위 조회 | 총 ${filteredDefect.length}건`}
        />
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            value={defectSearch}
            onChange={(e) => {
              setDefectSearch(e.target.value);
              setDefectPage(1);
            }}
            placeholder="날짜 / 라인 / 불량 원인 검색..."
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  '날짜',
                  '라인',
                  '생산 수량',
                  '불량 수량',
                  '불량률',
                  '목표 대비',
                  '주요 원인',
                  '액션',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {defectRows.map((row) => {
                const rateColor =
                  row.defectRate <= 2.0
                    ? '#16a34a'
                    : row.defectRate <= 3.0
                    ? '#d97706'
                    : '#dc2626';
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.line}</td>
                    <td className="px-4 py-3 tabular-nums text-gray-600">
                      {row.totalProduced.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-gray-900">
                      {row.defectCount}
                    </td>
                    <td className="px-4 py-3 w-36">
                      <MiniBar value={row.defectRate} max={5} color={rateColor} />
                    </td>
                    <td className="px-4 py-3">
                      <TrendBadge value={row.defectRate} target={2.0} invert />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {row.mainCause}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons />
                    </td>
                  </tr>
                );
              })}
              {defectRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          total={filteredDefect.length}
          page={defectPage}
          pageSize={PAGE_SIZE}
          onChange={setDefectPage}
        />
      </div>

      {/* ── 설비 가동률 요약 ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <SectionHeader
          title="설비 가동률 요약"
          subtitle={`전체 ${EQUIPMENT_DATA.length}대 | 정상 ${EQUIPMENT_DATA.filter((e) => e.status === 'normal').length}대 · 주의 ${EQUIPMENT_DATA.filter((e) => e.status === 'warning').length}대 · 비가동 ${EQUIPMENT_DATA.filter((e) => e.status === 'down').length}대 · 정비 ${EQUIPMENT_DATA.filter((e) => e.status === 'maintenance').length}대`}
        />
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            value={eqSearch}
            onChange={(e) => {
              setEqSearch(e.target.value);
              setEqPage(1);
            }}
            placeholder="설비명 / 설비 ID 검색..."
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  '설비명',
                  '설비 ID',
                  '가동 시간',
                  '계획 시간',
                  '가동률',
                  '비가동 시간',
                  '상태',
                  '액션',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {eqRows.map((row) => {
                const uColor =
                  row.utilizationRate >= 90
                    ? '#16a34a'
                    : row.utilizationRate >= 75
                    ? '#2563eb'
                    : row.utilizationRate >= 50
                    ? '#d97706'
                    : '#dc2626';
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.equipmentName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">
                      {row.equipmentId}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">
                      {row.operatingHours.toFixed(1)}{' '}
                      <span className="text-gray-400 text-xs">h</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-500">
                      {row.plannedHours}{' '}
                      <span className="text-gray-400 text-xs">h</span>
                    </td>
                    <td className="px-4 py-3 w-40">
                      <MiniBar value={row.utilizationRate} max={100} color={uColor} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-600">
                      {row.downtime.toFixed(1)}{' '}
                      <span className="text-gray-400 text-xs">h</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons />
                    </td>
                  </tr>
                );
              })}
              {eqRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          total={filteredEquipment.length}
          page={eqPage}
          pageSize={PAGE_SIZE}
          onChange={setEqPage}
        />
      </div>
    </div>
  );
}
