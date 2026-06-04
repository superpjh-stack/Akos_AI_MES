'use client';

import React, { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronUp, FileDown, Printer, ClipboardList } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Standard {
  id: string;
  product: string;
  type: '수입검사' | '공정검사' | '완제품검사';
  version: string;
  items: number;
  lastUpdated: string;
  updatedBy: string;
  status: '적용중' | '개정중' | '검토중';
}

interface StandardItem {
  seq: number;
  item: string;
  criterion: string;
  method: string;
  type: '합/불' | '계량';
  min?: number;
  max?: number;
  unit?: string;
  required: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STANDARDS: Standard[] = [
  { id: 'QS-2026-001', product: '자동화 용접라인', type: '수입검사', version: 'v2.3', items: 24, lastUpdated: '2026-05-15', updatedBy: '품질1팀', status: '적용중' },
  { id: 'QS-2026-002', product: 'PLC 제어반', type: '공정검사', version: 'v1.8', items: 18, lastUpdated: '2026-04-22', updatedBy: '품질2팀', status: '적용중' },
  { id: 'QS-2026-003', product: '컨베이어 시스템', type: '완제품검사', version: 'v3.1', items: 32, lastUpdated: '2026-05-30', updatedBy: '품질1팀', status: '적용중' },
  { id: 'QS-2026-004', product: '비전검사장비', type: '수입검사', version: 'v1.2', items: 15, lastUpdated: '2026-03-10', updatedBy: '품질3팀', status: '개정중' },
  { id: 'QS-2026-005', product: '협동로봇', type: '완제품검사', version: 'v2.0', items: 28, lastUpdated: '2026-05-01', updatedBy: '품질2팀', status: '적용중' },
  { id: 'QS-2026-006', product: '유압프레스', type: '공정검사', version: 'v1.5', items: 20, lastUpdated: '2026-02-18', updatedBy: '품질3팀', status: '검토중' },
];

const STANDARD_ITEMS: StandardItem[] = [
  { seq: 1, item: '외관 검사', criterion: '스크래치, 버, 이물질 없을 것', method: '육안', type: '합/불', required: true },
  { seq: 2, item: '치수 검사 - 전장', criterion: '500 ± 0.5mm', method: '버니어캘리퍼스', type: '계량', min: 499.5, max: 500.5, unit: 'mm', required: true },
  { seq: 3, item: '치수 검사 - 전폭', criterion: '300 ± 0.3mm', method: '버니어캘리퍼스', type: '계량', min: 299.7, max: 300.3, unit: 'mm', required: true },
  { seq: 4, item: '표면 거칠기', criterion: 'Ra 1.6 이하', method: '표면조도계', type: '계량', max: 1.6, unit: 'μm', required: true },
  { seq: 5, item: '도막 두께', criterion: '80 ± 10μm', method: '도막측정기', type: '계량', min: 70, max: 90, unit: 'μm', required: false },
];

// ─── Inline Components ────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '적용중': { bg: '#f0fdf4', color: '#16a34a' },
    '개정중': { bg: '#fff7ed', color: '#c2410c' },
    '검토중': { bg: '#eff6ff', color: '#2563eb' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: Standard['type'] }) {
  const map: Record<Standard['type'], { bg: string; color: string }> = {
    '수입검사': { bg: '#eff6ff', color: '#2563eb' },
    '공정검사': { bg: '#f0fdf4', color: '#16a34a' },
    '완제품검사': { bg: '#f5f3ff', color: '#7c3aed' },
  };
  const s = map[type];
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {type}
    </span>
  );
}

