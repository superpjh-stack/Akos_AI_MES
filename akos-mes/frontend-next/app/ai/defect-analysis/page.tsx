'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ExclamationTriangleIcon,
  CpuChipIcon,
  BoltIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
interface DefectType {
  name: string;
  value: number;
  color: string;
}

interface WeeklyData {
  week: string;
  치수불량: number;
  표면불량: number;
  용접불량: number;
}

interface RecentDefect {
  datetime: string;
  line: string;
  type: string;
  ai_cause: string;
  confidence: number;
  action: string;
  status: '완료' | '처리중' | '대기';
}

// ─────────────────────────────────────────────
// 목업 데이터
// ─────────────────────────────────────────────
const DEFECT_TYPES: DefectType[] = [
  { name: '치수불량', value: 35, color: '#ef4444' },
  { name: '표면불량', value: 28, color: '#f97316' },
  { name: '용접불량', value: 18, color: '#eab308' },
  { name: '조립불량', value: 12, color: '#8b5cf6' },
  { name: '기타', value: 7, color: '#6b7280' },
];

const WEEKLY: WeeklyData[] = [
  { week: '8주전', 치수불량: 10, 표면불량: 7, 용접불량: 4 },
  { week: '7주전', 치수불량: 12, 표면불량: 8, 용접불량: 5 },
  { week: '6주전', 치수불량: 9, 표면불량: 6, 용접불량: 4 },
  { week: '5주전', 치수불량: 14, 표면불량: 9, 용접불량: 6 },
  { week: '4주전', 치수불량: 11, 표면불량: 7, 용접불량: 5 },
  { week: '3주전', 치수불량: 13, 표면불량: 10, 용접불량: 7 },
  { week: '2주전', 치수불량: 15, 표면불량: 8, 용접불량: 6 },
  { week: '이번주', 치수불량: 16, 표면불량: 11, 용접불량: 8 },
];

const RECENT: RecentDefect[] = [
  { datetime: '2026-06-04 09:12', line: '조립1라인', type: '치수불량', ai_cause: '공구 마모 84%', confidence: 96, action: '공구 교체', status: '완료' },
  { datetime: '2026-06-04 10:34', line: '용접2공정', type: '용접불량', ai_cause: '전극 오염 감지', confidence: 91, action: '전극 세척', status: '처리중' },
  { datetime: '2026-06-04 11:05', line: '도장공정', type: '표면불량', ai_cause: '도료 점도 이상', confidence: 88, action: '도료 교체', status: '대기' },
  { datetime: '2026-06-04 13:22', line: '검사라인', type: '치수불량', ai_cause: '지그 위치 틀어짐', confidence: 94, action: '지그 재조정', status: '완료' },
  { datetime: '2026-06-04 14:47', line: '포장공정', type: '기타', ai_cause: '포장재 불량', confidence: 77, action: '포장재 교체', status: '대기' },
];

