'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Eye, FileText } from 'lucide-react';

function PageHeader({ title, section }: { title: string; section: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 리포트 출력</button>
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '합격': { bg: '#f0fdf4', color: '#16a34a' },
    '불합격': { bg: '#fef2f2', color: '#dc2626' },
    '조건부합격': { bg: '#fefce8', color: '#ca8a04' },
    '검사중': { bg: '#eff6ff', color: '#2563eb' },
  };
  const s = map[result] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{result}</span>;
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

const RESULTS = [
  { id: 'FAT-2024-0042', order: 'SO-2024-0298', product: 'PLC 제어반', total: 86, pass: 86, fail: 0, passRate: '100%', inspector: '김검사', startDate: '2024-06-08', endDate: '2024-06-10', result: '합격' },
  { id: 'FAT-2024-0038', order: 'SO-2024-0285', product: '스마트 물류 컨베이어 (1차)', total: 98, pass: 91, fail: 7, passRate: '92.9%', inspector: '이FAT', startDate: '2024-05-28', endDate: '2024-05-30', result: '조건부합격' },
  { id: 'FAT-2024-0033', order: 'SO-2024-0271', product: '배터리팩 조립라인 시제품', total: 165, pass: 140, fail: 25, passRate: '84.8%', inspector: '박점검', startDate: '2024-05-15', endDate: '2024-05-20', result: '불합격' },
  { id: 'FAT-2024-0028', order: 'SO-2024-0260', product: '압연라인 제어시스템', total: 110, pass: 108, fail: 2, passRate: '98.2%', inspector: '최검사', startDate: '2024-05-01', endDate: '2024-05-03', result: '합격' },
  { id: 'FAT-2024-0039', order: 'SO-2024-0312', product: '자동화 용접라인', total: 142, pass: 64, fail: 0, passRate: '45.1%', inspector: '이FAT', startDate: '2024-06-10', endDate: '-', result: '검사중' },
];

export default function FatResultsPage() {
  const [search, setSearch] = useState('');
  const rows = RESULTS.filter(r => !search || r.id.includes(search) || r.product.includes(search));
  return (
    <div className="space-y-6">
      <PageHeader title="FAT 결과" section="FAT 관리" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="이번달 FAT 건수" value="6건" sub="전월 대비 +1건" />
        <KpiCard label="합격률" value="75%" sub="목표 90%" color="#16a34a" />
        <KpiCard label="평균 검사일수" value="3.2일" sub="전월 대비 -0.5일" color="#2563eb" />
        <KpiCard label="불합격 건수" value="1건" sub="재검사 진행중" color="#dc2626" />
      </div>
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">FAT 결과 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="FAT번호, 제품명 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 결과</option><option>합격</option><option>조건부합격</option><option>불합격</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['FAT번호','수주번호','제품명','전체항목','합격','불합격','통과율','검사자','시작일','종료일','결과','액션'].map(h => (
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
                  <td className="px-4 py-3 text-gray-600">{r.total}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{r.pass}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: r.fail > 0 ? '#dc2626' : '#6b7280' }}>{r.fail}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: parseFloat(r.passRate) >= 95 ? '#16a34a' : parseFloat(r.passRate) >= 85 ? '#d97706' : '#dc2626' }}>{r.passRate}</td>
                  <td className="px-4 py-3 text-gray-600">{r.inspector}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.startDate}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.endDate}</td>
                  <td className="px-4 py-3"><ResultBadge result={r.result} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-blue-600"><FileText size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
