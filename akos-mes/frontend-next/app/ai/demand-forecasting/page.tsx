'use client';

import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
} from 'recharts';
import {
  ChartBarIcon,
  TruckIcon,
  CubeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
interface MonthlyData {
  month: string;
  actual: number | null;
  predicted: number;
  isFuture: boolean;
}

interface ProductForecast {
  product: string;
  nextMonth: number;
  range: string;
  stock: number;
  needProduce: number;
  orderDate: string;
}

// ─────────────────────────────────────────────
// 목업 데이터
// ─────────────────────────────────────────────
const MONTHLY: MonthlyData[] = [
  { month: '2026/01', actual: 1082, predicted: 1095, isFuture: false },
  { month: '2026/02', actual: 987,  predicted: 1010, isFuture: false },
  { month: '2026/03', actual: 1145, predicted: 1120, isFuture: false },
  { month: '2026/04', actual: 1203, predicted: 1180, isFuture: false },
  { month: '2026/05', actual: 1267, predicted: 1240, isFuture: false },
  { month: '2026/06', actual: null, predicted: 1247, isFuture: true  },
  { month: '2026/07', actual: null, predicted: 1312, isFuture: true  },
  { month: '2026/08', actual: null, predicted: 1289, isFuture: true  },
];

const PRODUCTS: ProductForecast[] = [
  { product: '자동화 용접라인',  nextMonth: 312, range: '290~335', stock: 45,  needProduce: 267, orderDate: '2026-06-20' },
  { product: 'PLC 제어반',       nextMonth: 248, range: '230~265', stock: 82,  needProduce: 166, orderDate: '2026-06-25' },
  { product: '컨베이어 시스템',  nextMonth: 187, range: '170~205', stock: 23,  needProduce: 164, orderDate: '2026-06-10' },
  { product: '비전검사장비',     nextMonth: 156, range: '140~172', stock: 67,  needProduce: 89,  orderDate: '2026-07-01' },
  { product: '협동로봇 유닛',    nextMonth: 344, range: '320~368', stock: 12,  needProduce: 332, orderDate: '2026-06-08' },
];

// ─────────────────────────────────────────────
// KPI 카드 데이터
// ─────────────────────────────────────────────
const KPI_CARDS = [
  {
    label: 'MAPE (예측 오차율)',
    value: '4.2',
    unit: '%',
    sub: '업계 기준 ≤5% 달성',
    subColor: 'text-green-600',
    icon: ChartBarIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: '다음달 수요 예측',
    value: '1,247',
    unit: '대',
    sub: '범위 1,180~1,310',
    subColor: 'text-gray-500',
    icon: CubeIcon,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    label: '재고 최적화율',
    value: '18.4',
    unit: '%',
    sub: '과잉재고 절감',
    subColor: 'text-green-600',
    icon: TruckIcon,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    label: '납기 준수율',
    value: '97.3',
    unit: '%',
    sub: '전월 대비 +0.8%',
    subColor: 'text-green-600',
    icon: CheckCircleIcon,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
];

// ─────────────────────────────────────────────
// 수평 바차트용 데이터
// ─────────────────────────────────────────────
const PRODUCT_BAR_DATA = [...PRODUCTS]
  .sort((a, b) => b.nextMonth - a.nextMonth)
  .map((p) => ({ name: p.product, 예측수요: p.nextMonth }));

// ─────────────────────────────────────────────
// 커스텀 툴팁
// ─────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string;
  value: number | null;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="bg-white rounded-lg px-3 py-2 text-xs space-y-1"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) =>
        p.value !== null ? (
          <p key={p.name} style={{ color: p.color }} className="tabular-nums">
            {p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span>대
          </p>
        ) : null
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function DemandForecastingPage() {
  // 미래 구간 시작/끝 month 값
  const futureStart = MONTHLY.find((d) => d.isFuture)?.month ?? '';
  const futureEnd = MONTHLY[MONTHLY.length - 1].month;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>
            AI 수요 예측
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            제품별 수요 예측 · 재고 최적화 · 생산 계획 지원
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ComposedChart — 월별 추이 (3/5 너비) */}
        <div
          className="lg:col-span-3 rounded-xl bg-white p-5 space-y-4"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: '#1e3a5f' }}>
              월별 수요 추이 (실적 vs 예측)
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-6 h-0.5 bg-blue-500" />
                실적
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-6 border-t-2 border-dashed border-orange-400" />
                예측
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-gray-100" />
                미래구간
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={MONTHLY} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                domain={[800, 1500]}
                tickFormatter={(v: number) => v.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* 미래 구간 배경 */}
              <ReferenceArea
                x1={futureStart}
                x2={futureEnd}
                fill="#f3f4f6"
                fillOpacity={0.8}
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="실적"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="예측"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 수평 BarChart — 제품별 예측 수요 (2/5 너비) */}
        <div
          className="lg:col-span-2 rounded-xl bg-white p-5 space-y-4"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: '#1e3a5f' }}>
            제품별 다음달 수요 예측
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={PRODUCT_BAR_DATA}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(value: unknown) => [`${Number(value).toLocaleString()}대`, '예측 수요']}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="예측수요" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 수요 예측 상세 테이블 */}
      <div
        className="rounded-xl bg-white overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: '#1e3a5f' }}>
            수요 예측 상세 (다음달)
          </h2>
          <button
            className="text-xs text-white px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}
          >
            생산 계획 반영
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">제품명</th>
                <th className="px-4 py-3 text-right font-medium">예측 수요</th>
                <th className="px-4 py-3 text-right font-medium">예측 범위</th>
                <th className="px-4 py-3 text-right font-medium">현재 재고</th>
                <th className="px-4 py-3 text-right font-medium">생산 필요량</th>
                <th className="px-4 py-3 text-center font-medium">발주 권고일</th>
                <th className="px-4 py-3 text-center font-medium">재고 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PRODUCTS.map((row, idx) => {
                const isLowStock = row.stock < row.needProduce * 0.3;
                return (
                  <tr key={idx} className={`transition-colors ${isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {row.product}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: '#1e3a5f' }}>
                      {row.nextMonth.toLocaleString()}
                      <span className="text-gray-400 font-normal ml-0.5 text-xs">대</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs tabular-nums">
                      {row.range}
                    </td>
                    <td className={`px-4 py-3 text-right tabular-nums font-medium ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                      {row.stock.toLocaleString()}
                      <span className="text-gray-400 font-normal ml-0.5 text-xs">개</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {row.needProduce.toLocaleString()}
                      <span className="text-gray-400 font-normal ml-0.5 text-xs">개</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs tabular-nums whitespace-nowrap">
                      {row.orderDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                          재고 부족
                        </span>
                      ) : (
                        <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          정상
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            빨간 행 강조: 현재 재고가 생산 필요량의 30% 미만인 품목 — 즉시 조치 권고
          </p>
        </div>
      </div>
    </div>
  );
}
