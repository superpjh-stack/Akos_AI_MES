'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Activity, TrendingUp, Download, RefreshCw } from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, Scatter, BarChart, Cell,
} from 'recharts';

// ─── Inline sub-components ───────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '적합': { bg: '#dcfce7', color: '#16a34a' },
    '요주의': { bg: '#fef9c3', color: '#b45309' },
    '부적합': { bg: '#fee2e2', color: '#dc2626' },
    '조치완료': { bg: '#dcfce7', color: '#16a34a' },
    '조치중': { bg: '#dbeafe', color: '#2563eb' },
    '대기중': { bg: '#fef9c3', color: '#b45309' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}>{status}</span>
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const XBAR_DATA = [
  { group: 1,  xbar: 50.2, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 2,  xbar: 49.8, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 3,  xbar: 50.5, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 4,  xbar: 51.8, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 5,  xbar: 49.1, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 6,  xbar: 50.3, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 7,  xbar: 52.4, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 8,  xbar: 50.1, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 9,  xbar: 49.7, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 10, xbar: 50.8, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 11, xbar: 49.5, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 12, xbar: 50.2, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 13, xbar: 51.1, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 14, xbar: 50.4, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 15, xbar: 49.9, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 16, xbar: 50.6, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 17, xbar: 51.5, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 18, xbar: 50.0, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 19, xbar: 49.3, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 20, xbar: 50.7, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 21, xbar: 47.2, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 22, xbar: 50.1, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 23, xbar: 50.9, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 24, xbar: 49.6, ucl: 52.1, lcl: 47.9, cl: 50.0 },
  { group: 25, xbar: 50.3, ucl: 52.1, lcl: 47.9, cl: 50.0 },
];

// Annotate out-of-control points for custom dot rendering
const XBAR_CHART_DATA = XBAR_DATA.map(d => ({
  ...d,
  outOfControl: d.xbar > d.ucl || d.xbar < d.lcl,
  // Separate series for out-of-control scatter
  ooXbar: d.xbar > d.ucl || d.xbar < d.lcl ? d.xbar : null,
}));

const CAPABILITY = [
  { product: '자동화 용접라인',  characteristic: '전장(mm)',       nominal: 500,   usl: 500.5, lsl: 499.5, mean: 500.08, std: 0.15,  cp: 1.11,  cpk: 1.04, status: '적합'  },
  { product: 'PLC 제어반',       characteristic: '절연저항(MΩ)',   nominal: 100,   usl: null,  lsl: 10,    mean: 87.3,   std: 12.4,  cp: null,  cpk: 2.09, status: '적합'  },
  { product: '컨베이어',          characteristic: '벨트장력(N)',    nominal: 500,   usl: 550,   lsl: 450,   mean: 498.2,  std: 18.6,  cp: 0.90,  cpk: 0.88, status: '요주의' },
  { product: '협동로봇',          characteristic: '반복정도(mm)',   nominal: 0,     usl: 0.05,  lsl: 0,     mean: 0.021,  std: 0.008, cp: 1.04,  cpk: 1.21, status: '적합'  },
  { product: '비전검사장비',      characteristic: '측정정도(μm)',   nominal: 5,     usl: 7,     lsl: 3,     mean: 5.3,    std: 0.9,   cp: 0.74,  cpk: 0.63, status: '부적합' },
];

const ANOMALY_HISTORY = [
  { id: 1, datetime: '2026-06-04 09:12', process: '자동화 용접라인', characteristic: '전장(mm)',     measured: 52.4, limit: 'UCL=52.1', type: 'UCL 초과', action: '작업자 경보 발령 / 원인 분석 지시', statusBadge: '조치완료' },
  { id: 2, datetime: '2026-06-03 14:38', process: '자동화 용접라인', characteristic: '전장(mm)',     measured: 47.2, limit: 'LCL=47.9', type: 'LCL 미달', action: '라인 일시 정지 / 치공구 점검',        statusBadge: '조치완료' },
  { id: 3, datetime: '2026-06-02 11:05', process: '컨베이어',         characteristic: '벨트장력(N)', measured: 412.5, limit: 'LCL=450', type: 'LCL 미달', action: '장력 재조정 / 예방보전 예약',         statusBadge: '조치완료' },
  { id: 4, datetime: '2026-06-01 16:22', process: '비전검사장비',     characteristic: '측정정도(μm)', measured: 8.1,  limit: 'USL=7.0',  type: 'UCL 초과', action: '교정 일정 검토 중',                  statusBadge: '조치중'   },
  { id: 5, datetime: '2026-05-31 08:47', process: 'PLC 제어반',       characteristic: '절연저항(MΩ)', measured: 8.3,  limit: 'LSL=10.0', type: 'LCL 미달', action: '절연 상태 정밀 점검 대기',           statusBadge: '대기중'   },
];

