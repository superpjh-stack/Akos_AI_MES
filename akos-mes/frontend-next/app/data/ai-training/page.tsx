'use client';

import { useState } from 'react';

interface Dataset {
  id: string;
  name: string;
  targetModel: string;
  recordCount: number;
  lastUpdated: string;
  qualityScore: number;
  usedForTraining: boolean;
  status: '활성' | '검토중' | '비활성';
}

interface VersionHistory {
  version: string;
  dataset: string;
  changedBy: string;
  date: string;
  recordDelta: string;
  note: string;
}

const datasets: Dataset[] = [
  {
    id: 'DS001',
    name: 'FAT불량예측_v3',
    targetModel: '불량예측 AI',
    recordCount: 12450,
    lastUpdated: '2026-06-04 10:23',
    qualityScore: 97.1,
    usedForTraining: true,
    status: '활성',
  },
  {
    id: 'DS002',
    name: '원가예측_v2',
    targetModel: '원가최적화 AI',
    recordCount: 8320,
    lastUpdated: '2026-06-03 15:40',
    qualityScore: 93.5,
    usedForTraining: true,
    status: '활성',
  },
  {
    id: 'DS003',
    name: '납기예측_v1',
    targetModel: '납기예측 AI',
    recordCount: 6180,
    lastUpdated: '2026-06-02 09:15',
    qualityScore: 88.7,
    usedForTraining: false,
    status: '검토중',
  },
  {
    id: 'DS004',
    name: '설비이상감지_v4',
    targetModel: '예지보전 AI',
    recordCount: 14902,
    lastUpdated: '2026-06-04 08:00',
    qualityScore: 96.3,
    usedForTraining: true,
    status: '활성',
  },
  {
    id: 'DS005',
    name: '수요예측_v2',
    targetModel: '수요예측 AI',
    recordCount: 4560,
    lastUpdated: '2026-05-31 14:22',
    qualityScore: 91.0,
    usedForTraining: false,
    status: '비활성',
  },
  {
    id: 'DS006',
    name: '공정최적화_v1',
    targetModel: '공정최적화 AI',
    recordCount: 1420,
    lastUpdated: '2026-05-28 11:05',
    qualityScore: 85.4,
    usedForTraining: false,
    status: '검토중',
  },
];

const versionHistory: VersionHistory[] = [
  {
    version: 'v3.2.1',
    dataset: 'FAT불량예측_v3',
    changedBy: '김철수',
    date: '2026-06-04 10:23',
    recordDelta: '+342',
    note: '6월 생산 데이터 추가',
  },
  {
    version: 'v4.1.0',
    dataset: '설비이상감지_v4',
    changedBy: '이영희',
    date: '2026-06-04 08:00',
    recordDelta: '+1,205',
    note: '센서 데이터 일괄 업로드',
  },
  {
    version: 'v2.3.0',
    dataset: '원가예측_v2',
    changedBy: '박민준',
    date: '2026-06-03 15:40',
    recordDelta: '+88',
    note: '원자재 단가 갱신 반영',
  },
  {
    version: 'v1.0.2',
    dataset: '납기예측_v1',
    changedBy: '최지원',
    date: '2026-06-02 09:15',
    recordDelta: '-12',
    note: '이상 레코드 제거 후 정제',
  },
  {
    version: 'v2.1.0',
    dataset: '수요예측_v2',
    changedBy: '김철수',
    date: '2026-05-31 14:22',
    recordDelta: '+450',
    note: '5월 수요 실적 데이터 추가',
  },
];

