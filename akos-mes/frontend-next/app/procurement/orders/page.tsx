'use client';

import { useState } from 'react';

interface Order {
  id: string;
  materialCode: string;
  materialName: string;
  supplier: string;
  quantity: number;
  amount: number;
  orderDate: string;
  dueDate: string;
  leadTime: number;
  status: '발주완료' | '납품대기' | '지연' | '취소';
  project: string;
  delayRisk: boolean;
}

const mockOrders: Order[] = [
  { id: 'PO-2024-001', materialCode: 'M-1001', materialName: 'SMPS 전원모듈 24V', supplier: '한국전력전자', quantity: 50, amount: 12500000, orderDate: '2024-05-10', dueDate: '2024-06-15', leadTime: 36, status: '납품대기', project: '스마트공장A', delayRisk: false },
  { id: 'PO-2024-002', materialCode: 'M-1042', materialName: 'PLC 컨트롤러 (지멘스)', supplier: '지멘스코리아', quantity: 10, amount: 48000000, orderDate: '2024-04-20', dueDate: '2024-06-10', leadTime: 51, status: '지연', project: '스마트공장B', delayRisk: true },
  { id: 'PO-2024-003', materialCode: 'M-2003', materialName: '산업용 터치패널 15인치', supplier: '프로페이스', quantity: 20, amount: 18000000, orderDate: '2024-05-15', dueDate: '2024-06-25', leadTime: 41, status: '발주완료', project: '스마트공장A', delayRisk: false },
  { id: 'PO-2024-004', materialCode: 'M-3011', materialName: '서보모터 750W', supplier: '파나소닉', quantity: 30, amount: 27000000, orderDate: '2024-05-01', dueDate: '2024-06-08', leadTime: 38, status: '지연', project: '스마트공장C', delayRisk: true },
  { id: 'PO-2024-005', materialCode: 'M-1088', materialName: '인버터 드라이브 3.7kW', supplier: '엘에스일렉트릭', quantity: 15, amount: 9750000, orderDate: '2024-05-20', dueDate: '2024-07-01', leadTime: 42, status: '발주완료', project: '스마트공장B', delayRisk: false },
  { id: 'PO-2024-006', materialCode: 'M-4022', materialName: '비전카메라 5MP', supplier: '바슬러', quantity: 8, amount: 32000000, orderDate: '2024-04-15', dueDate: '2024-06-12', leadTime: 58, status: '납품대기', project: '스마트공장A', delayRisk: true },
  { id: 'PO-2024-007', materialCode: 'M-2055', materialName: '안전 PLC 모듈', supplier: '필즈', quantity: 5, amount: 21500000, orderDate: '2024-05-25', dueDate: '2024-07-10', leadTime: 46, status: '발주완료', project: '스마트공장C', delayRisk: false },
  { id: 'PO-2024-008', materialCode: 'M-3044', materialName: '공압 솔레노이드 밸브', supplier: 'SMC코리아', quantity: 100, amount: 5800000, orderDate: '2024-05-28', dueDate: '2024-06-20', leadTime: 23, status: '발주완료', project: '스마트공장B', delayRisk: false },
  { id: 'PO-2024-009', materialCode: 'M-1099', materialName: 'HMI 소프트웨어 라이선스', supplier: '인텍전기전자', quantity: 3, amount: 7200000, orderDate: '2024-03-10', dueDate: '2024-05-30', leadTime: 81, status: '취소', project: '스마트공장A', delayRisk: false },
  { id: 'PO-2024-010', materialCode: 'M-5001', materialName: '산업용 이더넷 스위치', supplier: '모사', quantity: 12, amount: 8400000, orderDate: '2024-05-18', dueDate: '2024-06-28', leadTime: 41, status: '납품대기', project: '스마트공장C', delayRisk: false },
];

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      borderRadius: 10,
      padding: '20px 24px',
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], { bg: string; color: string }> = {
    '발주완료': { bg: '#dcfce7', color: '#15803d' },
    '납품대기': { bg: '#dbeafe', color: '#1d4ed8' },
    '지연':     { bg: '#fee2e2', color: '#dc2626' },
    '취소':     { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status];
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>{status}</span>
  );
}

const PROJECTS = ['전체', '스마트공장A', '스마트공장B', '스마트공장C'];
const STATUS_OPTIONS: ('전체' | Order['status'])[] = ['전체', '발주완료', '납품대기', '지연', '취소'];

