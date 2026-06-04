'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { Search, Filter, ChevronDown, ChevronUp, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '합격': { bg: '#dcfce7', color: '#16a34a' },
    '조건부합격': { bg: '#fff7ed', color: '#ea580c' },
    '불합격': { bg: '#fee2e2', color: '#dc2626' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{status}</span>
  );
}

function PageHeader({ title, section, action }: { title: string; section: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

const INSPECTIONS = [
  { id: 'IR-2026-0482', date: '2026-06-04', product: '자동화 용접라인', type: '완제품검사', inspector: '김품질', qty: 2, pass: 2, fail: 0, passRate: 100, status: '합격' },
  { id: 'IR-2026-0481', date: '2026-06-04', product: 'PLC 제어반', type: '공정검사', inspector: '이검사', qty: 5, pass: 4, fail: 1, passRate: 80, status: '조건부합격' },
  { id: 'IR-2026-0480', date: '2026-06-03', product: '컨베이어 시스템', type: '수입검사', inspector: '박품질', qty: 10, pass: 9, fail: 1, passRate: 90, status: '조건부합격' },
  { id: 'IR-2026-0479', date: '2026-06-03', product: '협동로봇', type: '완제품검사', inspector: '최검사', qty: 3, pass: 3, fail: 0, passRate: 100, status: '합격' },
  { id: 'IR-2026-0478', date: '2026-06-02', product: '비전검사장비', type: '공정검사', inspector: '김품질', qty: 4, pass: 2, fail: 2, passRate: 50, status: '불합격' },
  { id: 'IR-2026-0477', date: '2026-06-02', product: '유압프레스', type: '수입검사', inspector: '이검사', qty: 6, pass: 6, fail: 0, passRate: 100, status: '합격' },
  { id: 'IR-2026-0476', date: '2026-06-01', product: '자동화 용접라인', type: '공정검사', inspector: '정품질', qty: 2, pass: 2, fail: 0, passRate: 100, status: '합격' },
  { id: 'IR-2026-0475', date: '2026-06-01', product: 'PLC 제어반', type: '완제품검사', inspector: '박품질', qty: 3, pass: 3, fail: 0, passRate: 100, status: '합격' },
];

const TREND = [
  { date: '5/22', passRate: 97.2 }, { date: '5/23', passRate: 95.1 }, { date: '5/24', passRate: 98.3 },
  { date: '5/25', passRate: 96.8 }, { date: '5/26', passRate: 99.1 }, { date: '5/27', passRate: 94.5 },
  { date: '5/28', passRate: 97.8 }, { date: '5/29', passRate: 96.2 }, { date: '5/30', passRate: 98.5 },
  { date: '5/31', passRate: 95.3 }, { date: '6/1', passRate: 100 }, { date: '6/2', passRate: 83.3 },
  { date: '6/3', passRate: 95.0 }, { date: '6/4', passRate: 86.7 },
];

const BY_PRODUCT = [
  { product: '자동화 용접라인', total: 24, pass: 23, fail: 1, passRate: 95.8 },
  { product: 'PLC 제어반', total: 32, pass: 29, fail: 3, passRate: 90.6 },
  { product: '컨베이어', total: 18, pass: 17, fail: 1, passRate: 94.4 },
  { product: '협동로봇', total: 15, pass: 15, fail: 0, passRate: 100 },
  { product: '비전검사장비', total: 12, pass: 8, fail: 4, passRate: 66.7 },
];

const PIE_DATA = [
  { name: '완제품검사', value: 18 },
  { name: '공정검사', value: 22 },
  { name: '수입검사', value: 8 },
];
const PIE_COLORS = ['#2563eb', '#7c3aed', '#0891b2'];

const FAIL_DETAILS: Record<string, { item: string; defect: string; action: string }[]> = {
  'IR-2026-0481': [
    { item: '제어반 #3', defect: '접지불량', action: '재작업 후 재검사 예정' },
  ],
  'IR-2026-0480': [
    { item: '컨베이어 벨트 #7', defect: '치수 미달', action: '공급사 반품 처리 중' },
  ],
  'IR-2026-0478': [
    { item: '카메라 모듈 A', defect: '초점 불량', action: '교체 요청' },
    { item: '조명 유닛 B', defect: '밝기 편차 초과', action: '조정 후 재검사' },
  ],
};

const INSPECTION_TYPES = ['전체', '완제품검사', '공정검사', '수입검사'];
const STATUS_OPTIONS = ['전체', '합격', '조건부합격', '불합격'];

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  passRate?: number;
}

function CustomBarShape(props: BarShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, passRate = 0 } = props;
  const color = passRate >= 95 ? '#16a34a' : '#dc2626';
  return <rect x={x} y={y} width={width} height={height} fill={color} rx={3} />;
}