// ─────────────────────────────────────────────
// KPI 카드 데이터
// ─────────────────────────────────────────────
const KPI_CARDS = [
  {
    label: '불량률',
    value: '2.3',
    unit: '%',
    sub: '목표 2.0%',
    subColor: 'text-red-500',
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    label: 'AI 분류 정확도',
    value: '96.1',
    unit: '%',
    sub: '전월 대비 +1.4%',
    subColor: 'text-green-600',
    icon: CpuChipIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: '자동 조치율',
    value: '67',
    unit: '%',
    sub: '전월 대비 +5%',
    subColor: 'text-green-600',
    icon: BoltIcon,
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
  {
    label: '월 절감 비용',
    value: '8.2',
    unit: 'M원',
    sub: '목표 대비 +0.2M',
    subColor: 'text-green-600',
    icon: CurrencyDollarIcon,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
];

// ─────────────────────────────────────────────
// 배지 색상
// ─────────────────────────────────────────────
const defectTypeColor: Record<string, string> = {
  치수불량: 'bg-red-100 text-red-700',
  표면불량: 'bg-orange-100 text-orange-700',
  용접불량: 'bg-yellow-100 text-yellow-700',
  조립불량: 'bg-purple-100 text-purple-700',
  기타: 'bg-gray-100 text-gray-600',
};

const statusColor: Record<RecentDefect['status'], string> = {
  완료: 'bg-green-100 text-green-700',
  처리중: 'bg-blue-100 text-blue-700',
  대기: 'bg-gray-100 text-gray-500',
};

// ─────────────────────────────────────────────
// 커스텀 도넛 레이블 (중앙)
// ─────────────────────────────────────────────
interface CustomLabelProps {
  cx?: number;
  cy?: number;
}

function DonutCenterLabel({ cx = 0, cy = 0 }: CustomLabelProps) {
  const total = DEFECT_TYPES.reduce((s, d) => s + d.value, 0);
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-xs" fontSize={11}>
        총 불량
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" fontWeight={700} fontSize={22} fill="#1e3a5f">
        {total}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#6b7280">
        건
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function DefectAnalysisPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>
            AI 불량 분석
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            실시간 불량 유형 분류 · 원인 분석 · 자동 조치 현황
          </p>
        </div>
        <span className="text-xs text-gray-400">기준: 2026-06-04</span>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl bg-white p-4 space-y-3"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
                  <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: '#1e3a5f' }}>
                {kpi.value}
                <span className="text-sm font-medium text-gray-400 ml-1">{kpi.unit}</span>
              </p>
              <p className={`text-xs font-medium ${kpi.subColor}`}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 차트 2개 가로 배치 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 도넛 차트 — 불량유형별 */}
        <div
          className="rounded-xl bg-white p-5 space-y-4"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#1e3a5f' }}>
            불량 유형별 분포
          </h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={DEFECT_TYPES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {DEFECT_TYPES.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <DonutCenterLabel cx={100} cy={100} />
                <Tooltip
                  formatter={(value: unknown) => [`${value}건`, '발생 건수']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* 범례 */}
            <div className="flex-1 space-y-2">
              {DEFECT_TYPES.map((d, i) => {
                const pct = Math.round((d.value / DEFECT_TYPES.reduce((s, x) => s + x.value, 0)) * 100);
                return (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-sm cursor-pointer"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-700 text-xs">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs tabular-nums">{d.value}건</span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: d.color }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 누적 바차트 — 8주 추이 */}
        <div
          className="rounded-xl bg-white p-5 space-y-4"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#1e3a5f' }}>
            주간 불량 추이 (8주)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="치수불량" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="표면불량" stackId="a" fill="#f97316" />
              <Bar dataKey="용접불량" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 최근 불량 분석 테이블 */}
      <div
        className="rounded-xl bg-white overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: '#1e3a5f' }}>
            최근 불량 분석 내역
          </h2>
          <button
            className="text-xs text-white px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}
          >
            전체 보기
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">발생일시</th>
                <th className="px-4 py-3 text-left font-medium">라인/공정</th>
                <th className="px-4 py-3 text-left font-medium">불량유형</th>
                <th className="px-4 py-3 text-left font-medium">AI 원인 분석</th>
                <th className="px-4 py-3 text-left font-medium">신뢰도</th>
                <th className="px-4 py-3 text-left font-medium">권고 조치</th>
                <th className="px-4 py-3 text-center font-medium">처리상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs tabular-nums">
                    {row.datetime}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium text-xs">
                    {row.line}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${defectTypeColor[row.type] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">
                    {row.ai_cause}
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${row.confidence}%`,
                            backgroundColor:
                              row.confidence >= 95
                                ? '#22c55e'
                                : row.confidence >= 88
                                ? '#3b82f6'
                                : '#f59e0b',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-semibold tabular-nums w-9 text-right"
                        style={{
                          color:
                            row.confidence >= 95
                              ? '#16a34a'
                              : row.confidence >= 88
                              ? '#2563eb'
                              : '#d97706',
                        }}
                      >
                        {row.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">
                    {row.action}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[row.status]}`}
                    >
                      {row.status}
                    </span>
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
