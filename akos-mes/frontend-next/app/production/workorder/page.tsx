'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit2, Printer } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      {onAdd && <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#2563eb' }}><Plus size={15} /> 작업지시 발행</button>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '발행': { bg: '#f5f3ff', color: '#7c3aed' },
    '작업중': { bg: '#eff6ff', color: '#2563eb' },
    '완료': { bg: '#f0fdf4', color: '#16a34a' },
    '일시중지': { bg: '#fefce8', color: '#ca8a04' },
    '취소': { bg: '#fef2f2', color: '#dc2626' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{status}</span>;
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

const WORKORDERS = [
  { id: 'WO-2024-0842', plan: 'PP-2024-0156', product: '자동화 용접라인 메인프레임', process: '기계가공', qty: 2, done: 1, line: '라인 A', scheduled: '2024-06-10', operator: '김기계', status: '작업중' },
  { id: 'WO-2024-0835', plan: 'PP-2024-0156', product: '용접로봇 베이스', process: '용접', qty: 4, done: 4, line: '라인 A', scheduled: '2024-06-08', operator: '이용접', status: '완료' },
  { id: 'WO-2024-0821', plan: 'PP-2024-0143', product: 'PLC 제어반 패널', process: '조립', qty: 1, done: 0, line: '라인 B', scheduled: '2024-06-12', operator: '최조립', status: '발행' },
  { id: 'WO-2024-0818', plan: 'PP-2024-0143', product: 'PLC 제어반 도장', process: '도장', qty: 1, done: 0, line: '라인 B', scheduled: '2024-06-11', operator: '박도장', status: '일시중지' },
  { id: 'WO-2024-0805', plan: 'PP-2024-0128', product: '컨베이어 프레임', process: '기계가공', qty: 6, done: 0, line: '라인 A', scheduled: '2024-06-15', operator: '김기계', status: '취소' },
];

export default function WorkOrderPage() {
  const [search, setSearch] = useState('');
  const rows = WORKORDERS.filter(r => !search || r.id.includes(search) || r.product.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="작업지시" section="생산/공정관리" onAdd={() => alert('작업지시 발행')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="오늘 발행 건수" value="18건" sub="전일 대비 +3" color="#2563eb" />
        <KpiCard label="작업중" value="7건" sub="현재 진행" color="#7c3aed" />
        <KpiCard label="오늘 완료" value="9건" sub="달성율 100%" color="#16a34a" />
        <KpiCard label="지연 작업" value="2건" sub="즉시 확인 필요" color="#dc2626" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">작업지시 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="지시번호, 제품명 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 공정</option><option>기계가공</option><option>용접</option><option>도장</option><option>조립</option><option>검사</option></select>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 상태</option><option>발행</option><option>작업중</option><option>완료</option><option>일시중지</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['지시번호','계획번호','제품/작업명','공정','수량','완료','라인','예정일','담당자','상태','액션'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.plan}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{r.product}</td>
                  <td className="px-4 py-3 text-gray-600">{r.process}</td>
                  <td className="px-4 py-3 text-gray-600">{r.qty}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: r.done === r.qty ? '#16a34a' : '#2563eb' }}>{r.done}/{r.qty}</td>
                  <td className="px-4 py-3 text-gray-600">{r.line}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.scheduled}</td>
                  <td className="px-4 py-3 text-gray-600">{r.operator}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                      <button className="text-gray-400 hover:text-gray-600"><Printer size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-xs text-gray-400">1-{rows.length} / {rows.length}건</span>
          <div className="flex gap-1">{[1,2,3].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}</div>
        </div>
      </div>
    </div>
  );
}
