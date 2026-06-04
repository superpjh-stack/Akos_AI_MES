'use client';

import { useState } from 'react';

interface SimilarProject {
  id: number;
  name: string;
  customer: string;
  similarity: number;
  equipmentType: string;
  bomScale: string;
  processDifficulty: string;
  actualCost: number;
  deliveryDays: number;
  completedDate: string;
  quotedCost: number;
  costVariance: number;
  mainProcesses: string[];
}

interface ComparisonRow {
  item: string;
  current: string;
  project1?: string;
  project2?: string;
}

const KpiCard = ({
  label,
  value,
  sub,
  color = '#2563eb',
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      borderRadius: 10,
      padding: '16px 20px',
      minWidth: 140,
    }}
  >
    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
  </div>
);

const similarProjects: SimilarProject[] = [
  {
    id: 1,
    name: '자동차부품 조립라인 자동화',
    customer: '현대모비스',
    similarity: 94,
    equipmentType: '조립/검사 복합',
    bomScale: '대형 (500+)',
    processDifficulty: '고난도',
    actualCost: 1_850_000_000,
    deliveryDays: 180,
    completedDate: '2024-08-15',
    quotedCost: 1_920_000_000,
    costVariance: -3.6,
    mainProcesses: ['자동조립', '비전검사', '레이저마킹'],
  },
  {
    id: 2,
    name: '반도체 패키징 스마트라인',
    customer: 'SK하이닉스',
    similarity: 87,
    equipmentType: '정밀조립',
    bomScale: '대형 (500+)',
    processDifficulty: '고난도',
    actualCost: 2_100_000_000,
    deliveryDays: 210,
    completedDate: '2024-03-22',
    quotedCost: 2_050_000_000,
    costVariance: 2.4,
    mainProcesses: ['정밀조립', 'AOI검사', '자동포장'],
  },
  {
    id: 3,
    name: '이차전지 전극공정 설비',
    customer: 'LG에너지솔루션',
    similarity: 81,
    equipmentType: '화학/조립 복합',
    bomScale: '중형 (200-500)',
    processDifficulty: '고난도',
    actualCost: 1_450_000_000,
    deliveryDays: 150,
    completedDate: '2023-11-10',
    quotedCost: 1_380_000_000,
    costVariance: 5.1,
    mainProcesses: ['코팅', '건조', '압연', '슬리팅'],
  },
  {
    id: 4,
    name: '전자부품 SMT 자동화라인',
    customer: '삼성전기',
    similarity: 76,
    equipmentType: '정밀조립',
    bomScale: '중형 (200-500)',
    processDifficulty: '중난도',
    actualCost: 980_000_000,
    deliveryDays: 120,
    completedDate: '2024-01-05',
    quotedCost: 1_050_000_000,
    costVariance: -6.7,
    mainProcesses: ['SMT', '리플로우', '광학검사'],
  },
  {
    id: 5,
    name: '식품 자동포장 및 팔레타이징',
    customer: 'CJ제일제당',
    similarity: 68,
    equipmentType: '포장/물류',
    bomScale: '소형 (~200)',
    processDifficulty: '중난도',
    actualCost: 620_000_000,
    deliveryDays: 90,
    completedDate: '2023-09-28',
    quotedCost: 650_000_000,
    costVariance: -4.6,
    mainProcesses: ['자동포장', '중량선별', '팔레타이징'],
  },
];

const comparisonData: ComparisonRow[] = [
  { item: '설비유형', current: '조립/검사 복합', project1: '조립/검사 복합', project2: '정밀조립' },
  { item: 'BOM 규모', current: '대형 (500+)', project1: '대형 (500+)', project2: '대형 (500+)' },
  { item: '공정 난이도', current: '고난도', project1: '고난도', project2: '고난도' },
  { item: '견적 원가', current: '1,900,000,000원', project1: '1,920,000,000원', project2: '2,050,000,000원' },
  { item: '실적 원가', current: '-', project1: '1,850,000,000원', project2: '2,100,000,000원' },
  { item: '원가 편차', current: '-', project1: '-3.6%', project2: '+2.4%' },
  { item: '납기 일수', current: '185일', project1: '180일', project2: '210일' },
  { item: '주요 공정 수', current: '4개', project1: '3개', project2: '3개' },
  { item: '완료 연도', current: '(신규)', project1: '2024년', project2: '2024년' },
  { item: '리스크 수준', current: '검토중', project1: '낮음', project2: '중간' },
];