export default function InspectionResultsPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-04');
  const [typeFilter, setTypeFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = INSPECTIONS.filter(r => {
    if (typeFilter !== '전체' && r.type !== typeFilter) return false;
    if (statusFilter !== '전체' && r.status !== statusFilter) return false;
    if (r.date < dateFrom || r.date > dateTo) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="검사실적 조회 및 통계"
          section="품질관리 > 검사실적"
          action={
            <button
              className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: '#2563eb' }}
            >
              <FileText size={15} />
              보고서 내보내기
            </button>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard label="이번달 검사" value="48건" sub="2026년 6월" />
          <KpiCard label="합격" value="43건" sub="합격률 89.6%" color="#16a34a" />
          <KpiCard label="불합격/조건부" value="5건" sub="이번달 누계" color="#dc2626" />
          <KpiCard label="평균 합격률" value="91.2%" sub="목표 95%" color="#2563eb" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 w-fit" style={{ border: '1px solid #e5e7eb' }}>
          {(['history', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-md text-sm font-medium transition-colors"
              style={activeTab === tab
                ? { backgroundColor: '#2563eb', color: '#fff' }
                : { color: '#6b7280', backgroundColor: 'transparent' }}
            >
              {tab === 'history' ? '검사 이력' : '통계 분석'}
            </button>
          ))}
        </div>

        {/* Tab 1: 검사 이력 */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium">기간</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid #d1d5db', color: '#374151' }}
                />
                <span className="text-gray-400 text-sm">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid #d1d5db', color: '#374151' }}
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid #d1d5db', color: '#374151' }}
              >
                {INSPECTION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid #d1d5db', color: '#374151' }}
              >
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <button
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid #d1d5db', color: '#374151' }}
              >
                <Search size={14} />
                조회
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['검사번호', '검사일', '제품명', '검사유형', '검사자', '검사수량', '합격', '불합격', '합격률', '결과', '상세'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const isLowPass = row.passRate < 80;
                    const isExpanded = expandedRow === row.id;
                    const details = FAIL_DETAILS[row.id];
                    return (
                      <React.Fragment key={row.id}>
                        <tr
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            backgroundColor: isLowPass ? '#fff5f5' : 'transparent',
                          }}
                        >
                          <td className="py-3 px-3 font-mono text-xs" style={{ color: '#2563eb' }}>{row.id}</td>
                          <td className="py-3 px-3 text-gray-600">{row.date}</td>
                          <td className="py-3 px-3 font-medium" style={{ color: '#1e3a5f' }}>{row.product}</td>
                          <td className="py-3 px-3 text-gray-600">{row.type}</td>
                          <td className="py-3 px-3 text-gray-600">{row.inspector}</td>
                          <td className="py-3 px-3 text-center font-medium text-gray-700">{row.qty}</td>
                          <td className="py-3 px-3 text-center font-medium" style={{ color: '#16a34a' }}>{row.pass}</td>
                          <td className="py-3 px-3 text-center font-medium" style={{ color: row.fail > 0 ? '#dc2626' : '#6b7280' }}>{row.fail}</td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className="text-xs font-bold"
                              style={{ color: row.passRate >= 95 ? '#16a34a' : row.passRate >= 80 ? '#ea580c' : '#dc2626' }}
                            >
                              {row.passRate}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="py-3 px-3">
                            {details ? (
                              <button
                                onClick={() => toggleExpand(row.id)}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                                style={{ border: '1px solid #e5e7eb', color: '#2563eb' }}
                              >
                                상세 {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && details && (
                          <tr style={{ backgroundColor: '#fef2f2' }}>
                            <td colSpan={11} className="px-6 py-3">
                              <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                                <AlertCircle size={13} />
                                불합격 항목 상세
                              </div>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr>
                                    <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-1/4">항목</th>
                                    <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-1/3">불량 내용</th>
                                    <th className="text-left py-1.5 px-2 text-gray-500 font-medium">조치사항</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {details.map((d, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid #fecaca' }}>
                                      <td className="py-1.5 px-2 font-medium text-gray-700">{d.item}</td>
                                      <td className="py-1.5 px-2 text-red-600 font-medium">{d.defect}</td>
                                      <td className="py-1.5 px-2 text-gray-600">{d.action}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">조건에 맞는 검사실적이 없습니다.</div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400">
              총 {filtered.length}건 조회됨
            </div>
          </div>
        )}

        {/* Tab 2: 통계 분석 */}
        {activeTab === 'stats' && (
          <div className="space-y-5">
            {/* 합격률 트렌드 */}
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold" style={{ color: '#1e3a5f' }}>합격률 트렌드 (최근 14일)</h2>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-4 h-0.5 bg-blue-600 rounded" />
                    실제 합격률
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-4 h-0.5 bg-red-400 rounded" style={{ borderTop: '2px dashed #f87171' }} />
                    목표 95%
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={TREND} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
                  <Tooltip
                    formatter={(v) => [`${v}%`, '합격률']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <ReferenceLine y={95} stroke="#f87171" strokeDasharray="5 5" label={{ value: '목표 95%', position: 'right', fontSize: 10, fill: '#f87171' }} />
                  <Line
                    type="monotone"
                    dataKey="passRate"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const color = payload.passRate >= 95 ? '#16a34a' : '#dc2626';
                      return <circle key={`dot-${props.index}`} cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />;
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 제품별 합격률 */}
              <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold" style={{ color: '#1e3a5f' }}>제품별 합격률</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-600" />95% 이상</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-600" />95% 미만</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={BY_PRODUCT} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
                    <YAxis type="category" dataKey="product" tick={{ fontSize: 11, fill: '#374151' }} width={90} />
                    <Tooltip
                      formatter={(v) => [`${v}%`, '합격률']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <ReferenceLine x={95} stroke="#f87171" strokeDasharray="4 4" />
                    <Bar dataKey="passRate" radius={[0, 3, 3, 0]}>
                      {BY_PRODUCT.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.passRate >= 95 ? '#16a34a' : '#dc2626'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1">
                  {BY_PRODUCT.map(p => (
                    <div key={p.product} className="flex items-center justify-between text-xs text-gray-500">
                      <span>{p.product}</span>
                      <span className="text-gray-400">{p.total}건 중 합격 {p.pass}건</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 검사유형별 PieChart */}
              <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <h2 className="text-sm font-bold mb-4" style={{ color: '#1e3a5f' }}>검사유형별 건수</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}`}
                      labelLine={true}
                    >
                      {PIE_DATA.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${v}건`, '건수']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {PIE_DATA.map((d, i) => (
                    <div key={d.name} className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: `${PIE_COLORS[i]}15` }}>
                      <div className="text-lg font-bold" style={{ color: PIE_COLORS[i] }}>{d.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{d.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 요약 인사이트 */}
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h2 className="text-sm font-bold mb-3" style={{ color: '#1e3a5f' }}>품질 인사이트</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <XCircle size={18} color="#dc2626" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">주의 필요</p>
                    <p className="text-xs text-red-600 mt-0.5">비전검사장비 합격률 66.7% — 목표 대비 28.3%p 미달</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <AlertCircle size={18} color="#ea580c" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-700">모니터링</p>
                    <p className="text-xs text-orange-600 mt-0.5">6월 4일 합격률 86.7% — 최근 3일 하락 추세</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <CheckCircle size={18} color="#16a34a" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">우수</p>
                    <p className="text-xs text-green-600 mt-0.5">협동로봇 합격률 100% — 15건 연속 합격 유지</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
