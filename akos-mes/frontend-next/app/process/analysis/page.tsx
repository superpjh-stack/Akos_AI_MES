'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

// ─── 인라인 목업 데이터 ───────────────────────────────────────────────────────

const leadTimeData = [
  { process: '원자재 투입', planned: 2.0, actual: 2.1, unit: 'h' },
  { process: '절단 가공', planned: 3.5, actual: 4.8, unit: 'h' },
  { process: '열처리', planned: 5.0, actual: 5.3, unit: 'h' },
  { process: '표면처리', planned: 2.5, actual: 3.9, unit: 'h' },
  { process: '정밀 가공', planned: 4.0, actual: 4.2, unit: 'h' },
  { process: '조립 1공정', planned: 3.0, actual: 5.1, unit: 'h' },
  { process: '조립 2공정', planned: 3.0, actual: 3.2, unit: 'h' },
  { process: '검사', planned: 1.5, actual: 1.7, unit: 'h' },
  { process: '도장', planned: 2.0, actual: 2.1, unit: 'h' },
  { process: '최종 검사', planned: 1.0, actual: 1.4, unit: 'h' },
  { process: '포장', planned: 1.0, actual: 1.1, unit: 'h' },
  { process: '출하 준비', planned: 0.5, actual: 0.6, unit: 'h' },
];

const reworkData = [
  { process: '절단 가공', rate: 7.2, count: 144 },
  { process: '조립 1공정', rate: 6.8, count: 136 },
  { process: '표면처리', rate: 5.1, count: 102 },
  { process: '정밀 가공', rate: 3.9, count: 78 },
  { process: '열처리', rate: 3.4, count: 68 },
  { process: '최종 검사', rate: 2.8, count: 56 },
  { process: '조립 2공정', rate: 2.1, count: 42 },
  { process: '도장', rate: 1.8, count: 36 },
  { process: '검사', rate: 1.2, count: 24 },
  { process: '원자재 투입', rate: 0.9, count: 18 },
  { process: '포장', rate: 0.6, count: 12 },
  { process: '출하 준비', rate: 0.2, count: 4 },
];

const reworkCauses = [
  { process: '절단 가공', cause: '치수 오차', frequency: 89, action: '공구 마모 주기 단축' },
  { process: '조립 1공정', cause: '부품 불일치', frequency: 76, action: '공급망 QC 강화' },
  { process: '표면처리', cause: '도막 두께 편차', frequency: 61, action: '분사 압력 자동 보정' },
  { process: '정밀 가공', cause: '온도 변형', frequency: 45, action: '항온 챔버 도입 검토' },
  { process: '열처리', cause: '냉각 불균일', frequency: 38, action: '냉각 속도 프로파일 최적화' },
];

const qualityDeviationData = [
  { range: '±0.01mm 이하', count: 412, ratio: 41.2 },
  { range: '±0.02mm', count: 286, ratio: 28.6 },
  { range: '±0.03mm', count: 158, ratio: 15.8 },
  { range: '±0.05mm', count: 87, ratio: 8.7 },
  { range: '±0.10mm', count: 42, ratio: 4.2 },
  { range: '±0.10mm 초과', count: 15, ratio: 1.5 },
];

const deviationTop3 = [
  {
    rank: 1,
    cause: '설비 진동 과다',
    process: '정밀 가공',
    impact: '±0.05mm 이상 편차의 68% 기여',
    icon: '⚙️',
  },
  {
    rank: 2,
    cause: '작업자 숙련도 편차',
    process: '조립 1공정',
    impact: '재작업률 1.4%p 증가 유발',
    icon: '👤',
  },
  {
    rank: 3,
    cause: '원자재 로트 편차',
    process: '열처리',
    impact: '품질 산포 22% 확대 기여',
    icon: '📦',
  },
];

const aiSuggestions = [
  {
    process: '절단 가공',
    problem: '실제 리드타임이 계획 대비 37% 초과(3.5h → 4.8h)하고 재작업률이 7.2%로 최고 수준',
    recommendation:
      'AI 공구 마모 예측 모델 적용: 절삭력 센서 데이터 기반으로 공구 교체 시점을 사전 예측하고, 가공 피드 속도를 실시간 자동 조정',
    expected: '리드타임 15% 단축, 재작업률 4% 이하 감소, 월 절감 효과 약 ₩2,400만',
    color: '#dc2626',
    badge: '긴급',
  },
  {
    process: '조립 1공정',
    problem: '리드타임 초과율 70%(3.0h → 5.1h)로 병목 공정 1위. 부품 불일치로 인한 재작업이 반복 발생',
    recommendation:
      '비전 AI 기반 부품 적합성 사전 검사 도입: 조립 전 카메라로 부품 형상/치수를 자동 검증하여 불량 부품 투입 차단. 작업자 보조 AR 가이드 병행',
    expected: '조립 리드타임 25% 단축, 재작업률 3% 이하, 불량 조기 발견율 90% 이상',
    color: '#d97706',
    badge: '높음',
  },
  {
    process: '표면처리',
    problem: '도막 두께 편차로 인한 재작업률 5.1%. 분사 조건 수동 설정으로 작업자마다 결과 상이',
    recommendation:
      '자동 분사 파라미터 최적화 시스템 구축: 기온·습도·소재 온도를 실시간 감지하여 분사 압력·거리·속도를 자동 보정. 도막 두께 인라인 측정 피드백 루프 구성',
    expected: '품질 편차 40% 감소, 도료 사용량 12% 절감, 재작업률 2% 이하',
    color: '#2563eb',
    badge: '중간',
  },
];

