'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit2, Wrench } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      {onAdd && <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#2563eb' }}><Plus size={15} /> AS 접수</button>}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '긴급': { bg: '#fef2f2', color: '#dc2626' },
    '높음': { bg: '#fff7ed', color: '#ea580c' },
    '보통': { bg: '#fefce8', color: '#ca8a04' },
    '낮음': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[priority] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '접수': { bg: '#f5f3ff', color: '#7c3aed' },
    '배정': { bg: '#fefce8', color: '#ca8a04' },
    '출동중': { bg: '#eff6ff', color: '#2563eb' },
    '처리중': { bg: '#fff7ed', color: '#ea580c' },
    '완료': { bg: '#f0fdf4', color: '#16a34a' },
    '보류': { bg: '#f3f4f6', color: '#6b7280' },
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

const AS_LIST = [
  { id: 'AS-2024-0142', order: 'SO-2024-0298', customer: 'LG화학', product: 'PLC 제어반', issue: 'HMI 화면 오류', priority: '긴급', received: '2024-06-10', engineer: '김AS', sla: '24시간', elapsed: '3시간', status: '출동중' },
  { id: 'AS-2024-0138', order: 'SO-2024-0260', customer: 'POSCO', product: '압연라인 제어시스템', issue: '서보모터 이상 진동', priority: '높음', received: '2024-06-08', engineer: '이서비스', sla: '48시간', elapsed: '2일', status: '처리중' },
  { id: 'AS-2024-0131', order: 'SO-2023-0188', customer: '두산중공업', product: '이전 납품 라인', issue: '냉각 팬 소음 발생', priority: '보통', received: '2024-06-05', engineer: '박수리', sla: '5일', elapsed: '5일', status: '완료' },
  { id: 'AS-2024-0125', order: 'SO-2024-0285', customer: 'SK하이닉스', product: '스마트 물류 컨베이어', issue: '속도 불안정 현상', priority: '높음', received: '2024-06-03', engineer: '최기술', sla: '48시간', elapsed: '7일', status: '보류' },
  { id: 'AS-2024-0118', order: 'SO-2023-0165', customer: 'GS칼텍스', product: '배관 용접 장치', issue: '정기 점검 요청', priority: '낮음', received: '2024-06-01', engineer: '미배정', sla: '10일', elapsed: '9일', status: '접수' },
];

export default function AsPage() {
  const [search, setSearch] = useState('');
  const rows = AS_LIST.filter(r => !search || r.id.includes(search) || r.customer.includes(search) || r.issue.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="AS 관리" section="납품/SAT" onAdd={() => alert('AS 접수')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="이번달 AS 건수" value="12건" sub="전월 대비 +2" />
        <KpiCard label="미처리 건수" value="5건" sub="긴급 1건 포함" color="#dc2626" />
        <KpiCard label="평균 처리 시간" value="18.5시간" sub="SLA 대비 좋음" color="#16a34a" />
        <KpiCard label="고객 만족도" value="4.2/5" sub="이번달 7건 응답" color="#2563eb" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">AS 접수 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="AS번호, 고객사, 증상 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 우선순위</option><option>긴급</option><option>높음</option><option>보통</option><option>낮음</option></select>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 상태</option><option>접수</option><option>배정</option><option>출동중</option><option>처리중</option><option>완료</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['AS번호','수주번호','고객사','제품','증상','우선순위','접수일','담당자','SLA','경과','상태','액션'].map(h => (
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
                  <td className="px-4 py-3 font-medium text-gray-800">{r.customer}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px] truncate">{r.product}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[150px] truncate">{r.issue}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.received}</td>
                  <td className="px-4 py-3 text-gray-600">{r.engineer}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.sla}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.elapsed}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                      <button className="text-gray-400 hover:text-orange-500"><Wrench size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span className="text-xs text-gray-400">1-{rows.length} / 12건</span>
          <div className="flex gap-1">{[1,2].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}</div>
        </div>
      </div>
    </div>
  );
}
