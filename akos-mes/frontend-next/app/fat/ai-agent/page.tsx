'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

function PageHeader({ title, section }: { title: string; section: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div><p className="text-xs text-gray-400 mb-0.5">{section}</p><h1 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>{title}</h1></div>
      <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
        <Sparkles size={12} /> AI 활성화
      </span>
    </div>
  );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex flex-col gap-1" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-2xl font-bold" style={{ color: color ?? '#1e3a5f' }}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

const AI_INSIGHTS = [
  { type: 'warning', icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2', title: 'FAT-2024-0033 재검사 필요', body: '배터리팩 조립라인의 안전회로 불량이 수정되었습니다. AI 분석 결과 동일 원인의 추가 불량 가능성이 72%입니다. 즉시 재검사를 권고합니다.', time: '5분 전' },
  { type: 'info', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff', title: 'PLC 데이터 이상 패턴 감지', body: '라인 A의 용접로봇 토크 값이 지난 2시간 동안 점진적으로 증가했습니다. 현재 정상 범위이나 24시간 내 이상 발생 가능성 38%. 예방 점검을 권고합니다.', time: '22분 전' },
  { type: 'success', icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4', title: 'FAT 자동 판정 완료', body: 'PLC 제어반(FAT-2024-0042)에 대한 86개 항목 자동 점검이 완료되었습니다. 전 항목 합격 기준 충족. 최종 합격 처리를 권고합니다.', time: '1시간 전' },
  { type: 'info', icon: Clock, color: '#7c3aed', bg: '#f5f3ff', title: '검사 일정 최적화 제안', body: '다음 주 FAT 일정 분석 결과, 라인 B의 검사 병렬화가 가능합니다. 현재 계획 대비 1.5일 단축 가능합니다.', time: '3시간 전' },
];

const CHAT_HISTORY = [
  { role: 'user', text: 'FAT-2024-0033 불합격 원인을 분석해줘', time: '14:22' },
  { role: 'ai', text: 'FAT-2024-0033 분석 결과:\n\n주요 불합격 원인 (25건/165항목):\n1. 안전회로 동작불량 (치명) - 1건: 배터리 과충전 보호 회로 미작동\n2. 치수 오차 (중결함) - 8건: 주로 용접 후 변형으로 인한 오차\n3. 기능 오류 (중결함) - 6건: 속도 제어 응답 지연\n4. 외관 불량 (경결함) - 10건: 도장 불균일, 스크래치\n\nAI 권고: 안전회로 설계 재검토 및 용접 지그 정밀도 향상이 우선 필요합니다.', time: '14:22' },
  { role: 'user', text: '유사 불량이 다른 제품에도 발생할 가능성은?', time: '14:25' },
  { role: 'ai', text: '과거 18개월 데이터를 기반으로 유사 불량 발생 가능성 분석:\n\n• SO-2024-0312 (용접라인): 용접 변형 유사 문제 가능성 45%\n• SO-2024-0285 (컨베이어): 속도 제어 오차 유사 가능성 28%\n\n선제적으로 해당 제품의 용접 치수 중간 검사 실시를 권고합니다.', time: '14:25' },
];

export default function FatAiAgentPage() {
  const [input, setInput] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader title="AI 에이전트" section="FAT 관리" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="AI 분석 완료" value="128건" sub="이번달" color="#7c3aed" />
        <KpiCard label="자동 판정 정확도" value="96.8%" sub="목표 95% 초과" color="#16a34a" />
        <KpiCard label="불량 사전 예측" value="12건" sub="예방 조치 완료" color="#2563eb" />
        <KpiCard label="평균 응답 시간" value="1.2초" sub="전월 대비 -0.3초" color="#d97706" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h2 className="text-base font-semibold text-gray-800">AI 인사이트 & 권고</h2>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '360px' }}>
            {AI_INSIGHTS.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: ins.bg, border: `1px solid ${ins.bg.replace('f','e')}` }}>
                  <div className="flex items-start gap-2.5">
                    <Icon size={16} style={{ color: ins.color, flexShrink: 0, marginTop: 1 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold" style={{ color: ins.color }}>{ins.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{ins.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ins.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat interface */}
        <div className="bg-white rounded-lg flex flex-col" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '460px' }}>
          <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">FAT AI Agent</div>
              <div className="text-xs text-green-600">온라인</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {CHAT_HISTORY.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] rounded-lg px-3 py-2" style={{
                  backgroundColor: msg.role === 'user' ? '#2563eb' : '#f3f4f6',
                  color: msg.role === 'user' ? 'white' : '#374151',
                }}>
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3" style={{ borderTop: '1px solid #f3f4f6' }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setInput('')}
                className="flex-1 text-sm px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="FAT 관련 질문을 입력하세요..."
              />
              <button onClick={() => setInput('')} className="px-3 py-2 rounded-md text-white flex-shrink-0" style={{ backgroundColor: '#2563eb' }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
