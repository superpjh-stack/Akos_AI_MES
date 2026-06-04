'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit2, Trash2 } from 'lucide-react';

function PageHeader({ title, section, onAdd }: { title: string; section: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#2563eb' }}>
          <Plus size={15} /> 신규 등록
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '작성중': { bg: '#fefce8', color: '#ca8a04' },
    '검토중': { bg: '#f5f3ff', color: '#7c3aed' },
    '제출완료': { bg: '#eff6ff', color: '#2563eb' },
    '승인': { bg: '#f0fdf4', color: '#16a34a' },
    '반려': { bg: '#fef2f2', color: '#dc2626' },
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

const QUOTES = [
  { id: 'QT-2024-0088', customer: '두산중공업', project: '스마트팩토리 구축', amount: '₩750,000,000', submitted: '2024-06-01', valid: '2024-07-01', status: '검토중', manager: '김철수' },
  { id: 'QT-2024-0082', customer: 'LS산전', project: 'MCC반 제작 납품', amount: '₩92,500,000', submitted: '2024-05-20', valid: '2024-06-20', status: '승인', manager: '이영희' },
  { id: 'QT-2024-0076', customer: '한화솔루션', project: '자동화 포장라인', amount: '₩280,000,000', submitted: '2024-05-15', valid: '2024-06-15', status: '제출완료', manager: '박민준' },
  { id: 'QT-2024-0069', customer: 'GS칼텍스', project: '배관 자동 용접장치', amount: '₩415,000,000', submitted: '2024-05-10', valid: '2024-06-10', status: '반려', manager: '최수진' },
  { id: 'QT-2024-0063', customer: '롯데케미칼', project: '비전 검사 시스템', amount: '₩185,000,000', submitted: '2024-05-05', valid: '2024-06-05', status: '작성중', manager: '정현우' },
];

export default function QuotesPage() {
  const [search, setSearch] = useState('');
  const rows = QUOTES.filter(r => !search || r.id.includes(search) || r.customer.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="견적관리" section="수주/견적관리" onAdd={() => alert('신규 견적 작성')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="이번달 견적 건수" value="9건" sub="+2 전월 대비" color="#2563eb" />
        <KpiCard label="견적 수주 전환율" value="68%" sub="목표 70%" color="#16a34a" />
        <KpiCard label="평균 견적금액" value="₩3.2억" sub="전월 대비 +8%" color="#d97706" />
        <KpiCard label="유효기간 만료 임박" value="3건" sub="7일 이내" color="#dc2626" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">견적 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="견적번호, 고객사 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"><option>전체 상태</option><option>작성중</option><option>검토중</option><option>제출완료</option><option>승인</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['견적번호','고객사','프로젝트명','견적금액','제출일','유효기간','담당자','상태','액션'].map(h => (
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
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{r.project}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.amount}</td>
                  <td className="px-4 py-3 text-gray-600">{r.submitted}</td>
                  <td className="px-4 py-3 text-gray-600">{r.valid}</td>
                  <td className="px-4 py-3 text-gray-600">{r.manager}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={15} /></button>
                      <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
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
            {[1,2,3].map(p => <button key={p} className="w-7 h-7 text-xs rounded border border-gray-200 text-gray-600 hover:bg-blue-50" style={p===1?{backgroundColor:'#eff6ff',color:'#2563eb',borderColor:'#bfdbfe'}:{}}>{p}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
