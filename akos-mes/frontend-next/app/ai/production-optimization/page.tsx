'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
  Cell,
} from 'recharts';
import {
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

// ───────────────────────────────────────────────
// 타입 정의
// ───────────────────────────────────────────────
interface HourlyOEE {
  hour: string;
  oee: number;
  target: number;
}

interface ProcessRate {
  process: string;
  rate: number;
}

interface Recommendation {
  priority: number;
  process: string;
  issue: string;
  improvement: string;
  confidence: number;
  status: '대기' | '검토중' | '이행중' | '완료';
}

interface AnalysisResult {
  summary: string;
  bottleneck: string;
  estimatedGain: string;
  generatedAt: string;
}

// ───────────────────────────────────────────────
// 목업 데이터
// ───────────────────────────────────────────────
const HOURLY: HourlyOEE[] = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  oee: Math.round(83 + Math.sin(h / 4) * 5),
  target: 90,
}));

const PROCESS_RATES: ProcessRate[] = [
  { process: '조립1라인', rate: 94 },
  { process: '용접2공정', rate: 71 },
  { process: '도장공정', rate: 88 },
  { process: '검사라인', rate: 96 },
  { process: '포장공정', rate: 82 },
  { process: '출하라인', rate: 79 },
];

const RECOMMENDATIONS: Recommendation[] = [
  { priority: 1, process: '용접2공정', issue: '설비 과부하', improvement: '+15% 효율', confidence: 94, status: '대기' },
  { priority: 2, process: '출하라인', issue: '인력 배치 비최적', improvement: '+8% 효율', confidence: 87, status: '검토중' },
  { priority: 3, process: '포장공정', issue: '사이클타임 초과', improvement: '+6% 효율', confidence: 91, status: '이행중' },
  { priority: 4, process: '도장공정', issue: '온도 편차', improvement: '+4% 효율', confidence: 82, status: '완료' },
  { priority: 5, process: '조립1라인', issue: '자재 공급 지연', improvement: '+3% 효율', confidence: 78, status: '대기' },
];

// ───────────────────────────────────────────────
// 상수
// ───────────────────────────────────────────────
const STATUS_STYLE: Record<Recommendation['status'], string> = {
  대기: 'bg-gray-100 text-gray-500',
  검토중: 'bg-yellow-100 text-yellow-700',
  이행중: 'bg-blue-100 text-blue-700',
  완료: 'bg-green-100 text-green-700',
};

const PRIORITY_COLORS: Record<number, string> = {
  1: '#dc2626',
  2: '#ea580c',
  3: '#2563eb',
  4: '#16a34a',
  5: '#6b7280',
};

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