const PRODUCT_OPTIONS = [
  { label: '자동화 용접라인 — 전장(mm)', value: '0' },
  { label: 'PLC 제어반 — 절연저항(MΩ)', value: '1' },
  { label: '컨베이어 — 벨트장력(N)',     value: '2' },
  { label: '협동로봇 — 반복정도(mm)',    value: '3' },
  { label: '비전검사장비 — 측정정도(μm)', value: '4' },
];

// ─── Custom dot for X-bar line ────────────────────────────────────────────────

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: { outOfControl?: boolean };
}

function CustomXbarDot(props: DotProps) {
  const { cx = 0, cy = 0, payload } = props;
  if (payload?.outOfControl) {
    return <circle cx={cx} cy={cy} r={6} fill="#dc2626" stroke="#fff" strokeWidth={2} />;
  }
  return <circle cx={cx} cy={cy} r={3} fill="#2563eb" stroke="#fff" strokeWidth={1} />;
}

// ─── Cpk color helper ─────────────────────────────────────────────────────────

function cpkColor(cpk: number | null): string {
  if (cpk === null) return '#6b7280';
  if (cpk >= 1.33) return '#16a34a';
  if (cpk >= 1.0)  return '#d97706';
  return '#dc2626';
}

// ─── Tab 1: X-bar 관리도 ─────────────────────────────────────────────────────

