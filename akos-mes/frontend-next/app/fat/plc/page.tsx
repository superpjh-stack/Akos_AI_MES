'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Eye, RefreshCw, Activity } from 'lucide-react';

function PageHeader({ title, section }: { title: string; section: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-white hover:opacity-90" style={{ backgroundColor: '#16a34a' }}><Activity size={14} /> 실시간 모니터링</button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><RefreshCw size={14} /> 새로고침</button>
      </div>
    </div>
  );
}

function ConnStatus({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    '연결됨': { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a' },
    '연결끊김': { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626' },
    '점검중': { bg: '#fefce8', color: '#ca8a04', dot: '#ca8a04' },
    '대기': { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  );
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

const PLC_DEVICES = [
  { id: 'PLC-001', name: 'Q03UDE CPU', model: 'Mitsubishi Q03UDE', ip: '192.168.1.10', protocol: 'MC Protocol', line: '라인 A', points: 512, lastSync: '방금 전', status: '연결됨' },
  { id: 'PLC-002', name: 'FX5U CPU', model: 'Mitsubishi FX5U', ip: '192.168.1.11', protocol: 'MC Protocol', line: '라인 A', points: 256, lastSync: '30초 전', status: '연결됨' },
  { id: 'PLC-003', name: 'S7-1500 CPU', model: 'Siemens S7-1500', ip: '192.168.1.20', protocol: 'OPC-UA', line: '라인 B', points: 1024, lastSync: '5분 전', status: '점검중' },
  { id: 'PLC-004', name: 'CompactLogix', model: 'AB 5069-L306ER', ip: '192.168.1.30', protocol: 'EtherNet/IP', line: '라인 B', points: 768, lastSync: '-', status: '연결끊김' },
  { id: 'PLC-005', name: 'CP1H CPU', model: 'OMRON CP1H', ip: '192.168.1.40', protocol: 'FINS/TCP', line: '라인 C', points: 192, lastSync: '1분 전', status: '연결됨' },
];

export default function PlcPage() {
  const [search, setSearch] = useState('');
  const rows = PLC_DEVICES.filter(r => !search || r.id.includes(search) || r.name.includes(search) || r.line.includes(search));
  const connected = PLC_DEVICES.filter(r => r.status === '연결됨').length;

  return (
    <div className="space-y-6">
      <PageHeader title="PLC 연동" section="FAT 관리" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="등록 장비 수" value={`${PLC_DEVICES.length}대`} sub="3개 프로토콜" />
        <KpiCard label="현재 연결 중" value={`${connected}대`} sub={`전체의 ${Math.round(connected/PLC_DEVICES.length*100)}%`} color="#16a34a" />
        <KpiCard label="수집 데이터 포인트" value="2,752점" sub="실시간 갱신" color="#2563eb" />
        <KpiCard label="마지막 장애" value="3일 전" sub="PLC-004 연결 끊김" color="#d97706" />
      </div>

      {/* Real-time data preview */}
      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">실시간 데이터 미리보기 (PLC-001)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { tag: 'D0001', desc: '모터 RPM', value: '1,450', unit: 'RPM', ok: true },
            { tag: 'D0002', desc: '토크 값', value: '42.3', unit: 'Nm', ok: true },
            { tag: 'D0010', desc: '온도 센서 1', value: '68.4', unit: '°C', ok: true },
            { tag: 'D0011', desc: '압력 센서', value: '3.2', unit: 'MPa', ok: false },
          ].map(d => (
            <div key={d.tag} className="rounded-lg p-3" style={{ backgroundColor: d.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${d.ok ? '#bbf7d0' : '#fecaca'}` }}>
              <div className="text-xs text-gray-400 font-mono">{d.tag}</div>
              <div className="text-xs text-gray-500 mt-0.5">{d.desc}</div>
              <div className="text-lg font-bold mt-1" style={{ color: d.ok ? '#16a34a' : '#dc2626' }}>{d.value}<span className="text-xs font-normal ml-1">{d.unit}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">PLC/장비 목록</h2>
          <span className="text-xs text-gray-400">총 {rows.length}대</span>
        </div>
        <div className="px-6 pt-4 flex flex-wrap gap-3 mb-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="장비 ID, 이름 검색..." onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 라인</option><option>라인 A</option><option>라인 B</option><option>라인 C</option></select>
          <select className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white"><option>전체 상태</option><option>연결됨</option><option>연결끊김</option><option>점검중</option></select>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><Download size={14} /> 내보내기</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['장비ID','장비명','모델','IP 주소','프로토콜','라인','데이터포인트','최종동기화','연결상태','액션'].map(h => (
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
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.model}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.ip}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.protocol}</td>
                  <td className="px-4 py-3 text-gray-600">{r.line}</td>
                  <td className="px-4 py-3 text-gray-600">{r.points}점</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.lastSync}</td>
                  <td className="px-4 py-3"><ConnStatus status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button className="text-gray-400 hover:text-green-600"><RefreshCw size={15} /></button>
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
