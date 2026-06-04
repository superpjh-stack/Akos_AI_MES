'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Cell,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';

// ── 인라인 컴포넌트 ──────────────────────────────────────────────────────────

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
    '달성': { bg: '#dcfce7', color: '#16a34a' },
    '미달': { bg: '#fee2e2', color: '#dc2626' },
    '초과': { bg: '#dbeafe', color: '#2563eb' },
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

function AchievementBadge({ rate }: { rate: number }) {
  const cfg =
    rate >= 100
      ? { bg: '#dcfce7', color: '#16a34a' }
      : rate >= 95
      ? { bg: '#dbeafe', color: '#2563eb' }
      : { bg: '#fee2e2', color: '#dc2626' };
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {rate.toFixed(1)}%
    </span>
  );
}

function PageHeader({
  title,
  section,
  action,
}: {
  title: string;
  section: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{section}</p>
        <h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

// ── 목업 데이터 ───────────────────────────────────────────────────────────────

const DAILY_RESULTS = [
  { date: '06/01', planned: 120, actual: 115, defect: 3, rate: 95.8 },
  { date: '06/02', planned: 120, actual: 122, defect: 2, rate: 101.7 },
  { date: '06/03', planned: 100, actual: 98, defect: 4, rate: 98.0 },
  { date: '06/04', planned: 120, actual: 108, defect: 5, rate: 90.0 },
  { date: '06/05', planned: 120, actual: 119, defect: 1, rate: 99.2 },
  { date: '06/06', planned: 80, actual: 82, defect: 2, rate: 102.5 },
  { date: '06/07', planned: 80, actual: 79, defect: 3, rate: 98.8 },
  { date: '06/08', planned: 120, actual: 121, defect: 2, rate: 100.8 },
  { date: '06/09', planned: 120, actual: 117, defect: 4, rate: 97.5 },
  { date: '06/10', planned: 120, actual: 115, defect: 3, rate: 95.8 },
  { date: '06/11', planned: 120, actual: 123, defect: 1, rate: 102.5 },
  { date: '06/12', planned: 120, actual: 110, defect: 6, rate: 91.7 },
  { date: '06/13', planned: 100, actual: 99, defect: 2, rate: 99.0 },
  { date: '06/14', planned: 120, actual: 118, defect: 3, rate: 98.3 },
];

const LINE_RESULTS = [
  { line: '라인 A', planned: 420, actual: 415, achievement: 98.8, defect: 12, defectRate: 2.9 },
  { line: '라인 B', planned: 380, actual: 365, achievement: 96.1, defect: 18, defectRate: 4.9 },
  { line: '라인 C', planned: 350, actual: 358, achievement: 102.3, defect: 8, defectRate: 2.2 },
  { line: '라인 D', planned: 300, actual: 281, achievement: 93.7, defect: 15, defectRate: 5.3 },
];

const PRODUCT_RESULTS = [
  { product: '자동화 용접라인', planned: 180, actual: 178, defect: 4 },
  { product: 'PLC 제어반', planned: 240, actual: 235, defect: 8 },
  { product: '컨베이어 시스템', planned: 160, actual: 162, defect: 3 },
  { product: '비전검사장비', planned: 120, actual: 115, defect: 5 },
  { product: '협동로봇 유닛', planned: 200, actual: 198, defect: 6 },
];

// ── 탭 컨텐츠 ─────────────────────────────────────────────────────────────────

function DailyTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* 차트 */}
      <div
        className="bg-white rounded-lg p-5"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: '#1e3a5f' }}>
          일별 계획 vs 실적 (최근 14일)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={DAILY_RESULTS} barGap={2} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 140]} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="planned" name="계획" fill="#cbd5e1" radius={[3, 3, 0, 0]}>
              {DAILY_RESULTS.map((d, i) => (
                <Cell key={i} fill="#cbd5e1" />
              ))}
            </Bar>
            <Bar dataKey="actual" name="실적" radius={[3, 3, 0, 0]}>
              {DAILY_RESULTS.map((d, i) => (
                <Cell key={i} fill={d.rate >= 100 ? '#2563eb' : '#fca5a5'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['날짜', '계획(개)', '실적(개)', '달성률', '불량수', '불량률'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAILY_RESULTS.map((row, i) => {
              const defectRate = ((row.defect / row.actual) * 100).toFixed(1);
              const rowBg = row.rate < 95 ? '#fff5f5' : 'transparent';
              return (
                <tr
                  key={i}
                  style={{ backgroundColor: rowBg, borderTop: '1px solid #f3f4f6' }}
                >
                  <td className="px-4 py-3 font-medium text-gray-700">{row.date}</td>
                  <td className="px-4 py-3 text-gray-600">{row.planned.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{row.actual.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <AchievementBadge rate={row.rate} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.defect}</td>
                  <td className="px-4 py-3 text-gray-600">{defectRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LineTab() {
  const chartData = LINE_RESULTS.map((l) => ({ name: l.line, 달성률: l.achievement }));

  return (
    <div className="flex flex-col gap-6">
      {/* 수평 달성률 바차트 */}
      <div
        className="bg-white rounded-lg p-5"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: '#1e3a5f' }}>
          라인별 달성률 (목표 100%)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ left: 20, right: 40, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              domain={[80, 110]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              unit="%"
            />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#374151' }} width={55} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
              formatter={(v) => [`${v}%`, '달성률']}
            />
            <ReferenceLine x={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '목표', fontSize: 11, fill: '#ef4444' }} />
            <Bar dataKey="달성률" radius={[0, 4, 4, 0]}>
              {LINE_RESULTS.map((l, i) => (
                <Cell key={i} fill={l.achievement >= 100 ? '#16a34a' : l.achievement >= 95 ? '#2563eb' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['라인', '계획(개)', '실적(개)', '달성률', '불량수', '불량률'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LINE_RESULTS.map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td className="px-4 py-3 font-semibold text-gray-700">{row.line}</td>
                <td className="px-4 py-3 text-gray-600">{row.planned.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{row.actual.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[80px]">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.min(row.achievement, 110) / 110 * 100}%`,
                          backgroundColor:
                            row.achievement >= 100
                              ? '#16a34a'
                              : row.achievement >= 95
                              ? '#2563eb'
                              : '#ef4444',
                        }}
                      />
                    </div>
                    <AchievementBadge rate={row.achievement} />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.defect}</td>
                <td className="px-4 py-3 text-gray-600">{row.defectRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductTab() {
  const chartData = PRODUCT_RESULTS.map((p) => ({
    name: p.product.length > 8 ? p.product.slice(0, 8) + '…' : p.product,
    계획: p.planned,
    실적: p.actual,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* 수평 grouped 바차트 */}
      <div
        className="bg-white rounded-lg p-5"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: '#1e3a5f' }}>
          제품별 생산량 계획 vs 실적
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            layout="vertical"
            data={chartData}
            barGap={4}
            margin={{ left: 20, right: 20, top: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151' }} width={80} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="계획" fill="#cbd5e1" radius={[0, 3, 3, 0]} />
            <Bar dataKey="실적" fill="#2563eb" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 테이블 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {['제품명', '계획(개)', '실적(개)', '달성률', '불량수', '불량률'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRODUCT_RESULTS.map((row, i) => {
              const achievement = (row.actual / row.planned) * 100;
              const defectRate = ((row.defect / row.actual) * 100).toFixed(1);
              return (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td className="px-4 py-3 font-medium text-gray-700">{row.product}</td>
                  <td className="px-4 py-3 text-gray-600">{row.planned.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{row.actual.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[80px]">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(achievement, 110) / 110 * 100}%`,
                            backgroundColor: achievement >= 100 ? '#16a34a' : achievement >= 95 ? '#2563eb' : '#ef4444',
                          }}
                        />
                      </div>
                      <AchievementBadge rate={achievement} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.defect}</td>
                  <td className="px-4 py-3 text-gray-600">{defectRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────

const TABS = ['일별 실적', '라인별 실적', '제품별 실적'] as const;
type Tab = typeof TABS[number];

export default function ProductionResultsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('일별 실적');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-14');

  const headerAction = (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm text-gray-600"
        style={{ border: '1px solid #e5e7eb' }}
      >
        <Calendar size={14} className="text-gray-400" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="outline-none text-sm text-gray-700 bg-transparent"
        />
        <span className="text-gray-400">~</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="outline-none text-sm text-gray-700 bg-transparent"
        />
      </div>
      <button
        className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-lg font-medium"
        style={{ backgroundColor: '#2563eb' }}
        onClick={() => alert('엑셀 다운로드 (목업)')}
      >
        <Download size={14} />
        엑셀 다운로드
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="생산실적 조회/분석" section="생산관리 > 생산실적" action={headerAction} />

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="이번달 생산 (달성률)"
          value="1,470개"
          sub="계획 1,450개 · 달성률 101.4%"
          color="#16a34a"
        />
        <KpiCard
          label="오늘 생산 (달성률)"
          value="118개"
          sub="계획 120개 · 달성률 98.3%"
          color="#2563eb"
        />
        <KpiCard
          label="이번달 불량"
          value="53개"
          sub="불량률 3.6%"
          color="#ea580c"
        />
        <KpiCard
          label="평균 달성률"
          value="98.6%"
          sub="최근 14일 기준"
          color="#1e3a5f"
        />
      </div>

      {/* 탭 */}
      <div
        className="bg-white rounded-lg overflow-hidden"
        style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div style={{ borderBottom: '1px solid #e5e7eb' }} className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 text-sm font-medium transition-colors"
              style={{
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                backgroundColor: 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === '일별 실적' && <DailyTab />}
          {activeTab === '라인별 실적' && <LineTab />}
          {activeTab === '제품별 실적' && <ProductTab />}
        </div>
      </div>
    </div>
  );
}
