'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit2, Trash2, GitBranch, Layers, Package, Pencil } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#2563eb' }}>
          <Plus size={15} /> BOM 등록
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '확정': { bg: '#f0fdf4', color: '#16a34a' },
    '검토중': { bg: '#fefce8', color: '#ca8a04' },
    '개정중': { bg: '#eff6ff', color: '#2563eb' },
    '구버전': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{status}</span>;
}

function KpiCard({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub?: string; color?: string; icon?: React.ComponentType<{size?: number | string}> }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex items-start gap-3" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {Icon && <div className="p-2 rounded-lg mt-0.5" style={{ backgroundColor: '#eff6ff' }}><Icon size={18} /></div>}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

const BOMS = [
  { id: 'BOM-2024-0145', product: '자동화 용접라인 시스템', version: 'v3.2', items: 248, drawings: 42, created: '2024-05-15', updated: '2024-06-01', owner: '설계1팀', status: '확정' },
  { id: 'BOM-2024-0132', product: 'PLC 제어반 (표준형)', version: 'v2.8', items: 86, drawings: 18, created: '2024-04-20', updated: '2024-05-28', owner: '설계2팀', status: '개정중' },
  { id: 'BOM-2024-0118', product: '스마트 물류 컨베이어', version: 'v4.1', items: 174, drawings: 35, created: '2024-03-10', updated: '2024-05-15', owner: '설계1팀', status: '확정' },
  { id: 'BOM-2024-0095', product: '배터리팩 조립라인', version: 'v1.0', items: 312, drawings: 58, created: '2024-02-01', updated: '2024-06-10', owner: '설계3팀', status: '검토중' },
  { id: 'BOM-2023-0287', product: '압연라인 제어시스템 (구형)', version: 'v2.0', items: 195, drawings: 30, created: '2023-11-05', updated: '2024-01-20', owner: '설계2팀', status: '구버전' },
];

export default function BomPage() {
  const [search, setSearch] = useState('');
  const rows = BOMS.filter(r => !search || r.id.includes(search) || r.product.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="설계/BOM" section="설계/BOM" onAdd={() => alert('BOM 등록')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="전체 BOM 수" value="32개" sub="현행 버전 기준" icon={GitBranch} />
        <KpiCard label="평균 BOM 구성 품목" value="186개" sub="이전 대비 +12" icon={Layers} />
        <KpiCard label="도면 총 수" value="1,248장" sub="이번달 42장 추가" icon={Pencil} />
        <KpiCard label="자재 등록 수" value="4,832종" color="#2563eb" icon={Package} />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">BOM 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="BOM번호, 제품명 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white focus:outline-none"><option>전체 상태</option><option>확정</option><option>개정중</option><option>검토중</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['BOM번호','제품명','버전','구성품목','도면수','생성일','최종수정','담당팀','상태','액션'].map(h => (
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
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{r.product}</td>
                  <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{r.version}</span></td>
                  <td className="px-4 py-3 text-gray-600">{r.items}개</td>
                  <td className="px-4 py-3 text-gray-600">{r.drawings}장</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.created}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.updated}</td>
                  <td className="px-4 py-3 text-gray-600">{r.owner}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                      <button className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-xs text-gray-400">1-{rows.length} / 32건</span>
          <div className="flex gap-1">
            {[1,2,3,4].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
