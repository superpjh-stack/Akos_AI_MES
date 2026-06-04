'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  '현재 생산 라인 상태는?',
  '오늘 불량률 리포트 요약해줘',
  '설비 예지 정비 일정 알려줘',
  '금주 생산 목표 달성률은?',
  '원자재 재고 현황 확인해줘',
  'AI 품질 검사 결과 분석해줘',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
          AI
        </div>
      )}
      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0 mt-1">
          나
        </div>
      )}
    </div>
  );
}

export default function AIAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        '안녕하세요! Akos AI MES 어시스턴트입니다.\n생산 현황, 품질 분석, 설비 상태 등 스마트 팩토리 운영에 관한 모든 질문을 도와드립니다.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getSimulatedResponse(trimmed),
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiResponse]);
  };

  const getSimulatedResponse = (query: string): string => {
    if (query.includes('생산 라인') || query.includes('상태')) {
      return '현재 생산 라인 A, B, C 모두 정상 가동 중입니다.\n- 라인 A: 95% 가동률\n- 라인 B: 88% 가동률 (경미한 속도 저하 감지)\n- 라인 C: 97% 가동률\n\n전체 OEE: 93.3% (목표 대비 +2.3%)';
    }
    if (query.includes('불량률') || query.includes('품질')) {
      return '오늘(06/03) 품질 현황:\n- 전체 불량률: 0.42% (목표 0.5% 이하 달성)\n- AI 비전 검사 정확도: 99.2%\n- 주요 불량 유형: 표면 스크래치 (0.18%), 치수 불량 (0.14%)\n\n전일 대비 불량률 0.08% 감소했습니다.';
    }
    if (query.includes('설비') || query.includes('정비')) {
      return '예지 정비 일정:\n- [긴급] CNC-03: 3일 이내 베어링 교체 필요\n- [권고] 컨베이어-B2: 7일 이내 벨트 점검\n- [정기] 프레스-01: 2026-06-15 정기 점검\n\nAI 이상 감지 기반 예측 신뢰도 94.7%';
    }
    if (query.includes('목표') || query.includes('달성')) {
      return '금주 생산 목표 달성률:\n- 월: 102% ✓\n- 화: 98% ✓\n- 수: 105% ✓\n- 목: 99% ✓\n- 금(오늘): 진행 중 (현재 76%)\n\n주간 누적 달성률: 101.2% — 목표 초과 달성 예상';
    }
    if (query.includes('재고') || query.includes('원자재')) {
      return '원자재 재고 현황:\n- 철판 (SUS304): 잔여 8.2톤 (적정 수준)\n- 알루미늄 합금: 잔여 2.1톤 [주의: 3일치 물량]\n- 구리 배선재: 잔여 5.6km (충분)\n\n알루미늄 합금 긴급 발주를 권장합니다.';
    }
    return `"${query}"에 대한 분석을 수행 중입니다.\n\n실제 운영 환경에서는 MES 데이터베이스와 연동하여 실시간 정보를 제공합니다. 현재는 데모 모드로 동작 중입니다.\n\n더 구체적인 질문을 해주시면 시뮬레이션 데이터를 기반으로 답변드릴 수 있습니다.`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Akos AI Agent</h1>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            온라인 · 스마트 팩토리 MES 연동
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
              AI
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">빠른 질문</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isTyping}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-blue-400 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 max-h-32 min-h-[24px]"
            rows={1}
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
