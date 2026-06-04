'use client';

import React, { useState } from 'react';
import { PlusCircle, Search, Printer, FileText } from 'lucide-react';

type WorkOrder = {
  id: string;
  planId: string;
  product: string;
  process: string;
  qty: number;
  done: number;
  line: string;
  scheduled: string;
  dueDate: string;
  operator: string;
  status: string;
  priority: string;
};

const WORKORDERS: WorkOrder[] = [
  { id: 'WO-2026-0842', planId: 'PP-2026-0156', product: '자동화 용접라인 메인프레임', process: '기계가공', qty: 2, done: 1, line: '라인 A', scheduled: '2026-06-10', dueDate: '2026-06-15', operator: '김기계', status: '작업중', priority: '긴급' },
  { id: 'WO-2026-0843', planId: 'PP-2026-0156', product: '용접로봇 베이스플레이트', process: '용접', qty: 4, done: 4, line: '라인 A', scheduled: '2026-06-08', dueDate: '2026-06-12', operator: '이용접', status: '완료', priority: '일반' },
  { id: 'WO-2026-0844', planId: 'PP-2026-0157', product: 'PLC 제어반 패널', process: '조립', qty: 1, done: 0, line: '라인 B', scheduled: '2026-06-12', dueDate: '2026-06-18', operator: '최조립', status: '발행', priority: '일반' },
  { id: 'WO-2026-0845', planId: 'PP-2026-0157', product: '컨베이어 프레임', process: '절삭가공', qty: 6, done: 2, line: '라인 C', scheduled: '2026-06-09', dueDate: '2026-06-14', operator: '박절삭', status: '작업중', priority: '높음' },
  { id: 'WO-2026-0846', planId: 'PP-2026-0158', product: '유압 실린더 어셈블리', process: '조립', qty: 3, done: 3, line: '라인 B', scheduled: '2026-06-07', dueDate: '2026-06-10', operator: '정조립', status: '완료', priority: '일반' },
  { id: 'WO-2026-0847', planId: 'PP-2026-0158', product: '모터 마운팅 브라켓', process: '도장', qty: 8, done: 0, line: '라인 D', scheduled: '2026-06-13', dueDate: '2026-06-17', operator: '강도장', status: '발행', priority: '일반' },
  { id: 'WO-2026-0848', planId: 'PP-2026-0159', product: '비전검사 카메라 하우징', process: '기계가공', qty: 2, done: 1, line: '라인 A', scheduled: '2026-06-11', dueDate: '2026-06-16', operator: '김기계', status: '일시중지', priority: '높음' },
  { id: 'WO-2026-0849', planId: 'PP-2026-0159', product: '협동로봇 그리퍼', process: '조립', qty: 5, done: 5, line: '라인 B', scheduled: '2026-06-06', dueDate: '2026-06-09', operator: '최조립', status: '완료', priority: '긴급' },
];

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
    '발행': { bg: '#ede9fe', color: '#7c3aed' },
    '작업중': { bg: '#dbeafe', color: '#1d4ed8' },
    '완료': { bg: '#dcfce7', color: '#15803d' },
    '일시중지': { bg: '#fef9c3', color: '#a16207' },
    '취소': { bg: '#fee2e2', color: '#b91c1c' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '긴급': { bg: '#fee2e2', color: '#b91c1c' },
    '높음': { bg: '#ffedd5', color: '#c2410c' },
    '일반': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[priority] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {priority}
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

const TODAY = '2026-06-04';

export default function WorkOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [lineFilter, setLineFilter] = useState('전체');
  const [priorityFilter, setPriorityFilter] = useState('전체');
  const [applied, setApplied] = useState({ search: '', status: '전체', line: '전체', priority: '전체' });

  const handleSearch = () => {
    setApplied({ search, status: statusFilter, line: lineFilter, priority: priorityFilter });
  };

  const filtered = WORKORDERS.filter((wo) => {
    const matchSearch =
      applied.search === '' ||
      wo.id.includes(applied.search) ||
      wo.product.includes(applied.search) ||
      wo.operator.includes(applied.search);
    const matchStatus = applied.status === '전체' || wo.status === applied.status;
    const matchLine = applied.line === '전체' || wo.line === applied.line;
    const matchPriority = applied.priority === '전체' || wo.priority === applied.priority;
    return matchSearch && matchStatus && matchLine && matchPriority;
  });

  const isOverdue = (wo: WorkOrder) =>
    wo.dueDate < TODAY && (wo.status === '작업중' || wo.status === '발행' || wo.status === '일시중지');

  const progressPct = (done: number, qty: number) => Math.round((done / qty) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-screen-xl mx-auto">
        <PageHeader
          title="작업지시 관리"
          section="생산관리"
          action={
            <button
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#2563eb' }}
            >
              <PlusCircle size={16} />
              작업지시 발행
            </button>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="오늘 발행" value="8건" sub="2026-06-04 기준" />
          <KpiCard label="작업중" value="3건" sub="진행중" color="#1d4ed8" />
          <KpiCard label="완료" value="4건" sub="오늘" color="#15803d" />
          <KpiCard label="지연위험" value="1건" sub="마감일 초과" color="#b91c1c" />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="WO번호 / 제품명 / 작업자 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ border: '1px solid #e5e7eb' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {['전체', '발행', '작업중', '완료', '일시중지', '취소'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {['전체', '라인 A', '라인 B', '라인 C', '라인 D'].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {['전체', '긴급', '높음', '일반'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-md"
            style={{ backgroundColor: '#2563eb' }}
          >
            <Search size={14} />
            검색
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  {['WO번호', '계획번호', '제품명', '공정', '라인', '수량(완료/계획)', '예정일', '마감일', '작업자', '우선순위', '상태', '액션'].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((wo, idx) => {
                  const overdue = isOverdue(wo);
                  const pct = progressPct(wo.done, wo.qty);
                  return (
                    <tr
                      key={wo.id}
                      className={overdue ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                    >
                      <td className="px-3 py-3 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: '#2563eb' }}>
                        {wo.id}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {wo.planId}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-gray-800 max-w-[180px]">
                        <span className="line-clamp-2">{wo.product}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{wo.process}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">{wo.line}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold" style={{ color: '#1e3a5f' }}>
                            {wo.done}/{wo.qty}
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: pct === 100 ? '#15803d' : '#2563eb',
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{wo.scheduled}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className="text-xs font-medium"
                          style={{ color: overdue ? '#b91c1c' : '#374151' }}
                        >
                          {wo.dueDate}
                          {overdue && (
                            <span className="ml-1 text-xs font-semibold text-red-600">⚠</span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{wo.operator}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <PriorityBadge priority={wo.priority} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge status={wo.status} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                            style={{ border: '1px solid #2563eb', color: '#2563eb', backgroundColor: '#eff6ff' }}
                          >
                            <FileText size={11} />
                            상세
                          </button>
                          <button
                            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                            style={{ border: '1px solid #e5e7eb', color: '#6b7280', backgroundColor: '#f9fafb' }}
                          >
                            <Printer size={11} />
                            출력
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-3 py-10 text-center text-sm text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
            <span className="text-xs text-gray-400">
              총 <span className="font-semibold text-gray-600">{WORKORDERS.length}건</span> / 필터된{' '}
              <span className="font-semibold text-gray-600">{filtered.length}건</span>
            </span>
            <span className="text-xs text-gray-400">마지막 업데이트: 2026-06-04 08:30</span>
          </div>
        </div>
      </div>
    </div>
  );
}
