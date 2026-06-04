'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ── 로컬 KPI 카드 컴포넌트 ──────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  unit,
  sub,
  color,
}: {
  title: string;
  value: string;
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
        borderRadius: 10,
        padding: '20px 24px',
        flex: 1,
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? '#1e3a5f', lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── 인라인 목업 데이터 ──────────────────────────────────────────────────────
const historyData = [
  {
    id: 1,
    date: '2026-05-02',
    type: '사출성형기',
    estCost: 3.2,
    realCost: 3.35,
    errorRate: 4.7,
    estDays: 42,
    realDays: 44,
  },
  {
    id: 2,
    date: '2026-05-08',
    type: 'CNC 가공기',
    estCost: 1.8,
    realCost: 1.74,
    errorRate: 3.3,
    estDays: 30,
    realDays: 29,
  },
  {
    id: 3,
    date: '2026-05-13',
    type: '컨베이어 시스템',
    estCost: 5.6,
    realCost: 5.91,
    errorRate: 5.5,
    estDays: 60,
    realDays: 63,
  },
  {
    id: 4,
    date: '2026-05-19',
    type: '로봇 용접기',
    estCost: 4.1,
    realCost: 4.22,
    errorRate: 2.9,
    estDays: 50,
    realDays: 51,
  },
  {
    id: 5,
    date: '2026-05-24',
    type: '압축공기 시스템',
    estCost: 2.3,
    realCost: 2.41,
    errorRate: 4.8,
    estDays: 35,
    realDays: 37,
  },
  {
    id: 6,
    date: '2026-05-29',
    type: '자동포장기',
    estCost: 3.8,
    realCost: 3.95,
    errorRate: 3.9,
    estDays: 45,
    realDays: 46,
  },
  {
    id: 7,
    date: '2026-06-02',
    type: '스마트 AGV',
    estCost: 6.5,
    realCost: 6.72,
    errorRate: 3.4,
    estDays: 70,
    realDays: 73,
  },
];

const trendData = historyData.map((d) => ({
  date: d.date.slice(5),
  예측원가: d.estCost,
  실제원가: d.realCost,
  예측납기: d.estDays,
  실제납기: d.realDays,
}));

const equipmentTypes = [
  '사출성형기',
  'CNC 가공기',
  '컨베이어 시스템',
  '로봇 용접기',
  '압축공기 시스템',
  '자동포장기',
  '스마트 AGV',
  '기타',
];

// ── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function ForecastPage() {
  const [form, setForm] = useState({
    equipmentType: '',
    bomCount: '',
    processSteps: '',
    specialReq: '',
  });
  const [result, setResult] = useState<{
    cost: number;
    days: number;
    confidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cost' | 'days'>('cost');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function runAI() {
    if (!form.equipmentType || !form.bomCount || !form.processSteps) return;
    setLoading(true);
    setTimeout(() => {
      const bom = parseInt(form.bomCount) || 50;
      const steps = parseInt(form.processSteps) || 5;
      const specialMultiplier = form.specialReq.trim() ? 1.12 : 1.0;
      const baseCost = (bom * 0.04 + steps * 0.3) * specialMultiplier;
      const baseDays = Math.round(bom * 0.6 + steps * 2.5);
      const confidence = Math.min(96, 82 + Math.floor(Math.random() * 12));
      setResult({
        cost: parseFloat(baseCost.toFixed(2)),
        days: baseDays,
        confidence,
      });
      setLoading(false);
    }, 1400);
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 24px' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
          수주견적관리 &rsaquo; 원가납기 예측관리
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
          원가·납기 예측관리
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, margin: '6px 0 0' }}>
          설계·제작·구매·설치 데이터를 AI로 분석해 예상원가와 납기를 자동 예측합니다. 담당자 경험 의존도를 최소화합니다.
        </p>
      </div>

      {/* KPI 카드 4개 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KpiCard
          title="예측 정확도"
          value="91.2"
          unit="%"
          sub="전월 대비 +1.4%p"
          color="#16a34a"
        />
        <KpiCard
          title="평균 원가 오차"
          value="4.8"
          unit="%"
          sub="목표: 5% 이하"
          color="#d97706"
        />
        <KpiCard
          title="납기 예측 오차"
          value="2.3"
          unit="일"
          sub="최근 30일 평균"
          color="#2563eb"
        />
        <KpiCard
          title="예측 건수"
          value="23"
          unit="건"
          sub="이번 달 누적"
          color="#7c3aed"
        />
      </div>

      {/* 메인 2열 레이아웃 */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* 왼쪽: 입력 폼 + 결과 카드 */}
        <div style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI 예측 입력 폼 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 10,
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: '0 0 18px' }}>
              AI 예측 입력
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 설비유형 */}
              <div>
                <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  설비유형 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="equipmentType"
                  value={form.equipmentType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#111827',
                    background: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="">-- 선택 --</option>
                  {equipmentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* BOM 항목수 */}
              <div>
                <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  BOM 항목수 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  name="bomCount"
                  value={form.bomCount}
                  onChange={handleChange}
                  placeholder="예: 120"
                  min={1}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 공정단계수 */}
              <div>
                <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  공정단계수 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  name="processSteps"
                  value={form.processSteps}
                  onChange={handleChange}
                  placeholder="예: 8"
                  min={1}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 특수요구사항 */}
              <div>
                <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  특수요구사항
                </label>
                <textarea
                  name="specialReq"
                  value={form.specialReq}
                  onChange={handleChange}
                  rows={3}
                  placeholder="방폭, 클린룸, 고온환경 등 특수 조건 입력"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#111827',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={runAI}
                disabled={loading || !form.equipmentType || !form.bomCount || !form.processSteps}
                style={{
                  backgroundColor:
                    loading || !form.equipmentType || !form.bomCount || !form.processSteps
                      ? '#93c5fd'
                      : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 7,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    loading || !form.equipmentType || !form.bomCount || !form.processSteps
                      ? 'not-allowed'
                      : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? 'AI 분석 중...' : 'AI 예측 실행'}
              </button>
            </div>
          </div>

          {/* 예측 결과 카드 */}
          {result && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                padding: 20,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: '0 0 16px' }}>
                AI 예측 결과
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #dbeafe',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>예상원가</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#1e3a5f' }}>
                    ₩{result.cost}억
                  </div>
                </div>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #dbeafe',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>예상납기</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#1e3a5f' }}>
                    {result.days}일
                  </div>
                </div>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #dbeafe',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>AI 신뢰도</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a' }}>
                      {result.confidence}%
                    </div>
                  </div>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: `conic-gradient(#16a34a ${result.confidence}%, #e5e7eb 0%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#16a34a',
                      }}
                    >
                      {result.confidence}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 트렌드 차트 + 이력 테이블 */}
        <div style={{ flex: 1, minWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 트렌드 차트 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 10,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
                예측 vs 실제 트렌드
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setActiveTab('cost')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 5,
                    border: '1px solid #d1d5db',
                    background: activeTab === 'cost' ? '#2563eb' : '#fff',
                    color: activeTab === 'cost' ? '#fff' : '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  원가
                </button>
                <button
                  onClick={() => setActiveTab('days')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 5,
                    border: '1px solid #d1d5db',
                    background: activeTab === 'days' ? '#2563eb' : '#fff',
                    color: activeTab === 'days' ? '#fff' : '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  납기
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  unit={activeTab === 'cost' ? '억' : '일'}
                />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    activeTab === 'cost'
                      ? [`${Number(value)}억`, name]
                      : [`${Number(value)}일`, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {activeTab === 'cost' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="예측원가"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="실제원가"
                      stroke="#16a34a"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 4 }}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="예측납기"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="실제납기"
                      stroke="#d97706"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 4 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 예측 이력 테이블 */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderRadius: 10,
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: '0 0 16px' }}>
              예측 이력
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['예측일', '설비유형', '예상원가', '실제원가', '오차율', '납기예측', '실제납기'].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 10px',
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
                  {historyData.map((row, idx) => (
                    <tr
                      key={row.id}
                      style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}
                    >
                      <td style={{ padding: '8px 10px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {row.date}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#111827', whiteSpace: 'nowrap' }}>
                        {row.type}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#1e3a5f', fontWeight: 600 }}>
                        ₩{row.estCost}억
                      </td>
                      <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 600 }}>
                        ₩{row.realCost}억
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span
                          style={{
                            background:
                              row.errorRate <= 4 ? '#dcfce7' : row.errorRate <= 5 ? '#fef9c3' : '#fee2e2',
                            color:
                              row.errorRate <= 4 ? '#16a34a' : row.errorRate <= 5 ? '#b45309' : '#dc2626',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {row.errorRate}%
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#7c3aed', fontWeight: 600 }}>
                        {row.estDays}일
                      </td>
                      <td style={{ padding: '8px 10px', color: '#d97706', fontWeight: 600 }}>
                        {row.realDays}일
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
