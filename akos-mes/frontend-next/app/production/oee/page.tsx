'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';

function PageHeader({ title, section }: { title: string; section: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      <div className="flex gap-2">
        <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white">
          <option>오늘</option><option>이번 주</option><option>이번 달</option>
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 리포트</button>
      </div>
    </div>
  );
}

function OEEGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const isGood = value >= 85;
  return (
    <div className="bg-white rounded-lg px-5 py-5 flex flex-col items-center gap-2" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="relative" style={{ width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 32 * value / 100} ${2 * Math.PI * 32 * (1 - value / 100)}`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center rotate-0">
          <span className="text-lg font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        <div className="text-xs mt-0.5" style={{ color: isGood ? '#16a34a' : '#dc2626' }}>
          {isGood ? '목표 달성' : '개선 필요'}
        </div>
      </div>
    </div>
  );
}

const OEE_DATA = [
  { line: '라인 A', equipment: '5축 머시닝센터', availability: 92, performance: 88, quality: 97, oee: 78.6, trend: 'up', change: '+2.3%' },
  { line: '라인 A', equipment: '자동용접로봇', availability: 88, performance: 91, quality: 98, oee: 78.4, trend: 'up', change: '+1.5%' },
  { line: '라인 B', equipment: '자동도장부스', availability: 72, performance: 84, quality: 95, oee: 57.5, trend: 'down', change: '-4.2%' },
  { line: '라인 B', equipment: '조립지그 세트', availability: 95, performance: 93, quality: 99, oee: 87.3, trend: 'up', change: '+0.8%' },
  { line: '라인 C', equipment: '3D 비전검사기', availability: 65, performance: 89, quality: 100, oee: 57.9, trend: 'down', change: '-6.1%' },
];

export default function OEEPage() {
  const [search, setSearch] = useState('');
  const rows = OEE_DATA.filter(r => !search || r.line.includes(search) || r.equipment.includes(search));
  const avgOEE = Math.round(OEE_DATA.reduce((a, r) => a + r.oee, 0) / OEE_DATA.length * 10) / 10;

  return (
    <div className="space-y-6">
      <PageHeader title="OEE 관리" section="생산/공정관리" />

      {/* Overall OEE gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OEEGauge value={avgOEE} label="종합 OEE" color="#2563eb" />
        <OEEGauge value={82} label="가동률 (Availability)" color="#16a34a" />
        <OEEGauge value={89} label="성능률 (Performance)" color="#7c3aed" />
        <OEEGauge value={97} label="품질률 (Quality)" color="#d97706" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">설비별 OEE 현황</h2>
          <span className="text-xs text-gray-400">총 {rows.length}건</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="라인, 설비명 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 라인</option><option>라인 A</option><option>라인 B</option><option>라인 C</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Filter size={14} /> 필터</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['라인','설비명','가동률','성능률','품질률','OEE','전일 대비'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                  <td className="px-4 py-3 text-gray-600">{r.line}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.equipment}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${r.availability}%`, backgroundColor: r.availability >= 85 ? '#16a34a' : '#dc2626' }} /></div>
                      <span className="text-xs font-semibold text-gray-700">{r.availability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${r.performance}%`, backgroundColor: r.performance >= 85 ? '#7c3aed' : '#dc2626' }} /></div>
                      <span className="text-xs font-semibold text-gray-700">{r.performance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${r.quality}%`, backgroundColor: '#d97706' }} /></div>
                      <span className="text-xs font-semibold text-gray-700">{r.quality}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-base font-bold" style={{ color: r.oee >= 75 ? '#2563eb' : '#dc2626' }}>{r.oee}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" style={{ color: r.trend === 'up' ? '#16a34a' : '#dc2626' }}>
                      {r.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="text-xs font-semibold">{r.change}</span>
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
