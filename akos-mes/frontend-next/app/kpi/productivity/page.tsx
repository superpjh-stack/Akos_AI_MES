'use client';

import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, Gauge, Target, ChevronDown, BarChart2, Settings } from 'lucide-react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── TypeScript Interfaces ───────────────────────────────────────────────────

interface LineKpi {
  id: string;
  line: string;
  equipment: string;
  shift: '1교대' | '2교대' | '3교대';
  period: '오늘' | '이번주' | '이번달';
  oee: number;         // %
  availability: number; // 가동률 %
  performance: number;  // 성능률 %
  quality: number;      // 품질률 %
  planQty: number;
  actualQty: number;
  defectQty: number;
  uptimeMin: number;   // 가동시간 (분)
  targetOee: number;   // 목표 OEE %
  status: 'active' | 'warning' | 'error' | 'idle';
}

// ─── Sample Data (10행 이상) ──────────────────────────────────────────────────

const ALL_DATA: LineKpi[] = [
  // 오늘
  { id: 'L001', line: '조립라인 A', equipment: 'ASSY-01', shift: '1교대', period: '오늘', oee: 87.2, availability: 94.5, performance: 91.8, quality: 99.5, planQty: 240, actualQty: 236, defectQty: 3, uptimeMin: 448, targetOee: 85, status: 'active' },
  { id: 'L002', line: '조립라인 B', equipment: 'ASSY-02', shift: '1교대', period: '오늘', oee: 72.4, availability: 81.2, performance: 89.5, quality: 99.5, planQty: 200, actualQty: 178, defectQty: 9, uptimeMin: 389, targetOee: 85, status: 'warning' },
  { id: 'L003', line: '용접라인 1', equipment: 'WELD-01', shift: '1교대', period: '오늘', oee: 91.0, availability: 96.0, performance: 94.8, quality: 99.9, planQty: 120, actualQty: 115, defectQty: 1, uptimeMin: 461, targetOee: 88, status: 'active' },
  { id: 'L004', line: '도장라인',   equipment: 'PAINT-01', shift: '1교대', period: '오늘', oee: 65.3, availability: 74.1, performance: 88.0, quality: 99.8, planQty: 300, actualQty: 240, defectQty: 5, uptimeMin: 355, targetOee: 80, status: 'error' },
  { id: 'L005', line: '조립라인 A', equipment: 'ASSY-01', shift: '2교대', period: '오늘', oee: 84.5, availability: 92.1, performance: 91.6, quality: 99.9, planQty: 240, actualQty: 228, defectQty: 2, uptimeMin: 441, targetOee: 85, status: 'active' },
  { id: 'L006', line: '조립라인 B', equipment: 'ASSY-02', shift: '2교대', period: '오늘', oee: 79.8, availability: 88.4, performance: 90.3, quality: 100.0, planQty: 200, actualQty: 185, defectQty: 0, uptimeMin: 424, targetOee: 85, status: 'active' },
  { id: 'L007', line: '용접라인 2', equipment: 'WELD-02', shift: '1교대', period: '오늘', oee: 88.6, availability: 95.2, performance: 93.1, quality: 100.0, planQty: 100, actualQty: 95, defectQty: 0, uptimeMin: 457, targetOee: 88, status: 'active' },
  { id: 'L008', line: '포장라인',   equipment: 'PACK-01', shift: '1교대', period: '오늘', oee: 93.2, availability: 97.8, performance: 95.3, quality: 100.0, planQty: 500, actualQty: 490, defectQty: 0, uptimeMin: 469, targetOee: 90, status: 'active' },
  { id: 'L009', line: '도장라인',   equipment: 'PAINT-01', shift: '2교대', period: '오늘', oee: 70.1, availability: 77.5, performance: 90.5, quality: 99.8, planQty: 300, actualQty: 250, defectQty: 4, uptimeMin: 372, targetOee: 80, status: 'warning' },
  { id: 'L010', line: '검사라인',   equipment: 'QC-01',   shift: '1교대', period: '오늘', oee: 95.0, availability: 98.2, performance: 96.7, quality: 100.0, planQty: 600, actualQty: 592, defectQty: 0, uptimeMin: 471, targetOee: 90, status: 'active' },
  { id: 'L011', line: 'CNC 가공 1', equipment: 'CNC-01',  shift: '1교대', period: '오늘', oee: 82.3, availability: 90.0, performance: 91.4, quality: 99.9, planQty: 80, actualQty: 74, defectQty: 1, uptimeMin: 432, targetOee: 85, status: 'active' },
  { id: 'L012', line: 'CNC 가공 2', equipment: 'CNC-02',  shift: '2교대', period: '오늘', oee: 61.0, availability: 68.5, performance: 89.0, quality: 100.0, planQty: 80, actualQty: 56, defectQty: 0, uptimeMin: 329, targetOee: 85, status: 'error' },
  // 이번주
  { id: 'W001', line: '조립라인 A', equipment: 'ASSY-01', shift: '1교대', period: '이번주', oee: 85.6, availability: 93.0, performance: 92.0, quality: 99.8, planQty: 1200, actualQty: 1170, defectQty: 12, uptimeMin: 2240, targetOee: 85, status: 'active' },
  { id: 'W002', line: '조립라인 B', equipment: 'ASSY-02', shift: '1교대', period: '이번주', oee: 74.2, availability: 83.0, performance: 89.4, quality: 99.7, planQty: 1000, actualQty: 890, defectQty: 28, uptimeMin: 1950, targetOee: 85, status: 'warning' },
  { id: 'W003', line: '용접라인 1', equipment: 'WELD-01', shift: '1교대', period: '이번주', oee: 90.2, availability: 95.5, performance: 94.5, quality: 99.9, planQty: 600, actualQty: 575, defectQty: 4, uptimeMin: 2305, targetOee: 88, status: 'active' },
  { id: 'W004', line: '도장라인',   equipment: 'PAINT-01', shift: '1교대', period: '이번주', oee: 67.8, availability: 76.3, performance: 88.9, quality: 99.7, planQty: 1500, actualQty: 1220, defectQty: 22, uptimeMin: 1775, targetOee: 80, status: 'warning' },
  { id: 'W005', line: '포장라인',   equipment: 'PACK-01', shift: '1교대', period: '이번주', oee: 92.0, availability: 97.0, performance: 94.8, quality: 100.0, planQty: 2500, actualQty: 2435, defectQty: 0, uptimeMin: 2345, targetOee: 90, status: 'active' },
  // 이번달
  { id: 'M001', line: '조립라인 A', equipment: 'ASSY-01', shift: '1교대', period: '이번달', oee: 84.0, availability: 92.0, performance: 91.3, quality: 99.8, planQty: 5200, actualQty: 4900, defectQty: 45, uptimeMin: 9200, targetOee: 85, status: 'active' },
  { id: 'M002', line: '조립라인 B', equipment: 'ASSY-02', shift: '1교대', period: '이번달', oee: 73.5, availability: 82.0, performance: 89.6, quality: 99.6, planQty: 4500, actualQty: 3850, defectQty: 110, uptimeMin: 8100, targetOee: 85, status: 'warning' },
  { id: 'M003', line: '용접라인 1', equipment: 'WELD-01', shift: '1교대', period: '이번달', oee: 89.5, availability: 95.0, performance: 94.2, quality: 99.9, planQty: 2600, actualQty: 2490, defectQty: 18, uptimeMin: 9500, targetOee: 88, status: 'active' },
  { id: 'M004', line: '도장라인',   equipment: 'PAINT-01', shift: '1교대', period: '이번달', oee: 66.1, availability: 75.0, performance: 88.1, quality: 99.8, planQty: 6500, actualQty: 5200, defectQty: 88, uptimeMin: 7500, targetOee: 80, status: 'warning' },
  { id: 'M005', line: '포장라인',   equipment: 'PACK-01', shift: '1교대', period: '이번달', oee: 91.8, availability: 97.5, performance: 94.2, quality: 100.0, planQty: 11000, actualQty: 10500, defectQty: 0, uptimeMin: 9750, targetOee: 90, status: 'active' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function OeeBar({ value, target }: { value: number; target: number }) {
  const pct = Math.min(value, 100);
  const color = value >= target ? 'bg-emerald-500' : value >= target - 10 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 bg-gray-100 rounded-full h-2 min-w-[70px]">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
        {/* target line */}
        <div
          className="absolute top-0 h-2 w-0.5 bg-gray-400 opacity-60"
          style={{ left: `${target}%` }}
        />
      </div>
      <span className={`text-xs font-semibold w-10 text-right ${value >= target ? 'text-emerald-600' : value >= target - 10 ? 'text-yellow-600' : 'text-red-500'}`}>
        {value}%
      </span>
    </div>
  );
}

function AchieveRate({ actual, plan }: { actual: number; plan: number }) {
  const rate = plan > 0 ? ((actual / plan) * 100).toFixed(1) : '0.0';
  const num = parseFloat(rate);
  return (
    <div className="text-right">
      <div className="text-xs text-gray-500">{actual.toLocaleString()} / {plan.toLocaleString()}</div>
      <div className={`text-xs font-semibold ${num >= 100 ? 'text-emerald-600' : num >= 90 ? 'text-yellow-600' : 'text-red-500'}`}>
        {rate}%
      </div>
    </div>
  );
}

// ─── Table columns ────────────────────────────────────────────────────────────

const columns: Column<LineKpi & Record<string, unknown>>[] = [
  { key: 'line', header: '라인', sortable: true },
  { key: 'equipment', header: '설비코드', width: '100px' },
  { key: 'shift', header: '교대', width: '70px', align: 'center' },
  {
    key: 'oee', header: 'OEE', width: '150px',
    sortable: true,
    render: (v, row) => <OeeBar value={Number(v)} target={(row as unknown as LineKpi).targetOee} />,
  },
  { key: 'availability', header: '가동률', width: '80px', align: 'center', sortable: true, render: (v) => <span className="font-medium text-gray-700">{String(v)}%</span> },
  { key: 'performance', header: '성능률', width: '80px', align: 'center', sortable: true, render: (v) => <span className="font-medium text-gray-700">{String(v)}%</span> },
  { key: 'quality', header: '품질률', width: '80px', align: 'center', sortable: true, render: (v) => <span className="font-medium text-gray-700">{String(v)}%</span> },
  {
    key: 'actualQty', header: '실적/계획', width: '120px', align: 'right',
    render: (v, row) => <AchieveRate actual={Number(v)} plan={(row as unknown as LineKpi).planQty} />,
  },
  { key: 'defectQty', header: '불량', width: '60px', align: 'center', sortable: true, render: (v) => <span className={Number(v) > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>{String(v)}</span> },
  { key: 'targetOee', header: '목표OEE', width: '75px', align: 'center', render: (v) => <span className="text-gray-500 text-xs">{String(v)}%</span> },
  { key: 'status', header: '상태', width: '80px', align: 'center', render: (v) => <StatusBadge status={String(v)} /> },
  {
    key: 'id', header: '액션', width: '90px', align: 'center',
    render: () => (
      <div className="flex gap-1 justify-center">
        <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600">상세</button>
        <button className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50">수정</button>
      </div>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductivityKpiPage() {
  const [period, setPeriod] = useState<'오늘' | '이번주' | '이번달'>('오늘');
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const periodData = useMemo(() => ALL_DATA.filter(r => r.period === period), [period]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return periodData.filter(r => {
      const matchSearch = !q || r.line.toLowerCase().includes(q) || r.equipment.toLowerCase().includes(q);
      const matchLine = !filterValues.line || filterValues.line === 'all' || r.line === filterValues.line;
      const matchShift = !filterValues.shift || filterValues.shift === 'all' || r.shift === filterValues.shift;
      const matchStatus = !filterValues.status || filterValues.status === 'all' || r.status === filterValues.status;
      return matchSearch && matchLine && matchShift && matchStatus;
    });
  }, [periodData, search, filterValues]);

  // KPI aggregation
  const avgOee = filtered.length > 0 ? (filtered.reduce((s, r) => s + r.oee, 0) / filtered.length).toFixed(1) : '0.0';
  const totalActual = filtered.reduce((s, r) => s + r.actualQty, 0);
  const totalPlan = filtered.reduce((s, r) => s + r.planQty, 0);
  const achieveRate = totalPlan > 0 ? ((totalActual / totalPlan) * 100).toFixed(1) : '0.0';
  const avgAvail = filtered.length > 0 ? (filtered.reduce((s, r) => s + r.availability, 0) / filtered.length).toFixed(1) : '0.0';
  const aboveTargetCount = filtered.filter(r => r.oee >= r.targetOee).length;

  const uniqueLines = [...new Set(ALL_DATA.map(r => r.line))];

  const kpiCards = [
    {
      label: '평균 OEE',
      value: `${avgOee}%`,
      sub: `목표 달성 ${aboveTargetCount}/${filtered.length} 라인`,
      color: 'border-l-blue-500',
      textColor: 'text-blue-600',
      icon: <Gauge className="w-6 h-6 text-blue-400" />,
    },
    {
      label: '생산 달성률',
      value: `${achieveRate}%`,
      sub: `${totalActual.toLocaleString()} / ${totalPlan.toLocaleString()}개`,
      color: 'border-l-emerald-500',
      textColor: 'text-emerald-600',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
    },
    {
      label: '평균 가동률',
      value: `${avgAvail}%`,
      sub: '설비 가동 기준',
      color: 'border-l-yellow-400',
      textColor: 'text-yellow-600',
      icon: <Activity className="w-6 h-6 text-yellow-400" />,
    },
    {
      label: '총 생산량',
      value: totalActual.toLocaleString(),
      sub: `계획 대비 ${achieveRate}%`,
      color: 'border-l-gray-400',
      textColor: 'text-gray-700',
      icon: <BarChart2 className="w-6 h-6 text-gray-400" />,
    },
  ];

  return (
    <>
      <PageHeader
        title="생산성 KPI"
        subtitle="라인별·설비별 OEE, 생산량, 가동률, 목표 대비 달성률을 조회합니다"
        breadcrumbs={[{ label: 'KPI관리' }, { label: '생산성KPI' }]}
        actions={[{ label: '보고서 내보내기', onClick: () => {}, variant: 'secondary' }]}
      />

      <div className="p-6 space-y-6">

        {/* 기간 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 mr-1">기간:</span>
          {(['오늘', '이번주', '이번달'] as const).map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setSearch(''); setFilterValues({}); }}
              className={`px-4 py-1.5 text-sm rounded-lg border transition-colors font-medium ${
                period === p
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {period === '오늘' && '기준: 2026-06-04'}
            {period === '이번주' && '기준: 2026-06-01 ~ 06-04'}
            {period === '이번달' && '기준: 2026-06-01 ~ 06-04'}
          </span>
        </div>

        {/* KPI 카드 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(kpi => (
            <div
              key={kpi.label}
              className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.textColor}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                <div className="mt-1">{kpi.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 테이블 */}
        <PageCard title={`라인별·설비별 KPI 상세 (${filtered.length}건)`}>
          <SearchFilter
            placeholder="라인명, 설비코드 검색"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: 'line',
                label: '라인',
                options: uniqueLines.map(l => ({ value: l, label: l })),
              },
              {
                key: 'shift',
                label: '교대',
                options: [
                  { value: '1교대', label: '1교대' },
                  { value: '2교대', label: '2교대' },
                  { value: '3교대', label: '3교대' },
                ],
              },
              {
                key: 'status',
                label: '상태',
                options: [
                  { value: 'active', label: '정상' },
                  { value: 'warning', label: '경고' },
                  { value: 'error', label: '이상' },
                  { value: 'idle', label: '미가동' },
                ],
              },
            ]}
            filterValues={filterValues}
            onFilterChange={(k, v) => setFilterValues(prev => ({ ...prev, [k]: v }))}
            onReset={() => { setSearch(''); setFilterValues({}); }}
          />
          <div className="mt-3">
            <DataTable
              columns={columns as Column<Record<string, unknown>>[]}
              data={filtered as unknown as Record<string, unknown>[]}
              rowKey="id"
              pageSize={10}
              emptyMessage="조건에 맞는 KPI 데이터가 없습니다."
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            * OEE 바 차트의 세로선은 목표 OEE를 나타냅니다. 녹색: 목표 달성 / 노란색: 목표 -10% 이내 / 빨간색: 목표 미달
          </p>
        </PageCard>

      </div>
    </>
  );
}
