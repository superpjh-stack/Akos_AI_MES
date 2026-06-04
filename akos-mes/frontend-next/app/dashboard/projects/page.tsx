'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Project {
  id: number;
  name: string;
  client: string;
  costStatus: string;
  costRate: number;
  deadline: string;
  deadlineStatus: '정상' | '위험' | '지연';
  progressRate: number;
  qualityIssues: number;
  riskLevel: '고위험' | '중위험' | '저위험';
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'EV 배터리 케이스 생산라인',
    client: '현대모비스',
    costStatus: '110%',
    costRate: 110,
    deadline: '2026-07-15',
    deadlineStatus: '위험',
    progressRate: 72,
    qualityIssues: 5,
    riskLevel: '고위험',
  },
  {
    id: 2,
    name: '반도체 방열판 정밀가공',
    client: 'SK하이닉스',
    costStatus: '98%',
    costRate: 98,
    deadline: '2026-08-30',
    deadlineStatus: '정상',
    progressRate: 85,
    qualityIssues: 1,
    riskLevel: '저위험',
  },
  {
    id: 3,
    name: '항공기 브라켓 어셈블리',
    client: '한국항공우주',
    costStatus: '105%',
    costRate: 105,
    deadline: '2026-06-20',
    deadlineStatus: '지연',
    progressRate: 55,
    qualityIssues: 3,
    riskLevel: '고위험',
  },
  {
    id: 4,
    name: '의료기기 하우징 생산',
    client: '삼성메디슨',
    costStatus: '93%',
    costRate: 93,
    deadline: '2026-09-10',
    deadlineStatus: '정상',
    progressRate: 40,
    qualityIssues: 0,
    riskLevel: '저위험',
  },
  {
    id: 5,
    name: '자동차 엔진 마운트 생산',
    client: '기아자동차',
    costStatus: '102%',
    costRate: 102,
    deadline: '2026-07-01',
    deadlineStatus: '위험',
    progressRate: 68,
    qualityIssues: 2,
    riskLevel: '중위험',
  },
  {
    id: 6,
    name: '로봇 관절 부품 가공',
    client: '현대로보틱스',
    costStatus: '97%',
    costRate: 97,
    deadline: '2026-10-15',
    deadlineStatus: '정상',
    progressRate: 30,
    qualityIssues: 1,
    riskLevel: '저위험',
  },
  {
    id: 7,
    name: '풍력발전 기어박스 부품',
    client: '두산에너빌리티',
    costStatus: '99%',
    costRate: 99,
    deadline: '2026-08-05',
    deadlineStatus: '정상',
    progressRate: 78,
    qualityIssues: 2,
    riskLevel: '중위험',
  },
  {
    id: 8,
    name: '선박 엔진 부품 정밀가공',
    client: 'HD현대중공업',
    costStatus: '96%',
    costRate: 96,
    deadline: '2026-11-30',
    deadlineStatus: '정상',
    progressRate: 22,
    qualityIssues: 0,
    riskLevel: '저위험',
  },
];

const progressChartData = mockProjects.map((p) => ({
  name: p.name.length > 8 ? p.name.slice(0, 8) + '…' : p.name,
  진행률: p.progressRate,
  원가율: p.costRate,
}));

function KpiCard({
  title,
  value,
  unit,
  color,
  subText,
}: {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
  subText?: string;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: '10px',
        padding: '20px 24px',
        flex: 1,
        minWidth: '160px',
      }}
    >
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: color || '#1e3a5f' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>{unit}</span>
        )}
      </div>
      {subText && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{subText}</div>
      )}
    </div>
  );
}

function RiskBadge({ level }: { level: '고위험' | '중위험' | '저위험' }) {
  const styles: Record<string, { background: string; color: string; border: string }> = {
    고위험: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    중위험: { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' },
    저위험: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
  };
  const s = styles[level];
  return (
    <span
      style={{
        ...s,
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
      }}
    >
      {level}
    </span>
  );
}

function DeadlineBadge({ status }: { status: '정상' | '위험' | '지연' }) {
  const styles: Record<string, { background: string; color: string }> = {
    정상: { background: '#f0fdf4', color: '#16a34a' },
    위험: { background: '#fff7ed', color: '#ea580c' },
    지연: { background: '#fef2f2', color: '#dc2626' },
  };
  const s = styles[status];
  return (
    <span
      style={{
        ...s,
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '4px',
      }}
    >
      {status}
    </span>
  );
}

function ProgressBar({ value, riskLevel }: { value: number; riskLevel: string }) {
  const barColor =
    riskLevel === '고위험' ? '#dc2626' : riskLevel === '중위험' ? '#ea580c' : '#2563eb';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          flex: 1,
          height: '8px',
          background: '#f3f4f6',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: barColor,
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: '12px', color: '#374151', fontWeight: 600, minWidth: '32px' }}>
        {value}%
      </span>
    </div>
  );
}

const barColors = mockProjects.map((p) =>
  p.riskLevel === '고위험' ? '#dc2626' : p.riskLevel === '중위험' ? '#ea580c' : '#2563eb'
);