export default function SimilarProjectPage() {
  const [equipmentType, setEquipmentType] = useState('조립/검사 복합');
  const [bomScale, setBomScale] = useState('대형 (500+)');
  const [processDifficulty, setProcessDifficulty] = useState('고난도');
  const [searched, setSearched] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    setSelectedProjects([]);
    setShowComparison(false);
  };

  const toggleSelect = (id: number) => {
    setSelectedProjects((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const formatCost = (v: number) =>
    v >= 100_000_000
      ? `${(v / 100_000_000).toFixed(1)}억원`
      : `${(v / 10_000).toLocaleString()}만원`;

  const getSimilarityColor = (pct: number) => {
    if (pct >= 90) return '#16a34a';
    if (pct >= 75) return '#2563eb';
    return '#d97706';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
          수주견적관리 &gt; 유사 프로젝트 조회
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
          유사 프로젝트 조회
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6, margin: '6px 0 0' }}>
          신규 견적 조건과 유사한 과거 수행 프로젝트를 검색하여 실적 원가 및 납기를 참조하세요.
        </p>
      </div>

      {/* KPI 요약 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard label="조회 가능 프로젝트" value="147건" sub="최근 5년 완료" />
        <KpiCard label="평균 원가 편차" value="±4.2%" sub="견적 대비 실적" color="#d97706" />
        <KpiCard label="평균 납기 준수율" value="91.3%" sub="전체 프로젝트" color="#16a34a" />
        <KpiCard label="AI 매칭 정확도" value="89.7%" sub="유사도 모델 성능" color="#7c3aed" />
      </div>

      {/* 검색 폼 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', marginBottom: 18, marginTop: 0 }}>
          검색 조건 입력
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
              설비유형
            </label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                color: '#111827',
                background: '#f9fafb',
                outline: 'none',
              }}
            >
              <option>조립/검사 복합</option>
              <option>정밀조립</option>
              <option>화학/조립 복합</option>
              <option>포장/물류</option>
              <option>가공/절삭</option>
              <option>용접/도장</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
              BOM 규모
            </label>
            <select
              value={bomScale}
              onChange={(e) => setBomScale(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                color: '#111827',
                background: '#f9fafb',
                outline: 'none',
              }}
            >
              <option>소형 (~200)</option>
              <option>중형 (200-500)</option>
              <option>대형 (500+)</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: 500 }}>
              공정 난이도
            </label>
            <select
              value={processDifficulty}
              onChange={(e) => setProcessDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                color: '#111827',
                background: '#f9fafb',
                outline: 'none',
              }}
            >
              <option>저난도</option>
              <option>중난도</option>
              <option>고난도</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: 42,
            }}
          >
            유사 프로젝트 검색
          </button>
        </div>
      </div>

      {/* 검색 결과 */}
      {searched && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', margin: 0 }}>
              검색 결과 — 유사 프로젝트 5건
            </h2>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              최대 2개 선택 후 비교 가능 ({selectedProjects.length}/2 선택됨)
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}
          >
            {similarProjects.map((project) => {
              const isSelected = selectedProjects.includes(project.id);
              const simColor = getSimilarityColor(project.similarity);
              return (
                <div
                  key={project.id}
                  style={{
                    background: '#fff',
                    border: isSelected ? `2px solid #2563eb` : '1px solid #e5e7eb',
                    boxShadow: isSelected
                      ? '0 4px 12px rgba(37,99,235,0.15)'
                      : '0 1px 3px rgba(0,0,0,0.06)',
                    borderRadius: 12,
                    padding: '20px',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* 카드 헤더 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', marginBottom: 3 }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{project.customer}</div>
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: simColor,
                        minWidth: 52,
                        textAlign: 'right',
                      }}
                    >
                      {project.similarity}%
                    </div>
                  </div>

                  {/* 유사도 진행바 */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>유사도</span>
                      <span style={{ fontSize: 11, color: simColor, fontWeight: 600 }}>
                        {project.similarity >= 90 ? '매우 높음' : project.similarity >= 75 ? '높음' : '보통'}
                      </span>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${project.similarity}%`,
                          height: '100%',
                          background: simColor,
                          borderRadius: 4,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* 정보 그리드 */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px 12px',
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>설비유형</div>
                      <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{project.equipmentType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>납기 일수</div>
                      <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{project.deliveryDays}일</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>실적 원가</div>
                      <div style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600 }}>
                        {formatCost(project.actualCost)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>원가 편차</div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: project.costVariance < 0 ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {project.costVariance > 0 ? '+' : ''}
                        {project.costVariance}%
                      </div>
                    </div>
                  </div>

                  {/* 주요 공정 태그 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {project.mainProcesses.map((p) => (
                      <span
                        key={p}
                        style={{
                          fontSize: 11,
                          background: '#eff6ff',
                          color: '#2563eb',
                          borderRadius: 4,
                          padding: '2px 7px',
                          fontWeight: 500,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* 버튼 영역 */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => toggleSelect(project.id)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        border: isSelected ? '1.5px solid #2563eb' : '1px solid #d1d5db',
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor: isSelected ? '#eff6ff' : '#f9fafb',
                        color: isSelected ? '#2563eb' : '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? '선택 해제' : '비교 선택'}
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        border: 'none',
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: 600,
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 비교 테이블 토글 버튼 */}
          {selectedProjects.length === 2 && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button
                onClick={() => setShowComparison((v) => !v)}
                style={{
                  backgroundColor: '#1e3a5f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 36px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {showComparison ? '비교 테이블 닫기' : '선택 프로젝트 상세 비교 보기'}
              </button>
            </div>
          )}

          {/* 상세 비교 테이블 */}
          {showComparison && selectedProjects.length === 2 && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                borderRadius: 12,
                padding: '24px 28px',
                marginBottom: 28,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', marginBottom: 18, marginTop: 0 }}>
                항목별 상세 비교
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          color: '#1e3a5f',
                          fontWeight: 700,
                          borderBottom: '2px solid #e5e7eb',
                          width: '22%',
                        }}
                      >
                        비교 항목
                      </th>
                      <th
                        style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          color: '#1e3a5f',
                          fontWeight: 700,
                          borderBottom: '2px solid #e5e7eb',
                          background: '#eff6ff',
                        }}
                      >
                        현재 견적 (신규)
                      </th>
                      {selectedProjects.map((id) => {
                        const p = similarProjects.find((x) => x.id === id)!;
                        return (
                          <th
                            key={id}
                            style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                              color: '#374151',
                              fontWeight: 600,
                              borderBottom: '2px solid #e5e7eb',
                            }}
                          >
                            <div>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>
                              {p.customer} · 유사도 {p.similarity}%
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, idx) => (
                      <tr
                        key={row.item}
                        style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}
                      >
                        <td
                          style={{
                            padding: '11px 16px',
                            color: '#374151',
                            fontWeight: 600,
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          {row.item}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'center',
                            color: '#1e3a5f',
                            fontWeight: 600,
                            borderBottom: '1px solid #f3f4f6',
                            background: '#eff6ff',
                          }}
                        >
                          {row.current}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'center',
                            color: '#374151',
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          {row.project1 ?? '-'}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'center',
                            color: '#374151',
                            borderBottom: '1px solid #f3f4f6',
                          }}
                        >
                          {row.project2 ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 비교 인사이트 */}
              <div
                style={{
                  marginTop: 20,
                  padding: '14px 18px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                  AI 견적 인사이트
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#15803d', fontSize: 13, lineHeight: 1.7 }}>
                  <li>선택한 2개 유사 프로젝트의 평균 실적 원가는 <strong>19.75억원</strong>으로, 현재 견적(19억원) 대비 약 3.9% 높습니다.</li>
                  <li>평균 납기는 <strong>195일</strong>로 현재 견적(185일)보다 10일 여유가 있습니다. 일정 리스크 검토를 권장합니다.</li>
                  <li>두 프로젝트 모두 고난도 공정으로, 추가 품질 관리 비용 항목 반영이 필요할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* 초기 안내 */}
      {!searched && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: 12,
            padding: '48px 28px',
            textAlign: 'center',
            color: '#9ca3af',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
            검색 조건을 입력하고 유사 프로젝트를 조회하세요
          </div>
          <div style={{ fontSize: 13 }}>
            설비유형, BOM 규모, 공정 난이도를 선택 후 [유사 프로젝트 검색] 버튼을 클릭하세요.
          </div>
        </div>
      )}
    </div>
  );
}
