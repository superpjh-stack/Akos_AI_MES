'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface QuotationRisk {
  id: string;
  orderNo: string;
  customer: string;
  estimatedCost: number;
  targetMargin: number;
  marginRate: number;
  deliveryRisk: '낮음' | '보통' | '높음';
  profitabilityRisk: '낮음' | '보통' | '높음';
  overallRisk: '저위험' | '중위험' | '고위험';
}

const mockData: QuotationRisk[] = [
  {
    id: '1',
    orderNo: 'QT-2026-001',
    customer: '삼성전자',
    estimatedCost: 85000000,
    targetMargin: 20,
    marginRate: 22.4,
    deliveryRisk: '낮음',
    profitabilityRisk: '낮음',
    overallRisk: '저위험',
  },
  {
    id: '2',
    orderNo: 'QT-2026-002',
    customer: 'LG디스플레이',
    estimatedCost: 120000000,
    targetMargin: 18,
    marginRate: 15.2,
    deliveryRisk: '보통',
    profitabilityRisk: '높음',
    overallRisk: '고위험',
  },
  {
    id: '3',
    orderNo: 'QT-2026-003',
    customer: 'SK하이닉스',
    estimatedCost: 65000000,
    targetMargin: 22,
    marginRate: 19.8,
    deliveryRisk: '낮음',
    profitabilityRisk: '보통',
    overallRisk: '중위험',
  },
  {
    id: '4',
    orderNo: 'QT-2026-004',
    customer: '현대모비스',
    estimatedCost: 92000000,
    targetMargin: 15,
    marginRate: 11.3,
    deliveryRisk: '높음',
    profitabilityRisk: '높음',
    overallRisk: '고위험',
  },
  {
    id: '5',
    orderNo: 'QT-2026-005',
    customer: '포스코',
    estimatedCost: 47000000,
    targetMargin: 20,
    marginRate: 21.6,
    deliveryRisk: '낮음',
    profitabilityRisk: '낮음',
    overallRisk: '저위험',
  },
  {
    id: '6',
    orderNo: 'QT-2026-006',
    customer: 'KIA모터스',
    estimatedCost: 78000000,
    targetMargin: 18,
    marginRate: 17.9,
    deliveryRisk: '보통',
    profitabilityRisk: '보통',
    overallRisk: '중위험',
  },
  {
    id: '7',
    orderNo: 'QT-2026-007',
    customer: '롯데케미칼',
    estimatedCost: 55000000,
    targetMargin: 20,
    marginRate: 23.1,
    deliveryRisk: '낮음',
    profitabilityRisk: '낮음',
    overallRisk: '저위험',
  },
  {
    id: '8',
    orderNo: 'QT-2026-008',
    customer: 'HD현대',
    estimatedCost: 108000000,
    targetMargin: 17,
    marginRate: 16.4,
    deliveryRisk: '높음',
    profitabilityRisk: '보통',
    overallRisk: '중위험',
  },
];

const chartData = mockData.map((item) => ({
  name: item.orderNo.replace('QT-2026-', 'QT-'),
  목표마진: item.targetMargin,
  실제마진율: item.marginRate,
  customer: item.customer,
}));

function KpiCard({
  title,
  value,
  unit,
  sub,
  color,
}: {
  title: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: '10px',
        padding: '20px 24px',
        flex: 1,
        minWidth: '160px',
      }}
    >
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
        {title}
      </p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: color ?? '#1e3a5f', lineHeight: 1.2 }}>
        {value}
        {unit && (
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#6b7280', marginLeft: '4px' }}>
            {unit}
          </span>
        )}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>{sub}</p>
      )}
    </div>
  );
}

function riskBadge(risk: '낮음' | '보통' | '높음') {
  const map: Record<string, { bg: string; color: string }> = {
    낮음: { bg: '#dcfce7', color: '#16a34a' },
    보통: { bg: '#fef9c3', color: '#ca8a04' },
    높음: { bg: '#fee2e2', color: '#dc2626' },
  };
  const style = map[risk];
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: '999px',
        padding: '2px 10px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {risk}
    </span>
  );
}

