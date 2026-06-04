'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  WrenchScrewdriverIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// ────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────
type EquipStatus = '정상' | '양호' | '주의' | '위험' | '긴급';

interface Equipment {
  id: string;
  name: string;
  health: number;
  rul: number;
  status: EquipStatus;
  next: string;
}

interface SensorPoint {
  date: string;
  vibration: number;
  temperature: number;
  current: number;
}

interface MaintenanceRow {
  id: string;
  name: string;
  status: EquipStatus;
  next: string;
  rul: number;
  health: number;
  action: string;
}

// ────────────────────────────────────────────────
// 목업 데이터
// ────────────────────────────────────────────────
const EQUIPMENTS: Equipment[] = [
  { id: 'CNC-001', name: 'CNC 머시닝센터 #1', health: 92, rul: 1240, status: '정상',  next: '2026-07-15' },
  { id: 'WLD-002', name: '용접로봇 #2',        health: 61, rul: 312,  status: '주의',  next: '2026-06-18' },
  { id: 'CNV-003', name: '컨베이어 #3',        health: 45, rul: 180,  status: '위험',  next: '2026-06-10' },
  { id: 'PRS-004', name: '유압프레스 #4',      health: 88, rul: 980,  status: '정상',  next: '2026-08-01' },
  { id: 'INS-005', name: '비전검사기 #5',      health: 77, rul: 650,  status: '양호',  next: '2026-07-05' },
  { id: 'ROB-006', name: '협동로봇 #6',        health: 35, rul: 95,   status: '긴급',  next: '즉시' },
];

const SENSOR: SensorPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: `${Math.floor(i / 30) + 6}/${(i % 30) + 1}`,
  vibration:   parseFloat((0.8 + i * 0.03).toFixed(2)),
  temperature: parseFloat((72 + i * 0.2).toFixed(1)),
  current:     parseFloat((14.2 + i * 0.05).toFixed(2)),
}));

const MAINTENANCE_ROWS: MaintenanceRow[] = EQUIPMENTS.map((e) => ({
  id: e.id,
  name: e.name,
  status: e.status,
  next: e.next,
  rul: e.rul,
  health: e.health,
  action:
    e.status === '긴급' ? '즉시 교체 필요' :
    e.status === '위험' ? '긴급 점검 예약' :
    e.status === '주의' ? '정밀 진단 권고' :
    e.status === '양호' ? '예방 점검 유지' :
    '정기 점검 유지',
}));

// ────────────────────────────────────────────────
// 상태 스타일 매핑
// ────────────────────────────────────────────────
const statusBorder: Record<EquipStatus, string> = {
  긴급: 'border-l-4 border-l-red-500',
  위험: 'border-l-4 border-l-orange-400',
  주의: 'border-l-4 border-l-yellow-400',
  양호: 'border-l-4 border-l-blue-400',
  정상: 'border-l-4 border-l-green-400',
};

const statusBadge: Record<EquipStatus, string> = {
  긴급: 'bg-red-100 text-red-700',
  위험: 'bg-orange-100 text-orange-700',
  주의: 'bg-yellow-100 text-yellow-700',
  양호: 'bg-blue-100 text-blue-700',
  정상: 'bg-green-100 text-green-700',
};

const healthBarColor = (h: number) =>
  h >= 80 ? '#16a34a' : h >= 60 ? '#2563eb' : h >= 40 ? '#f59e0b' : '#ef4444';

// ────────────────────────────────────────────────
// KPI 카드
// ────────────────────────────────────────────────
const KPI_CARDS = [
  { label: '예측 정확도',    value: '91.5%',   sub: '지난 30일 평균',  icon: CheckCircleIcon,          color: '#16a34a' },
  { label: '긴급 보전 설비', value: '2대',      sub: '즉시 조치 필요',  icon: ExclamationTriangleIcon,  color: '#ef4444' },
  { label: '월 절감 비용',   value: '₩12.4M', sub: '예방보전 효과',   icon: CurrencyDollarIcon,       color: '#2563eb' },
  { label: '평균 잔여수명',  value: '576h',    sub: '전 설비 RUL 평균', icon: ClockIcon,               color: '#7c3aed' },
];