// ─── KpiCard 컴포넌트 ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  unit,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: highlight ? '1px solid #fca5a5' : '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: 12,
        padding: '20px 24px',
        flex: 1,
        minWidth: 160,
      }}
    >
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: highlight ? '#dc2626' : '#1e3a5f', margin: 0 }}>
        {value}
        {unit && <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
      </p>
      {sub && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ─── 메인 페이지 컴포넌트 ─────────────────────────────────────────────────────

const TABS = ['리드타임 분석', '재작업률 분석', '품질편차 분석'] as const;
type Tab = (typeof TABS)[number];

const BOTTLENECK_PROCESSES = ['절단 가공', '조립 1공정'];

export default function ProcessAnalysisPage() {
  const [activeTab, setActiveTab] = useState<Tab>('리드타임 분석');

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '32px 24px' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>공정관리</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>공정 데이터 분석</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
          공정별 리드타임·재작업률·품질편차를 분석하여 생산성 개선 및 품질 안정화 개선점을 도출합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KpiCard label="분석 공정 수" value={12} unit="개" sub="전체 공정 대상" />
        <KpiCard label="병목 공정" value={2} unit="개" sub="절단 가공 · 조립 1공정" highlight />
        <KpiCard label="평균 리드타임 초과율" value="8.7" unit="%" sub="계획 대비 실적" highlight />
        <KpiCard label="평균 재작업률" value="4.2" unit="%" sub="최근 30일 기준" highlight />
      </div>

      {/* 탭 네비게이션 */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
          width: 'fit-content',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 22px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: 14,
              backgroundColor: activeTab === tab ? '#2563eb' : 'transparent',
              color: activeTab === tab ? '#fff' : '#4b5563',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 탭 1: 리드타임 분석 ─────────────────────────────────────────── */}
      {activeTab === '리드타임 분석' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, margin: 0 }}>
                공정별 계획 vs 실제 리드타임 (단위: 시간)
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    background: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: 20,
                    padding: '3px 10px',
                    fontWeight: 600,
                  }}
                >
                  🔴 병목 공정 강조
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={leadTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="process"
                  tick={{ fontSize: 12, fill: '#4b5563' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} unit="h" />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value)}h`,
                    name === 'planned' ? '계획' : '실제',
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Legend
                  formatter={(value) => (value === 'planned' ? '계획 리드타임' : '실제 리드타임')}
                  wrapperStyle={{ fontSize: 13 }}
                />
                <Bar dataKey="planned" name="planned" fill="#93c5fd" radius={[3, 3, 0, 0]}>
                  {leadTimeData.map((entry) => (
                    <Cell
                      key={entry.process}
                      fill={BOTTLENECK_PROCESSES.includes(entry.process) ? '#bfdbfe' : '#93c5fd'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="actual" name="actual" radius={[3, 3, 0, 0]}>
                  {leadTimeData.map((entry) => (
                    <Cell
                      key={entry.process}
                      fill={
                        BOTTLENECK_PROCESSES.includes(entry.process)
                          ? '#dc2626'
                          : entry.actual > entry.planned
                          ? '#f97316'
                          : '#2563eb'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 초과 공정 요약 테이블 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
              리드타임 초과 공정 현황
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['공정명', '계획(h)', '실제(h)', '초과(h)', '초과율', '구분'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        color: '#374151',
                        fontWeight: 600,
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leadTimeData
                  .filter((d) => d.actual > d.planned)
                  .sort((a, b) => b.actual - b.planned - (a.actual - a.planned))
                  .map((d) => {
                    const over = (d.actual - d.planned).toFixed(1);
                    const overRate = (((d.actual - d.planned) / d.planned) * 100).toFixed(1);
                    const isBottleneck = BOTTLENECK_PROCESSES.includes(d.process);
                    return (
                      <tr key={d.process} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 14px', fontWeight: isBottleneck ? 700 : 400, color: isBottleneck ? '#dc2626' : '#111827' }}>
                          {d.process}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#4b5563' }}>{d.planned}h</td>
                        <td style={{ padding: '10px 14px', color: '#4b5563' }}>{d.actual}h</td>
                        <td style={{ padding: '10px 14px', color: '#dc2626', fontWeight: 600 }}>+{over}h</td>
                        <td style={{ padding: '10px 14px', color: '#d97706', fontWeight: 600 }}>{overRate}%</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              fontSize: 12,
                              borderRadius: 20,
                              padding: '2px 10px',
                              background: isBottleneck ? '#fee2e2' : '#fff7ed',
                              color: isBottleneck ? '#dc2626' : '#d97706',
                              fontWeight: 600,
                            }}
                          >
                            {isBottleneck ? '병목' : '초과'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 탭 2: 재작업률 분석 ─────────────────────────────────────────── */}
      {activeTab === '재작업률 분석' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
              공정별 재작업률 (최근 30일)
            </h2>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                layout="vertical"
                data={reworkData}
                margin={{ top: 5, right: 60, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} unit="%" domain={[0, 9]} />
                <YAxis dataKey="process" type="category" tick={{ fontSize: 12, fill: '#4b5563' }} width={75} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value)}%`, '재작업률']}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <ReferenceLine x={4.2} stroke="#6b7280" strokeDasharray="4 4" label={{ value: '평균 4.2%', position: 'top', fontSize: 12, fill: '#6b7280' }} />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {reworkData.map((entry) => (
                    <Cell
                      key={entry.process}
                      fill={entry.rate >= 6 ? '#dc2626' : entry.rate >= 4 ? '#f97316' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 원인 분석 테이블 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
              재작업 주요 원인 분석
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['공정명', '주요 원인', '발생 빈도(건)', '권장 조치'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        color: '#374151',
                        fontWeight: 600,
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reworkCauses.map((row) => (
                  <tr key={row.process} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{row.process}</td>
                    <td style={{ padding: '10px 14px', color: '#dc2626' }}>{row.cause}</td>
                    <td style={{ padding: '10px 14px', color: '#4b5563' }}>{row.frequency}건</td>
                    <td style={{ padding: '10px 14px', color: '#2563eb' }}>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 탭 3: 품질편차 분석 ─────────────────────────────────────────── */}
      {activeTab === '품질편차 분석' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h2 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
              품질 편차 분포 (치수 허용 오차별 검사 건수)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityDeviationData} margin={{ top: 5, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#4b5563' }} />
                <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} unit="건" />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    name === 'count' ? [`${Number(value)}건`, '검사 건수'] : [`${Number(value)}%`, '비율']
                  }
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="count" name="count" radius={[4, 4, 0, 0]}>
                  {qualityDeviationData.map((entry, index) => (
                    <Cell
                      key={entry.range}
                      fill={index <= 1 ? '#2563eb' : index <= 3 ? '#f97316' : '#dc2626'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {qualityDeviationData.map((d, i) => (
                <div
                  key={d.range}
                  style={{
                    background: i <= 1 ? '#eff6ff' : i <= 3 ? '#fff7ed' : '#fef2f2',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#6b7280' }}>{d.range}: </span>
                  <span style={{ fontWeight: 700, color: i <= 1 ? '#2563eb' : i <= 3 ? '#d97706' : '#dc2626' }}>
                    {d.ratio}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 편차 원인 TOP3 카드 */}
          <div>
            <h2 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, marginBottom: 14 }}>
              품질 편차 주요 원인 TOP 3
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {deviationTop3.map((item) => (
                <div
                  key={item.rank}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    borderRadius: 12,
                    padding: 20,
                    flex: 1,
                    minWidth: 220,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span
                      style={{
                        background: '#1e3a5f',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {item.rank}
                    </span>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 15 }}>{item.cause}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px 0' }}>관련 공정: {item.process}</p>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI 개선 제안 카드 섹션 ──────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h2 style={{ color: '#1e3a5f', fontSize: 19, fontWeight: 700, margin: 0 }}>AI 개선 제안</h2>
          <span
            style={{
              fontSize: 12,
              background: '#eff6ff',
              color: '#2563eb',
              borderRadius: 20,
              padding: '3px 10px',
              fontWeight: 600,
            }}
          >
            Akos AI 분석 결과
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {aiSuggestions.map((s) => (
            <div
              key={s.process}
              style={{
                background: '#fff',
                border: `1px solid ${s.color}30`,
                borderLeft: `4px solid ${s.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                borderRadius: 12,
                padding: 22,
                flex: 1,
                minWidth: 280,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ color: '#1e3a5f', fontSize: 16, fontWeight: 700, margin: 0 }}>{s.process}</h3>
                <span
                  style={{
                    fontSize: 11,
                    background: s.color + '20',
                    color: s.color,
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontWeight: 700,
                  }}
                >
                  우선순위: {s.badge}
                </span>
              </div>

              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  문제 현황
                </p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{s.problem}</p>
              </div>

              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  AI 권장 조치
                </p>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{s.recommendation}</p>
              </div>

              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '10px 14px',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>기대 효과</p>
                <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.6, margin: 0 }}>{s.expected}</p>
              </div>

              <button
                style={{
                  marginTop: 14,
                  width: '100%',
                  padding: '10px 0',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                개선 계획 수립
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
