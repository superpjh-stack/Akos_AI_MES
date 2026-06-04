'use client';

import { useState } from 'react';

interface Material {
  code: string;
  name: string;
  spec: string;
  supplier: string;
  unitPrice: number;
  status: string;
}

interface Alternative {
  id: string;
  name: string;
  supplier: string;
  spec: string;
  unitPrice: number;
  leadTimeDays: number;
  fitScore: number;
  pastApplicationCount: number;
  remark: string;
}

interface ApplicationHistory {
  date: string;
  originalMaterial: string;
  alternativeMaterial: string;
  supplier: string;
  quantity: number;
  appliedBy: string;
  result: string;
}

const MOCK_MATERIAL: Material = {
  code: 'RM-20341',
  name: '고강도 알루미늄 합금 판재',
  spec: 'AL6061-T6 / 2.0t × 1000 × 2000mm',
  supplier: '(주)한국알루미늄',
  unitPrice: 48500,
  status: '공급 지연',
};

const MOCK_ALTERNATIVES: Alternative[] = [
  {
    id: 'ALT-001',
    name: '알루미늄 합금 판재 A급',
    supplier: '삼성메탈(주)',
    spec: 'AL6061-T651 / 2.0t × 1000 × 2000mm',
    unitPrice: 51200,
    leadTimeDays: 5,
    fitScore: 97,
    pastApplicationCount: 12,
    remark: '동등 규격, 열처리 추가',
  },
  {
    id: 'ALT-002',
    name: '프리미엄 AL판 6061',
    supplier: '동국알루미늄',
    spec: 'AL6061-T6 / 2.0t × 1000 × 2000mm',
    unitPrice: 46900,
    leadTimeDays: 7,
    fitScore: 95,
    pastApplicationCount: 8,
    remark: '동일 규격, 가격 유리',
  },
  {
    id: 'ALT-003',
    name: '알루미늄 합금재 6063',
    supplier: '현대금속(주)',
    spec: 'AL6063-T5 / 2.0t × 1000 × 2000mm',
    unitPrice: 43000,
    leadTimeDays: 3,
    fitScore: 82,
    pastApplicationCount: 3,
    remark: '유사 강도, 구조 검토 필요',
  },
  {
    id: 'ALT-004',
    name: '고강도 AL 복합판',
    supplier: '포스코알루미늄',
    spec: 'AL7075-T6 / 2.0t × 1000 × 2000mm',
    unitPrice: 68000,
    leadTimeDays: 10,
    fitScore: 75,
    pastApplicationCount: 1,
    remark: '상위 등급, 단가 높음',
  },
  {
    id: 'ALT-005',
    name: '표준 AL판재 5052',
    supplier: '국제알루미늄',
    spec: 'AL5052-H32 / 2.0t × 1000 × 2000mm',
    unitPrice: 38500,
    leadTimeDays: 2,
    fitScore: 61,
    pastApplicationCount: 0,
    remark: '강도 부족, 보강 필요',
  },
];

const MOCK_HISTORY: ApplicationHistory[] = [
  {
    date: '2026-05-28',
    originalMaterial: 'RM-20100 스테인리스 파이프',
    alternativeMaterial: 'SUS304 파이프 (대신메탈)',
    supplier: '대신메탈(주)',
    quantity: 200,
    appliedBy: '김철수',
    result: '적용완료',
  },
  {
    date: '2026-05-21',
    originalMaterial: 'RM-19875 구리 전선재',
    alternativeMaterial: 'OFC 구리선 (한화전선)',
    supplier: '한화전선',
    quantity: 500,
    appliedBy: '이영희',
    result: '적용완료',
  },
  {
    date: '2026-05-14',
    originalMaterial: 'RM-18443 산업용 베어링',
    alternativeMaterial: 'NSK 동등품 베어링',
    supplier: 'NSK코리아',
    quantity: 50,
    appliedBy: '박민준',
    result: '적용완료',
  },
  {
    date: '2026-05-07',
    originalMaterial: 'RM-17220 탄소강 플레이트',
    alternativeMaterial: 'SS400 후판 (동국제강)',
    supplier: '동국제강',
    quantity: 30,
    appliedBy: '최지원',
    result: '검토중',
  },
  {
    date: '2026-04-30',
    originalMaterial: 'RM-16589 산업용 볼트 M12',
    alternativeMaterial: '동등 규격 볼트 (대보정공)',
    supplier: '대보정공(주)',
    quantity: 1000,
    appliedBy: '강동현',
    result: '적용완료',
  },
];

function FitScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#16a34a' : score >= 75 ? '#ca8a04' : '#dc2626';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>적합도</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ backgroundColor: '#e5e7eb', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: 10,
        padding: '16px 22px',
        minWidth: 140,
        flex: 1,
      }}
    >
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || '#1e3a5f' }}>
        {value}
        {unit && <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function AlternativesPage() {
  const [materialCode, setMaterialCode] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [searched, setSearched] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleSearch = () => {
    if (!materialCode.trim() && !materialName.trim()) return;
    setSearched(true);
    setAppliedId(null);
  };

  const handleApply = (id: string) => {
    setAppliedId(id);
  };

  const statusColor = (status: string) => {
    if (status === '적용완료') return { backgroundColor: '#dcfce7', color: '#16a34a' };
    if (status === '검토중') return { backgroundColor: '#fef9c3', color: '#ca8a04' };
    return { backgroundColor: '#fee2e2', color: '#dc2626' };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px 24px' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>구매조달관리 / 대체품 추천</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>대체품 추천</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
          공급 지연 또는 단종 자재 발생 시 BOM·규격·과거 적용 사례를 기반으로 대체 가능 품목을 추천합니다.
        </p>
      </div>

      {/* KPI 요약 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard label="공급 지연 자재" value={7} unit="건" color="#dc2626" />
        <KpiCard label="단종 자재" value={3} unit="건" color="#ca8a04" />
        <KpiCard label="이번 달 대체 적용" value={12} unit="건" color="#2563eb" />
        <KpiCard label="평균 적합도" value="88" unit="%" color="#16a34a" />
      </div>

      {/* 검색 영역 */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', marginBottom: 16, marginTop: 0 }}>자재 검색</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>자재코드</label>
            <input
              type="text"
              placeholder="예: RM-20341"
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 14,
                width: 180,
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>자재명</label>
            <input
              type="text"
              placeholder="예: 알루미늄 판재"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 14,
                width: 220,
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              height: 38,
            }}
          >
            대체품 검색
          </button>
          {searched && (
            <button
              onClick={() => { setSearched(false); setMaterialCode(''); setMaterialName(''); }}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 14,
                cursor: 'pointer',
                height: 38,
              }}
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      {searched && (
        <>
          {/* 원본 자재 정보 */}
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 10,
              padding: '20px 24px',
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', marginBottom: 14, marginTop: 0 }}>
              원본 자재 정보
            </h2>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>자재코드</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f' }}>{MOCK_MATERIAL.code}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>자재명</span>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{MOCK_MATERIAL.name}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>규격</span>
                <div style={{ fontSize: 14, color: '#374151' }}>{MOCK_MATERIAL.spec}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>공급사</span>
                <div style={{ fontSize: 14, color: '#374151' }}>{MOCK_MATERIAL.supplier}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>단가</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>
                  ₩{MOCK_MATERIAL.unitPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}
                >
                  {MOCK_MATERIAL.status}
                </span>
              </div>
            </div>
          </div>

          {/* 대체품 추천 목록 */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', marginBottom: 14 }}>
              대체품 추천 목록 ({MOCK_ALTERNATIVES.length}건)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {MOCK_ALTERNATIVES.map((alt) => (
                <div
                  key={alt.id}
                  style={{
                    backgroundColor: '#fff',
                    border: appliedId === alt.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    borderRadius: 10,
                    padding: '18px 20px',
                    position: 'relative',
                  }}
                >
                  {appliedId === alt.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 20,
                      }}
                    >
                      적용됨
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{alt.id}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{alt.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>공급사</span>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{alt.supplier}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>규격</span>
                      <span style={{ fontSize: 12, color: '#374151', textAlign: 'right', maxWidth: 180 }}>{alt.spec}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>단가</span>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                        ₩{alt.unitPrice.toLocaleString()}
                        <span
                          style={{
                            fontSize: 11,
                            color: alt.unitPrice <= MOCK_MATERIAL.unitPrice ? '#16a34a' : '#dc2626',
                            marginLeft: 4,
                          }}
                        >
                          ({alt.unitPrice <= MOCK_MATERIAL.unitPrice ? '-' : '+'}
                          {Math.abs(((alt.unitPrice - MOCK_MATERIAL.unitPrice) / MOCK_MATERIAL.unitPrice) * 100).toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>납기</span>
                      <span style={{ fontSize: 13, color: '#374151' }}>{alt.leadTimeDays}일</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>과거 적용</span>
                      <span style={{ fontSize: 13, color: '#374151' }}>{alt.pastApplicationCount}건</span>
                    </div>
                  </div>
                  <FitScoreBar score={alt.fitScore} />
                  {alt.remark && (
                    <div
                      style={{
                        marginTop: 10,
                        backgroundColor: '#f9fafb',
                        borderRadius: 5,
                        padding: '5px 8px',
                        fontSize: 12,
                        color: '#6b7280',
                      }}
                    >
                      {alt.remark}
                    </div>
                  )}
                  <button
                    onClick={() => handleApply(alt.id)}
                    disabled={appliedId === alt.id}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      backgroundColor: appliedId === alt.id ? '#e5e7eb' : '#2563eb',
                      color: appliedId === alt.id ? '#9ca3af' : '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 0',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: appliedId === alt.id ? 'default' : 'pointer',
                    }}
                  >
                    {appliedId === alt.id ? '적용 완료' : '적용'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 최근 대체품 적용 이력 */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '20px 24px',
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', marginBottom: 16, marginTop: 0 }}>
          최근 대체품 적용 이력
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['적용일', '원본 자재', '대체 자재', '공급사', '수량', '담당자', '상태'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      color: '#6b7280',
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{row.originalMaterial}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{row.alternativeMaterial}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{row.supplier}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', textAlign: 'right' }}>{row.quantity.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{row.appliedBy}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        ...statusColor(row.result),
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 20,
                      }}
                    >
                      {row.result}
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
