'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Plus, Search, Filter, Calendar, BarChart2, List, X, ChevronDown } from 'lucide-react';

// ─── 인라인 컴포넌트 ────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div
      className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '진행중': { bg: '#dbeafe', color: '#1d4ed8' },
    '완료': { bg: '#dcfce7', color: '#16a34a' },
    '지연': { bg: '#fee2e2', color: '#dc2626' },
    '계획': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '긴급': { bg: '#fee2e2', color: '#dc2626' },
    '높음': { bg: '#ffedd5', color: '#ea580c' },
    '일반': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[priority] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {priority}
    </span>
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

// ─── 목업 데이터 ────────────────────────────────────────────────────────────

const PLANS = [
  { id: 'PP-2026-0162', orderId: 'ORD-2026-0041', product: '자동화 용접라인 시스템', customer: '(주)현대모비스', qty: 2, startDate: '2026-06-10', endDate: '2026-06-28', lines: ['라인 A', '라인 B'], priority: '긴급', status: '진행중', progress: 35 },
  { id: 'PP-2026-0161', orderId: 'ORD-2026-0038', product: 'PLC 제어반 (표준형) × 5', customer: '삼성전자(주)', qty: 5, startDate: '2026-06-05', endDate: '2026-06-20', lines: ['라인 B'], priority: '높음', status: '진행중', progress: 68 },
  { id: 'PP-2026-0160', orderId: 'ORD-2026-0035', product: '스마트 물류 컨베이어', customer: 'LG전자(주)', qty: 1, startDate: '2026-05-28', endDate: '2026-06-15', lines: ['라인 C', '라인 D'], priority: '일반', status: '완료', progress: 100 },
  { id: 'PP-2026-0159', orderId: 'ORD-2026-0042', product: '협동로봇 그리퍼 유닛', customer: '현대자동차(주)', qty: 10, startDate: '2026-06-15', endDate: '2026-07-05', lines: ['라인 A'], priority: '일반', status: '계획', progress: 0 },
  { id: 'PP-2026-0158', orderId: 'ORD-2026-0040', product: '배터리팩 조립라인 모듈', customer: '(주)포스코', qty: 3, startDate: '2026-06-08', endDate: '2026-06-25', lines: ['라인 D'], priority: '높음', status: '지연', progress: 42 },
  { id: 'PP-2026-0157', orderId: 'ORD-2026-0036', product: '비전검사 시스템', customer: 'SK하이닉스(주)', qty: 2, startDate: '2026-06-01', endDate: '2026-06-18', lines: ['라인 B', '라인 C'], priority: '일반', status: '완료', progress: 100 },
];

const LINE_LOAD_DATA = [
  { date: '6/1', 라인A: 72, 라인B: 85, 라인C: 60, 라인D: 45 },
  { date: '6/2', 라인A: 78, 라인B: 90, 라인C: 65, 라인D: 50 },
  { date: '6/3', 라인A: 82, 라인B: 88, 라인C: 70, 라인D: 55 },
  { date: '6/4', 라인A: 75, 라인B: 92, 라인C: 68, 라인D: 60 },
  { date: '6/5', 라인A: 80, 라인B: 87, 라인C: 72, 라인D: 58 },
  { date: '6/6', 라인A: 85, 라인B: 83, 라인C: 75, 라인D: 62 },
  { date: '6/7', 라인A: 88, 라인B: 79, 라인C: 78, 라인D: 65 },
];

const LINE_CAPACITY = [
  { line: '라인 A', capacity: 480, planned: 396, utilization: 82.5 },
  { line: '라인 B', capacity: 480, planned: 420, utilization: 87.5 },
  { line: '라인 C', capacity: 480, planned: 336, utilization: 70.0 },
  { line: '라인 D', capacity: 480, planned: 276, utilization: 57.5 },
];

const LINE_OPTIONS = ['라인 A', '라인 B', '라인 C', '라인 D'];

// ─── Gantt 헬퍼 ─────────────────────────────────────────────────────────────

const GANTT_START = new Date('2026-06-01');
const GANTT_END = new Date('2026-06-30');
const GANTT_TOTAL_DAYS = 30;