function PageHeader({ title, section, action }: { title: string; section: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

// ─── Expandable Detail Panel ──────────────────────────────────────────────────

function DetailPanel({ standard }: { standard: Standard }) {
  return (
    <tr>
      <td colSpan={9} className="px-0 py-0">
        <div style={{ backgroundColor: '#f8faff', borderTop: '1px solid #e0ecff', borderBottom: '1px solid #e0ecff' }}>
          {/* Basic Info */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList size={15} style={{ color: '#2563eb' }} />
                <span className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>기준서 기본정보 — {standard.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: '#dc2626' }}
                  onClick={() => alert('PDF 출력')}
                >
                  <Printer size={13} /> PDF 출력
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: '#16a34a' }}
                  onClick={() => alert('엑셀 다운로드')}
                >
                  <FileDown size={13} /> 엑셀 다운로드
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: '기준서번호', value: standard.id },
                { label: '적용제품', value: standard.product },
                { label: '검사유형', value: standard.type },
                { label: '버전', value: standard.version },
                { label: '검사항목 수', value: `${standard.items}개` },
                { label: '최종수정일', value: standard.lastUpdated },
                { label: '수정부서', value: standard.updatedBy },
                { label: '상태', value: standard.status },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-md px-3 py-2" style={{ border: '1px solid #e5e7eb' }}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Items Table */}
            <p className="text-xs font-semibold text-gray-500 mb-2">검사항목 목록 (샘플 — {standard.id})</p>
            <div className="overflow-x-auto rounded-md" style={{ border: '1px solid #e5e7eb' }}>
              <table className="w-full text-sm bg-white">
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['순번', '검사항목', '판정기준', '검사방법', '유형', 'Min', 'Max', '단위', '필수'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STANDARD_ITEMS.map((item, i) => (
                    <tr
                      key={item.seq}
                      style={{ borderBottom: i < STANDARD_ITEMS.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafbff')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{item.seq}</td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap">{item.item}</td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[200px]">{item.criterion}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">{item.method}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={item.type === '합/불'
                            ? { backgroundColor: '#fef9c3', color: '#854d0e' }
                            : { backgroundColor: '#e0f2fe', color: '#0369a1' }}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 font-mono">{item.min ?? '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 font-mono">{item.max ?? '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{item.unit ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        {item.required
                          ? <span className="text-xs font-bold" style={{ color: '#dc2626' }}>필수</span>
                          : <span className="text-xs text-gray-400">선택</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QualityStandardsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = STANDARDS.filter(s => {
    const matchSearch = !search || s.id.includes(search) || s.product.includes(search);
    const matchType = typeFilter === '전체' || s.type === typeFilter;
    const matchStatus = statusFilter === '전체' || s.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalCount = STANDARDS.length;
  const activeCount = STANDARDS.filter(s => s.status === '적용중').length;
  const pendingCount = STANDARDS.filter(s => s.status !== '적용중').length;
  const avgItems = (STANDARDS.reduce((sum, s) => sum + s.items, 0) / STANDARDS.length).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="검사기준 관리"
        section="품질관리"
        action={
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}
            onClick={() => alert('기준서 등록')}
          >
            <Plus size={15} /> 기준서 등록
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="전체 기준서" value={`${totalCount}건`} sub="등록된 검사기준서" color="#1e3a5f" />
        <KpiCard label="적용중" value={`${activeCount}건`} sub="현행 기준서" color="#16a34a" />
        <KpiCard label="개정중 / 검토" value={`${pendingCount}건`} sub="진행 중인 변경" color="#c2410c" />
        <KpiCard label="평균 검사항목" value={`${avgItems}개`} sub="기준서당 평균" color="#7c3aed" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">기준서 목록</h2>
          <span className="text-xs text-gray-400">총 {filtered.length}건</span>
        </div>

        {/* Filters */}
        <div className="px-6 pt-4 pb-3 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="기준서번호, 제품명 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option>전체</option>
            <option>수입검사</option>
            <option>공정검사</option>
            <option>완제품검사</option>
          </select>
          <select
            className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option>전체</option>
            <option>적용중</option>
            <option>개정중</option>
            <option>검토중</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['기준서번호', '적용제품', '검사유형', '버전', '검사항목수', '최종수정일', '수정자', '상태', '액션'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <React.Fragment key={s.id}>
                    <tr
                      style={{ borderBottom: expandedId === s.id ? 'none' : (i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none') }}
                      onMouseEnter={e => { if (expandedId !== s.id) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">{s.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{s.product}</td>
                      <td className="px-4 py-3"><TypeBadge type={s.type} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.version}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>{s.items}</span>
                        <span className="text-xs text-gray-400 ml-1">개</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{s.lastUpdated}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{s.updatedBy}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
                          style={expandedId === s.id
                            ? { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                            : { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}
                          onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        >
                          {expandedId === s.id ? <><ChevronUp size={13} /> 닫기</> : <><ChevronDown size={13} /> 상세보기</>}
                        </button>
                      </td>
                    </tr>
                    {expandedId === s.id && <DetailPanel standard={s} />}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-xs text-gray-400">1–{filtered.length} / {filtered.length}건</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600"
                style={p === 1 ? { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' } : {}}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
