'use client';

import { useState } from 'react';

interface QuotationResult {
  materialCost: number;
  laborCost: number;
  outsourcingCost: number;
  indirectCost: number;
  profit: number;
  total: number;
  confidence: number;
  generatedAt: string;
}

interface QuotationHistory {
  id: string;
  generatedAt: string;
  productType: string;
  amount: number;
  confidence: number;
  manager: string;
  status: '검토중' | '승인됨' | '수정요청' | '완료';
}

interface QuotationForm {
  productType: string;
  equipmentSpec: string;
  quantity: string;
  deliveryDate: string;
  specialConditions: string;
}

function KpiCard({
  title,
  value,
  unit,
  sub,
  color,
}: {
  title: string;
  value: string;
  unit: string;
  sub: string;
  color: string;
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color }}>{value}</span>
        <span style={{ fontSize: 14, color: '#9ca3af' }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

const HISTORY_DATA: QuotationHistory[] = [
  { id: 'Q-2024-047', generatedAt: '2026-06-04 14:32', productType: '자동화 용접 설비', amount: 87500000, confidence: 94, manager: '김민준', status: '승인됨' },
  { id: 'Q-2024-046', generatedAt: '2026-06-04 11:15', productType: 'CNC 가공 라인', amount: 134200000, confidence: 89, manager: '이서연', status: '검토중' },
  { id: 'Q-2024-045', generatedAt: '2026-06-03 16:48', productType: '조립 자동화 셀', amount: 56300000, confidence: 96, manager: '박지호', status: '완료' },
  { id: 'Q-2024-044', generatedAt: '2026-06-03 10:22', productType: '도장 설비 라인', amount: 210000000, confidence: 87, manager: '최수진', status: '수정요청' },
  { id: 'Q-2024-043', generatedAt: '2026-06-02 15:30', productType: '자동화 용접 설비', amount: 92100000, confidence: 93, manager: '김민준', status: '승인됨' },
  { id: 'Q-2024-042', generatedAt: '2026-06-02 09:45', productType: '검사 자동화 설비', amount: 45800000, confidence: 91, manager: '정다은', status: '완료' },
  { id: 'Q-2024-041', generatedAt: '2026-06-01 14:10', productType: 'PCB 조립 라인', amount: 178500000, confidence: 88, manager: '이서연', status: '승인됨' },
  { id: 'Q-2024-040', generatedAt: '2026-06-01 10:55', productType: '물류 자동화 시스템', amount: 320000000, confidence: 85, manager: '박지호', status: '검토중' },
  { id: 'Q-2024-039', generatedAt: '2026-05-31 16:20', productType: 'CNC 가공 라인', amount: 118700000, confidence: 92, manager: '최수진', status: '완료' },
  { id: 'Q-2024-038', generatedAt: '2026-05-31 11:30', productType: '조립 자동화 셀', amount: 63400000, confidence: 95, manager: '김민준', status: '승인됨' },
];

const PRODUCT_TYPES = [
  '자동화 용접 설비',
  'CNC 가공 라인',
  '조립 자동화 셀',
  '도장 설비 라인',
  '검사 자동화 설비',
  'PCB 조립 라인',
  '물류 자동화 시스템',
  '기타 특수 설비',
];

function formatKRW(amount: number): string {
  if (amount >= 100000000) {
    const eok = amount / 100000000;
    return `${eok % 1 === 0 ? eok.toFixed(0) : eok.toFixed(1)}억`;
  }
  return (amount / 10000).toLocaleString() + '만원';
}

function formatFull(amount: number): string {
  return amount.toLocaleString() + '원';
}

function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 93 ? '#059669' : value >= 88 ? '#d97706' : '#dc2626';
  const bg = value >= 93 ? '#d1fae5' : value >= 88 ? '#fef3c7' : '#fee2e2';
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 12,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {value}%
    </span>
  );
}

