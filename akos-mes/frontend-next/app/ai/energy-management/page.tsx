'use client';

import React, { useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  BoltIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

// ────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────
type Priority = '높음' | '중간' | '낮음';

interface HourlyPoint {
  hour: string;
  consumption: number;
  baseline: number;
}

interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

interface RecommendationRow {
  target: string;
  current: string;
  saving: string;
  cost_saving: string;
  action: string;
  priority: Priority;
}

// ────────────────────────────────────────────────
// 목업 데이터
// ────────────────────────────────────────────────
const HOURLY: HourlyPoint[] = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  consumption: Math.round(180 + 40 * Math.sin((h - 6) / 4)),
  baseline: 185,
}));

const BREAKDOWN: BreakdownItem[] = [
  { name: 'CNC 설비군',  value: 38, color: '#2563eb' },
  { name: '용접 설비',   value: 24, color: '#7c3aed' },
  { name: '공조/냉각',   value: 18, color: '#0891b2' },
  { name: '조명/기타',   value: 12, color: '#16a34a' },
  { name: '컨베이어',    value:  8, color: '#d97706' },
];

const RECS: RecommendationRow[] = [
  {
    target: 'CNC-001~003', current: '142 kWh', saving: '11.8 kWh',
    cost_saving: '₩1,416/일', action: '대기모드 스케줄 최적화', priority: '높음',
  },
  {
    target: '공조시스템', current: '64 kWh', saving: '8.3 kWh',
    cost_saving: '₩996/일', action: '피크타임 온도 설정 조정', priority: '높음',
  },
  {
    target: '조명시스템', current: '22 kWh', saving: '6.2 kWh',
    cost_saving: '₩744/일', action: '재실 감지 센서 확대', priority: '중간',
  },
  {
    target: '유압 설비', current: '38 kWh', saving: '4.1 kWh',
    cost_saving: '₩492/일', action: '유압 압력 최적화', priority: '낮음',
  },
];

// ────────────────────────────────────────────────
// 배지 스타일
// ────────────────────────────────────────────────
const priorityBadge: Record<Priority, string> = {
  높음: 'bg-red-100 text-red-700',
  중간: 'bg-amber-100 text-amber-700',
  낮음: 'bg-gray-100 text-gray-500',
};

// ────────────────────────────────────────────────
// KPI 카드
// ────────────────────────────────────────────────
const KPI_CARDS = [
  { label: '에너지 절감률',   value: '8.3%',    sub: '전월 대비',         icon: BoltIcon,             color: '#16a34a' },
  { label: '예측 에너지 비용', value: '₩24.7M', sub: '이번 달 예상',       icon: CurrencyDollarIcon,   color: '#2563eb' },
  { label: 'CO₂ 절감량',     value: '15.2톤',  sub: '이번 달 누적',       icon: CloudIcon,            color: '#0891b2' },
  { label: '낭비 구간',       value: '4개',     sub: '즉시 개선 권고',     icon: ExclamationCircleIcon, color: '#f59e0b' },
];

// ────────────────────────────────────────────────
// 도넛 차트 커스텀 라벨
// ────────────────────────────────────────────────
interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ────────────────────────────────────────────────
// 컴포넌트
// ────────────────────────────────────────────────
export default function EnergyManagementPage() {
  const [viewMode, setViewMode] = useState<'오늘' | '주간' | '월간'>('오늘');

  // 피크 시간대: 08:00 ~ 18:00 인덱스
  const peakHours = HOURLY.filter((h) => {
    const hr = parseInt(h.hour.split(':')[0], 10);
    return hr >= 8 && hr <= 18;
  });
  const peakAvg = Math.round(peakHours.reduce((a, h) => a + h.consumption, 0) / peakHours.length);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">AI 분석</p>
          <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
            AI 에너지 관리
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            {(['오늘', '주간', '월간'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="text-sm px-3 py-1.5 transition-colors"
                style={{
                  backgroundColor: viewMode === v ? '#2563eb' : '#ffffff',
                  color: viewMode === v ? '#ffffff' : '#6b7280',
                }}
              >
                {v}
              </button>
            ))}
          </div>
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

      {/* 차트 2단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 24시간 에너지 소비 AreaChart */}
        <div
          className="lg:col-span-2 bg-white rounded-lg p-5"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-semibold text-gray-800">24시간 에너지 소비 현황</h2>
              <p className="text-xs text-gray-400 mt-0.5">기준선 대비 실시간 소비 — 단위: kWh</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-orange-400 rounded" />
                피크 평균 {peakAvg} kWh
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={HOURLY} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                width={36}
                domain={[140, 230]}
              />
              <Tooltip
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: unknown, name: string) => [`${value ?? ''} kWh`, name]) as any}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {/* 피크 시간대 배경 강조 */}
              <ReferenceLine
                x="08:00"
                stroke="#f59e0b"
                strokeDasharray="4 2"
                strokeWidth={1.5}
                label={{ value: '피크 시작', position: 'top', fontSize: 10, fill: '#f59e0b' }}
              />
              <ReferenceLine
                x="18:00"
                stroke="#f59e0b"
                strokeDasharray="4 2"
                strokeWidth={1.5}
                label={{ value: '피크 종료', position: 'top', fontSize: 10, fill: '#f59e0b' }}
              />
              <Area
                type="monotone"
                dataKey="baseline"
                name="기준선"
                stroke="#9ca3af"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="url(#gradBaseline)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                name="실제 소비"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#gradConsumption)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 설비별 에너지 비중 PieChart */}
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-base font-semibold text-gray-800 mb-1">설비별 에너지 비중</h2>
          <p className="text-xs text-gray-400 mb-3">오늘 기준 누적 소비</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel as any}
              >
                {BREAKDOWN.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((value: unknown) => [`${value ?? ''}%`, '비중']) as any}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* 범례 */}
          <div className="mt-2 space-y-1.5">
            {BREAKDOWN.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="text-gray-600">{b.name}</span>
                </div>
                <span className="font-semibold tabular-nums text-gray-700">{b.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 절감 추천 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <div>
            <h2 className="text-base font-semibold text-gray-800">AI 절감 추천</h2>
            <p className="text-xs text-gray-400 mt-0.5">AI가 분석한 에너지 절감 실행 가능 항목</p>
          </div>
          <button
            className="text-sm px-3 py-1.5 rounded-md text-white"
            style={{ backgroundColor: '#2563eb' }}
          >
            전체 적용
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['대상 설비', '현재 소비', '절감 가능', '비용 절감', '권고 조치', '우선순위'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECS.map((r, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < RECS.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{r.target}</td>
                  <td className="px-4 py-3 tabular-nums text-gray-600">{r.current}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-green-600">{r.saving}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-blue-600">{r.cost_saving}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.action}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityBadge[r.priority]}`}>
                      {r.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 합계 행 */}
        <div
          className="px-5 py-3 flex items-center justify-end gap-6 text-sm"
          style={{ borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}
        >
          <span className="text-gray-500">총 절감 가능:</span>
          <span className="font-bold text-green-600">30.4 kWh/일</span>
          <span className="font-bold text-blue-600">₩3,648/일</span>
        </div>
      </div>
    </div>
  );
}
