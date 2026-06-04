'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Zap, AlertCircle, Table2, Play, Download, RotateCcw, ChevronDown, Clock, BookmarkCheck, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

type DataSource = 'projects' | 'bom_items' | 'fat_records' | 'production_orders';

interface FilterRow {
  id: number;
  column: string;
  operator: string;
  value: string;
}

// ─── Column Definitions per datasource ───────────────────────────────────────

const SOURCE_COLUMNS: Record<DataSource, string[]> = {
  projects:          ['project_id', 'project_name', 'customer', 'status', 'start_date', 'end_date', 'manager'],
  bom_items:         ['bom_id', 'parent_item', 'child_item', 'item_name', 'quantity', 'unit', 'lead_time_days'],
  fat_records:       ['fat_id', 'project_id', 'inspector', 'inspection_date', 'result', 'defect_count', 'rework_hours'],
  production_orders: ['order_id', 'product_code', 'product_name', 'planned_qty', 'actual_qty', 'line', 'status', 'due_date'],
};

const OPERATORS = ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

// ─── Mock Result Sets ─────────────────────────────────────────────────────────

const MOCK_RESULTS: Record<DataSource, Record<string, unknown>[]> = {
  projects: [
    { project_id: 'PRJ-2026-001', project_name: '스마트공장 A라인 구축', customer: '현대중공업', status: '진행중', start_date: '2026-01-15', end_date: '2026-09-30', manager: '박준형' },
    { project_id: 'PRJ-2026-002', project_name: '자동화 용접 시스템', customer: 'LG에너지솔루션', status: '진행중', start_date: '2026-02-01', end_date: '2026-12-31', manager: '김철수' },
    { project_id: 'PRJ-2026-003', project_name: 'FAT 자동검사 장비', customer: '삼성SDI', status: '완료', start_date: '2025-10-01', end_date: '2026-03-15', manager: '이영희' },
    { project_id: 'PRJ-2026-004', project_name: '도장 공정 개선', customer: '기아자동차', status: '계획', start_date: '2026-07-01', end_date: '2026-11-30', manager: '최민준' },
    { project_id: 'PRJ-2025-015', project_name: 'MES 시스템 고도화', customer: '아코스 내부', status: '완료', start_date: '2025-06-01', end_date: '2025-12-31', manager: '박준형' },
    { project_id: 'PRJ-2026-005', project_name: 'CNC 설비 증설', customer: 'HD현대인프라코어', status: '진행중', start_date: '2026-03-01', end_date: '2026-08-31', manager: '배성호' },
    { project_id: 'PRJ-2026-006', project_name: '포장라인 자동화', customer: '롯데케미칼', status: '계획', start_date: '2026-08-01', end_date: '2027-02-28', manager: '강태양' },
    { project_id: 'PRJ-2026-007', project_name: '품질관리시스템 구축', customer: 'LS전선', status: '진행중', start_date: '2026-04-01', end_date: '2026-10-31', manager: '오지현' },
    { project_id: 'PRJ-2025-012', project_name: '물류창고 WMS 연동', customer: 'CJ대한통운', status: '보류', start_date: '2025-11-01', end_date: '2026-05-31', manager: '한동훈' },
    { project_id: 'PRJ-2026-008', project_name: 'AI 비전검사 도입', customer: 'SK하이닉스', status: '진행중', start_date: '2026-05-01', end_date: '2026-12-31', manager: '정수연' },
    { project_id: 'PRJ-2026-009', project_name: '전력모니터링 시스템', customer: '한화에어로스페이스', status: '계획', start_date: '2026-09-01', end_date: '2027-03-31', manager: '배성호' },
    { project_id: 'PRJ-2025-010', project_name: '생산계획 최적화', customer: '아코스 내부', status: '완료', start_date: '2025-03-01', end_date: '2025-09-30', manager: '이영희' },
  ],
  bom_items: [
    { bom_id: 'BOM-001-01', parent_item: 'ASSY-MAIN-001', child_item: 'PART-FRAME-001', item_name: '메인 프레임', quantity: 1, unit: 'EA', lead_time_days: 14 },
    { bom_id: 'BOM-001-02', parent_item: 'ASSY-MAIN-001', child_item: 'PART-MOTOR-003', item_name: 'AC 서보모터 1.5kW', quantity: 2, unit: 'EA', lead_time_days: 21 },
    { bom_id: 'BOM-001-03', parent_item: 'ASSY-MAIN-001', child_item: 'PART-CTRL-007', item_name: 'PLC 제어반', quantity: 1, unit: 'SET', lead_time_days: 30 },
    { bom_id: 'BOM-001-04', parent_item: 'ASSY-MAIN-001', child_item: 'PART-CABLE-012', item_name: '제어 케이블 다발', quantity: 5, unit: 'M', lead_time_days: 7 },
    { bom_id: 'BOM-002-01', parent_item: 'ASSY-ARM-002', child_item: 'PART-JOINT-001', item_name: '회전 조인트', quantity: 6, unit: 'EA', lead_time_days: 10 },
    { bom_id: 'BOM-002-02', parent_item: 'ASSY-ARM-002', child_item: 'PART-SENSOR-005', item_name: '토크 센서', quantity: 3, unit: 'EA', lead_time_days: 14 },
    { bom_id: 'BOM-002-03', parent_item: 'ASSY-ARM-002', child_item: 'PART-GRIP-009', item_name: '공압 그리퍼', quantity: 1, unit: 'EA', lead_time_days: 21 },
    { bom_id: 'BOM-003-01', parent_item: 'ASSY-BASE-003', child_item: 'PART-PLATE-001', item_name: '베이스 플레이트 (SS400)', quantity: 1, unit: 'EA', lead_time_days: 5 },
    { bom_id: 'BOM-003-02', parent_item: 'ASSY-BASE-003', child_item: 'PART-BOLT-M16', item_name: '앵커볼트 M16', quantity: 8, unit: 'EA', lead_time_days: 3 },
    { bom_id: 'BOM-003-03', parent_item: 'ASSY-BASE-003', child_item: 'PART-LEVEL-002', item_name: '레벨링 패드', quantity: 4, unit: 'EA', lead_time_days: 5 },
    { bom_id: 'BOM-004-01', parent_item: 'ASSY-SAFE-004', child_item: 'PART-GUARD-001', item_name: '안전가드 패널', quantity: 4, unit: 'EA', lead_time_days: 10 },
    { bom_id: 'BOM-004-02', parent_item: 'ASSY-SAFE-004', child_item: 'PART-EMSW-001', item_name: '비상정지 스위치', quantity: 2, unit: 'EA', lead_time_days: 7 },
  ],
  fat_records: [
    { fat_id: 'FAT-2026-0142', project_id: 'PRJ-2026-001', inspector: '최민준', inspection_date: '2026-06-03', result: '합격', defect_count: 0, rework_hours: 0 },
    { fat_id: 'FAT-2026-0141', project_id: 'PRJ-2026-002', inspector: '이영희', inspection_date: '2026-06-02', result: '조건부합격', defect_count: 2, rework_hours: 4.5 },
    { fat_id: 'FAT-2026-0140', project_id: 'PRJ-2026-003', inspector: '최민준', inspection_date: '2026-06-01', result: '합격', defect_count: 0, rework_hours: 0 },
    { fat_id: 'FAT-2026-0139', project_id: 'PRJ-2026-006', inspector: '박준형', inspection_date: '2026-05-30', result: '불합격', defect_count: 5, rework_hours: 12.0 },
    { fat_id: 'FAT-2026-0138', project_id: 'PRJ-2026-001', inspector: '최민준', inspection_date: '2026-05-28', result: '합격', defect_count: 1, rework_hours: 1.5 },
    { fat_id: 'FAT-2026-0137', project_id: 'PRJ-2026-005', inspector: '이영희', inspection_date: '2026-05-27', result: '합격', defect_count: 0, rework_hours: 0 },
    { fat_id: 'FAT-2026-0136', project_id: 'PRJ-2026-008', inspector: '박준형', inspection_date: '2026-05-26', result: '조건부합격', defect_count: 3, rework_hours: 6.0 },
    { fat_id: 'FAT-2026-0135', project_id: 'PRJ-2026-002', inspector: '최민준', inspection_date: '2026-05-24', result: '합격', defect_count: 0, rework_hours: 0 },
    { fat_id: 'FAT-2026-0134', project_id: 'PRJ-2026-007', inspector: '이영희', inspection_date: '2026-05-23', result: '불합격', defect_count: 7, rework_hours: 18.0 },
    { fat_id: 'FAT-2026-0133', project_id: 'PRJ-2026-001', inspector: '최민준', inspection_date: '2026-05-22', result: '합격', defect_count: 0, rework_hours: 0 },
    { fat_id: 'FAT-2026-0132', project_id: 'PRJ-2026-004', inspector: '박준형', inspection_date: '2026-05-20', result: '조건부합격', defect_count: 1, rework_hours: 2.0 },
    { fat_id: 'FAT-2026-0131', project_id: 'PRJ-2026-003', inspector: '이영희', inspection_date: '2026-05-19', result: '합격', defect_count: 0, rework_hours: 0 },
  ],
  production_orders: [
    { order_id: 'PO-2026-0451', product_code: 'PRD-ARM-001', product_name: '6축 로봇암 (중형)', planned_qty: 10, actual_qty: 10, line: '조립라인 A', status: '완료', due_date: '2026-06-03' },
    { order_id: 'PO-2026-0452', product_code: 'PRD-CNV-002', product_name: '컨베이어 시스템 2M', planned_qty: 5, actual_qty: 3, line: '조립라인 B', status: '진행중', due_date: '2026-06-07' },
    { order_id: 'PO-2026-0453', product_code: 'PRD-WLD-003', product_name: '자동용접 헤드 유닛', planned_qty: 8, actual_qty: 8, line: '용접라인 1', status: '완료', due_date: '2026-06-04' },
    { order_id: 'PO-2026-0454', product_code: 'PRD-CTRL-001', product_name: 'MCC 제어반 (3상 400V)', planned_qty: 15, actual_qty: 0, line: '-', status: '계획', due_date: '2026-06-20' },
    { order_id: 'PO-2026-0455', product_code: 'PRD-FAT-001', product_name: 'FAT 검사 지그 세트', planned_qty: 3, actual_qty: 1, line: '기계가공', status: '진행중', due_date: '2026-06-10' },
    { order_id: 'PO-2026-0456', product_code: 'PRD-FRAME-002', product_name: '설비 프레임 (대형)', planned_qty: 6, actual_qty: 6, line: '조립라인 A', status: '완료', due_date: '2026-06-02' },
    { order_id: 'PO-2026-0457', product_code: 'PRD-PUMP-005', product_name: '유압 펌프 유닛', planned_qty: 12, actual_qty: 8, line: '조립라인 B', status: '진행중', due_date: '2026-06-12' },
    { order_id: 'PO-2026-0458', product_code: 'PRD-SAFE-003', product_name: '안전 펜스 모듈', planned_qty: 20, actual_qty: 20, line: '도장라인', status: '완료', due_date: '2026-05-30' },
    { order_id: 'PO-2026-0459', product_code: 'PRD-SENSOR-007', product_name: '비전 센서 브라켓', planned_qty: 30, actual_qty: 5, line: '기계가공', status: '지연', due_date: '2026-06-01' },
    { order_id: 'PO-2026-0460', product_code: 'PRD-HMI-002', product_name: 'HMI 패널 (15인치)', planned_qty: 7, actual_qty: 0, line: '-', status: '계획', due_date: '2026-06-25' },
    { order_id: 'PO-2026-0461', product_code: 'PRD-GRIP-009', product_name: '공압 그리퍼 어셈블리', planned_qty: 18, actual_qty: 12, line: '조립라인 A', status: '진행중', due_date: '2026-06-15' },
    { order_id: 'PO-2026-0462', product_code: 'PRD-TRACK-001', product_name: 'AGV 트랙 세그먼트', planned_qty: 50, actual_qty: 50, line: '용접라인 2', status: '완료', due_date: '2026-06-01' },
  ],
};

