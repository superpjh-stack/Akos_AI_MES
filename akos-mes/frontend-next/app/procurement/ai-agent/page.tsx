'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: AlertItem[] | RiskItem[] | SupplierItem[] | OrderItem[];
  dataType?: 'risk' | 'supplier' | 'order' | 'leadtime';
}

interface AlertItem {
  id: string;
  level: 'urgent' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
}

interface RiskItem {
  material: string;
  supplier: string;
  expectedDate: string;
  delayDays: number;
  riskLevel: '높음' | '중간' | '낮음';
}

interface SupplierItem {
  rank: number;
  name: string;
  score: number;
  leadtime: string;
  price: string;
  reliability: string;
}

interface OrderItem {
  material: string;
  quantity: string;
  amount: string;
  supplier: string;
  status: '입고완료' | '배송중' | '발주확인' | '지연';
}

const todayAlerts: AlertItem[] = [
  {
    id: 'A001',
    level: 'urgent',
    title: '납기 지연 긴급 경보',
    detail: 'MCU STM32F4 - 한국반도체(주) 납기 7일 초과 예상',
    time: '09:15',
  },
  {
    id: 'A002',
    level: 'warning',
    title: '재고 부족 경고',
    detail: '알루미늄 압출 프로파일 재고 3일치 미만, 긴급 발주 검토 필요',
    time: '10:32',
  },
  {
    id: 'A003',
    level: 'info',
    title: '공급사 단가 갱신',
    detail: '(주)대성전자 2024년 하반기 단가표 수신 완료, 검토 대기',
    time: '11:47',
  },
];

const mockResponses: Record<string, { text: string; dataType?: Message['dataType']; data?: Message['data'] }> = {
  '납기 지연 위험 자재?': {
    text: '현재 납기 지연 위험이 있는 자재를 분석했습니다. 총 3건의 위험 자재가 식별되었으며, 특히 MCU STM32F4는 즉각적인 조치가 필요합니다.',
    dataType: 'risk',
    data: [
      { material: 'MCU STM32F4', supplier: '한국반도체(주)', expectedDate: '2026-06-08', delayDays: 7, riskLevel: '높음' },
      { material: '알루미늄 압출 프로파일 A형', supplier: '영진알루미늄', expectedDate: '2026-06-12', delayDays: 3, riskLevel: '중간' },
      { material: 'DC모터 24V 100W', supplier: '모터텍코리아', expectedDate: '2026-06-15', delayDays: 2, riskLevel: '낮음' },
    ] as RiskItem[],
  },
  '대체 공급사 추천': {
    text: 'MCU STM32F4 기준으로 대체 가능한 공급사를 분석했습니다. 과거 거래 이력, 리드타임, 품질 점수를 종합하여 추천 순위를 산출했습니다.',
    dataType: 'supplier',
    data: [
      { rank: 1, name: '(주)엘에스반도체', score: 92, leadtime: '5일', price: '₩4,200', reliability: '98.5%' },
      { rank: 2, name: '한화시스템즈 전자', score: 88, leadtime: '7일', price: '₩3,950', reliability: '96.2%' },
      { rank: 3, name: '대림전자부품', score: 81, leadtime: '10일', price: '₩3,700', reliability: '93.8%' },
    ] as SupplierItem[],
  },
  '이번달 발주 현황': {
    text: '2026년 6월 발주 현황입니다. 이번달 총 발주 금액은 ₩87,450,000이며 12건의 발주 중 8건이 정상 진행 중입니다.',
    dataType: 'order',
    data: [
      { material: 'MCU STM32F4 x500', quantity: '500개', amount: '₩21,000,000', supplier: '한국반도체(주)', status: '지연' },
      { material: '서보드라이버 400W x20', quantity: '20대', amount: '₩18,400,000', supplier: '파나소닉코리아', status: '배송중' },
      { material: 'HMI 터치패널 10인치 x10', quantity: '10대', amount: '₩15,200,000', supplier: '지멘스코리아', status: '입고완료' },
      { material: 'PLC 모듈 x30', quantity: '30개', amount: '₩12,600,000', supplier: '미쓰비시전기', status: '발주확인' },
    ] as OrderItem[],
  },
  '리드타임 분석': {
    text: '최근 6개월간 주요 자재별 리드타임 분석 결과입니다. 전자부품 카테고리의 평균 리드타임이 전분기 대비 2.3일 증가했습니다. AI 예측 모델 기준 7월 리드타임은 추가 1.5일 증가가 예상됩니다.',
    dataType: 'leadtime',
    data: [
      { material: '전자부품 (MCU/센서)', supplier: '평균 리드타임', expectedDate: '12.3일', delayDays: 2, riskLevel: '중간' },
      { material: '기구부품 (알루미늄/철강)', supplier: '평균 리드타임', expectedDate: '8.7일', delayDays: 0, riskLevel: '낮음' },
      { material: '전장부품 (모터/드라이버)', supplier: '평균 리드타임', expectedDate: '15.1일', delayDays: 3, riskLevel: '높음' },
      { material: '소모품 (케이블/커넥터)', supplier: '평균 리드타임', expectedDate: '5.2일', delayDays: 0, riskLevel: '낮음' },
    ] as RiskItem[],
  },
};