// ────────────────────────────────────────────────
// 컴포넌트
// ────────────────────────────────────────────────
export default function PredictiveMaintenancePage() {
  const [selectedEquip, setSelectedEquip] = useState<string>('CNV-003');

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">AI 분석</p>
          <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
            AI 설비 예지보전
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">기준: 2026-06-04</span>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-white"
            style={{ backgroundColor: '#2563eb' }}
          >
            <WrenchScrewdriverIcon className="w-4 h-4" />
            보전 계획 생성
          </button>
        </div>
      </div>

      {/* KPI 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-lg px-5 py-4"
            style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-500">{k.label}</p>
              <k.icon className="w-5 h-5" style={{ color: k.color }} />
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: '#1e3a5f' }}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* 설비 건강 상태 그리드 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">설비 건강 상태 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {EQUIPMENTS.map((eq) => (
            <div
              key={eq.id}
              onClick={() => setSelectedEquip(eq.id)}
              className={`bg-white rounded-lg p-4 cursor-pointer transition-all ${statusBorder[eq.status]} ${
                selectedEquip === eq.id ? 'ring-2 ring-blue-300' : ''
              }`}
              style={{
                border: '1px solid #e5e7eb',
                borderLeft: undefined,
                boxShadow: selectedEquip === eq.id
                  ? '0 2px 8px rgba(37,99,235,0.15)'
                  : '0 1px 4px rgba(0,0,0,0.08)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{eq.id}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{eq.name}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[eq.status]}`}>
                  {eq.status}
                </span>
              </div>

              {/* 건강 지수 진행바 */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">건강 지수</span>
                  <span className="font-bold tabular-nums" style={{ color: healthBarColor(eq.health) }}>
                    {eq.health}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${eq.health}%`, backgroundColor: healthBarColor(eq.health) }}
                  />
                </div>
              </div>

              {/* RUL & 다음 보전일 */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-500">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>잔여수명</span>
                  <span className="font-bold text-gray-800 tabular-nums ml-1">{eq.rul}h</span>
                </div>
                <div className="text-gray-500">
                  다음 보전:&nbsp;
                  <span
                    className={`font-semibold ${eq.next === '즉시' ? 'text-red-600' : 'text-gray-700'}`}
                  >
                    {eq.next}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 센서 이상 트렌드 */}
      <div
        className="bg-white rounded-lg p-5"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">센서 이상 트렌드</h2>
            <p className="text-xs text-gray-400 mt-0.5">진동 / 온도 / 전류 — 최근 30일</p>
          </div>
          <div className="flex gap-2">
            {EQUIPMENTS.map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelectedEquip(eq.id)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  selectedEquip === eq.id
                    ? 'text-white border-blue-600'
                    : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
                style={selectedEquip === eq.id ? { backgroundColor: '#2563eb' } : {}}
              >
                {eq.id}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={SENSOR} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="vibration"
              name="진동 (mm/s)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="온도 (°C)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="전류 (A)"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 예지보전 일정 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <h2 className="text-base font-semibold text-gray-800">예지보전 일정</h2>
          <span className="text-xs text-gray-400">총 {MAINTENANCE_ROWS.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['설비 ID', '설비명', '건강 지수', '잔여수명', '상태', '다음 보전일', '권고 조치'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAINTENANCE_ROWS.map((r, i) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: i < MAINTENANCE_ROWS.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.health}%`,
                            backgroundColor: healthBarColor(r.health),
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-semibold tabular-nums"
                        style={{ color: healthBarColor(r.health) }}
                      >
                        {r.health}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-gray-700 text-sm font-semibold">
                    {r.rul}h
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <span className={r.next === '즉시' ? 'font-bold text-red-600' : ''}>
                      {r.next}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