const SAVED_QUERIES = [
  { id: 1, name: '이번 주 진행중 프로젝트', source: 'projects' as DataSource },
  { id: 2, name: '불합격 FAT 기록 조회', source: 'fat_records' as DataSource },
  { id: 3, name: '지연 생산오더 목록', source: 'production_orders' as DataSource },
  { id: 4, name: 'BOM 리드타임 20일 초과', source: 'bom_items' as DataSource },
  { id: 5, name: '프로젝트 완료 현황', source: 'projects' as DataSource },
  { id: 6, name: '오늘 FAT 검사 목록', source: 'fat_records' as DataSource },
  { id: 7, name: '조립라인 생산오더', source: 'production_orders' as DataSource },
  { id: 8, name: '재작업 발생 이력', source: 'fat_records' as DataSource },
];

const STATUS_COLORS: Record<string, string> = {
  진행중: 'bg-blue-100 text-blue-700',
  완료:   'bg-emerald-100 text-emerald-700',
  계획:   'bg-gray-100 text-gray-500',
  보류:   'bg-yellow-100 text-yellow-700',
  지연:   'bg-red-100 text-red-600',
  합격:   'bg-emerald-100 text-emerald-700',
  조건부합격: 'bg-yellow-100 text-yellow-700',
  불합격: 'bg-red-100 text-red-600',
};

