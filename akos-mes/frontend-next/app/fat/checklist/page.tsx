'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit2, CheckSquare } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      {onAdd && <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#2563eb' }}><Plus size={15} /> 체크리스트 생성</button>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '미착수': { bg: '#f3f4f6', color: '#6b7280' },
    '진행중': { bg: '#eff6ff', color: '#2563eb' },
    '완료': { bg: '#f0fdf4', color: '#16a34a' },
    '보류': { bg: '#fefce8', color: '#ca8a04' },
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

const CHECKLISTS = [
  { id: 'FCL-2024-0042', order: 'SO-2024-0298', product: 'PLC 제어반', template: 'PLC-STD-v2', items: 86, checked: 86, inspector: '김검사', date: '2024-06-10', status: '완료' },
  { id: 'FCL-2024-0039', order: 'SO-2024-0312', product: '자동화 용접라인', template: 'WELD-STD-v3', items: 142, checked: 64, inspector: '이FAT', date: '2024-06-12', status: '진행중' },
  { id: 'FCL-2024-0035', order: 'SO-2024-0285', product: '스마트 물류 컨베이어', template: 'CONV-STD-v1', items: 98, checked: 0, inspector: '박점검', date: '2024-06-18', status: '미착수' },
  { id: 'FCL-2024-0031', order: 'SO-2024-0271', product: '배터리팩 조립라인', template: 'BATT-STD-v2', items: 165, checked: 0, inspector: '최검사', date: '2024-07-05', status: '미착수' },
  { id: 'FCL-2024-0028', order: 'SO-2024-0260', product: '압연라인 제어시스템', template: 'ROLL-STD-v1', items: 110, checked: 45, inspector: '정FAT', date: '2024-06-15', status: '보류' },
];

export default function FatChecklistPage() {
  const [search, setSearch] = useState('');
  const rows = CHECKLISTS.filter(r => !search || r.id.includes(search) || r.product.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="FAT 체크리스트" section="FAT 관리" onAdd={() => alert('체크리스트 생성')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="전체 체크리스트" value="42개" sub="이번달 6개 생성" />
        <KpiCard label="완료" value="28개" sub="완료율 66.7%" color="#16a34a" />
        <KpiCard label="진행중" value="8개" sub="현재 검사 중" color="#2563eb" />
        <KpiCard label="평균 통과율" value="94.2%" sub="전월 대비 +1.8%" color="#7c3aed" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">FAT 체크리스트 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="번호, 제품명 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 상태</option><option>미착수</option><option>진행중</option><option>완료</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['체크리스트 번호','수주번호','제품명','템플릿','항목수','점검완료','검사자','예정일','상태','액션'].map(h => (
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
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.order}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{r.product}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.template}</td>
                  <td className="px-4 py-3 text-gray-600">{r.items}개</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${Math.round(r.checked/r.items*100)}%`, backgroundColor: '#2563eb' }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{r.checked}/{r.items}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.inspector}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><CheckSquare size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-xs text-gray-400">1-{rows.length} / 42건</span>
          <div className="flex gap-1">{[1,2,3,4,5].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}</div>
        </div>
      </div>
    </div>
  );
}