function dateToOffset(dateStr: string): number {
  const d = new Date(dateStr);
  const diff = (d.getTime() - GANTT_START.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.min(diff, GANTT_TOTAL_DAYS));
}

function dateToDuration(startStr: string, endStr: string): number {
  const s = Math.max(0, dateToOffset(startStr));
  const e = Math.min(GANTT_TOTAL_DAYS, dateToOffset(endStr));
  return Math.max(0, e - s);
}

function ganttBarColor(status: string): string {
  const map: Record<string, string> = {
    '완료': '#16a34a',
    '진행중': '#2563eb',
    '지연': '#dc2626',
    '계획': '#9ca3af',
  };
  return map[status] ?? '#9ca3af';
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

type Plan = typeof PLANS[number];

interface FormData {
  orderId: string;
  product: string;
  qty: string;
  startDate: string;
  endDate: string;
  lines: string[];
  priority: string;
}

export default function ProductionPlanningPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'gantt' | 'load'>('list');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [priorityFilter, setPriorityFilter] = useState('전체');
  const [searchText, setSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    orderId: '',
    product: '',
    qty: '',
    startDate: '',
    endDate: '',
    lines: [],
    priority: '일반',
  });

  const filteredPlans = useMemo(() => {
    return PLANS.filter(p => {
      const matchStatus = statusFilter === '전체' || p.status === statusFilter;
      const matchPriority = priorityFilter === '전체' || p.priority === priorityFilter;
      const matchSearch =
        !searchText ||
        p.product.includes(searchText) ||
        p.customer.includes(searchText) ||
        p.id.includes(searchText);
      return matchStatus && matchPriority && matchSearch;
    });
  }, [statusFilter, priorityFilter, searchText]);

  // 오늘 날짜 Gantt 위치
  const todayOffset = dateToOffset('2026-06-04');
  const todayPct = (todayOffset / GANTT_TOTAL_DAYS) * 100;

  // 날짜 헤더 (5일 간격)
  const dateHeaders = Array.from({ length: 7 }, (_, i) => {
    const day = i * 5 + 1;
    return { day, pct: ((day - 1) / GANTT_TOTAL_DAYS) * 100 };
  });

  function handleLineToggle(line: string) {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.includes(line)
        ? prev.lines.filter(l => l !== line)
        : [...prev.lines, line],
    }));
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowForm(false);
    setFormData({ orderId: '', product: '', qty: '', startDate: '', endDate: '', lines: [], priority: '일반' });
  }

  const tabs = [
    { key: 'list', label: '계획 목록', icon: <List size={14} /> },
    { key: 'gantt', label: 'Gantt 일정', icon: <Calendar size={14} /> },
    { key: 'load', label: '부하 분석', icon: <BarChart2 size={14} /> },
  ] as const;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="생산계획 수립 및 조회"
        section="생산관리 > 생산계획"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white rounded-lg px-4 py-2"
            style={{ backgroundColor: '#2563eb' }}
          >
            <Plus size={15} />
            생산계획 등록
          </button>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="이번달 계획" value="6건" sub="2026년 6월" />
        <KpiCard label="진행중" value="2건" color="#2563eb" sub="계획 대비 33%" />
        <KpiCard label="완료" value="2건" color="#16a34a" sub="정시완료율 100%" />
        <KpiCard label="지연" value="1건" color="#dc2626" sub="즉시 조치 필요" />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={
              activeTab === t.key
                ? { backgroundColor: '#2563eb', color: '#fff' }
                : { backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }
            }
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 탭1: 계획 목록 ── */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {/* 필터 */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-sm rounded-lg pl-3 pr-8 py-2 appearance-none bg-white"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {['전체', '진행중', '완료', '지연', '계획'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="text-sm rounded-lg pl-3 pr-8 py-2 appearance-none bg-white"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {['전체', '긴급', '높음', '일반'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="제품명, 고객사, 계획번호 검색"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full text-sm rounded-lg pl-8 pr-3 py-2 bg-white"
                style={{ border: '1px solid #e5e7eb' }}
              />
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['계획번호', '수주번호', '제품명', '고객사', '수량', '시작일', '완료예정일', '투입라인', '우선순위', '진행률', '상태'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map(plan => (
                  <tr
                    key={plan.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: plan.status === '지연' ? '#fff5f5' : undefined,
                    }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-700 whitespace-nowrap">{plan.id}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-500 whitespace-nowrap">{plan.orderId}</td>
                    <td className="py-2.5 px-3 font-medium whitespace-nowrap" style={{ color: '#1e3a5f', maxWidth: 180 }}>
                      <span className="block truncate max-w-[160px]" title={plan.product}>{plan.product}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{plan.customer}</td>
                    <td className="py-2.5 px-3 text-gray-700 text-center">{plan.qty}</td>
                    <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{plan.startDate}</td>
                    <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{plan.endDate}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {plan.lines.map(l => (
                          <span key={l} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <PriorityBadge priority={plan.priority} />
                    </td>
                    <td className="py-2.5 px-3 min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold w-8 text-right" style={{ color: '#1e3a5f' }}>{plan.progress}%</span>
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${plan.progress}%`,
                              backgroundColor: plan.status === '지연' ? '#dc2626' : plan.status === '완료' ? '#16a34a' : '#2563eb',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={plan.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPlans.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">검색 결과가 없습니다.</div>
            )}
          </div>
        </div>
      )}

      {/* ── 탭2: Gantt 일정 ── */}
      {activeTab === 'gantt' && (
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: '#1e3a5f' }}>2026년 6월 생산 일정</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {[
                { color: '#16a34a', label: '완료' },
                { color: '#2563eb', label: '진행중' },
                { color: '#dc2626', label: '지연' },
                { color: '#9ca3af', label: '계획' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1">
                  <span className="inline-block w-3 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: 700 }}>
              {/* 날짜 헤더 */}
              <div className="flex mb-1">
                <div style={{ width: '22%' }} />
                <div className="relative flex-1" style={{ height: 24 }}>
                  {dateHeaders.map(({ day, pct }) => (
                    <span
                      key={day}
                      className="absolute text-xs text-gray-400"
                      style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                    >
                      {day}일
                    </span>
                  ))}
                </div>
              </div>

              {/* Gantt 행 */}
              <div className="relative">
                {/* 오늘 세로선 */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `calc(22% + ${todayPct * 0.78}%)`,
                    borderLeft: '2px dashed #ef4444',
                    zIndex: 10,
                  }}
                >
                  <span
                    className="absolute -top-0 text-xs font-semibold text-red-500 whitespace-nowrap"
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    오늘
                  </span>
                </div>

                {PLANS.map((plan, idx) => {
                  const leftPct = (dateToOffset(plan.startDate) / GANTT_TOTAL_DAYS) * 100;
                  const widthPct = (dateToDuration(plan.startDate, plan.endDate) / GANTT_TOTAL_DAYS) * 100;
                  const barColor = ganttBarColor(plan.status);

                  return (
                    <div
                      key={plan.id}
                      className="flex items-center"
                      style={{
                        height: 44,
                        backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#fff',
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      {/* 계획명 */}
                      <div
                        className="flex-shrink-0 px-3 text-xs font-medium truncate"
                        style={{ width: '22%', color: '#1e3a5f' }}
                        title={plan.product}
                      >
                        {plan.product.substring(0, 14)}
                      </div>

                      {/* 바 영역 */}
                      <div className="relative flex-1" style={{ height: '100%' }}>
                        {/* 그리드 선 */}
                        {dateHeaders.map(({ pct }) => (
                          <div
                            key={pct}
                            className="absolute top-0 bottom-0"
                            style={{ left: `${pct}%`, borderLeft: '1px solid #f3f4f6' }}
                          />
                        ))}

                        {/* Gantt 바 */}
                        {widthPct > 0 && (
                          <div
                            className="absolute top-1/2 rounded overflow-hidden"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              height: 22,
                              transform: 'translateY(-50%)',
                              backgroundColor: barColor,
                              opacity: 0.85,
                              minWidth: 4,
                            }}
                          >
                            {/* 진행률 채우기 */}
                            <div
                              style={{
                                width: `${plan.progress}%`,
                                height: '100%',
                                backgroundColor: barColor,
                                opacity: 1,
                              }}
                            />
                            {/* 진행률 텍스트 */}
                            {widthPct > 8 && (
                              <span
                                className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold"
                                style={{ fontSize: 10 }}
                              >
                                {plan.progress}%
                              </span>
                            )}
                          </div>
                        )}

                        {/* 바가 범위 밖일 경우 표시 */}
                        {widthPct <= 0 && (
                          <span className="absolute top-1/2 left-1 -translate-y-1/2 text-xs text-gray-400">7월 이후</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 탭3: 부하 분석 ── */}
      {activeTab === 'load' && (
        <div className="space-y-5">
          {/* 라인별 가동률 차트 */}
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: '#1e3a5f' }}>라인별 가동률 추이 (최근 7일, %)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={LINE_LOAD_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
                  formatter={(v: unknown) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="라인A" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="라인B" fill="#7c3aed" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="라인C" fill="#0891b2" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar dataKey="라인D" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 라인 가용 시간 vs 투입 계획 */}
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: '#1e3a5f' }}>라인 가용 시간 vs 투입 계획 (이번 주, 단위: 시간)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['라인', '가용 시간', '투입 계획', '여유 시간', '가동률', '상태'].map(h => (
                      <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LINE_CAPACITY.map((row, idx) => {
                    const slack = row.capacity - row.planned;
                    const isOverload = row.utilization >= 90;
                    const isWarning = row.utilization >= 75 && row.utilization < 90;
                    return (
                      <tr
                        key={row.line}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#fff',
                        }}
                      >
                        <td className="py-3 px-4 font-semibold" style={{ color: '#1e3a5f' }}>{row.line}</td>
                        <td className="py-3 px-4 text-gray-700">{row.capacity}h</td>
                        <td className="py-3 px-4 text-gray-700">{row.planned}h</td>
                        <td className="py-3 px-4 text-gray-700">{slack}h</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.utilization}%`,
                                  backgroundColor: isOverload ? '#dc2626' : isWarning ? '#f59e0b' : '#16a34a',
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: isOverload ? '#dc2626' : isWarning ? '#d97706' : '#16a34a' }}>
                              {row.utilization}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isOverload ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>과부하</span>
                          ) : isWarning ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>주의</span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>정상</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 생산계획 등록 모달 ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <div
            className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: '#1e3a5f' }}>생산계획 등록</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">수주번호</label>
                  <input
                    type="text"
                    placeholder="ORD-2026-0000"
                    value={formData.orderId}
                    onChange={e => setFormData(p => ({ ...p, orderId: e.target.value }))}
                    className="w-full text-sm rounded-lg px-3 py-2"
                    style={{ border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">수량</label>
                  <input
                    type="number"
                    placeholder="0"
                    min={1}
                    value={formData.qty}
                    onChange={e => setFormData(p => ({ ...p, qty: e.target.value }))}
                    className="w-full text-sm rounded-lg px-3 py-2"
                    style={{ border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">제품명</label>
                <input
                  type="text"
                  placeholder="제품명을 입력하세요"
                  value={formData.product}
                  onChange={e => setFormData(p => ({ ...p, product: e.target.value }))}
                  className="w-full text-sm rounded-lg px-3 py-2"
                  style={{ border: '1px solid #e5e7eb' }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">시작일</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full text-sm rounded-lg px-3 py-2"
                    style={{ border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">완료예정일</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full text-sm rounded-lg px-3 py-2"
                    style={{ border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">투입라인</label>
                <div className="flex gap-3">
                  {LINE_OPTIONS.map(line => (
                    <label key={line} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lines.includes(line)}
                        onChange={() => handleLineToggle(line)}
                        className="accent-blue-600"
                      />
                      {line}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">우선순위</label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}
                    className="w-full text-sm rounded-lg pl-3 pr-8 py-2 appearance-none bg-white"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    {['긴급', '높음', '일반'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm px-4 py-2 rounded-lg text-gray-600"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="text-sm font-semibold px-5 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
