'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  sub: string;
  color: string;
  icon: string;
}

function KpiCard({ title, value, sub, color, icon }: KpiCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: 10,
        padding: '20px 24px',
        flex: 1,
        minWidth: 180,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

type RiskLevel = '고위험' | '중위험' | '저위험';

interface Supplier {
  name: string;
  avgLeadTime: number;
  delayHistory: number;
  pendingOrders: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactor: string;
  recommendation: string;
}

interface ProjectRisk {
  project: string;
  affectedSuppliers: string;
  scheduledDate: string;
  riskLevel: RiskLevel;
  impact: string;
  status: string;
}

const supplierData: Supplier[] = [
  {
    name: '한국전자부품(주)',
    avgLeadTime: 28,
    delayHistory: 7,
    pendingOrders: 42000000,
    riskScore: 87,
    riskLevel: '고위험',
    riskFactor: '반복적 납기 지연, 높은 발주 잔량',
    recommendation: '대체 공급사 발굴 또는 안전재고 확보',
  },
  {
    name: '글로벌소재기술',
    avgLeadTime: 35,
    delayHistory: 5,
    pendingOrders: 31500000,
    riskScore: 75,
    riskLevel: '고위험',
    riskFactor: '장기 리드타임, 해외 물류 불안정',
    recommendation: '조기 발주 및 분산 공급 구조 검토',
  },
  {
    name: '삼성정밀기계',
    avgLeadTime: 21,
    delayHistory: 3,
    pendingOrders: 18000000,
    riskScore: 61,
    riskLevel: '고위험',
    riskFactor: '최근 품질 이슈로 납기 협의 지연',
    recommendation: '품질 검수 강화 및 납기 모니터링',
  },
  {
    name: '우리산업소재',
    avgLeadTime: 14,
    delayHistory: 2,
    pendingOrders: 9500000,
    riskScore: 38,
    riskLevel: '중위험',
    riskFactor: '수급 물량 소폭 지연 이력',
    recommendation: '납기 확인 주기 단축(주 2회)',
  },
  {
    name: '현대공급망(주)',
    avgLeadTime: 10,
    delayHistory: 0,
    pendingOrders: 5200000,
    riskScore: 15,
    riskLevel: '저위험',
    riskFactor: '이력 양호, 리드타임 짧음',
    recommendation: '현 공급 구조 유지',
  },
];

const projectRiskData: ProjectRisk[] = [
  {
    project: '스마트공장 1호기 구축',
    affectedSuppliers: '한국전자부품(주), 글로벌소재기술',
    scheduledDate: '2026-07-15',
    riskLevel: '고위험',
    impact: '핵심 부품 조달 지연 시 약 3~4주 일정 차질',
    status: '경고 발령',
  },
  {
    project: 'AI 비전검사 라인 증설',
    affectedSuppliers: '삼성정밀기계',
    scheduledDate: '2026-08-01',
    riskLevel: '중위험',
    impact: '품질 이슈 장기화 시 2주 지연 가능',
    status: '모니터링 중',
  },
  {
    project: '물류자동화 시스템 설치',
    affectedSuppliers: '우리산업소재',
    scheduledDate: '2026-09-10',
    riskLevel: '중위험',
    impact: '소재 납기 지연 시 1주 내외 영향',
    status: '주의',
  },
  {
    project: '품질관리 MES 연동',
    affectedSuppliers: '현대공급망(주)',
    scheduledDate: '2026-10-01',
    riskLevel: '저위험',
    impact: '일정 영향 없음',
    status: '정상',
  },
];

const riskBadgeStyle: Record<RiskLevel, React.CSSProperties> = {
  고위험: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    padding: '2px 10px',
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  중위험: {
    backgroundColor: '#fff7ed',
    color: '#d97706',
    border: '1px solid #fcd34d',
    borderRadius: 6,
    padding: '2px 10px',
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  저위험: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #86efac',
    borderRadius: 6,
    padding: '2px 10px',
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
};

const barColors: Record<RiskLevel, string> = {
  고위험: '#ef4444',
  중위험: '#f59e0b',
  저위험: '#22c55e',
};

const chartData = supplierData.map((s) => ({
  name: s.name.length > 7 ? s.name.slice(0, 7) + '…' : s.name,
  fullName: s.name,
  riskScore: s.riskScore,
  riskLevel: s.riskLevel,
}));

const statusBadgeStyle = (status: string): React.CSSProperties => {
  if (status === '경고 발령') return { color: '#dc2626', fontWeight: 700 };
  if (status === '모니터링 중') return { color: '#d97706', fontWeight: 600 };
  if (status === '주의') return { color: '#f59e0b', fontWeight: 600 };
  return { color: '#16a34a', fontWeight: 600 };
};

export default function ProcurementRiskPage() {
  return (
    <div style={{ padding: '28px 32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Pretendard, Apple SD Gothic Neo, sans-serif' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>구매조달관리</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e3a5f', margin: 0 }}>
          납기 리스크 분석
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, margin: 0 }}>
          공급사별 리드타임·지연이력·발주잔량 분석으로 납기 위험을 사전에 예측하고 프로젝트 일정 지연을 방지합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard
          title="리스크 분석 공급사"
          value="15개"
          sub="전체 등록 공급사 대상"
          color="#2563eb"
          icon="🏭"
        />
        <KpiCard
          title="고위험 공급사"
          value="3개"
          sub="즉시 조치 필요"
          color="#dc2626"
          icon="⚠️"
        />
        <KpiCard
          title="평균 리드타임 초과율"
          value="12.4%"
          sub="전월 대비 +2.1%p"
          color="#d97706"
          icon="📦"
        />
        <KpiCard
          title="이번달 경고 발령"
          value="5건"
          sub="2026년 6월 기준"
          color="#7c3aed"
          icon="🔔"
        />
      </div>

      {/* 공급사별 위험도 BarChart */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '24px',
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: '0 0 20px 0' }}>
          공급사별 납기 위험 점수
        </h2>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
          위험 점수 0~100 (100에 가까울수록 고위험)
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 60, left: 10, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: '#374151' }}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, _name: any, props: any) => [
                `${value}점`,
                props?.payload?.fullName ?? '',
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="riskScore" radius={[0, 6, 6, 0]} maxBarSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColors[entry.riskLevel as RiskLevel]} />
              ))}
              <LabelList
                dataKey="riskScore"
                position="right"
                style={{ fontSize: 12, fontWeight: 700, fill: '#374151' }}
                formatter={(v: any) => `${v}점`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
          {(['고위험', '중위험', '저위험'] as RiskLevel[]).map((level) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: barColors[level] }} />
              {level}
            </div>
          ))}
        </div>
      </div>

      {/* 공급사 상세 테이블 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '24px',
          marginBottom: 28,
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
            공급사별 납기 리스크 상세
          </h2>
          <button
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            보고서 다운로드
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              {['공급사명', '평균 리드타임', '지연 이력(건)', '현재 발주잔량', '납기 위험도', '위험 요인', '권장 조치'].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      color: '#374151',
                      fontWeight: 700,
                      borderBottom: '1px solid #e5e7eb',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {supplierData.map((s, idx) => (
              <tr
                key={s.name}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb',
                  transition: 'background 0.15s',
                }}
              >
                <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1e3a5f' }}>{s.name}</td>
                <td style={{ padding: '11px 14px', color: '#374151' }}>{s.avgLeadTime}일</td>
                <td style={{ padding: '11px 14px', color: s.delayHistory >= 5 ? '#dc2626' : '#374151', fontWeight: s.delayHistory >= 5 ? 700 : 400 }}>
                  {s.delayHistory}건
                </td>
                <td style={{ padding: '11px 14px', color: '#374151' }}>
                  {s.pendingOrders.toLocaleString()}원
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={riskBadgeStyle[s.riskLevel]}>{s.riskLevel}</span>
                </td>
                <td style={{ padding: '11px 14px', color: '#6b7280', maxWidth: 220 }}>{s.riskFactor}</td>
                <td style={{ padding: '11px 14px', color: '#374151', maxWidth: 220 }}>{s.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 프로젝트별 조달 리스크 영향 분석 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '24px',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
            프로젝트별 조달 리스크 영향 분석
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280', padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
              기준일: 2026-06-04
            </span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              {['프로젝트명', '영향 공급사', '예정 완료일', '리스크 수준', '일정 영향', '현황'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    color: '#374151',
                    fontWeight: 700,
                    borderBottom: '1px solid #e5e7eb',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectRiskData.map((p, idx) => (
              <tr
                key={p.project}
                style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}
              >
                <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1e3a5f' }}>{p.project}</td>
                <td style={{ padding: '11px 14px', color: '#6b7280' }}>{p.affectedSuppliers}</td>
                <td style={{ padding: '11px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{p.scheduledDate}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={riskBadgeStyle[p.riskLevel]}>{p.riskLevel}</span>
                </td>
                <td style={{ padding: '11px 14px', color: '#6b7280', maxWidth: 240 }}>{p.impact}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={statusBadgeStyle(p.status)}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 하단 안내 */}
        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            fontSize: 13,
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <span>
            고위험 공급사의 납기 지연은 프로젝트 전체 일정에 연쇄 영향을 줄 수 있습니다.
            경고 발령된 공급사에 대해 즉시 구매팀과 프로젝트 매니저 간 협의를 진행하시기 바랍니다.
          </span>
        </div>
      </div>
    </div>
  );
}
