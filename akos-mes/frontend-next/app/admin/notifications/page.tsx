'use client';

import React, { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Phone, Settings, ToggleLeft, ToggleRight,
  AlertTriangle, Clock, CheckCircle, ChevronLeft, ChevronRight, Search, Filter,
  Plus, Edit2, Trash2, Eye
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type NotifType = '불량률초과' | '납기지연' | 'FAT실패' | '설비이상' | 'AI예측경보';
type Channel = '이메일' | 'Slack' | 'SMS';
type Priority = 'high' | 'medium' | 'low';

interface ChannelConfig {
  key: Channel;
  label: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
  target: string;
  tested: string;
}

interface NotifSetting extends Record<string, unknown> {
  id: string;
  notifType: NotifType;
  category: string;
  emailEnabled: boolean;
  slackEnabled: boolean;
  smsEnabled: boolean;
  threshold: string;
  recipients: string;
  priority: Priority;
  cooldown: string;
  lastFired: string;
  enabled: boolean;
}

// ── Sample Data ────────────────────────────────────────────────────────────
const INITIAL_CHANNELS: ChannelConfig[] = [
  {
    key: '이메일', label: '이메일', color: 'blue',
    icon: <Mail className="w-5 h-5" />,
    enabled: true, target: 'smtp.akos.com:587', tested: '2026-06-04 08:00',
  },
  {
    key: 'Slack', label: 'Slack', color: 'purple',
    icon: <MessageSquare className="w-5 h-5" />,
    enabled: true, target: '#mes-alerts (Webhook 연결됨)', tested: '2026-06-04 07:55',
  },
  {
    key: 'SMS', label: 'SMS', color: 'orange',
    icon: <Phone className="w-5 h-5" />,
    enabled: false, target: 'KT ISMS Gateway (미연결)', tested: '-',
  },
];

const INITIAL_SETTINGS: NotifSetting[] = [
  {
    id: 'NS001', notifType: '불량률초과', category: '품질',
    emailEnabled: true, slackEnabled: true, smsEnabled: false,
    threshold: '불량률 > 3.0%', recipients: '품질팀 전체, 생산관리자',
    priority: 'high', cooldown: '30분', lastFired: '2026-06-04 11:25', enabled: true,
  },
  {
    id: 'NS002', notifType: '납기지연', category: '납기',
    emailEnabled: true, slackEnabled: true, smsEnabled: true,
    threshold: 'D-3 이내 완료율 < 80%', recipients: '영업팀, 생산관리자',
    priority: 'high', cooldown: '1시간', lastFired: '2026-06-04 09:00', enabled: true,
  },
  {
    id: 'NS003', notifType: 'FAT실패', category: '품질',
    emailEnabled: true, slackEnabled: true, smsEnabled: true,
    threshold: 'FAT 최종 불합격 발생 시', recipients: '영업팀, 품질팀, 고객사',
    priority: 'high', cooldown: '없음', lastFired: '2026-06-02 14:30', enabled: true,
  },
  {
    id: 'NS004', notifType: '설비이상', category: '설비',
    emailEnabled: true, slackEnabled: false, smsEnabled: true,
    threshold: 'IoT 이상 패턴 감지 시', recipients: '설비팀, 현장 반장',
    priority: 'high', cooldown: '15분', lastFired: '2026-06-03 22:15', enabled: true,
  },
  {
    id: 'NS005', notifType: 'AI예측경보', category: 'AI',
    emailEnabled: true, slackEnabled: true, smsEnabled: false,
    threshold: 'AI 이상 확률 > 80%', recipients: '품질팀, AI담당자',
    priority: 'medium', cooldown: '1시간', lastFired: '2026-06-04 10:45', enabled: true,
  },
  {
    id: 'NS006', notifType: '불량률초과', category: '품질',
    emailEnabled: false, slackEnabled: true, smsEnabled: false,
    threshold: '불량률 > 5.0% (위험 임계값)', recipients: '경영진, 품질팀장',
    priority: 'high', cooldown: '없음', lastFired: '2026-05-28 09:10', enabled: false,
  },
  {
    id: 'NS007', notifType: '납기지연', category: '납기',
    emailEnabled: true, slackEnabled: false, smsEnabled: false,
    threshold: 'D-7 이내 완료율 < 60%', recipients: '영업팀장, 생산부장',
    priority: 'medium', cooldown: '2시간', lastFired: '2026-06-01 08:30', enabled: true,
  },
  {
    id: 'NS008', notifType: 'FAT실패', category: '품질',
    emailEnabled: true, slackEnabled: false, smsEnabled: false,
    threshold: '이번 주 불합격률 > 3.0%', recipients: '품질팀 전체',
    priority: 'medium', cooldown: '1일', lastFired: '2026-06-02 17:00', enabled: true,
  },
  {
    id: 'NS009', notifType: '설비이상', category: '설비',
    emailEnabled: false, slackEnabled: true, smsEnabled: false,
    threshold: '예방정비 D-7 도래 설비 발생', recipients: '설비팀',
    priority: 'low', cooldown: '1일', lastFired: '2026-05-30 08:00', enabled: true,
  },
  {
    id: 'NS010', notifType: 'AI예측경보', category: 'AI',
    emailEnabled: true, slackEnabled: true, smsEnabled: false,
    threshold: 'AI 모델 정확도 < 85%', recipients: 'AI담당자, 시스템관리자',
    priority: 'medium', cooldown: '4시간', lastFired: '2026-05-31 14:00', enabled: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const NOTIF_TYPE_COLORS: Record<NotifType, string> = {
  '불량률초과': 'bg-red-100 text-red-700',
  '납기지연':   'bg-orange-100 text-orange-700',
  'FAT실패':    'bg-rose-100 text-rose-700',
  '설비이상':   'bg-yellow-100 text-yellow-700',
  'AI예측경보': 'bg-violet-100 text-violet-700',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  high:   'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  low:    'bg-gray-50 text-gray-500 border border-gray-200',
};
const PRIORITY_LABEL: Record<Priority, string> = { high: '높음', medium: '보통', low: '낮음' };

const CHANNEL_DOT_COLORS: Record<Channel, string> = {
  '이메일': 'bg-blue-500',
  'Slack':  'bg-purple-500',
  'SMS':    'bg-orange-500',
};

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-[#1e3a5f]' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

function ChannelDot({ active }: { active: boolean; channel: Channel }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const [channels, setChannels] = useState<ChannelConfig[]>(INITIAL_CHANNELS);
  const [settings, setSettings] = useState<NotifSetting[]>(INITIAL_SETTINGS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const toggleChannel = (key: Channel) =>
    setChannels(prev => prev.map(c => c.key === key ? { ...c, enabled: !c.enabled } : c));

  const toggleSetting = (id: string) =>
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const filtered = settings.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.notifType.toLowerCase().includes(q) || s.recipients.toLowerCase().includes(q) || s.threshold.toLowerCase().includes(q);
    const matchType = filterType === 'all' || s.notifType === filterType;
    const matchPriority = filterPriority === 'all' || s.priority === filterPriority;
    return matchSearch && matchType && matchPriority;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const enabledCount = settings.filter(s => s.enabled).length;
  const highPriorityCount = settings.filter(s => s.priority === 'high' && s.enabled).length;
  const todayFired = settings.filter(s => s.lastFired.startsWith('2026-06-04')).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>사용자/시스템관리</span>
              <span>/</span>
              <span className="text-gray-600 font-medium">알림 설정</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1e3a5f]" />
              알림 설정
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">채널별 알림 수신 설정 및 유형별 규칙을 관리합니다</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-medium rounded-lg hover:bg-[#162d4a] transition-colors">
            <Plus className="w-4 h-4" />
            알림 규칙 추가
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '전체 규칙', value: settings.length, sub: '등록된 알림 규칙', borderColor: 'border-l-blue-400', textColor: 'text-blue-600' },
            { label: '활성 규칙', value: enabledCount, sub: '현재 동작 중', borderColor: 'border-l-emerald-400', textColor: 'text-emerald-600' },
            { label: '높음 우선순위', value: highPriorityCount, sub: '즉시 처리 필요', borderColor: 'border-l-red-400', textColor: 'text-red-600' },
            { label: '오늘 발송', value: todayFired, sub: '오늘 알림 발송 수', borderColor: 'border-l-yellow-400', textColor: 'text-yellow-600' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.borderColor} shadow-sm p-5`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-3xl font-bold mt-1 ${kpi.textColor}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Channel Config Cards */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-semibold text-gray-900">알림 채널 설정</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {channels.map(ch => {
              const colorMap: Record<string, string> = {
                blue:   'border-blue-200 bg-blue-50',
                purple: 'border-purple-200 bg-purple-50',
                orange: 'border-orange-200 bg-orange-50',
              };
              const iconColorMap: Record<string, string> = {
                blue:   'text-blue-600 bg-blue-100',
                purple: 'text-purple-600 bg-purple-100',
                orange: 'text-orange-600 bg-orange-100',
              };
              return (
                <div key={ch.key} className={`rounded-lg border p-4 transition-all ${ch.enabled ? colorMap[ch.color] : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${ch.enabled ? iconColorMap[ch.color] : 'text-gray-400 bg-gray-200'}`}>
                        {ch.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{ch.label}</p>
                        <p className={`text-xs font-medium ${ch.enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {ch.enabled ? '● 활성화됨' : '○ 비활성화'}
                        </p>
                      </div>
                    </div>
                    <Toggle enabled={ch.enabled} onToggle={() => toggleChannel(ch.key)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 truncate">대상: {ch.target}</p>
                    <p className="text-xs text-gray-400">마지막 테스트: {ch.tested}</p>
                  </div>
                  <button className={`mt-3 w-full text-xs py-1.5 rounded border transition-colors ${ch.enabled ? 'border-gray-300 text-gray-600 hover:bg-white' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`} disabled={!ch.enabled}>
                    연결 테스트
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Settings Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-semibold text-gray-900">알림 유형별 설정</h2>
          </div>

          {/* Search & Filter */}
          <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="알림 유형, 수신자, 임계값 검색"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                <option value="all">알림 유형 전체</option>
                <option value="불량률초과">불량률초과</option>
                <option value="납기지연">납기지연</option>
                <option value="FAT실패">FAT실패</option>
                <option value="설비이상">설비이상</option>
                <option value="AI예측경보">AI예측경보</option>
              </select>
              <select
                value={filterPriority}
                onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
              >
                <option value="all">우선순위 전체</option>
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
            <p className="self-center text-xs text-gray-400 ml-auto whitespace-nowrap">{filtered.length}건</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', '알림 유형', '채널', '임계값', '수신자', '우선순위', '쿨다운', '마지막 발송', '활성화', '액션'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${!s.enabled ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${NOTIF_TYPE_COLORS[s.notifType]}`}>
                        {s.notifType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span title="이메일"><ChannelDot active={s.emailEnabled} channel="이메일" /></span>
                        <span title="Slack"><ChannelDot active={s.slackEnabled} channel="Slack" /></span>
                        <span title="SMS"><ChannelDot active={s.smsEnabled} channel="SMS" /></span>
                        <span className="text-xs text-gray-400 ml-1">
                          {[s.emailEnabled && '메일', s.slackEnabled && 'Slack', s.smsEnabled && 'SMS'].filter(Boolean).join(', ') || '없음'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[180px] truncate" title={s.threshold}>{s.threshold}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[150px] truncate" title={s.recipients}>{s.recipients}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[s.priority]}`}>
                        {PRIORITY_LABEL[s.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{s.cooldown}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{s.lastFired}</td>
                    <td className="px-4 py-3 text-center">
                      <Toggle enabled={s.enabled} onToggle={() => toggleSetting(s.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="상세">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="수정">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="삭제">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
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

        {/* Channel Legend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">채널 범례</p>
          <div className="flex flex-wrap gap-4">
            {(['이메일', 'Slack', 'SMS'] as Channel[]).map(ch => (
              <div key={ch} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`inline-block w-3 h-3 rounded-full ${CHANNEL_DOT_COLORS[ch]}`} />
                {ch} — 활성
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
              비활성 채널
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
