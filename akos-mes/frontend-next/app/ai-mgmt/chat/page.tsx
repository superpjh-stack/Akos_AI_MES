'use client';

import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Trash2,
  Bot,
  User,
  ChevronRight,
  Clock,
  Hash,
  Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messageCount: number;
  model: string;
  preview: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Sample Data
// ---------------------------------------------------------------------------

const SESSIONS: ChatSession[] = [
  { id: 'S001', title: '조립라인 A 불량률 원인 분석', date: '2026-06-04', messageCount: 14, model: 'GPT-4o', preview: '3번 지그 체결 토크 편차가 주요 원인입니다.' },
  { id: 'S002', title: '6월 생산계획 최적화 방안', date: '2026-06-04', messageCount: 22, model: 'GPT-4o', preview: '3교대 기준 일 생산량 480대를 목표로...' },
  { id: 'S003', title: 'FAT 검사 체크리스트 생성', date: '2026-06-03', messageCount: 8, model: 'Claude-3.5', preview: 'FAT 절차서 기준 17개 항목을 정리했습니다.' },
  { id: 'S004', title: '자재 발주 수량 예측', date: '2026-06-03', messageCount: 11, model: 'GPT-4o', preview: 'A-220 부품 재고가 3일 후 소진 예상입니다.' },
  { id: 'S005', title: '납기 지연 리스크 대응 전략', date: '2026-06-03', messageCount: 18, model: 'Claude-3.5', preview: 'WO-2024-0891 수주건 납기 리스크 분석 결과...' },
  { id: 'S006', title: '설비 예지보전 일정 수립', date: '2026-06-03', messageCount: 9, model: 'GPT-4o', preview: 'CNC-03 스핀들 베어링 교체 주기가 도래했습니다.' },
  { id: 'S007', title: '품질 SPC 차트 해석', date: '2026-06-02', messageCount: 16, model: 'GPT-4o', preview: 'X-bar 차트에서 Rule 2 위반 감지됩니다.' },
  { id: 'S008', title: '신규 작업표준서 초안 작성', date: '2026-06-02', messageCount: 31, model: 'Claude-3.5', preview: 'WI-2026-045 도면 기준으로 표준서를 작성했습니다.' },
  { id: 'S009', title: '원가 절감 방안 도출', date: '2026-06-01', messageCount: 25, model: 'GPT-4o', preview: '공정 사이클타임 단축으로 약 12% 원가 절감 가능...' },
  { id: 'S010', title: '이상 진동 데이터 패턴 분석', date: '2026-06-01', messageCount: 12, model: 'GPT-4o', preview: '주파수 112Hz 대역의 진동이 반복 감지됩니다.' },
  { id: 'S011', title: 'LOT 추적 이력 조회 방법', date: '2026-05-31', messageCount: 6, model: 'Claude-3.5', preview: 'LOT번호 기준 전수 이력을 조회할 수 있습니다.' },
  { id: 'S012', title: '불량 유형별 통계 분석', date: '2026-05-30', messageCount: 19, model: 'GPT-4o', preview: '치수 불량이 전체의 38%로 가장 높게 나타납니다.' },
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'M001',
    role: 'user',
    content: '조립라인 A의 불량률이 갑자기 높아졌어. 원인이 뭔지 분석해줄 수 있어?',
    timestamp: '2026-06-04 08:31',
  },
  {
    id: 'M002',
    role: 'assistant',
    content: '조립라인 A 불량률 급증 원인을 분석했습니다.\n\n**주요 원인 (상위 3가지)**\n\n1. **3번 지그 체결 토크 편차** — 최근 48시간 데이터에서 허용 공차(12±0.5 N·m) 대비 평균 1.8 N·m 이탈이 관찰됩니다. 체결 불량이 전체 불량의 약 42%를 차지합니다.\n\n2. **야간 교대 작업자 숙련도 차이** — 어제 야간(22:00~06:00) 불량률이 주간 대비 2.3배 높았습니다. 신규 투입 작업자 OJT 이력을 확인해 보시기 바랍니다.\n\n3. **A-220 부품 치수 편차** — 2026-06-03 입고 LOT(LOT-A220-0603)에서 직경 공차 초과 비율 7.2%가 검출됩니다. 해당 LOT 격리 및 공급사 클레임을 권장합니다.\n\n즉각 조치 사항으로 3번 지그 교정 및 A-220 LOT 재검사를 권장합니다.',
    timestamp: '2026-06-04 08:32',
  },
  {
    id: 'M003',
    role: 'user',
    content: '3번 지그 교정 이력은 언제야? 그리고 A-220 LOT 격리 조치는 어떻게 해?',
    timestamp: '2026-06-04 08:35',
  },
  {
    id: 'M004',
    role: 'assistant',
    content: '**3번 지그 교정 이력**\n\n| 교정일 | 교정자 | 결과 | 다음 예정 |\n|--------|--------|------|----------|\n| 2026-04-15 | 배성호 | 합격 | 2026-07-15 |\n| 2026-01-10 | 배성호 | 합격 | 2026-04-10 |\n\n마지막 교정은 약 50일 전이며, 정기 교정 주기(90일)까지 40일 남았지만 **현재 불량 패턴 고려 시 즉시 임시 교정**을 권장합니다.\n\n**A-220 LOT 격리 절차**\n\n1. MES → 자재관리 → LOT 관리에서 `LOT-A220-0603` 검색\n2. 상태를 **"보류(Hold)"**로 변경\n3. 창고 담당자에게 물리적 격리 태그 부착 요청\n4. 품질팀에 재검사 의뢰서(QR-2026-XXXX) 발행\n5. 공급사(아코스부품㈜) 클레임 접수 후 8D 보고서 요청\n\n격리 후 대체 자재 확보 여부도 확인이 필요합니다. 현재 재고로는 약 6시간 분량의 생산이 가능합니다.',
    timestamp: '2026-06-04 08:38',
  },
  {
    id: 'M005',
    role: 'user',
    content: 'FAT 이력에서 해당 LOT 사용 여부도 확인해줘.',
    timestamp: '2026-06-04 08:42',
  },
  {
    id: 'M006',
    role: 'assistant',
    content: 'FAT 이력에서 LOT-A220-0603 사용 현황을 조회했습니다.\n\n**FAT 검사 연관 이력**\n\n- **FAT-2026-0601** (수주: WO-0891) — A-220 사용, FAT 1차 **불합격** (치수 항목), 현재 재검사 대기 중\n- **FAT-2026-0598** (수주: WO-0875) — A-220 사용, FAT **합격**, 출하 완료 → 고객사 현장 확인 필요\n- **FAT-2026-0596** (수주: WO-0863) — A-220 사용, FAT **합격**, 출하 완료\n\n**조치 권고**\n\n- WO-0875 및 WO-0863은 이미 출하 완료 상태이므로 고객사에 필드 점검 요청이 필요합니다.\n- WO-0891은 재검사 전 해당 LOT 부품 교체 후 재조립을 권장합니다.\n\n담당 품질 엔지니어(이영희 책임)에게 즉시 공유하시겠습니까?',
    timestamp: '2026-06-04 08:45',
  },
];