export default function ProcurementOrdersPage() {
  const [projectFilter, setProjectFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState<'전체' | Order['status']>('전체');
  const [delayOnly, setDelayOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    materialCode: '',
    materialName: '',
    supplier: '',
    quantity: '',
    amount: '',
    dueDate: '',
    project: '스마트공장A',
  });
  const [submitted, setSubmitted] = useState(false);

  const filtered = mockOrders.filter(o => {
    if (projectFilter !== '전체' && o.project !== projectFilter) return false;
    if (statusFilter !== '전체' && o.status !== statusFilter) return false;
    if (delayOnly && !o.delayRisk) return false;
    return true;
  });

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setForm({ materialCode: '', materialName: '', supplier: '', quantity: '', amount: '', dueDate: '', project: '스마트공장A' });
    }, 1800);
  }

  return (
    <div style={{ padding: '28px 32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Pretendard, Apple SD Gothic Neo, sans-serif' }}>

      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>구매조달관리</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>발주관리</h1>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>BOM 기반 발주 대상 자재 확인 및 발주 진행 상태 관리 — 장기납기 품목 우선 관리</div>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <KpiCard label="발주 진행 중" value="23건" sub="검토 포함" color="#1e3a5f" />
        <KpiCard label="입고 대기" value="8건" sub="납품 확인 필요" color="#2563eb" />
        <KpiCard label="납기 지연 위험" value="3건" sub="즉시 조치 필요" color="#dc2626" />
        <KpiCard label="이번달 발주금액" value="₩4.2억" sub="2024년 6월" color="#059669" />
      </div>

      {/* 필터 + 발주 등록 버튼 */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>프로젝트</label>
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#374151', background: '#fff' }}
          >
            {PROJECTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>발주상태</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#374151', background: '#fff' }}
          >
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={delayOnly}
            onChange={e => setDelayOnly(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: '#dc2626' }}
          />
          납기위험만 보기
        </label>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> 발주 등록
          </button>
        </div>
      </div>

      {/* Expandable 발주 등록 폼 */}
      {showForm && (
        <div style={{
          background: '#fff',
          border: '1px solid #bfdbfe',
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e3a5f', margin: '0 0 16px 0' }}>신규 발주 등록</h3>
          {submitted ? (
            <div style={{ textAlign: 'center', color: '#059669', fontWeight: 700, fontSize: 15, padding: '16px 0' }}>
              발주가 성공적으로 등록되었습니다.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {[
                  { label: '자재코드', name: 'materialCode', placeholder: 'M-XXXX' },
                  { label: '자재명', name: 'materialName', placeholder: '자재명 입력' },
                  { label: '공급사', name: 'supplier', placeholder: '공급사명' },
                  { label: '발주수량', name: 'quantity', placeholder: '수량', type: 'number' },
                  { label: '발주금액(원)', name: 'amount', placeholder: '금액', type: 'number' },
                  { label: '납기예정일', name: 'dueDate', placeholder: '', type: 'date' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>{f.label}</label>
                    <input
                      name={f.name}
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={(form as Record<string, string>)[f.name]}
                      onChange={handleFormChange}
                      required
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '7px 10px', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 600 }}>프로젝트</label>
                  <select
                    name="project"
                    value={form.project}
                    onChange={handleFormChange}
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '7px 10px', fontSize: 13, background: '#fff' }}
                  >
                    {PROJECTS.filter(p => p !== '전체').map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  등록
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 7, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 발주 테이블 */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>발주 목록</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length}건 표시</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['발주번호', '자재코드', '자재명', '공급사', '발주수량', '발주금액', '발주일', '납기예정일', '리드타임', '상태'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr
                  key={o.id}
                  style={{
                    background: o.delayRisk ? '#fff7f7' : (i % 2 === 0 ? '#fff' : '#fafafa'),
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = o.delayRisk ? '#fff7f7' : (i % 2 === 0 ? '#fff' : '#fafafa'))}
                >
                  <td style={{ padding: '10px 14px', color: '#2563eb', fontWeight: 600, whiteSpace: 'nowrap' }}>{o.id}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{o.materialCode}</td>
                  <td style={{ padding: '10px 14px', color: '#111827', fontWeight: 500 }}>{o.materialName}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{o.supplier}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', textAlign: 'right', whiteSpace: 'nowrap' }}>{o.quantity.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', color: '#374151', textAlign: 'right', whiteSpace: 'nowrap' }}>₩{(o.amount / 10000).toLocaleString()}만</td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{o.orderDate}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: o.delayRisk ? '#dc2626' : '#374151', fontWeight: o.delayRisk ? 700 : 400 }}>
                      {o.dueDate} {o.delayRisk && '⚠'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: o.leadTime >= 50 ? '#dc2626' : '#374151', fontWeight: o.leadTime >= 50 ? 700 : 400, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {o.leadTime}일
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                    조건에 맞는 발주 건이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 푸터 요약 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', background: '#f8fafc', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {(['발주완료', '납품대기', '지연', '취소'] as Order['status'][]).map(s => {
            const count = filtered.filter(o => o.status === s).length;
            return (
              <span key={s} style={{ fontSize: 12, color: '#6b7280' }}>
                <StatusBadge status={s} /> <span style={{ marginLeft: 6 }}>{count}건</span>
              </span>
            );
          })}
          <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>
            합계 발주금액: ₩{(filtered.reduce((a, o) => a + o.amount, 0) / 100000000).toFixed(1)}억
          </span>
        </div>
      </div>
    </div>
  );
}