// ───────────────────────────────────────────────
// 페이지
// ───────────────────────────────────────────────
export default function ProductionOptimizationPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/v1/ai/production-optimization/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('API error');
      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch {
      // 폴백 목업 결과
      await new Promise((r) => setTimeout(r, 1800));
      setAnalysisResult({
        summary:
          '용접2공정의 설비 과부하가 전체 OEE를 3.2%p 저하시키는 주요 원인으로 분석되었습니다. 작업 부하 재분배와 예방 정비 스케줄 조정으로 일일 2.4시간 가동 손실을 회복할 수 있습니다.',
        bottleneck: '용접2공정 (현재 가동률 71% — 목표 대비 19%p 미달)',
        estimatedGain: 'OEE +3.2%p / 월간 생산량 +186EA 예상',
        generatedAt: new Date().toLocaleString('ko-KR'),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">AI 분석</p>
          <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
            AI 생산 최적화
          </h1>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#2563eb' }}
        >
          <BoltIcon className="w-4 h-4" />
          {isAnalyzing ? 'AI 분석 중...' : 'AI 분석 실행'}
        </button>
      </div>

      {/* AI 분석 결과 카드 */}
      {analysisResult && (
        <div
          className="rounded-lg p-4 flex gap-3"
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
          }}
        >
          <CpuChipIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div className="space-y-1 text-sm">
            <p className="font-semibold" style={{ color: '#1e3a5f' }}>
              AI 분석 완료 — {analysisResult.generatedAt}
            </p>
            <p className="text-gray-700">{analysisResult.summary}</p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className="text-gray-500">
                병목 공정: <span className="font-medium text-gray-800">{analysisResult.bottleneck}</span>
              </span>
              <span className="text-gray-500">
                개선 효과: <span className="font-medium" style={{ color: '#2563eb' }}>{analysisResult.estimatedGain}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="종합 OEE"
          value="87.3"
          unit="%"
          sub="목표 90% 대비 -2.7%p"
          icon={<CpuChipIcon className="w-4 h-4" />}
          accent="#2563eb"
        />
        <KpiCard
          label="절감 가능 시간"
          value="2.4"
          unit="시간/일"
          sub="최적화 이행 시 기대 효과"
          icon={<ClockIcon className="w-4 h-4" />}
          accent="#16a34a"
        />
        <KpiCard
          label="감지된 병목"
          value="3"
          unit="개"
          sub="용접·출하·포장 공정"
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
          accent="#dc2626"
        />
        <KpiCard
          label="권고 이행률"
          value="72"
          unit="%"
          sub="5건 중 3.6건 이행 완료"
          icon={<CheckCircleIcon className="w-4 h-4" />}
          accent="#d97706"
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* OEE 24시간 라인차트 */}
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">OEE 24시간 추이</h2>
            <p className="text-xs text-gray-400 mt-0.5">오늘 시간대별 종합효율 vs 목표(90%)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={HOURLY} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                interval={3}
              />
              <YAxis
                domain={[70, 100]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
                formatter={(v: unknown, name: unknown) => [
                  `${v}%`,
                  name === 'oee' ? '실제 OEE' : '목표',
                ]}
              />
              <ReferenceLine y={90} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: '목표 90%', position: 'right', fontSize: 10, fill: '#dc2626' }} />
              <Line
                type="monotone"
                dataKey="oee"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2563eb' }}
                name="oee"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 공정별 가동률 수평 바차트 */}
        <div
          className="bg-white rounded-lg p-5"
          style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">공정별 가동률</h2>
            <p className="text-xs text-gray-400 mt-0.5">71% 이하 공정 — 즉시 점검 필요</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={PROCESS_RATES}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="process"
                tick={{ fontSize: 11, fill: '#374151' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
                formatter={(v: unknown) => [`${v}%`, '가동률']}
              />
              <ReferenceLine x={71} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.5} />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={18}>
                {PROCESS_RATES.map((entry) => (
                  <Cell
                    key={entry.process}
                    fill={entry.rate <= 71 ? '#dc2626' : '#2563eb'}
                    fillOpacity={entry.rate <= 71 ? 1 : 0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI 추천 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <h2 className="text-sm font-semibold text-gray-800">AI 최적화 추천</h2>
          <span className="text-xs text-gray-400">총 {RECOMMENDATIONS.length}건</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['우선순위', '공정', '문제 유형', '개선 효과', '신뢰도', '상태'].map((h) => (
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
              {RECOMMENDATIONS.map((rec, i) => (
                <tr
                  key={rec.priority}
                  style={{ borderBottom: i < RECOMMENDATIONS.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  {/* 우선순위 원형 배지 */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: PRIORITY_COLORS[rec.priority] ?? '#6b7280' }}
                    >
                      {rec.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {rec.process}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rec.issue}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: '#16a34a' }}>
                    {rec.improvement}
                  </td>
                  {/* 신뢰도 진행바 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[90px]">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${rec.confidence}%`,
                            backgroundColor: rec.confidence >= 90 ? '#16a34a' : rec.confidence >= 80 ? '#2563eb' : '#d97706',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 tabular-nums w-8">
                        {rec.confidence}%
                      </span>
                    </div>
                  </td>
                  {/* 상태 배지 */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[rec.status]}`}
                    >
                      {rec.status}
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