function KpiCard({
  title,
  value,
  unit,
  color,
}: {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
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
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || '#1e3a5f' }}>
        {value}
        {unit && <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: '#6b7280' }}>{unit}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Dataset['status'] }) {
  const map: Record<Dataset['status'], { bg: string; color: string }> = {
    활성: { bg: '#dcfce7', color: '#16a34a' },
    검토중: { bg: '#fef9c3', color: '#b45309' },
    비활성: { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 12,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

export default function AITrainingDataPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [retrainRequested, setRetrainRequested] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file.name);
  }

  function handleRetrainRequest() {
    setRetrainRequested(true);
    setTimeout(() => setRetrainRequested(false), 3000);
  }

  return (
    <div style={{ padding: '32px 36px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>데이터관리 &gt; AI학습 데이터관리</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>AI학습 데이터관리</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
          ML 모델 학습용 데이터셋 관리 및 업데이트. 데이터 품질 향상을 통한 AI 성능 개선.
        </p>
      </div>

      {/* KPI 카드 4개 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard title="학습 데이터셋" value={12} unit="개" />
        <KpiCard title="총 레코드 수" value="47,832" unit="건" />
        <KpiCard title="마지막 업데이트" value="2시간 전" color="#2563eb" />
        <KpiCard title="데이터 품질 점수" value="94.2" unit="점" color="#16a34a" />
      </div>

      {/* 데이터셋 목록 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>데이터셋 목록</h2>
          <button
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
            + 데이터 업로드
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['데이터셋명', '대상모델', '레코드수', '마지막업데이트', '품질점수', '학습사용여부', '상태'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
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
              {datasets.map((ds, i) => (
                <tr
                  key={ds.id}
                  style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e3a5f' }}>{ds.name}</td>
                  <td style={{ padding: '10px 16px', color: '#374151' }}>{ds.targetModel}</td>
                  <td style={{ padding: '10px 16px', color: '#374151' }}>{ds.recordCount.toLocaleString()}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{ds.lastUpdated}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        color: ds.qualityScore >= 95 ? '#16a34a' : ds.qualityScore >= 90 ? '#b45309' : '#dc2626',
                        fontWeight: 700,
                      }}
                    >
                      {ds.qualityScore}점
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        color: ds.usedForTraining ? '#2563eb' : '#9ca3af',
                        fontWeight: 600,
                      }}
                    >
                      {ds.usedForTraining ? '사용' : '미사용'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <StatusBadge status={ds.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 데이터 업로드 영역 + 품질 검사 결과 */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* 파일 업로드 */}
        <div
          style={{
            flex: 1.5,
            minWidth: 300,
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: 10,
            padding: '20px 24px',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>
            데이터 업로드
          </h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#2563eb' : '#cbd5e1'}`,
              borderRadius: 8,
              padding: '36px 24px',
              textAlign: 'center',
              background: dragOver ? '#eff6ff' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
            <div style={{ fontSize: 14, color: '#374151', fontWeight: 600, marginBottom: 4 }}>
              파일을 여기에 드래그하거나 클릭하여 선택
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>CSV, Excel, JSON 파일 지원 (최대 500MB)</div>
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              style={{
                display: 'inline-block',
                marginTop: 12,
                backgroundColor: '#2563eb',
                color: '#fff',
                borderRadius: 6,
                padding: '7px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              파일 선택
            </label>
          </div>
          {uploadedFile && (
            <div
              style={{
                background: '#dcfce7',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 13,
                color: '#16a34a',
                fontWeight: 600,
              }}
            >
              업로드 완료: {uploadedFile}
            </div>
          )}
        </div>

        {/* 데이터 품질 검사 결과 */}
        <div
          style={{
            flex: 1,
            minWidth: 240,
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: 10,
            padding: '20px 24px',
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>
            데이터 품질 검사 결과
          </h2>
          {[
            { label: '결측값률', value: '1.3%', color: '#16a34a', bar: 1.3 },
            { label: '이상치율', value: '2.8%', color: '#b45309', bar: 2.8 },
            { label: '중복률', value: '0.5%', color: '#16a34a', bar: 0.5 },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: 13, color: item.color, fontWeight: 700 }}>{item.value}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8 }}>
                <div
                  style={{
                    width: `${Math.min(item.bar * 10, 100)}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: 4,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 20,
              padding: '10px 14px',
              background: '#eff6ff',
              borderRadius: 8,
              fontSize: 13,
              color: '#1e3a5f',
              fontWeight: 600,
            }}
          >
            종합 품질 점수: <span style={{ color: '#16a34a', fontSize: 16 }}>94.2점</span>
          </div>
        </div>
      </div>

      {/* 모델 재학습 요청 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>학습 트리거</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            최신 데이터셋을 기반으로 AI 모델 재학습을 요청합니다. 학습에는 약 20~40분이 소요됩니다.
          </p>
        </div>
        <button
          onClick={handleRetrainRequest}
          style={{
            backgroundColor: retrainRequested ? '#16a34a' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            whiteSpace: 'nowrap',
          }}
        >
          {retrainRequested ? '요청 완료!' : '모델 재학습 요청'}
        </button>
      </div>

      {/* 데이터 버전 이력 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>데이터 버전 이력</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['버전', '데이터셋', '변경자', '일시', '레코드 변경', '비고'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
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
              {versionHistory.map((row, i) => (
                <tr
                  key={`${row.version}-${i}`}
                  style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {row.version}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#1e3a5f', fontWeight: 600 }}>{row.dataset}</td>
                  <td style={{ padding: '10px 16px', color: '#374151' }}>{row.changedBy}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{row.date}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span
                      style={{
                        color: row.recordDelta.startsWith('+') ? '#16a34a' : '#dc2626',
                        fontWeight: 700,
                      }}
                    >
                      {row.recordDelta}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#6b7280' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