const QUICK_CHIPS = [
  { label: '불량 원인 분석', icon: '🔍', query: '현재 발생 중인 주요 불량의 원인을 분석해줘.' },
  { label: '생산 일정 조회', icon: '📅', query: '오늘 생산 현황과 금주 생산 일정을 요약해줘.' },
  { label: 'FAT 이력 검색', icon: '✅', query: '최근 FAT 검사 불합격 이력을 조회해줘.' },
  { label: '자재 재고 현황', icon: '📦', query: '재고 부족 위험이 있는 자재 목록을 알려줘.' },
  { label: '설비 이상 감지', icon: '⚙️', query: '최근 24시간 설비 이상 패턴 감지 결과를 알려줘.' },
  { label: '납기 위험 수주', icon: '🚨', query: '납기 지연 위험이 있는 수주 목록을 알려줘.' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AiMgmtChatPage() {
  const [selectedSession, setSelectedSession] = useState<ChatSession>(SESSIONS[0]);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const filteredSessions = SESSIONS.filter(
    (s) =>
      !sessionSearch ||
      s.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.model.toLowerCase().includes(sessionSearch.toLowerCase()),
  );

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `M${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).replace(/\. /g, '-').replace('.', ''),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: `M${Date.now() + 1}`,
        role: 'assistant',
        content: `"${text}" 질문에 대해 분석 중입니다. MES 데이터를 기반으로 관련 생산 이력, 품질 데이터, 설비 로그를 종합하여 답변드리겠습니다.\n\n현재 연결된 데이터 소스: 생산관리, 품질관리, 설비관리, 자재관리\n\n잠시 후 상세 분석 결과를 제공하겠습니다.`,
        timestamp: new Date().toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        }).replace(/\. /g, '-').replace('.', ''),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (query: string) => {
    setInputText(query);
    inputRef.current?.focus();
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `S${Date.now()}`,
      title: '새 AI 질의 세션',
      date: '2026-06-04',
      messageCount: 0,
      model: 'GPT-4o',
      preview: '새 세션을 시작하세요.',
    };
    setSelectedSession(newSession);
    setMessages([]);
  };

  // Render message content with basic markdown-like formatting
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold (**text**)
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return (
        <span key={i}>
          {parts}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      <PageHeader
        title="통합 AI 질의"
        subtitle="AI 에이전트와 대화하며 MES 데이터를 분석하고 인사이트를 얻으세요"
        breadcrumbs={[{ label: 'AI Agent관리' }, { label: '통합 AI 질의' }]}
        actions={[{ label: '+ 새 세션', onClick: handleNewSession, variant: 'primary' }]}
      />

      {/* KPI Cards */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: '전체 세션',
              value: SESSIONS.length,
              sub: '누적 세션 수',
              borderColor: 'border-l-blue-500',
              textColor: 'text-blue-600',
              icon: <MessageSquare size={18} className="text-blue-400" />,
            },
            {
              label: '오늘 세션',
              value: SESSIONS.filter((s) => s.date === '2026-06-04').length,
              sub: '오늘 생성된 세션',
              borderColor: 'border-l-emerald-500',
              textColor: 'text-emerald-600',
              icon: <Clock size={18} className="text-emerald-400" />,
            },
            {
              label: '총 메시지',
              value: SESSIONS.reduce((acc, s) => acc + s.messageCount, 0).toLocaleString(),
              sub: '누적 대화 메시지',
              borderColor: 'border-l-yellow-400',
              textColor: 'text-yellow-600',
              icon: <Hash size={18} className="text-yellow-400" />,
            },
            {
              label: '평균 메시지/세션',
              value: Math.round(SESSIONS.reduce((acc, s) => acc + s.messageCount, 0) / SESSIONS.length),
              sub: '세션당 평균 대화 수',
              borderColor: 'border-l-purple-400',
              textColor: 'text-purple-600',
              icon: <Zap size={18} className="text-purple-400" />,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.borderColor} shadow-sm p-5`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                {kpi.icon}
              </div>
              <p className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Chat Area */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex overflow-hidden" style={{ height: 'calc(100vh - 340px)', minHeight: '560px' }}>

          {/* ----------------------------------------------------------------
              Left Panel: Session List
          ---------------------------------------------------------------- */}
          <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">세션 목록</h2>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2563eb] hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Plus size={12} />
                  새 세션
                </button>
              </div>
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="세션 검색..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => { setSelectedSession(session); setMessages(SAMPLE_MESSAGES); }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors group ${
                    selectedSession.id === session.id ? 'bg-blue-50 border-l-2 border-l-[#2563eb]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className={`text-xs font-medium leading-snug line-clamp-2 flex-1 ${
                      selectedSession.id === session.id ? 'text-[#1e3a5f]' : 'text-gray-800'
                    }`}>
                      {session.title}
                    </span>
                    {selectedSession.id === session.id && (
                      <ChevronRight size={12} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-1.5">{session.preview}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{session.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                        <MessageSquare size={10} />
                        {session.messageCount}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        session.model === 'GPT-4o'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {session.model === 'GPT-4o' ? 'GPT' : 'Claude'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredSessions.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-gray-400">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              Right Panel: Chat UI
          ---------------------------------------------------------------- */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{selectedSession.title}</p>
                  <p className="text-xs text-gray-500">{selectedSession.model} · {selectedSession.date}</p>
                </div>
              </div>
              <button className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>

            {/* Quick Chips */}
            <div className="px-5 py-2.5 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex gap-2 flex-wrap">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleChipClick(chip.query)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-gray-600 rounded-full border border-gray-200 transition-colors"
                  >
                    <span>{chip.icon}</span>
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                    <Bot size={28} className="text-[#2563eb]" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Akos AI 어시스턴트</p>
                  <p className="text-xs text-gray-400">위의 빠른 질문 칩을 선택하거나 직접 질문을 입력하세요.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
                    msg.role === 'user'
                      ? 'bg-[#2563eb]'
                      : 'bg-[#1e3a5f]'
                  }`}>
                    {msg.role === 'user'
                      ? <User size={13} className="text-white" />
                      : <Bot size={13} className="text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[72%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#2563eb] text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                    }`}>
                      {renderContent(msg.content)}
                    </div>
                    <span className="text-xs text-gray-400 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-5 py-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-2 items-end">
                <div className="flex-1 border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#2563eb] focus-within:border-transparent transition-all">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="AI에게 질문하세요 (Shift+Enter로 줄바꿈, Enter로 전송)"
                    rows={2}
                    className="w-full px-4 py-3 text-sm resize-none focus:outline-none text-gray-800 placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isTyping}
                  className="flex-shrink-0 w-11 h-11 bg-[#2563eb] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 px-1">
                Akos AI MES · 생산/품질/설비 데이터 연동 중 · 응답은 참고용이며 최종 판단은 담당자가 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
