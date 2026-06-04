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
} from 'recharts';

// KPI 카드 컴포넌트
function KpiCard({
  title,
  value,
  unit,
  sub,
  color,
}: {
  title: string;
  value: string | number;
  unit: string;
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
        padding: '24px 20px',
        flex: 1,
        minWidth: '180px',
      }}
    >
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
        <span
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: color ?? '#1e3a5f',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: '15px', color: '#6b7280', marginBottom: '3px' }}>{unit}</span>
      </div>
      {sub && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>{sub}</div>
      )}
    </div>
  );
}

// 목업 데이터 — KPI
const kpiData = [
  {
    title: 'FAT 합격률',
    value: '92.3',
    unit: '%',
    sub: '목표: 95.0%',
    color: '#2563eb',
  },
  {
    title: '불량률',
    value: '2.1',
    unit: '%',
    sub: '전월 대비 -0.3%p',
    color: '#dc2626',
  },
  {
    title: '리워크율',
    value: '8.4',
    unit: '%',
    sub: '전월 대비 +0.8%p',
    color: '#d97706',
  },
  {
    title: '고객 클레임',
    value: '1',
    unit: '건',
    sub: '최근 30일',
    color: '#7c3aed',
  },
];

// 목업 데이터 — 공정별 불량 분포 (BarChart)
const processDefectData = [
  { process: 'SMT', defect: 12, rework: 8 },
  { process: '삽입조립', defect: 7, rework: 14 },
  { process: '납땜', defect: 18, rework: 5 },
  { process: 'AOI 검사', defect: 4, rework: 2 },
  { process: '기능시험', defect: 9, rework: 11 },
  { process: '최종검사', defect: 3, rework: 6 },
];

// 목업 데이터 — 주요 품질 이슈 테이블
const qualityIssues: {
  id: number;
  type: string;
  count: number;
  process: string;
  status: '완료' | '진행중' | '대기';
}[] = [
  { id: 1, type: '납교 불량', count: 18, process: '납땜', status: '진행중' },
  { id: 2, type: '부품 미장착', count: 12, process: 'SMT', status: '완료' },
  { id: 3, type: '솔더 브릿지', count: 9, process: '납땜', status: '완료' },
  { id: 4, type: '외관 스크래치', count: 7, process: '삽입조립', status: '대기' },
  { id: 5, type: '기능 오동작', count: 4, process: '기능시험', status: '진행중' },
];

const statusStyle: Record<'완료' | '진행중' | '대기', React.CSSProperties> = {
  완료: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
  },
  진행중: {
    backgroundColor: '#fef9c3',
    color: '#92400e',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
  },
  대기: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
  },
};

export default function QualityDashboardPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '32px 28px',
        fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      }}
    >
      {/* 헤더 */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
          AI 대시보드 / 품질현황 분석
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
          품질현황 분석
        </h1>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          기준 기간: 최근 30일 (2026-05-05 ~ 2026-06-04)
        </div>
      </div>

      {/* KPI 카드 4개 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            sub={kpi.sub}
            color={kpi.color}
          />
        ))}
      </div>

      {/* 공정별 불량 분포 차트 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '10px',
          padding: '24px 20px',
          marginBottom: '28px',
        }}
      >
        <h2
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#1e3a5f',
            margin: '0 0 20px 0',
          }}
        >
          공정별 불량 · 리워크 분포
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={processDefectData}
            margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
            barCategoryGap="35%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="process"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              unit="건"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '13px',
              }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
              formatter={(value) => (value === 'defect' ? '불량' : '리워크')}
            />
            <Bar dataKey="defect" name="defect" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rework" name="rework" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 주요 품질 이슈 목록 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '10px',
          padding: '24px 20px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
            주요 품질 이슈
          </h2>
          <button
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            조치 등록
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['#', '불량 유형', '발생 건수', '발생 공정', '조치 상태'].map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      color: '#6b7280',
                      fontWeight: 600,
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qualityIssues.map((issue) => (
                <tr
                  key={issue.id}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')
                  }
                >
                  <td style={{ padding: '12px 12px', color: '#9ca3af' }}>{issue.id}</td>
                  <td style={{ padding: '12px 12px', color: '#1e3a5f', fontWeight: 600 }}>
                    {issue.type}
                  </td>
                  <td style={{ padding: '12px 12px', color: '#374151' }}>
                    {issue.count}건
                  </td>
                  <td style={{ padding: '12px 12px', color: '#374151' }}>{issue.process}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={statusStyle[issue.status]}>{issue.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 하단 요약 메모 */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '16px 20px',
          fontSize: '13px',
          color: '#1e40af',
          lineHeight: '1.7',
        }}
      >
        <strong>AI 분석 요약</strong>: 납땜 공정에서 불량 발생 비율이 가장 높으며(18건),
        SMT 공정의 부품 미장착 건은 조치 완료되었습니다. 리워크율이 전월 대비 0.8%p 상승하여
        삽입조립 및 기능시험 공정에 대한 집중 모니터링이 권고됩니다.
      </div>
    </div>
  );
}
