'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

// ───────────────────────────────────────────────
// 타입 정의
// ───────────────────────────────────────────────
interface TrendPoint {
  date: string;
  actual: number;
  predicted: number;
}

interface QualityFactor {
  factor: string;
  impact: number;
}

interface QualityForecast {
  time: string;
  line: string;
  predicted_defect: number;
  confidence: number;
  main_cause: string;
  action: string;
}

// ───────────────────────────────────────────────
// 목업 데이터
// ───────────────────────────────────────────────
const TREND: TrendPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: `${Math.floor(i / 30 * 6 + 1) + 1}/${(i % 5) * 6 + 1}`,
  actual: parseFloat((2.1 + Math.sin(i / 5) * 0.6).toFixed(2)),
  predicted: parseFloat((2.0 + Math.cos(i / 5) * 0.5).toFixed(2)),
}));

const FACTORS: QualityFactor[] = [
  { factor: '온도편차', impact: 42 },
  { factor: '재료로트', impact: 35 },
  { factor: '압력변동', impact: 31 },
  { factor: '이송속도', impact: 28 },
  { factor: '습도', impact: 15 },
];

const FORECASTS: QualityForecast[] = [
  { time: '14:00', line: '조립1라인', predicted_defect: 2.1, confidence: 89, main_cause: '온도편차', action: '냉각수 유량 점검' },
  { time: '16:00', line: '용접2공정', predicted_defect: 3.8, confidence: 93, main_cause: '전극 마모', action: '전극 교체 필요' },
  { time: '18:00', line: '도장공정', predicted_defect: 1.2, confidence: 76, main_cause: '습도 상승', action: '제습기 가동' },
];

// ───────────────────────────────────────────────
// 서브 컴포넌트
// ───────────────────────────────────────────────
function KpiCard({
  label,
  value,
  unit,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="bg-white rounded-lg p-5 flex flex-col gap-3"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div>
        <span className="text-2xl font-bold tabular-nums" style={{ color: '#1e3a5f' }}>
          {value}
        </span>
        <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>
      </div>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

// 커스텀 툴팁
function TrendTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
    >
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────
// 페이지
// ───────────────────────────────────────────────
export default function QualityPredictionPage() {
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecasts, setForecasts] = useState<QualityForecast[]>(FORECASTS);

  const refreshForecast = async () => {
    setLoadingForecast(true);
    try {
      const res = await fetch('/api/v1/ai/quality-prediction/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('API error');
      const data: QualityForecast[] = await res.json();
      setForecasts(data);
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      setForecasts(FORECASTS);
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">AI 분석</p>
          <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
            AI 품질 예측
          </h1>
        </div>
        <button
          onClick={refreshForecast}
          disabled={loadingForecast}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#2563eb' }}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          {loadingForecast ? '예측 갱신 중...' : '예보 갱신'}
        </button>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="예측 정확도"
          value="94.2"
          unit="%"
          sub="최근 30일 모델 성능"
          icon={<ShieldCheckIcon className="w-4 h-4" />}
          accent="#2563eb"
        />
        <KpiCard
          label="오늘 예측 불량률"
          value="1.8"
          unit="%"
          sub="목표 3% 이하 — 양호"
          icon={<ChartBarIcon className="w-4 h-4" />}
          accent="#16a34a"
        />
        <KpiCard
          label="위험 공정"
          value="2"
          unit="개"
          sub="용접2공정 · 도장공정 주의"
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
          accent="#dc2626"
        />
        <KpiCard
          label="조기 경보"
          value="5"
          unit="건/주"
          sub="전주 대비 -2건 감소"
          icon={<BellAlertIcon className="w-4 h-4" />}
          accent="#d97706"
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 30일 불량률 트렌드 — 2/3 너비 */}
        <div
          className="bg-white rounded-lg p-5 lg:col-span-2"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">30일 불량률 트렌드</h2>
            <p className="text-xs text-gray-400 mt-0.5">실측 vs AI 예측 — 기준선 3%</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={TREND} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                domain={[0, 4]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                iconType="line"
                iconSize={12}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) =>
                  value === 'actual' ? '실제 불량률' : 'AI 예측 불량률'
                }
              />
              <ReferenceLine
                y={3}
                stroke="#dc2626"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: '기준 3%', position: 'right', fontSize: 10, fill: '#dc2626' }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name="actual"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f97316"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4 }}
                name="predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 품질 영향 요인 바차트 — 1/3 너비 */}
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">품질 영향 요인</h2>
            <p className="text-xs text-gray-400 mt-0.5">AI 피처 중요도 분석</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={FACTORS}
              layout="vertical"
              margin={{ top: 0, right: 36, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 50]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="factor"
                tick={{ fontSize: 11, fill: '#374151' }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
                formatter={(v: unknown) => [`${v}%`, '영향도']}
              />
              <Bar dataKey="impact" fill="#2563eb" fillOpacity={0.8} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 품질 위험 예보 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <div>
            <h2 className="text-sm font-semibold text-gray-800">품질 위험 예보</h2>
            <p className="text-xs text-gray-400 mt-0.5">예측 불량률 3% 초과 시 위험 강조</p>
          </div>
          <span className="text-xs text-gray-400">총 {forecasts.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['예측시간', '라인', '예측 불량률', '신뢰도', '주요 원인', '권장 조치'].map((h) => (
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
              {forecasts.map((fc, i) => {
                const isHighRisk = fc.predicted_defect > 3.0;
                return (
                  <tr
                    key={`${fc.time}-${fc.line}`}
                    style={{
                      borderBottom: i < forecasts.length - 1 ? '1px solid #f3f4f6' : 'none',
                      backgroundColor: isHighRisk ? '#fff1f2' : undefined,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = isHighRisk ? '#ffe4e6' : '#fafafa')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isHighRisk ? '#fff1f2' : '')
                    }
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {fc.time}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {fc.line}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="text-base font-bold tabular-nums"
                        style={{ color: isHighRisk ? '#dc2626' : '#2563eb' }}
                      >
                        {fc.predicted_defect.toFixed(1)}%
                      </span>
                      {isHighRisk && (
                        <span className="ml-2 text-xs font-semibold text-red-500 bg-red-50 rounded px-1.5 py-0.5 border border-red-200">
                          위험
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${fc.confidence}%`,
                              backgroundColor:
                                fc.confidence >= 90
                                  ? '#16a34a'
                                  : fc.confidence >= 80
                                  ? '#2563eb'
                                  : '#d97706',
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 tabular-nums w-8">
                          {fc.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fc.main_cause}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: isHighRisk ? '#fee2e2' : '#eff6ff',
                          color: isHighRisk ? '#b91c1c' : '#1d4ed8',
                        }}
                      >
                        {fc.action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