function XbarTab() {
  const [selected, setSelected] = useState('0');
  const outPoints = XBAR_DATA.filter(d => d.xbar > d.ucl || d.xbar < d.lcl);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600 font-medium">공정 / 특성치</label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {PRODUCT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Chart card */}
      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">X-bar 관리도</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="inline-block w-5 border-t-2 border-dashed border-red-500" /> UCL / LCL</span>
            <span className="flex items-center gap-1"><span className="inline-block w-5 border-t-2 border-dashed border-green-600" /> 중심선(CL)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-500" /> 이상점</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={XBAR_CHART_DATA} margin={{ top: 10, right: 24, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="group" label={{ value: '부분군', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#9ca3af' }} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis domain={[46, 54]} tickCount={7} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6 }}
              formatter={(v: unknown, name: unknown) => [(v as number).toFixed(2), name === 'xbar' ? 'X-bar' : String(name)]}
            />
            {/* Control limit reference lines */}
            <ReferenceLine y={52.1} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5}
              label={{ value: 'UCL 52.1', position: 'right', fontSize: 10, fill: '#ef4444' }} />
            <ReferenceLine y={50.0} stroke="#16a34a" strokeDasharray="6 3" strokeWidth={1.5}
              label={{ value: 'CL 50.0', position: 'right', fontSize: 10, fill: '#16a34a' }} />
            <ReferenceLine y={47.9} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5}
              label={{ value: 'LCL 47.9', position: 'right', fontSize: 10, fill: '#ef4444' }} />
            {/* Main X-bar line */}
            <Line
              type="monotone"
              dataKey="xbar"
              stroke="#2563eb"
              strokeWidth={2}
              dot={<CustomXbarDot />}
              activeDot={{ r: 5, fill: '#2563eb' }}
              name="X-bar"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary bar */}
        <div className="mt-4 flex flex-wrap items-center gap-4 px-2 py-3 rounded-md text-sm"
          style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <span className="text-gray-500">UCL = <strong className="text-red-600">52.1</strong></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">CL = <strong style={{ color: '#1e3a5f' }}>50.0</strong></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">LCL = <strong className="text-red-600">47.9</strong></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">부분군 수 = <strong style={{ color: '#1e3a5f' }}>25</strong></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">이상점 = <strong className="text-red-600">{outPoints.length}개</strong></span>
        </div>
      </div>

      {/* Alarm cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 flex items-start gap-3"
          style={{ border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(220,38,38,0.08)' }}>
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">UCL 초과 — 부분군 #7</p>
            <p className="text-xs text-gray-500 mt-0.5">X-bar = 52.4 &gt; UCL 52.1 (+0.3 초과)</p>
            <p className="text-xs text-gray-400 mt-1">판정: 관리 이탈 / 특수원인 조사 필요</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 flex items-start gap-3"
          style={{ border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(220,38,38,0.08)' }}>
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">LCL 미달 — 부분군 #21</p>
            <p className="text-xs text-gray-500 mt-0.5">X-bar = 47.2 &lt; LCL 47.9 (−0.7 미달)</p>
            <p className="text-xs text-gray-400 mt-1">판정: 관리 이탈 / 특수원인 조사 필요</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: 공정능력 분석 ─────────────────────────────────────────────────────

const CPK_BAR_DATA = CAPABILITY.map(c => ({ name: c.product.replace('자동화 ', ''), cpk: c.cpk }));

function CapabilityTab() {
  return (
    <div className="space-y-5">
      {/* Cpk bar chart */}
      <div className="bg-white rounded-lg p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Cpk 비교</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={CPK_BAR_DATA} layout="vertical" margin={{ top: 4, right: 80, bottom: 4, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" domain={[0, 2.5]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#374151' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6 }}
              formatter={(v: unknown) => [(v as number)?.toFixed(2) ?? '—', 'Cpk']}
            />
            <ReferenceLine x={1.33} stroke="#16a34a" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: '1.33', position: 'top', fontSize: 10, fill: '#16a34a' }} />
            <ReferenceLine x={1.0}  stroke="#d97706" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: '1.00', position: 'top', fontSize: 10, fill: '#d97706' }} />
            <Bar dataKey="cpk" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {CPK_BAR_DATA.map((entry, i) => (
                <Cell key={i} fill={cpkColor(entry.cpk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-2 text-xs text-gray-400 justify-end">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-600" /> Cpk ≥ 1.33 (우수)</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-500" /> 1.00 ≤ Cpk &lt; 1.33 (적합)</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Cpk &lt; 1.00 (부적합)</span>
        </div>
      </div>

      {/* Capability table */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <h2 className="text-base font-semibold text-gray-800">공정능력 지수 현황</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {['제품', '특성치', '규격 (USL ~ LSL)', '평균', '표준편차', 'Cp', 'Cpk', '판정'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITY.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.product}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.characteristic}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {row.usl != null ? row.usl : '—'} ~ {row.lsl != null ? row.lsl : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 tabular-nums">{row.mean}</td>
                  <td className="px-4 py-3 text-gray-700 tabular-nums">{row.std}</td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: row.cp != null ? cpkColor(row.cp) : '#9ca3af' }}>
                    <span className="font-semibold">{row.cp != null ? row.cp.toFixed(2) : '—'}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className="font-bold text-base" style={{ color: cpkColor(row.cpk) }}>{row.cpk.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: 이상점 이력 ───────────────────────────────────────────────────────

function AnomalyTab() {
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <h2 className="text-base font-semibold text-gray-800">이상점 발생 이력</h2>
        <span className="text-xs text-gray-400">최근 5건</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['발생일시', '공정', '특성치', '측정값', '관리한계', '이상유형', '조치내용', '처리상태'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANOMALY_HISTORY.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: '1px solid #f3f4f6' }}>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap tabular-nums">{row.datetime}</td>
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.process}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.characteristic}</td>
                <td className="px-4 py-3 tabular-nums font-semibold text-red-600">{row.measured}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.limit}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={row.type.includes('UCL') || row.type.includes('초과')
                      ? { backgroundColor: '#fee2e2', color: '#dc2626' }
                      : { backgroundColor: '#fef9c3', color: '#b45309' }}>
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs">{row.action}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={row.statusBadge} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ['X-bar 관리도', '공정능력 분석', '이상점 이력'] as const;
type Tab = typeof TABS[number];

export default function SPCPage() {
  const [tab, setTab] = useState<Tab>('X-bar 관리도');

  return (
    <div className="space-y-6">
      <PageHeader
        title="SPC 분석"
        section="품질관리"
        action={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              <RefreshCw size={14} /> 새로고침
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              <Download size={14} /> 리포트
            </button>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="관리 공정" value="5개" sub="전체 등록 공정" />
        <KpiCard label="공정이상 경보" value="2건" sub="오늘 발생" color="#dc2626" />
        <KpiCard label="Cpk ≥ 1.33" value="2개" sub="우수 공정" color="#16a34a" />
        <KpiCard label="Cpk < 1.00" value="1개" sub="개선 필요" color="#d97706" />
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 mb-5 border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={tab === t
                ? { color: '#2563eb', borderBottom: '2px solid #2563eb', marginBottom: -1 }
                : { color: '#6b7280' }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'X-bar 관리도'   && <XbarTab />}
        {tab === '공정능력 분석'  && <CapabilityTab />}
        {tab === '이상점 이력'    && <AnomalyTab />}
      </div>
    </div>
  );
}
