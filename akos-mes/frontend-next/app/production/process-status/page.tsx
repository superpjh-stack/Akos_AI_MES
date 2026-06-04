'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Activity, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  seq: number;
  name: string;
  status: '작업중' | '완료' | '대기' | '점검중';
  progress: number;
  cycleTime: number;
  taktTime: number;
  operator: string;
  startTime: string;
}

interface Line {
  id: string;
  name: string;
  status: '가동중' | '점검중' | '정지';
  oee: number;
  planQty: number;
  actualQty: number;
  defect: number;
  processes: Process[];
}

interface Alarm {
  id: number;
  time: string;
  line: string;
  type: string;
  message: string;
  severity: '긴급' | '경고' | '주의';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LINES: Line[] = [
  {
    id: 'LINE-A', name: '라인 A', status: '가동중', oee: 87.3, planQty: 120, actualQty: 98, defect: 3,
    processes: [
      { seq: 1, name: '기계가공', status: '작업중', progress: 78, cycleTime: 42, taktTime: 45, operator: '김기계', startTime: '08:00' },
      { seq: 2, name: '용접', status: '작업중', progress: 65, cycleTime: 38, taktTime: 45, operator: '이용접', startTime: '09:30' },
      { seq: 3, name: '조립', status: '대기', progress: 0, cycleTime: 44, taktTime: 45, operator: '최조립', startTime: '-' },
      { seq: 4, name: '검사', status: '대기', progress: 0, cycleTime: 30, taktTime: 45, operator: '박검사', startTime: '-' },
    ],
  },
  {
    id: 'LINE-B', name: '라인 B', status: '가동중', oee: 76.1, planQty: 100, actualQty: 72, defect: 5,
    processes: [
      { seq: 1, name: '절삭가공', status: '완료', progress: 100, cycleTime: 55, taktTime: 50, operator: '강절삭', startTime: '07:30' },
      { seq: 2, name: '도장', status: '작업중', progress: 45, cycleTime: 51, taktTime: 50, operator: '정도장', startTime: '10:15' },
      { seq: 3, name: '조립', status: '대기', progress: 0, cycleTime: 44, taktTime: 50, operator: '최조립', startTime: '-' },
    ],
  },
  {
    id: 'LINE-C', name: '라인 C', status: '점검중', oee: 0, planQty: 80, actualQty: 0, defect: 0,
    processes: [
      { seq: 1, name: '열처리', status: '점검중', progress: 0, cycleTime: 90, taktTime: 80, operator: '김열처리', startTime: '-' },
    ],
  },
  {
    id: 'LINE-D', name: '라인 D', status: '가동중', oee: 92.4, planQty: 90, actualQty: 88, defect: 1,
    processes: [
      { seq: 1, name: '프레스', status: '완료', progress: 100, cycleTime: 28, taktTime: 30, operator: '이프레스', startTime: '07:00' },
      { seq: 2, name: '검사', status: '작업중', progress: 88, cycleTime: 30, taktTime: 30, operator: '박검사', startTime: '11:00' },
    ],
  },
];

const ALARMS: Alarm[] = [
  { id: 1, time: '11:23', line: '라인 C', type: '설비이상', message: '열처리로 온도 이상 (설정:850°C / 현재:920°C)', severity: '긴급' },
  { id: 2, time: '10:45', line: '라인 B', type: '품질경보', message: '도장 공정 불량률 초과 (임계값 3% / 현재 6.9%)', severity: '경고' },
  { id: 3, time: '09:12', line: '라인 A', type: '자재부족', message: '기계가공 공정 자재 잔량 15% 미만', severity: '주의' },
];

// ─── Inline Components ────────────────────────────────────────────────────────

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
    '가동중': { bg: '#dbeafe', color: '#1d4ed8' },
    '점검중': { bg: '#ffedd5', color: '#c2410c' },
    '정지': { bg: '#f3f4f6', color: '#6b7280' },
    '작업중': { bg: '#dbeafe', color: '#1d4ed8' },
    '완료': { bg: '#dcfce7', color: '#15803d' },
    '대기': { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
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

// ─── Process Node ─────────────────────────────────────────────────────────────

function ProcessNode({
  proc,
  isLast,
  isOverCycle,
  onClick,
}: {
  proc: Process;
  isLast: boolean;
  isOverCycle: boolean;
  onClick: () => void;
}) {
  const nodeColor =
    proc.status === '완료' ? '#16a34a'
    : proc.status === '작업중' ? '#2563eb'
    : proc.status === '점검중' ? '#ea580c'
    : '#9ca3af';

  return (
    <div className="flex items-center">
      {/* Node */}
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 focus:outline-none group"
        title={`${proc.name} 상세 보기`}
      >
        {/* Circle indicator */}
        <div className="relative" style={{ width: 36, height: 36 }}>
          {/* Pulse ring for 작업중 */}
          {proc.status === '작업중' && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: '#2563eb', opacity: 0.25 }}
            />
          )}
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110"
            style={{ backgroundColor: isOverCycle ? '#dc2626' : nodeColor }}
          >
            {proc.status === '완료' ? (
              <CheckCircle size={16} />
            ) : proc.status === '작업중' ? (
              <Activity size={14} />
            ) : proc.status === '점검중' ? (
              <AlertTriangle size={14} />
            ) : (
              <Clock size={14} />
            )}
          </div>
        </div>
        {/* Label */}
        <span
          className="text-xs font-medium text-center leading-tight"
          style={{ color: isOverCycle ? '#dc2626' : '#374151', maxWidth: 52 }}
        >
          {proc.name}
        </span>
        {/* Progress */}
        {proc.status === '작업중' && (
          <span className="text-xs font-semibold" style={{ color: '#2563eb' }}>
            {proc.progress}%
          </span>
        )}
      </button>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex items-center mx-1" style={{ marginBottom: 20 }}>
          <div className="h-px w-6" style={{ backgroundColor: '#d1d5db' }} />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '6px solid #d1d5db',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Process Detail Panel ─────────────────────────────────────────────────────

function ProcessDetail({ proc }: { proc: Process }) {
  const isOverCycle = proc.cycleTime > proc.taktTime;
  return (
    <div
      className="mt-3 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm"
      style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
    >
      <div>
        <span className="text-xs text-gray-400 block mb-0.5">담당자</span>
        <span className="font-semibold text-gray-800">{proc.operator}</span>
      </div>
      <div>
        <span className="text-xs text-gray-400 block mb-0.5">시작 시간</span>
        <span className="font-semibold text-gray-800">{proc.startTime}</span>
      </div>
      <div>
        <span className="text-xs text-gray-400 block mb-0.5">사이클타임</span>
        <span className="font-semibold" style={{ color: isOverCycle ? '#dc2626' : '#1e3a5f' }}>
          {proc.cycleTime}초 {isOverCycle && <span className="text-xs font-normal">(초과)</span>}
        </span>
      </div>
      <div>
        <span className="text-xs text-gray-400 block mb-0.5">택타임</span>
        <span className="font-semibold text-gray-800">{proc.taktTime}초</span>
      </div>
      {proc.status === '작업중' && (
        <div className="col-span-2">
          <span className="text-xs text-gray-400 block mb-1">진행률</span>
          <div className="w-full h-2 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${proc.progress}%`, backgroundColor: '#2563eb' }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-0.5 block">{proc.progress}% 완료</span>
        </div>
      )}
    </div>
  );
}

// ─── Line Card ────────────────────────────────────────────────────────────────

function LineCard({ line }: { line: Line }) {
  const [expandedProcess, setExpandedProcess] = useState<number | null>(null);

  const borderColor =
    line.status === '가동중' ? '#2563eb'
    : line.status === '점검중' ? '#ea580c'
    : '#9ca3af';

  const progressPct = line.planQty > 0 ? Math.min(100, Math.round((line.actualQty / line.planQty) * 100)) : 0;
  const progressColor =
    progressPct >= 85 ? '#16a34a'
    : progressPct >= 60 ? '#2563eb'
    : '#dc2626';

  const handleProcessClick = (seq: number) => {
    setExpandedProcess(prev => (prev === seq ? null : seq));
  };

  return (
    <div
      className="bg-white rounded-lg flex flex-col"
      style={{
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderTop: `3px solid ${borderColor}`,
      }}
    >
      {/* Card Header */}
      <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: '#1e3a5f' }}>{line.name}</span>
            <StatusBadge status={line.status} />
          </div>
          <div className="flex items-center gap-1">
            <Zap size={13} className="text-gray-400" />
            <span
              className="text-sm font-bold"
              style={{ color: line.oee >= 85 ? '#16a34a' : line.oee >= 70 ? '#d97706' : '#dc2626' }}
            >
              OEE {line.oee}%
            </span>
          </div>
        </div>