const initialMessages: Message[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content:
      '안녕하세요! 구매조달 AI Agent입니다. 자재 발주, 공급사 관리, 리드타임, 납기 지연 이력 데이터를 기반으로 조달 의사결정을 지원합니다.',
    timestamp: new Date(),
  },
  {
    id: 'init-2',
    role: 'assistant',
    content:
      '다음과 같은 질문을 해보세요:\n• "이번 주 납기 지연 위험 자재 알려줘"\n• "MCU 계열 대체 공급사 추천해줘"\n• "6월 발주 현황 요약해줘"\n• "리드타임이 긴 자재 분석해줘"',
    timestamp: new Date(),
  },
];

function AlertBadge({ level }: { level: AlertItem['level'] }) {
  const styles: Record<AlertItem['level'], { bg: string; text: string; label: string }> = {
    urgent: { bg: '#fee2e2', text: '#dc2626', label: '긴급' },
    warning: { bg: '#fef3c7', text: '#d97706', label: '경고' },
    info: { bg: '#dbeafe', text: '#2563eb', label: '정보' },
  };
  const s = styles[level];
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.text,
        fontSize: '11px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '999px',
      }}
    >
      {s.label}
    </span>
  );
}

function RiskTable({ data }: { data: RiskItem[] }) {
  const riskColor: Record<string, string> = { 높음: '#dc2626', 중간: '#d97706', 낮음: '#16a34a' };
  return (
    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            {['자재명', '공급사', '예상납기', '지연(일)', '위험도'].map((h) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 10px', fontWeight: 500 }}>{r.material}</td>
              <td style={{ padding: '8px 10px', color: '#6b7280' }}>{r.supplier}</td>
              <td style={{ padding: '8px 10px' }}>{r.expectedDate}</td>
              <td style={{ padding: '8px 10px', color: r.delayDays > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {r.delayDays > 0 ? `+${r.delayDays}일` : '정상'}
              </td>
              <td style={{ padding: '8px 10px' }}>
                <span style={{ color: riskColor[r.riskLevel], fontWeight: 700 }}>{r.riskLevel}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SupplierTable({ data }: { data: SupplierItem[] }) {
  return (
    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            {['순위', '공급사명', 'AI점수', '리드타임', '단가', '납기준수율'].map((h) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#2563eb' }}>#{s.rank}</td>
              <td style={{ padding: '8px 10px', fontWeight: 500 }}>{s.name}</td>
              <td style={{ padding: '8px 10px' }}>
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {s.score}점
                </span>
              </td>
              <td style={{ padding: '8px 10px' }}>{s.leadtime}</td>
              <td style={{ padding: '8px 10px' }}>{s.price}</td>
              <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 600 }}>{s.reliability}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderTable({ data }: { data: OrderItem[] }) {
  const statusStyle: Record<OrderItem['status'], { bg: string; color: string }> = {
    입고완료: { bg: '#dcfce7', color: '#16a34a' },
    배송중: { bg: '#dbeafe', color: '#2563eb' },
    발주확인: { bg: '#fef3c7', color: '#d97706' },
    지연: { bg: '#fee2e2', color: '#dc2626' },
  };
  return (
    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            {['자재', '수량', '금액', '공급사', '상태'].map((h) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((o, i) => (
            <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 10px', fontWeight: 500 }}>{o.material}</td>
              <td style={{ padding: '8px 10px', color: '#6b7280' }}>{o.quantity}</td>
              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{o.amount}</td>
              <td style={{ padding: '8px 10px', color: '#6b7280' }}>{o.supplier}</td>
              <td style={{ padding: '8px 10px' }}>
                <span
                  style={{
                    backgroundColor: statusStyle[o.status].bg,
                    color: statusStyle[o.status].color,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '10px',
        marginBottom: '16px',
        alignItems: 'flex-start',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          🤖
        </div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div
          style={{
            backgroundColor: isUser ? '#2563eb' : '#f9fafb',
            color: isUser ? 'white' : '#1f2937',
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            fontSize: '14px',
            lineHeight: '1.6',
            border: isUser ? 'none' : '1px solid #e5e7eb',
            whiteSpace: 'pre-line',
          }}
        >
          {msg.content}
        </div>
        {msg.dataType === 'risk' && msg.data && <RiskTable data={msg.data as RiskItem[]} />}
        {msg.dataType === 'supplier' && msg.data && <SupplierTable data={msg.data as SupplierItem[]} />}
        {msg.dataType === 'order' && msg.data && <OrderTable data={msg.data as OrderItem[]} />}
        {msg.dataType === 'leadtime' && msg.data && <RiskTable data={msg.data as RiskItem[]} />}
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
          {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          👤
        </div>
      )}
    </div>
  );
}

const quickQueries = ['납기 지연 위험 자재?', '대체 공급사 추천', '이번달 발주 현황', '리드타임 분석'];

export default function ProcurementAIAgentPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleSend(text?: string) {
    const query = (text ?? input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const matched = Object.keys(mockResponses).find((k) => query.includes(k.replace('?', '')));
      const response = matched
        ? mockResponses[matched]
        : {
            text: `"${query}"에 대한 조달 데이터를 분석 중입니다. 현재 시스템에 연결된 발주 DB, 공급사 마스터, 리드타임 이력을 기반으로 답변드리겠습니다. 더 구체적인 자재명이나 공급사명을 포함하여 다시 질문해 주시면 정확한 분석이 가능합니다.`,
          };

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        dataType: response.dataType,
        data: response.data,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>구매조달관리</span>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>/</span>
          <span style={{ color: '#1e3a5f', fontSize: '13px', fontWeight: 600 }}>구매조달 AI Agent</span>
        </div>
        <h1 style={{ color: '#1e3a5f', fontSize: '22px', fontWeight: 700, margin: 0 }}>구매조달 AI Agent</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* 메인 채팅 영역 */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 채팅 헤더 */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f9fafb',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '15px' }}>구매조달 AI Agent</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>발주 · 공급사 · 리드타임 · 납기 분석</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                }}
              />
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>연결됨</span>
              <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>· MES DB 동기화</span>
            </div>
          </div>

          {/* 빠른 질의 버튼 */}
          <div
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center' }}>빠른 질의:</span>
            {quickQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dbeafe';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* 채팅 메시지 영역 */}
          <div
            style={{
              padding: '20px',
              overflowY: 'auto',
              height: '480px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: `bounce 1.2s infinite ${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 입력창 */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="납기 지연 위험 자재를 알려주세요... (Enter로 전송)"
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '999px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              style={{
                backgroundColor: input.trim() && !isTyping ? '#2563eb' : '#93c5fd',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              전송
            </button>
          </div>
        </div>

        {/* 사이드 패널: 오늘의 조달 경보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ color: '#1e3a5f', fontSize: '14px', fontWeight: 700, margin: 0 }}>
                오늘의 조달 경보
              </h3>
              <span
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {todayAlerts.length}건
              </span>
            </div>
            <div style={{ padding: '12px' }}>
              {todayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #f3f4f6',
                    marginBottom: '8px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <AlertBadge level={alert.level} />
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{alert.time}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '13px', marginBottom: '4px' }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>{alert.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI 조달 통계 */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: '16px 18px',
            }}
          >
            <h3 style={{ color: '#1e3a5f', fontSize: '14px', fontWeight: 700, margin: '0 0 14px 0' }}>
              이번달 조달 현황
            </h3>
            {[
              { label: '총 발주 건수', value: '12건', color: '#2563eb' },
              { label: '납기 준수율', value: '75.0%', color: '#16a34a' },
              { label: '지연 발주', value: '3건', color: '#dc2626' },
              { label: '총 발주 금액', value: '₩87.5M', color: '#7c3aed' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* AI 권장 조치 */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 18px',
            }}
          >
            <h3 style={{ color: '#1e3a5f', fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0' }}>
              AI 권장 조치
            </h3>
            {[
              'MCU STM32F4 대체 공급사 즉시 컨택',
              '알루미늄 프로파일 긴급 발주 승인 요청',
              '7월 장기 리드타임 자재 선발주 검토',
            ].map((action, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}
              >
                <span
                  style={{
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1px',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.5' }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
