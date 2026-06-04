'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit2, AlertTriangle } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      {onAdd && <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#dc2626' }}><AlertTriangle size={15} /> 불량 등록</button>}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '치명': { bg: '#fef2f2', color: '#dc2626' },
    '중결함': { bg: '#fff7ed', color: '#ea580c' },
    '경결함': { bg: '#fefce8', color: '#ca8a04' },
    '외관': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[severity] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{severity}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '미조치': { bg: '#fef2f2', color: '#dc2626' },
    '조치중': { bg: '#eff6ff', color: '#2563eb' },
    '조치완료': { bg: '#f0fdf4', color: '#16a34a' },
    '재검필요': { bg: '#fefce8', color: '#ca8a04' },
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

const FAILS = [
  { id: 'DEF-2024-0125', fat: 'FAT-2024-0033', product: '배터리팩 조립라인', item: '안전회로 동작불량', process: '전기검사', severity: '치명', found: '2024-05-16', assignee: '김수리', status: '조치중' },
  { id: 'DEF-2024-0124', fat: 'FAT-2024-0033', product: '배터리팩 조립라인', item: '프레임 치수 오차 +0.8mm', process: '치수검사', severity: '중결함', found: '2024-05-16', assignee: '이가공', status: '조치중' },
  { id: 'DEF-2024-0118', fat: 'FAT-2024-0038', product: '스마트 물류 컨베이어', item: '속도 제어 오차 5% 초과', process: '기능검사', severity: '중결함', found: '2024-05-29', assignee: '박제어', status: '재검필요' },
  { id: 'DEF-2024-0115', fat: 'FAT-2024-0038', product: '스마트 물류 컨베이어', item: '도장 불량 (기포발생)', process: '외관검사', severity: '경결함', found: '2024-05-29', assignee: '최도장', status: '조치완료' },
  { id: 'DEF-2024-0098', fat: 'FAT-2024-0028', product: '압연라인 제어시스템', item: '케이블 배선 정리 미흡', process: '외관검사', severity: '외관', found: '2024-05-02', assignee: '정전기', status: '조치완료' },
];

export default function FatFailPage() {
  const [search, setSearch] = useState('');
  const rows = FAILS.filter(r => !search || r.id.includes(search) || r.product.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="FAT 불량관리" section="FAT 관리" onAdd={() => alert('불량 등록')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="누적 불량 건수" value="34건" sub="이번달 12건" color="#dc2626" />
        <KpiCard label="치명 결함" value="5건" sub="즉시 조치 필요" color="#dc2626" />
        <KpiCard label="미조치 건수" value="8건" sub="48시간 이상 경과 2건" color="#d97706" />
        <KpiCard label="평균 조치 기간" value="2.8일" sub="목표 2일 이내" color="#2563eb" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">불량 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="불량번호, 제품명 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 등급</option><option>치명</option><option>중결함</option><option>경결함</option><option>외관</option></select>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 상태</option><option>미조치</option><option>조치중</option><option>조치완료</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['불량번호','FAT번호','제품명','불량항목','공정','등급','발견일','담당자','상태','액션'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-red-600">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.fat}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[140px] truncate">{r.product}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate">{r.item}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.process}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={r.severity} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.found}</td>
                  <td className="px-4 py-3 text-gray-600">{r.assignee}</td>
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
          <span className="text-xs text-gray-400">1-{rows.length} / 34건</span>
          <div className="flex gap-1">{[1,2,3,4].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}</div>
        </div>
      </div>
    </div>
  );
}