export default function ProjectStatusPage() {
  const highRiskProjects = mockProjects.filter((p) => p.riskLevel === '고위험');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '28px 32px',
        fontFamily:
          "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
          AI 대시보드 &gt; 프로젝트현황분석
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
          프로젝트현황분석
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          프로젝트별 원가·납기·공정진척·품질이슈 통합 조회 및 고위험 프로젝트 조기 식별
        </p>
      </div>

      {/* KPI 카드 영역 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <KpiCard
          title="진행중 프로젝트"
          value={8}
          unit="건"
          subText="전월 대비 +1건"
        />
        <KpiCard
          title="납기위험 프로젝트"
          value={2}
          unit="건"
          color="#ea580c"
          subText="즉시 모니터링 필요"
        />
        <KpiCard
          title="원가초과위험"
          value={1}
          unit="건"
          color="#dc2626"
          subText="원가율 105% 초과"
        />
        <KpiCard
          title="평균 공정진행률"
          value="67"
          unit="%"
          color="#2563eb"
          subText="목표 대비 -3%p"
        />
      </div>

      {/* 고위험 프로젝트 알림 배너 */}
      {highRiskProjects.length > 0 && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <span style={{ fontWeight: 600, color: '#dc2626', fontSize: '13px' }}>
              고위험 프로젝트 {highRiskProjects.length}건 감지:{' '}
            </span>
            <span style={{ fontSize: '13px', color: '#7f1d1d' }}>
              {highRiskProjects.map((p) => p.name).join(', ')} — 즉각적인 대응 조치가 필요합니다.
            </span>
          </div>
        </div>
      )}

      {/* 차트 + 테이블 레이아웃 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* 공정진행률 차트 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: '10px',
            padding: '20px 24px',
            flex: '1',
            minWidth: '320px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1e3a5f',
              marginBottom: '16px',
              margin: '0 0 16px 0',
            }}
          >
            프로젝트별 공정진행률
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={progressChartData}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={48}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 120]} />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value)}%`,
                  name === '진행률' ? '공정진행률' : '원가율',
                ]}
                contentStyle={{
                  fontSize: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="진행률" radius={[4, 4, 0, 0]}>
                {progressChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '8px',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#6b7280',
            }}
          >
            <span>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#dc2626',
                  marginRight: '4px',
                }}
              />
              고위험
            </span>
            <span>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#ea580c',
                  marginRight: '4px',
                }}
              />
              중위험
            </span>
            <span>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#2563eb',
                  marginRight: '4px',
                }}
              />
              저위험
            </span>
          </div>
        </div>

        {/* 원가율 차트 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: '10px',
            padding: '20px 24px',
            flex: '1',
            minWidth: '320px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1e3a5f',
              marginBottom: '16px',
              margin: '0 0 16px 0',
            }}
          >
            프로젝트별 원가 투입률
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={progressChartData}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={48}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[80, 120]} />
              <Tooltip
                formatter={(value: any) => [`${Number(value)}%`, '원가율']}
                contentStyle={{
                  fontSize: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="원가율" radius={[4, 4, 0, 0]}>
                {progressChartData.map((entry, index) => (
                  <Cell
                    key={`cost-cell-${index}`}
                    fill={progressChartData[index].원가율 > 100 ? '#dc2626' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '8px',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#6b7280',
            }}
          >
            <span>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#dc2626',
                  marginRight: '4px',
                }}
              />
              원가초과 (100% 초과)
            </span>
            <span>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: '#10b981',
                  marginRight: '4px',
                }}
              />
              정상
            </span>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 테이블 */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a5f', margin: 0 }}>
            프로젝트 통합 현황
          </h2>
          <button
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            엑셀 다운로드
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {[
                  '프로젝트명',
                  '고객사',
                  '원가현황',
                  '납기상태',
                  '공정진행률',
                  '품질이슈',
                  '위험도',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                      whiteSpace: 'nowrap',
                      fontSize: '12px',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockProjects.map((project, idx) => (
                <tr
                  key={project.id}
                  style={{
                    background:
                      project.riskLevel === '고위험'
                        ? '#fff9f9'
                        : idx % 2 === 0
                        ? '#ffffff'
                        : '#fafafa',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.15s',
                  }}
                >
                  <td
                    style={{
                      padding: '12px 16px',
                      fontWeight: 600,
                      color: '#1e3a5f',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.name}
                  </td>
                  <td
                    style={{ padding: '12px 16px', color: '#374151', whiteSpace: 'nowrap' }}
                  >
                    {project.client}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: project.costRate > 100 ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {project.costStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <DeadlineBadge status={project.deadlineStatus} />
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {project.deadline}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', minWidth: '140px' }}>
                    <ProgressBar
                      value={project.progressRate}
                      riskLevel={project.riskLevel}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {project.qualityIssues > 0 ? (
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>
                        {project.qualityIssues}건
                      </span>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: 500 }}>없음</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <RiskBadge level={project.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: '10px 24px',
            borderTop: '1px solid #f3f4f6',
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          총 {mockProjects.length}개 프로젝트 · 최종 업데이트: 2026-06-04 09:00
        </div>
      </div>
    </div>
  );
}
