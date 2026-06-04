"use client";

import { useState } from "react";

interface QuestionHistory {
  id: string;
  question: string;
  answer: string;
  responseTime: number; // ms
  rating: number | null; // 1~5, null if not rated
  createdAt: string;
}

const mockData: QuestionHistory[] = [
  {
    id: "1",
    question: "현재 라인 3의 불량률은 얼마인가요?",
    answer: "라인 3의 현재 불량률은 2.3%입니다. 지난주 평균 대비 0.5% 감소하였습니다.",
    responseTime: 320,
    rating: 5,
    createdAt: "2026-06-03T09:15:00",
  },
  {
    id: "2",
    question: "금일 생산 목표 달성률을 알려주세요.",
    answer: "금일 생산 목표 달성률은 87.4%입니다. 목표 대비 현재 진행 중이며, 오후 근무 완료 시 95% 이상 달성 예상입니다.",
    responseTime: 480,
    rating: 4,
    createdAt: "2026-06-03T10:32:00",
  },
  {
    id: "3",
    question: "설비 A-07의 최근 유지보수 이력은?",
    answer: "설비 A-07의 최근 유지보수는 2026-05-28에 진행되었습니다. 윤활유 교체 및 벨트 장력 조정이 수행되었습니다.",
    responseTime: 610,
    rating: 3,
    createdAt: "2026-06-02T14:20:00",
  },
  {
    id: "4",
    question: "이번 주 에너지 소비 현황을 요약해주세요.",
    answer: "이번 주 에너지 소비는 총 1,240 kWh로, 전주 대비 3.2% 감소하였습니다. 주요 절감 요인은 라인 2 야간 대기 모드 적용입니다.",
    responseTime: 890,
    rating: null,
    createdAt: "2026-06-02T16:45:00",
  },
  {
    id: "5",
    question: "품질 검사 결과 중 재작업 대상 항목은?",
    answer: "오늘 품질 검사에서 재작업 대상은 총 14건입니다. 주요 원인은 치수 불량(8건), 표면 스크래치(4건), 기타(2건)입니다.",
    responseTime: 415,
    rating: 5,
    createdAt: "2026-06-01T11:05:00",
  },
];

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-gray-400 text-sm">미평가</span>;
  }
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AIHistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<string>("all");

  const filtered = mockData.filter((item) => {
    if (filterRating === "all") return true;
    if (filterRating === "unrated") return item.rating === null;
    return item.rating === Number(filterRating);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI 질문 이력</h1>
        <p className="text-gray-500 mt-1">사용자 질문 내용, 응답시간 및 유용도 평가 이력을 확인합니다.</p>
      </div>

      {/* 필터 영역 */}
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium text-gray-600">유용도 필터:</label>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="5">★★★★★ (5점)</option>
          <option value="4">★★★★☆ (4점)</option>
          <option value="3">★★★☆☆ (3점)</option>
          <option value="2">★★☆☆☆ (2점)</option>
          <option value="1">★☆☆☆☆ (1점)</option>
          <option value="unrated">미평가</option>
        </select>
        <span className="text-sm text-gray-400">총 {filtered.length}건</span>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">질문 내용</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">응답 시간</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">유용도 평가</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">질문 일시</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  조건에 맞는 이력이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <>
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                  >
                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-xs truncate">
                      <span className="font-medium">{item.question}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatResponseTime(item.responseTime)}
                    </td>
                    <td className="px-4 py-3">
                      <RatingStars rating={item.rating} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr key={`${item.id}-detail`} className="bg-blue-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">질문</span>
                          <p className="mt-1 text-gray-800">{item.question}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">AI 응답</span>
                          <p className="mt-1 text-gray-700 leading-relaxed">{item.answer}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        * 행을 클릭하면 AI 응답 내용을 확인할 수 있습니다.
      </p>
    </div>
  );
}
