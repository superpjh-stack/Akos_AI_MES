'use client';

import { useState } from 'react';

interface WorkCondition {
  id: number;
  name: string;
  setValue: number;
  unit: string;
  minRange: number;
  maxRange: number;
  currentValue: number;
  lastModified: string;
}

interface ChangeHistory {
  id: number;
  conditionName: string;
  before: string;
  after: string;
  changedBy: string;
  reason: string;
  changedAt: string;
}

interface ProcessData {
  conditions: WorkCondition[];
  changeHistory: ChangeHistory[];
}

type ProcessDataMap = {
  [key: string]: ProcessData;
};

const KpiCard = ({
  title,
  value,
  unit,
  sub,
  alert,
}: {
  title: string;
  value: string | number;
  unit?: string;
  sub?: string;
  alert?: boolean;
}) => (
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
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{title}</div>
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
        color: alert ? '#dc2626' : '#1e3a5f',
        lineHeight: 1.2,
      }}
    >
      {value}
      {unit && <span style={{ fontSize: 15, fontWeight: 400, marginLeft: 4 }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
  </div>
);

const processDataMap: ProcessDataMap = {
  welding: {
    conditions: [
      { id: 1, name: '용접전류', setValue: 180, unit: 'A', minRange: 170, maxRange: 190, currentValue: 183, lastModified: '2026-06-01' },
      { id: 2, name: '용접전압', setValue: 22, unit: 'V', minRange: 20, maxRange: 24, currentValue: 21.5, lastModified: '2026-05-30' },
      { id: 3, name: '와이어 속도', setValue: 5.2, unit: 'm/min', minRange: 4.8, maxRange: 5.6, currentValue: 5.1, lastModified: '2026-05-28' },
      { id: 4, name: '가스유량', setValue: 15, unit: 'L/min', minRange: 12, maxRange: 18, currentValue: 19.2, lastModified: '2026-06-02' },
      { id: 5, name: '용접속도', setValue: 0.8, unit: 'm/min', minRange: 0.6, maxRange: 1.0, currentValue: 0.79, lastModified: '2026-05-25' },
      { id: 6, name: '예열온도', setValue: 150, unit: '°C', minRange: 130, maxRange: 170, currentValue: 148, lastModified: '2026-06-03' },
    ],
    changeHistory: [
      { id: 1, conditionName: '용접전류', before: '175 A', after: '180 A', changedBy: '김철수', reason: '용접 품질 개선', changedAt: '2026-06-01 09:15' },
      { id: 2, conditionName: '가스유량', before: '14 L/min', after: '15 L/min', changedBy: '이영희', reason: '기공 발생 방지', changedAt: '2026-05-30 14:22' },
      { id: 3, conditionName: '예열온도', before: '140 °C', after: '150 °C', changedBy: '박민준', reason: '계절 변화 대응', changedAt: '2026-05-28 11:05' },
      { id: 4, conditionName: '용접전압', before: '21 V', after: '22 V', changedBy: '김철수', reason: '아크 안정화', changedAt: '2026-05-25 16:40' },
      { id: 5, conditionName: '와이어 속도', before: '5.0 m/min', after: '5.2 m/min', changedBy: '최지수', reason: '생산성 향상', changedAt: '2026-05-20 10:30' },
    ],
  },
  cutting: {
    conditions: [
      { id: 1, name: '절단속도', setValue: 2.5, unit: 'm/min', minRange: 2.0, maxRange: 3.0, currentValue: 2.48, lastModified: '2026-06-02' },
      { id: 2, name: '절단압력', setValue: 6.0, unit: 'bar', minRange: 5.5, maxRange: 6.5, currentValue: 6.1, lastModified: '2026-05-31' },
      { id: 3, name: '가스온도', setValue: 25, unit: '°C', minRange: 20, maxRange: 35, currentValue: 38.5, lastModified: '2026-06-01' },
      { id: 4, name: '노즐높이', setValue: 3.0, unit: 'mm', minRange: 2.5, maxRange: 3.5, currentValue: 3.0, lastModified: '2026-05-29' },
      { id: 5, name: '출력전력', setValue: 4000, unit: 'W', minRange: 3800, maxRange: 4200, currentValue: 3990, lastModified: '2026-05-27' },
    ],
    changeHistory: [
      { id: 1, conditionName: '절단속도', before: '2.3 m/min', after: '2.5 m/min', changedBy: '이영희', reason: '생산 효율 개선', changedAt: '2026-06-02 08:50' },
      { id: 2, conditionName: '출력전력', before: '3800 W', after: '4000 W', changedBy: '박민준', reason: '재질 두께 변경', changedAt: '2026-05-31 13:10' },
      { id: 3, conditionName: '노즐높이', before: '3.2 mm', after: '3.0 mm', changedBy: '김철수', reason: '절단면 품질 개선', changedAt: '2026-05-29 15:25' },
      { id: 4, conditionName: '절단압력', before: '5.8 bar', after: '6.0 bar', changedBy: '최지수', reason: '재질 변경 대응', changedAt: '2026-05-25 09:00' },
      { id: 5, conditionName: '가스온도', before: '22 °C', after: '25 °C', changedBy: '이영희', reason: '계절 온도 보정', changedAt: '2026-05-20 11:45' },
    ],
  },
  pressing: {
    conditions: [
      { id: 1, name: '가압력', setValue: 8.5, unit: 'bar', minRange: 8.0, maxRange: 9.0, currentValue: 8.5, lastModified: '2026-06-01' },
      { id: 2, name: '프레스 속도', setValue: 120, unit: 'mm/s', minRange: 100, maxRange: 140, currentValue: 118, lastModified: '2026-05-30' },
      { id: 3, name: '홀딩시간', setValue: 3.0, unit: 's', minRange: 2.5, maxRange: 3.5, currentValue: 3.1, lastModified: '2026-05-28' },
      { id: 4, name: '다이온도', setValue: 180, unit: '°C', minRange: 170, maxRange: 190, currentValue: 176, lastModified: '2026-06-03' },
      { id: 5, name: '금형압력', setValue: 250, unit: 'ton', minRange: 230, maxRange: 270, currentValue: 285, lastModified: '2026-05-26' },
    ],
    changeHistory: [
      { id: 1, conditionName: '가압력', before: '8.0 bar', after: '8.5 bar', changedBy: '박민준', reason: '성형 불량 개선', changedAt: '2026-06-01 10:00' },
      { id: 2, conditionName: '금형압력', before: '240 ton', after: '250 ton', changedBy: '김철수', reason: '제품 두께 변경', changedAt: '2026-05-30 14:00' },
      { id: 3, conditionName: '다이온도', before: '175 °C', after: '180 °C', changedBy: '이영희', reason: '수지 특성 최적화', changedAt: '2026-05-28 09:30' },
      { id: 4, conditionName: '홀딩시간', before: '2.8 s', after: '3.0 s', changedBy: '최지수', reason: '변형 방지', changedAt: '2026-05-25 16:00' },
      { id: 5, conditionName: '프레스 속도', before: '130 mm/s', after: '120 mm/s', changedBy: '박민준', reason: '소재 손상 방지', changedAt: '2026-05-21 11:20' },
    ],
  },
};

const processOptions = [
  { value: 'welding', label: '용접 공정' },
  { value: 'cutting', label: '절단 공정' },
  { value: 'pressing', label: '프레스 공정' },
];

export default function WorkConditionsPage() {
  const [selectedProcess, setSelectedProcess] = useState<string>('welding');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: '',
    setValue: '',
    unit: '',
    minRange: '',
    maxRange: '',
  });
  const [saveMsg, setSaveMsg] = useState('');

  const data = processDataMap[selectedProcess];

  const isDeviation = (c: WorkCondition) =>
    c.currentValue < c.minRange || c.currentValue > c.maxRange;

  const handleSaveProfile = () => {
    setSaveMsg('표준 프로파일이 저장되었습니다.');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleAddCondition = () => {
    if (!newCondition.name || !newCondition.setValue || !newCondition.unit) return;
    setNewCondition({ name: '', setValue: '', unit: '', minRange: '', maxRange: '' });
    setShowAddForm(false);
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '32px 24px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>공정관리</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
          작업조건관리
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
          절단속도, 용접전류 등 공정별 주요 작업조건을 표준화하고 관리합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KpiCard title="등록 조건 프로파일" value={48} unit="개" sub="전체 공정 합계" />
        <KpiCard title="이번달 조건 변경" value={7} unit="건" sub="2026년 6월" />
        <KpiCard title="최적화 개선율" value="12.3" unit="%" sub="전월 대비 +2.1%" />
        <KpiCard title="편차 초과 알림" value={3} unit="건" sub="즉시 확인 필요" alert />
      </div>

      {/* 공정 선택 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', whiteSpace: 'nowrap' }}>
            공정 선택
          </label>
          <select
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(e.target.value)}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 14,
              color: '#1e3a5f',
              background: '#fff',
              cursor: 'pointer',
              minWidth: 180,
            }}
          >
            {processOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            조건 프로파일 {data.conditions.length}개 등록됨
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + 조건 추가
            </button>
            <button
              onClick={handleSaveProfile}
              style={{
                backgroundColor: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              표준 프로파일 저장
            </button>
          </div>
        </div>
        {saveMsg && (
          <div
            style={{
              marginTop: 12,
              padding: '8px 14px',
              background: '#d1fae5',
              borderRadius: 6,
              fontSize: 13,
              color: '#065f46',
              fontWeight: 500,
            }}
          >
            {saveMsg}
          </div>
        )}
      </div>

      {/* 조건 추가 폼 */}
      {showAddForm && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: '20px 24px',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', marginBottom: 14 }}>
            신규 작업조건 추가
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {[
              { label: '조건명', key: 'name', placeholder: '예: 용접전류' },
              { label: '설정값', key: 'setValue', placeholder: '예: 180' },
              { label: '단위', key: 'unit', placeholder: '예: A' },
              { label: '최솟값(Min)', key: 'minRange', placeholder: '예: 170' },
              { label: '최댓값(Max)', key: 'maxRange', placeholder: '예: 190' },
            ].map((field) => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={newCondition[field.key as keyof typeof newCondition]}
                  onChange={(e) =>
                    setNewCondition((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    padding: '7px 10px',
                    fontSize: 13,
                    width: 130,
                    outline: 'none',
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleAddCondition}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                height: 36,
              }}
            >
              추가
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                backgroundColor: '#fff',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 13,
                cursor: 'pointer',
                height: 36,
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 작업조건 테이블 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', marginBottom: 16 }}>
          작업조건 현황 — {processOptions.find((p) => p.value === selectedProcess)?.label}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['조건명', '설정값', '단위', '허용범위 (Min ~ Max)', '현재값', '편차여부', '최종수정일'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        color: '#374151',
                        fontWeight: 600,
                        borderBottom: '1px solid #e5e7eb',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data.conditions.map((c) => {
                const dev = isDeviation(c);
                return (
                  <tr
                    key={c.id}
                    style={{
                      background: dev ? '#fef2f2' : '#fff',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    <td
                      style={{
                        padding: '11px 14px',
                        fontWeight: 600,
                        color: dev ? '#b91c1c' : '#1e3a5f',
                      }}
                    >
                      {c.name}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#111827' }}>{c.setValue}</td>
                    <td style={{ padding: '11px 14px', color: '#6b7280' }}>{c.unit}</td>
                    <td style={{ padding: '11px 14px', color: '#374151' }}>
                      {c.minRange} ~ {c.maxRange}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        fontWeight: 600,
                        color: dev ? '#dc2626' : '#059669',
                      }}
                    >
                      {c.currentValue}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {dev ? (
                        <span
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          편차 초과
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#d1fae5',
                            color: '#065f46',
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          정상
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#6b7280' }}>{c.lastModified}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 조건 변경 이력 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '20px 24px',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', marginBottom: 16 }}>
          조건 변경 이력 (최근 5건)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['조건명', '변경 전', '변경 후', '변경자', '변경 사유', '변경 일시'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      color: '#374151',
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
              {data.changeHistory.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e3a5f' }}>
                    {h.conditionName}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>{h.before}</td>
                  <td style={{ padding: '10px 14px', color: '#2563eb', fontWeight: 600 }}>
                    {h.after}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{h.changedBy}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{h.reason}</td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>{h.changedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
