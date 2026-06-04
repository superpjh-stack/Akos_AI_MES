'use client';

import React, { useState } from 'react';
import {
  BrainCircuit, AlertTriangle, AlertCircle, Info, CheckCircle2,
  Clock, ChevronLeft, ChevronRight, Search, Filter,
  Eye, Edit2, Trash2, Zap, RefreshCw, TrendingUp
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type Severity = 'urgent' | 'warning' | 'info';
type ActionStatus = 'pending' | 'in_progress' | 'done';

interface AiAlert extends Record<string, unknown> {
  id: string;
  alertType: string;
  title: string;
  content: string;
  source: string;
  severity: Severity;
  actionStatus: ActionStatus;
  assignee: string;
  createdAt: string;
  actionAt: string;
  recommendation: string;
}

// ── Sample Data (10+ rows) ─────────────────────────────────────────────────
const INITIAL_ALERTS: AiAlert[] = [
  {
    id: 'AI001', alertType: '불량률', title: '조립라인 B 불량률 임계값 초과',
    content: '실시간 불량률 3.2% 감지 — 기준치 3.0% 초과. 지속 시 생산 중단 필요.',
    source: 'AI 예측모델', severity: 'urgent', actionStatus: 'pending',
    assignee: '이영희', createdAt: '2026-06-04 11:25', actionAt: '-',
    recommendation: '공정 파라미터 즉시 점검 및 품질팀 현장 확인 요청',
  },
  {
    id: 'AI002', alertType: '납기지연', title: '수주 #087 납기 위험 경보',
    content: '납기까지 3일 남았으나 생산 완료율 62% — AI 예측 납기 준수 확률 34%.',
    source: 'AI 일정분석', severity: 'urgent', actionStatus: 'in_progress',
    assignee: '한동훈', createdAt: '2026-06-04 09:00', actionAt: '2026-06-04 09:30',
    recommendation: '잔여 공정 야간 특근 투입 또는 고객사 납기 협의 필요',
  },
  {
    id: 'AI003', alertType: '설비이상', title: '용접기 #3 진동 이상 패턴 감지',
    content: '진동 수치 2.8g — 정상범위 2.4g 대비 15% 초과. 베어링 마모 의심.',
    source: 'PLC 모니터링', severity: 'urgent', actionStatus: 'pending',
    assignee: '배성호', createdAt: '2026-06-03 22:15', actionAt: '-',
    recommendation: '즉시 가동 중단 및 베어링 교체 점검 일정 수립',
  },
  {
    id: 'AI004', alertType: 'FAT실패', title: 'FAT 불합격 비율 증가 추세',
    content: '이번 주 FAT 불합격률 4.1% — 목표 2.0% 대비 2배 이상. 공정 품질 저하 의심.',
    source: 'FAT 시스템', severity: 'warning', actionStatus: 'in_progress',
    assignee: '최민준', createdAt: '2026-06-04 08:45', actionAt: '2026-06-04 09:00',
    recommendation: '불합격 유형 분석 후 공정 개선 조치 수립',
  },
  {
    id: 'AI005', alertType: '재고', title: '자재 MC-200 안전재고 미달',
    content: '현재 재고 120개 / 안전재고 기준 150개. 생산 차질 예상 일수: 3일.',
    source: '재고 관리', severity: 'warning', actionStatus: 'pending',
    assignee: '오지현', createdAt: '2026-06-04 08:30', actionAt: '-',
    recommendation: '긴급 발주 요청 및 공급사 리드타임 확인 필요',
  },
  {
    id: 'AI006', alertType: 'OEE', title: '도장라인 OEE 65% 하회 지속',
    content: 'OEE 65% — 목표 80% 대비 15%p 하회. 비가동 시간 증가가 주요 원인.',
    source: 'KPI 모니터', severity: 'warning', actionStatus: 'pending',
    assignee: '김철수', createdAt: '2026-06-04 07:00', actionAt: '-',
    recommendation: '설비 가동률 분석 및 비가동 원인 5-Why 분석 실시',
  },
  {
    id: 'AI007', alertType: '품질', title: '도장 두께 기준 미달 자동 감지',
    content: '평균 도장 두께 55μm — 기준 60μm. AI가 공정 파라미터 자동 조정 완료.',
    source: 'AI 예측모델', severity: 'info', actionStatus: 'done',
    assignee: '정수연', createdAt: '2026-06-03 14:00', actionAt: '2026-06-03 14:05',
    recommendation: '자동 보정 완료. 다음 배치 품질 확인 권장',
  },
  {
    id: 'AI008', alertType: '납기지연', title: '수주 #092 납기 D-1 촉박',
    content: '납기 내일. 생산 완료율 91%. 잔여 공정 조립 15개 — 정상 진행 중.',
    source: 'AI 일정분석', severity: 'warning', actionStatus: 'done',
    assignee: '한동훈', createdAt: '2026-06-03 18:00', actionAt: '2026-06-04 08:00',
    recommendation: '오늘 오후 최종 확인 필요. 납기 준수 가능 예측 92%',
  },
  {
    id: 'AI009', alertType: '설비이상', title: '압축기 #1 운전온도 임계치 초과',
    content: '운전 온도 85°C — 임계치 80°C 초과. 냉각수 순환 이상 감지.',
    source: 'IoT 센서', severity: 'urgent', actionStatus: 'done',
    assignee: '배성호', createdAt: '2026-06-03 07:45', actionAt: '2026-06-03 08:30',
    recommendation: '냉각수 라인 점검 완료. 정상 운전 재개.',
  },
  {
    id: 'AI010', alertType: '재고', title: '원자재 A10 발주 권고',
    content: '현재 재고 45일 치. 발주 리드타임 30일 고려 시 즉시 발주 필요.',
    source: 'AI 추천엔진', severity: 'info', actionStatus: 'done',
    assignee: '오지현', createdAt: '2026-06-01 09:00', actionAt: '2026-06-01 10:15',
    recommendation: '발주 완료 확인. 도착 예정일 2026-07-01.',
  },
  {
    id: 'AI011', alertType: '품질', title: '조립 토크 편차 증가 예측',
    content: 'AI 모델이 향후 2시간 내 토크 편차 증가 예측. 현재 정상 범위 내.',
    source: 'AI 예측모델', severity: 'info', actionStatus: 'pending',
    assignee: '강태양', createdAt: '2026-06-04 10:30', actionAt: '-',
    recommendation: '예방적 공구 마모 점검 및 토크렌치 교정 권장',
  },
  {
    id: 'AI012', alertType: '불량률', title: '검사라인 C 불량률 상승 경향',
    content: '최근 3일 불량률: 1.8% → 2.1% → 2.7%. 임계치(3.0%) 도달 예측 시간: 6시간.',
    source: 'AI 예측모델', severity: 'warning', actionStatus: 'in_progress',
    assignee: '신혜진', createdAt: '2026-06-04 11:00', actionAt: '2026-06-04 11:10',
    recommendation: '공정 조건 점검 및 원인 분석 착수. 예방 조치 선제 시행 권장',
  },
];

// ── Config ─────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<Severity, { label: string; icon: React.ReactNode; badgeClass: string; rowClass: string }> = {
  urgent:  {
    label: '긴급',
    icon: <AlertCircle className="w-4 h-4" />,
    badgeClass: 'bg-red-100 text-red-700 border border-red-200',
    rowClass: 'border-l-4 border-l-red-400',
  },
  warning: {
    label: '경고',
    icon: <AlertTriangle className="w-4 h-4" />,
    badgeClass: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    rowClass: 'border-l-4 border-l-yellow-400',
  },
  info:    {
    label: '정보',
    icon: <Info className="w-4 h-4" />,
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
    rowClass: 'border-l-4 border-l-blue-400',
  },
};

