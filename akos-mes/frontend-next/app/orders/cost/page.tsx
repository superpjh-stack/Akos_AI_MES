'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit2 } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#2563eb' }}>
          <Plus size={15} /> 원가 등록
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '초과': { bg: '#fef2f2', color: '#dc2626' },
    '정상': { bg: '#f0fdf4', color: '#16a34a' },
    '절감': { bg: '#eff6ff', color: '#2563eb' },
    '검토중': { bg: '#fefce8', color: '#ca8a04' },
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

const COSTS = [
  { id: 'SO-2024-0312', customer: '현대중공업', product: '자동화 용접라인', estimated: '₩485,000,000', actual: '₩501,200,000', margin: '3.3%', laborRatio: '32%', materialRatio: '55%', status: '초과' },
  { id: 'SO-2024-0298', customer: 'LG화학', product: 'PLC 제어반', estimated: '₩128,500,000', actual: '₩115,700,000', margin: '9.9%', laborRatio: '28%', materialRatio: '58%', status: '절감' },
  { id: 'SO-2024-0285', customer: 'SK하이닉스', product: '스마트 물류 컨베이어', estimated: '₩320,000,000', actual: '₩318,400,000', margin: '0.5%', laborRatio: '30%', materialRatio: '52%', status: '정상' },
  { id: 'SO-2024-0271', customer: '삼성SDI', product: '배터리팩 조립라인', estimated: '₩1,250,000,000', actual: null, margin: '-', laborRatio: '-', materialRatio: '-', status: '검토중' },
  { id: 'SO-2024-0260', customer: 'POSCO', product: '압연라인 제어시스템', estimated: '₩670,000,000', actual: null, margin: '-', laborRatio: '-', materialRatio: '-', status: '검토중' },
];

export default function CostPage() {
  const [search, setSearch] = useState('');
  const rows = COSTS.filter(r => !search || r.id.includes(search) || r.customer.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="원가관리" section="수주/견적관리" onAdd={() => alert('원가 등록')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="평균 원가율" value="82.4%" sub="목표 80%" color="#2563eb" />
        <KpiCard label="원가 초과 건수" value="2건" sub="이번달" color="#dc2626" />
        <KpiCard label="원가 절감액" value="₩1,280만" sub="전월 대비 +15%" color="#16a34a" />
        <KpiCard label="평균 이익률" value="17.6%" sub="목표 20%" color="#d97706" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">원가 분석 현황</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="수주번호, 고객사 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white focus:outline-none"><option>전체 상태</option><option>초과</option><option>정상</option><option>절감</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['수주번호','고객사','제품','예산원가','실제원가','이익률','인건비율','자재비율','상태','액션'].map(h => (
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
                  <td className="px-4 py-3 font-medium text-gray-800">{r.customer}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{r.product}</td>
                  <td className="px-4 py-3 text-gray-700">{r.estimated}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: r.actual ? '#1e3a5f' : '#9ca3af' }}>{r.actual ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.margin}</td>
                  <td className="px-4 py-3 text-gray-600">{r.laborRatio}</td>
                  <td className="px-4 py-3 text-gray-600">{r.materialRatio}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-xs text-gray-400">1-{rows.length} / {rows.length}건</span>
          <div className="flex gap-1">
            {[1,2,3].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