function StatusBadge({ status }: { status: QuotationHistory['status'] }) {
  const map: Record<QuotationHistory['status'], { bg: string; color: string }> = {
    '검토중': { bg: '#dbeafe', color: '#1d4ed8' },
    '승인됨': { bg: '#d1fae5', color: '#065f46' },
    '수정요청': { bg: '#fef3c7', color: '#92400e' },
    '완료': { bg: '#f3f4f6', color: '#374151' },
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

export default function AiAutoQuotationPage() {
  const [form, setForm] = useState<QuotationForm>({
    productType: '',
    equipmentSpec: '',
    quantity: '',
    deliveryDate: '',
    specialConditions: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<QuotationResult | null>(null);
  const [error, setError] = useState('');

  function handleChange(field: keyof QuotationForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function generateQuotation() {
    if (!form.productType) { setError('제품유형을 선택해주세요.'); return; }
    if (!form.equipmentSpec.trim()) { setError('설비사양을 입력해주세요.'); return; }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      setError('유효한 수량을 입력해주세요.');
      return;
    }
    if (!form.deliveryDate) { setError('납기요구일을 선택해주세요.'); return; }

    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const base = 50000000 + Math.random() * 200000000;
      const qty = Number(form.quantity);
      const adjusted = base * (1 + (qty - 1) * 0.15);

      const material = adjusted * 0.38;
      const labor = adjusted * 0.28;
      const outsourcing = adjusted * 0.12;
      const indirect = adjusted * 0.10;
      const profit = adjusted * 0.12;
      const total = material + labor + outsourcing + indirect + profit;
      const confidence = Math.floor(85 + Math.random() * 11);

      setResult({
        materialCost: Math.round(material),
        laborCost: Math.round(labor),
        outsourcingCost: Math.round(outsourcing),
        indirectCost: Math.round(indirect),
        profit: Math.round(profit),
        total: Math.round(total),
        confidence,
        generatedAt: new Date().toLocaleString('ko-KR'),
      });
      setIsGenerating(false);
    }, 2300);
  }

  const costRows = result
    ? [
        { label: '재료비', amount: result.materialCost, ratio: ((result.materialCost / result.total) * 100).toFixed(1) },
        { label: '노무비', amount: result.laborCost, ratio: ((result.laborCost / result.total) * 100).toFixed(1) },
        { label: '외주비', amount: result.outsourcingCost, ratio: ((result.outsourcingCost / result.total) * 100).toFixed(1) },
        { label: '간접비', amount: result.indirectCost, ratio: ((result.indirectCost / result.total) * 100).toFixed(1) },
        { label: '이익', amount: result.profit, ratio: ((result.profit / result.total) * 100).toFixed(1) },
      ]
    : [];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '32px 24px', fontFamily: 'Pretendard, sans-serif' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>수주견적관리 &gt; 제품별 견적자동화 AI</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>제품별 견적자동화 AI</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
          과거 프로젝트 · BOM · 공수 · 자재비 · 설치비 데이터 기반 XGBoost/RF 앙상블 자동 견적 산출
        </p>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard title="AI 견적 생성" value="47" unit="건" sub="이번 달 누적" color="#2563eb" />
        <KpiCard title="평균 산출 시간" value="2.3" unit="분" sub="수동 견적 대비 85% 단축" color="#059669" />
        <KpiCard title="원가 예측 정확도" value="92.1" unit="%" sub="XGBoost/RF 앙상블 모델" color="#7c3aed" />
        <KpiCard title="수동 대비 시간절감" value="85" unit="%" sub="평균 15분 → 2.3분" color="#d97706" />
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* 견적 생성 폼 */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: 10,
            padding: 24,
            flex: '1 1 340px',
            minWidth: 300,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', marginTop: 0, marginBottom: 20 }}>
            AI 견적 입력 정보
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                제품유형 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={form.productType}
                onChange={(e) => handleChange('productType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#111827',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">제품유형 선택</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                설비사양 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.equipmentSpec}
                onChange={(e) => handleChange('equipmentSpec', e.target.value)}
                placeholder="예) 6축 로봇 + 용접 토치, 가반하중 10kg"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#111827',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  수량 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="수량 입력"
                  min={1}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#111827',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  납기요구일 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => handleChange('deliveryDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#111827',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#374151', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                특수조건 / 요구사항
              </label>
              <textarea
                value={form.specialConditions}
                onChange={(e) => handleChange('specialConditions', e.target.value)}
                placeholder="예) 방폭 환경 필요, 클린룸 등급 ISO 7, 고객사 특수 사양 적용 등"
                rows={4}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#111827',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              onClick={generateQuotation}
              disabled={isGenerating}
              style={{
                backgroundColor: isGenerating ? '#93c5fd' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 0',
                fontSize: 15,
                fontWeight: 700,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  AI 분석 중...
                </>
              ) : (
                'AI 견적 자동산출'
              )}
            </button>
          </div>
        </div>

        {/* 견적 결과 */}
        <div style={{ flex: '1 1 380px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result ? (
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                borderRadius: 10,
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>AI 견적 산출 결과</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>신뢰도</span>
                  <ConfidenceBadge value={result.confidence} />
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                산출일시: {result.generatedAt} &nbsp;|&nbsp; 모델: XGBoost/RF 앙상블 v2.4
              </div>

              {/* 비용 분류 테이블 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600, borderRadius: '4px 0 0 4px' }}>비용 항목</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>금액</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#6b7280', fontWeight: 600, borderRadius: '0 4px 4px 0' }}>비중</th>
                  </tr>
                </thead>
                <tbody>
                  {costRows.map((row, i) => (
                    <tr key={row.label} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{row.label}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#111827', fontFamily: 'monospace' }}>
                        {formatFull(row.amount)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: '#9ca3af' }}>
                        {row.ratio}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 총 견적금액 강조 */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                  borderRadius: 10,
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>총 견적금액</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>
                    {formatFull(result.total)}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                    ({formatKRW(result.total)})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>AI 신뢰도</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: result.confidence >= 93 ? '#6ee7b7' : result.confidence >= 88 ? '#fcd34d' : '#fca5a5' }}>
                    {result.confidence}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    border: '1px solid #2563eb',
                    borderRadius: 6,
                    background: '#fff',
                    color: '#2563eb',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  견적서 저장
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    border: 'none',
                    borderRadius: 6,
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  견적서 출력 (PDF)
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                borderRadius: 10,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: '#9ca3af',
                minHeight: 200,
              }}
            >
              <div style={{ fontSize: 36 }}>🤖</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>견적 입력 정보를 입력 후</div>
              <div style={{ fontSize: 13 }}>AI 견적 자동산출 버튼을 클릭하세요</div>
              <div style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>XGBoost/RF 앙상블 모델 기반 예측</div>
            </div>
          )}
        </div>
      </div>

      {/* AI 견적 이력 테이블 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: 10,
          padding: 24,
          marginTop: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>AI 견적 생성 이력 (최근 10건)</h2>
          <button
            style={{
              padding: '6px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: '#fff',
              color: '#6b7280',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            전체 이력 보기
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['견적번호', '생성일시', '제품유형', '견적금액', '신뢰도', '담당자', '상태'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 12,
                      color: '#6b7280',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY_DATA.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#2563eb', fontWeight: 600 }}>{row.id}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{row.generatedAt}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#111827' }}>{row.productType}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#111827', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    {formatKRW(row.amount)}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <ConfidenceBadge value={row.confidence} />
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{row.manager}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