const ACTION_STATUS_CONFIG: Record<ActionStatus, { label: string; badgeClass: string }> = {
  pending:     { label: '미처리', badgeClass: 'bg-gray-100 text-gray-600 border border-gray-200' },
  in_progress: { label: '처리중', badgeClass: 'bg-blue-100 text-blue-600 border border-blue-200' },
  done:        { label: '완료', badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
};

const ALERT_TYPE_COLORS: Record<string, string> = {
  불량률:   'bg-red-50 text-red-700',
  납기지연: 'bg-orange-50 text-orange-700',
  FAT실패:  'bg-rose-50 text-rose-700',
  설비이상: 'bg-yellow-50 text-yellow-700',
  재고:     'bg-teal-50 text-teal-700',
  OEE:      'bg-indigo-50 text-indigo-700',
  품질:     'bg-emerald-50 text-emerald-700',
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function AiMgmtAlertsPage() {
  const [alerts, setAlerts] = useState<AiAlert[]>(INITIAL_ALERTS);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 8;

  const markDone = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, actionStatus: 'done', actionAt: '2026-06-04 지금' } : a));

  const markInProgress = (id: string) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, actionStatus: 'in_progress', actionAt: '2026-06-04 지금' } : a));

  const filtered = alerts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.alertType.toLowerCase().includes(q);
    const matchSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || a.actionStatus === filterStatus;
    const matchType = filterType === 'all' || a.alertType === filterType;
    return matchSearch && matchSeverity && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const urgentCount = alerts.filter(a => a.severity === 'urgent' && a.actionStatus !== 'done').length;
  const pendingCount = alerts.filter(a => a.actionStatus === 'pending').length;
  const inProgressCount = alerts.filter(a => a.actionStatus === 'in_progress').length;
  const doneCount = alerts.filter(a => a.actionStatus === 'done').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>AI Agent 관리</span>
              <span>/</span>
              <span className="text-gray-600 font-medium">알림 및 추천</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#1e3a5f]" />
              알림 및 추천
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">AI가 감지한 이상 징후와 개선 권고사항을 확인하고 조치합니다</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Urgent Banner */}
        {urgentCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
            <Zap className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">
              긴급 알림 {urgentCount}건이 즉시 조치를 필요로 합니다.
            </p>
            <button
              onClick={() => setFilterSeverity('urgent')}
              className="ml-auto text-xs text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              긴급만 보기
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '전체 알림', value: alerts.length, sub: '총 생성 알림', borderColor: 'border-l-blue-400', textColor: 'text-blue-600', icon: <TrendingUp className="w-5 h-5 text-blue-400" /> },
            { label: '미처리', value: pendingCount, sub: '조치 대기 중', borderColor: 'border-l-red-400', textColor: 'text-red-600', icon: <AlertCircle className="w-5 h-5 text-red-400" /> },
            { label: '처리중', value: inProgressCount, sub: '진행 중인 조치', borderColor: 'border-l-yellow-400', textColor: 'text-yellow-600', icon: <Clock className="w-5 h-5 text-yellow-400" /> },
            { label: '처리 완료', value: doneCount, sub: '해결된 알림', borderColor: 'border-l-emerald-400', textColor: 'text-emerald-600', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.borderColor} shadow-sm p-5 flex items-start justify-between`}>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-3xl font-bold mt-1 ${kpi.textColor}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </div>
              <div className="mt-1">{kpi.icon}</div>
            </div>
          ))}
        </div>

        {/* Alert Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-semibold text-gray-900">AI 생성 알림 목록</h2>
          </div>

          {/* Search & Filter */}
          <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="알림 제목, 내용, 유형 검색"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={filterSeverity}
                onChange={e => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                <option value="all">우선순위 전체</option>
                <option value="urgent">긴급</option>
                <option value="warning">경고</option>
                <option value="info">정보</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                <option value="all">처리상태 전체</option>
                <option value="pending">미처리</option>
                <option value="in_progress">처리중</option>
                <option value="done">완료</option>
              </select>
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                <option value="all">알림 유형 전체</option>
                <option value="불량률">불량률</option>
                <option value="납기지연">납기지연</option>
                <option value="FAT실패">FAT실패</option>
                <option value="설비이상">설비이상</option>
                <option value="재고">재고</option>
                <option value="OEE">OEE</option>
                <option value="품질">품질</option>
              </select>
            </div>
            <p className="self-center text-xs text-gray-400 ml-auto whitespace-nowrap">{filtered.length}건</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', '우선순위', '유형', '알림 내용', '소스', '담당자', '처리상태', '생성시간', '액션'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(a => {
                  const sev = SEVERITY_CONFIG[a.severity];
                  const act = ACTION_STATUS_CONFIG[a.actionStatus];
                  const isExpanded = expandedId === a.id;
                  const isDone = a.actionStatus === 'done';

                  return (
                    <React.Fragment key={a.id}>
                      <tr
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${sev.rowClass} ${isDone ? 'opacity-60' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      >
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{a.id}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${sev.badgeClass}`}>
                            {sev.icon}
                            {sev.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ALERT_TYPE_COLORS[a.alertType] ?? 'bg-gray-100 text-gray-600'}`}>
                            {a.alertType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[320px] truncate">{a.content}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{a.source}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{a.assignee}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${act.badgeClass}`}>
                            {act.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{a.createdAt}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="상세"
                              onClick={() => setExpandedId(isExpanded ? null : a.id)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {a.actionStatus === 'pending' && (
                              <button
                                onClick={() => markInProgress(a.id)}
                                className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors whitespace-nowrap"
                              >
                                처리시작
                              </button>
                            )}
                            {a.actionStatus === 'in_progress' && (
                              <button
                                onClick={() => markDone(a.id)}
                                className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors whitespace-nowrap font-semibold"
                              >
                                조치완료
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr className="bg-blue-50/40">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">상세 내용</p>
                                <p className="text-sm text-gray-800">{a.content}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  <BrainCircuit className="w-3.5 h-3.5 text-[#1e3a5f]" />
                                  AI 권고 조치
                                </p>
                                <p className="text-sm text-[#1e3a5f] font-medium">{a.recommendation}</p>
                              </div>
                              <div className="flex items-center gap-6 text-xs text-gray-500">
                                <span>생성: {a.createdAt}</span>
                                <span>조치시각: {a.actionAt}</span>
                                <span>담당자: {a.assignee}</span>
                              </div>
                              {a.actionStatus !== 'done' && (
                                <div className="flex items-center gap-2">
                                  {a.actionStatus === 'pending' && (
                                    <button
                                      onClick={() => markInProgress(a.id)}
                                      className="px-3 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors font-medium"
                                    >
                                      처리 시작
                                    </button>
                                  )}
                                  {a.actionStatus === 'in_progress' && (
                                    <button
                                      onClick={() => markDone(a.id)}
                                      className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-semibold"
                                    >
                                      조치 완료 확인
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {filtered.length}건 중 {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}건 표시
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 text-xs rounded transition-colors ${page === currentPage ? 'bg-[#1e3a5f] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Priority Legend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">우선순위 범례</p>
          <div className="flex flex-wrap gap-6">
            {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG[Severity]][]).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${val.badgeClass}`}>
                  {val.icon}{val.label}
                </span>
                <span className="text-xs text-gray-500">
                  {key === 'urgent' ? '즉시 조치 필요' : key === 'warning' ? '당일 내 조치 필요' : '모니터링 권장'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