function overallRiskBadge(risk: '저위험' | '중위험' | '고위험') {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    저위험: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    중위험: { bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
    고위험: { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' },
  };
  const style = map[risk];
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {risk}
    </span>
  );
}

function formatCost(value: number): string {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(1) + '억원';
  }
  return (value / 10000).toFixed(0) + '만원';
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const item = chartData.find((d) => d.name === label);
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '13px',
        }}
      >
        <p style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '6px' }}>
          {label} ({item?.customer})
        </p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function QuotationRiskPage() {
  const highRiskCount = mockData.filter((d) => d.overallRisk === '고위험').length;
  const avgMargin = (
    mockData.reduce((sum, d) => sum + d.marginRate, 0) / mockData.length
  ).toFixed(1);
  const deliveryRiskCount = mockData.filter((d) => d.deliveryRisk === '높음').length;

  return (
    <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
          수주견적관리
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a5f', marginBottom: '6px' }}>
          수익성 / 리스크 분석
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          예상원가, 목표마진, 납기지연 가능성 기반으로 수주별 리스크를 산정하고 저수익 수주를 사전에 식별합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <KpiCard
          title="분석 수주"
          value={mockData.length}
          unit="건"
          sub="2026년 상반기 기준"
        />
        <KpiCard
          title="고위험 수주"
          value={highRiskCount}
          unit="건"
          color="#dc2626"
          sub="즉시 검토 필요"
        />
        <KpiCard
          title="평균 마진율"
          value={avgMargin}
          unit="%"
          color="#2563eb"
          sub="목표 마진율 18% 대비"
        />
        <KpiCard
          title="납기지연 예측"
          value={deliveryRiskCount}
          unit="건"
          color="#d97706"
          sub="높음 단계 수주"
        />
      </div>

      {/* 수익성 분석 차트 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f', marginBottom: '20px' }}>
          수주별 마진율 분석
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              domain={[0, 30]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '13px', color: '#374151' }}
            />
            <ReferenceLine
              y={18}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: '목표기준 18%', position: 'right', fontSize: 11, fill: '#ef4444' }}
            />
            <Bar dataKey="목표마진" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="실제마진율" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 리스크 분석 테이블 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '10px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f' }}>
            수주 리스크 상세 현황
          </h2>
          <button
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            리스크 보고서 출력
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {[
                  '수주번호',
                  '고객사',
                  '예상원가',
                  '목표마진',
                  '마진율',
                  '납기리스크',
                  '수익성리스크',
                  '종합위험도',
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, idx) => {
                const isHighRisk = row.overallRisk === '고위험';
                return (
                  <tr
                    key={row.id}
                    style={{
                      background: isHighRisk ? '#fff5f5' : idx % 2 === 0 ? '#fff' : '#fafafa',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1e3a5f' }}>
                      {row.orderNo}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#374151' }}>{row.customer}</td>
                    <td style={{ padding: '11px 14px', color: '#374151' }}>
                      {formatCost(row.estimatedCost)}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#374151' }}>{row.targetMargin}%</td>
                    <td
                      style={{
                        padding: '11px 14px',
                        fontWeight: 700,
                        color:
                          row.marginRate < row.targetMargin - 2
                            ? '#dc2626'
                            : row.marginRate < row.targetMargin
                            ? '#d97706'
                            : '#16a34a',
                      }}
                    >
                      {row.marginRate}%
                    </td>
                    <td style={{ padding: '11px 14px' }}>{riskBadge(row.deliveryRisk)}</td>
                    <td style={{ padding: '11px 14px' }}>{riskBadge(row.profitabilityRisk)}</td>
                    <td style={{ padding: '11px 14px' }}>{overallRiskBadge(row.overallRisk)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 범례 */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 18px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            위험도 판정 기준
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#15803d' }}>
              저위험: 마진율 목표 달성 + 납기리스크 낮음
            </span>
            <span style={{ fontSize: '12px', color: '#b45309' }}>
              중위험: 마진율 목표 미달 또는 납기리스크 보통
            </span>
            <span style={{ fontSize: '12px', color: '#b91c1c' }}>
              고위험: 마진율 심각 미달 또는 납기리스크 높음 + 수익성리스크 높음
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
