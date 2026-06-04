"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ───────────────────────────── 더미 데이터 ─────────────────────────────

const kpiData = [
  {
    id: "oee",
    label: "설비 종합효율 (OEE)",
    value: "87.3%",
    delta: "+2.1%",
    positive: true,
    icon: "⚙️",
  },
  {
    id: "defect",
    label: "불량률",
    value: "1.24%",
    delta: "-0.18%",
    positive: true,
    icon: "🔍",
  },
  {
    id: "throughput",
    label: "시간당 생산량",
    value: "1,248 pcs",
    delta: "+56 pcs",
    positive: true,
    icon: "🏭",
  },
  {
    id: "downtime",
    label: "비계획 다운타임",
    value: "3.2 h",
    delta: "+0.4 h",
    positive: false,
    icon: "⏱️",
  },
];

const lineProductionData = [
  { line: "라인 A", 목표: 1200, 실적: 1248, 불량: 16 },
  { line: "라인 B", 목표: 1100, 실적: 1032, 불량: 24 },
  { line: "라인 C", 목표: 1300, 실적: 1310, 불량: 11 },
  { line: "라인 D", 목표: 900, 실적: 870, 불량: 18 },
  { line: "라인 E", 목표: 1050, 실적: 1100, 불량: 9 },
];

const defectTypeData = [
  { type: "치수 불량", count: 42, ratio: 35 },
  { type: "표면 결함", count: 28, ratio: 23 },
  { type: "조립 오류", count: 22, ratio: 18 },
  { type: "도장 불량", count: 17, ratio: 14 },
  { type: "기타", count: 12, ratio: 10 },
];

const aiInsights = [
  {
    id: 1,
    severity: "high",
    title: "라인 B 생산 효율 저하 감지",
    body: "라인 B의 실적이 목표 대비 6.2% 미달하고 있습니다. 설비 C-204의 주축 진동이 임계값(3.2 mm/s)을 초과했으며, 예방 정비를 권장합니다.",
    action: "정비 작업 지시 생성",
  },
  {
    id: 2,
    severity: "medium",
    title: "치수 불량 증가 패턴 감지",
    body: "지난 4시간 동안 치수 불량이 전일 대비 18% 증가했습니다. 절삭 공구 마모가 주요 원인으로 추정됩니다. 공구 교체 주기 재검토를 권장합니다.",
    action: "공구 교체 알림 발송",
  },
  {
    id: 3,
    severity: "low",
    title: "라인 C·E 우수 성과",
    body: "라인 C와 E는 목표 대비 각각 +0.8%, +4.8% 초과 달성했습니다. 현재 공정 파라미터를 표준으로 등록하여 타 라인에 적용하면 전체 생산성 향상이 기대됩니다.",
    action: "베스트 프랙티스 등록",
  },
];

// ───────────────────────────── 헬퍼 매핑 ─────────────────────────────

const severityStyle: Record<string, string> = {
  high: "border-red-500 bg-red-50",
  medium: "border-yellow-500 bg-yellow-50",
  low: "border-green-500 bg-green-50",
};

const severityBadge: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const severityLabel: Record<string, string> = {
  high: "긴급",
  medium: "주의",
  low: "정보",
};

// ───────────────────────────── 페이지 컴포넌트 ─────────────────────────────

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<"production" | "defect">(
    "production"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">생산 / 품질 분석</h1>
          <p className="text-sm text-gray-500 mt-1">
            2026-06-03 기준 · 실시간 AI 분석 결과
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          리포트 내보내기
        </button>
      </div>

      {/* KPI 요약 카드 4개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {kpi.label}
              </span>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
            <div
              className={`text-sm font-medium ${
                kpi.positive ? "text-green-600" : "text-red-500"
              }`}
            >
              {kpi.delta}{" "}
              <span className="text-gray-400 font-normal">전일 대비</span>
            </div>
          </div>
        ))}
      </div>

      {/* 차트 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("production")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "production"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            라인별 생산 현황
          </button>
          <button
            onClick={() => setActiveTab("defect")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "defect"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            불량 유형 분포
          </button>
        </div>

        {/* 라인별 생산 차트 */}
        {activeTab === "production" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              라인별 목표 vs 실적 (단위: pcs)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lineProductionData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="line" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="목표" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="실적" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="불량" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 불량 유형 차트 */}
        {activeTab === "defect" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              불량 유형별 발생 건수
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={defectTypeData}
                layout="vertical"
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="type"
                  type="category"
                  tick={{ fontSize: 13 }}
                  width={90}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="발생 건수"
                  fill="#f97316"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="ratio"
                  name="비율 (%)"
                  fill="#fb923c"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AI 인사이트 카드 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          AI 인사이트
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-xl border-l-4 p-5 flex flex-col gap-3 shadow-sm ${
                severityStyle[insight.severity]
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    severityBadge[insight.severity]
                  }`}
                >
                  {severityLabel[insight.severity]}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {insight.title}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {insight.body}
              </p>
              <button className="self-start mt-auto px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                {insight.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