        {/* Plan vs Actual bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>생산 실적</span>
              <span>
                <span className="font-semibold" style={{ color: progressColor }}>{line.actualQty}</span>
                <span className="text-gray-400"> / {line.planQty}개</span>
                <span className="ml-1 font-semibold" style={{ color: progressColor }}>({progressPct}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>
          {line.defect > 0 && (
            <div className="text-right shrink-0">
              <span className="text-xs text-gray-400">불량</span>
              <span className="ml-1 text-xs font-bold text-red-500">{line.defect}개</span>
            </div>
          )}
        </div>
      </div>

      {/* Process Flow */}
      <div className="px-5 py-4">
        <p className="text-xs text-gray-400 mb-3 font-medium">공정 흐름</p>
        <div className="flex flex-wrap items-start gap-y-3">
          {line.processes.map((proc, idx) => {
            const isOverCycle = proc.cycleTime > proc.taktTime;
            return (
              <React.Fragment key={proc.seq}>
                <div className="flex flex-col">
                  <ProcessNode
                    proc={proc}
                    isLast={idx === line.processes.length - 1}
                    isOverCycle={isOverCycle}
                    onClick={() => handleProcessClick(proc.seq)}
                  />
                  {expandedProcess === proc.seq && (
                    <ProcessDetail proc={proc} />
                  )}
                </div>
                {idx < line.processes.length - 1 && (
                  <div className="flex items-center" style={{ marginBottom: 20, marginTop: 0 }}>
                    <div className="h-px w-6" style={{ backgroundColor: '#d1d5db' }} />
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: '4px solid transparent',
                        borderBottom: '4px solid transparent',
                        borderLeft: '6px solid #d1d5db',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Over cycle warning */}
        {line.processes.some(p => p.cycleTime > p.taktTime) && (
          <div
            className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            <AlertTriangle size={13} />
            <span>사이클타임 초과 공정 있음 — 즉시 확인 필요</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Alarm Panel ─────────────────────────────────────────────────────────────

function AlarmPanel({ alarms }: { alarms: Alarm[] }) {
  const severityStyle: Record<string, { bg: string; border: string; badge: string; badgeText: string; dot: string }> = {
    '긴급': { bg: '#fff1f2', border: '#fecdd3', badge: '#dc2626', badgeText: '#fff', dot: '#dc2626' },
    '경고': { bg: '#fff7ed', border: '#fed7aa', badge: '#ea580c', badgeText: '#fff', dot: '#ea580c' },
    '주의': { bg: '#fefce8', border: '#fef08a', badge: '#ca8a04', badgeText: '#fff', dot: '#ca8a04' },
  };

  return (
    <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} style={{ color: '#dc2626' }} />
          <h2 className="text-sm font-bold" style={{ color: '#1e3a5f' }}>현재 알람</h2>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
        >
          {alarms.length}건
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {alarms.map(alarm => {
          const s = severityStyle[alarm.severity] ?? severityStyle['주의'];
          return (
            <div
              key={alarm.id}
              className="px-5 py-3.5"
              style={{ backgroundColor: s.bg }}
            >
              <div className="flex items-start gap-3">
                {/* Severity dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: s.dot }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: s.badge, color: s.badgeText }}
                    >
                      {alarm.severity}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">{alarm.type}</span>
                    <span className="text-xs text-gray-400">{alarm.line}</span>
                    <span className="text-xs text-gray-400 ml-auto">{alarm.time}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{alarm.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProcessStatusPage() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setLastUpdated(`${hh}:${mm}:${ss}`);
      setRefreshing(false);
    }, 600);
  };

  const activeLines = LINES.filter(l => l.status === '가동중').length;
  const avgOEE = (LINES.filter(l => l.oee > 0).reduce((a, l) => a + l.oee, 0) / LINES.filter(l => l.oee > 0).length).toFixed(1);
  const totalActual = LINES.reduce((a, l) => a + l.actualQty, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="실시간 공정 현황판"
        section="생산관리 > 공정현황"
        action={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                마지막 업데이트: <span className="font-semibold text-gray-600">{lastUpdated}</span>
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-white transition-colors"
              style={{ backgroundColor: refreshing ? '#93c5fd' : '#2563eb' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              새로고침
            </button>
          </div>
        }
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="가동 라인"
          value={`${activeLines} / ${LINES.length}개`}
          sub="정상 가동 중"
          color="#2563eb"
        />
        <KpiCard
          label="전체 OEE"
          value={`${avgOEE}%`}
          sub="가동 라인 평균"
          color={Number(avgOEE) >= 85 ? '#16a34a' : '#d97706'}
        />
        <KpiCard
          label="오늘 생산"
          value={`${totalActual}개`}
          sub={`계획 ${LINES.reduce((a, l) => a + l.planQty, 0)}개`}
          color="#1e3a5f"
        />
        <KpiCard
          label="현재 알람"
          value={`${ALARMS.length}건`}
          sub={`긴급 ${ALARMS.filter(a => a.severity === '긴급').length}건 포함`}
          color={ALARMS.some(a => a.severity === '긴급') ? '#dc2626' : '#d97706'}
        />
      </div>

      {/* Main content: Line cards + Alarm panel */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Line cards grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {LINES.map(line => (
            <LineCard key={line.id} line={line} />
          ))}
        </div>

        {/* Alarm panel */}
        <div className="xl:w-80 shrink-0">
          <AlarmPanel alarms={ALARMS} />
        </div>
      </div>
    </div>
  );
}