const PAGE_SIZE = 8;

let filterIdSeq = 1;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function DataQueryPage() {
  const [source, setSource] = useState<DataSource>('projects');
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo]   = useState('2026-06-04');
  const [filters, setFilters] = useState<FilterRow[]>([{ id: filterIdSeq++, column: '', operator: '=', value: '' }]);
  const [executed, setExecuted] = useState(false);
  const [queryTime, setQueryTime] = useState(0);
  const [page, setPage] = useState(1);

  const results = executed ? MOCK_RESULTS[source] : [];
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columns = executed && results.length > 0 ? Object.keys(results[0]) : [];

  function handleExecute() {
    const t = +(Math.random() * 0.5 + 0.1).toFixed(2);
    setQueryTime(t);
    setExecuted(true);
    setPage(1);
  }

  function addFilter() {
    setFilters(prev => [...prev, { id: filterIdSeq++, column: '', operator: '=', value: '' }]);
  }
  function removeFilter(id: number) {
    setFilters(prev => prev.filter(f => f.id !== id));
  }
  function updateFilter(id: number, field: keyof FilterRow, value: string) {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }

  const cols = SOURCE_COLUMNS[source];

  return (
    <>
      <PageHeader
        title="데이터 조회"
        subtitle="데이터 소스 및 조건 필터를 설정하여 MES 데이터를 조회합니다"
        breadcrumbs={[{ label: '데이터관리' }, { label: '데이터조회' }]}
        actions={[
          { label: '쿼리 저장', onClick: () => {}, variant: 'secondary' },
          { label: '+ 조건 추가', onClick: addFilter, variant: 'secondary' },
        ]}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '오늘 쿼리', value: 42, sub: '금일 실행 횟수', icon: <Search size={18} />, color: 'border-blue-400', text: 'text-blue-600' },
            { label: '평균 응답', value: '0.3s', sub: '최근 10회 평균', icon: <Clock size={18} />, color: 'border-emerald-400', text: 'text-emerald-600' },
            { label: '저장된 쿼리', value: SAVED_QUERIES.length, sub: '재사용 가능', icon: <BookmarkCheck size={18} />, color: 'border-indigo-400', text: 'text-indigo-600' },
            { label: '데이터 소스', value: Object.keys(MOCK_RESULTS).length, sub: '연결된 테이블', icon: <Database size={18} />, color: 'border-gray-300', text: 'text-gray-700' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <span className={kpi.text}>{kpi.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${kpi.text}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Saved Queries Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">저장된 쿼리</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {SAVED_QUERIES.map(q => (
                  <li key={q.id}>
                    <button
                      onClick={() => { setSource(q.source); setExecuted(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors group"
                    >
                      <p className="text-xs font-medium text-gray-800 group-hover:text-blue-700 truncate">{q.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{q.source}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Query Builder */}
          <div className="lg:col-span-3 space-y-4">
            <PageCard title="쿼리 빌더">
              {/* Data Source + Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">데이터 소스</label>
                  <select
                    value={source}
                    onChange={e => { setSource(e.target.value as DataSource); setExecuted(false); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                  >
                    {(Object.keys(MOCK_RESULTS) as DataSource[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">시작일</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">종료일</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              {/* Filter Rows */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">조건 필터</p>
                  <button onClick={addFilter}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    + 조건 추가
                  </button>
                </div>
                <div className="space-y-2">
                  {filters.map((f, idx) => (
                    <div key={f.id} className="flex gap-2 items-center">
                      {idx > 0 && (
                        <span className="text-xs font-semibold text-gray-400 w-8 shrink-0">AND</span>
                      )}
                      {idx === 0 && <span className="text-xs text-gray-300 w-8 shrink-0">WHERE</span>}
                      <select
                        value={f.column}
                        onChange={e => updateFilter(f.id, 'column', e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50"
                      >
                        <option value="">컬럼 선택</option>
                        {cols.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select
                        value={f.operator}
                        onChange={e => updateFilter(f.id, 'operator', e.target.value)}
                        className="w-28 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50"
                      >
                        {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="값"
                        value={f.value}
                        onChange={e => updateFilter(f.id, 'value', e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      {filters.length > 1 && (
                        <button onClick={() => removeFilter(f.id)}
                          className="text-gray-300 hover:text-red-400 text-xs px-1">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button onClick={handleExecute}
                  className="flex items-center gap-2 px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  <Play size={14} />
                  조회 실행
                </button>
                <button onClick={() => { setExecuted(false); setFilters([{ id: filterIdSeq++, column: '', operator: '=', value: '' }]); }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  <RotateCcw size={14} />
                  초기화
                </button>
                {executed && (
                  <button className="flex items-center gap-2 ml-auto px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <Download size={14} />
                    CSV 내보내기
                  </button>
                )}
              </div>
            </PageCard>

            {/* Results */}
            {executed && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">조회 결과</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      소스: <span className="font-mono text-blue-600">{source}</span> · 총 {results.length}건 · 응답 {queryTime}s
                    </p>
                  </div>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-semibold">
                    쿼리 완료
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {columns.map(col => (
                          <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paged.map((row, ri) => (
                        <tr key={ri} className="hover:bg-gray-50">
                          {columns.map(col => {
                            const val = String(row[col] ?? '-');
                            const badge = STATUS_COLORS[val];
                            return (
                              <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                {badge ? (
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${badge}`}>{val}</span>
                                ) : (
                                  <span className={col.includes('id') || col.includes('code') ? 'font-mono text-xs text-gray-600' : ''}>{val}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    총 {results.length}건 · 페이지 {page}/{totalPages}
                  </span>
                  <div className="flex gap-1 items-center">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`px-3 py-1 text-xs rounded border ${p === page ? 'bg-[#2563eb] text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                      className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
