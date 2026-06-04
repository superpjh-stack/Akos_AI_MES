"use client";

import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "red" | "green" | "blue" | "yellow";
}

function KpiCard({ title, value, unit, trend, trendValue, color = "blue" }: KpiCardProps) {
  const colorMap = {
    red: "border-red-500 bg-red-50",
    green: "border-green-500 bg-green-50",
    blue: "border-blue-500 bg-blue-50",
    yellow: "border-yellow-500 bg-yellow-50",
  };

  const trendColor =
    trend === "up" ? "text-red-500" : trend === "down" ? "text-green-500" : "text-gray-500";

  return (
    <div className={`rounded-xl border-l-4 p-6 shadow-sm ${colorMap[color]}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">
        {value}
        <span className="ml-1 text-base font-normal text-gray-500">{unit}</span>
      </p>
      {trendValue && (
        <p className={`mt-1 text-sm ${trendColor}`}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "–"} {trendValue}
        </p>
      )}
    </div>
  );
}

const qualityTableData = [
  { process: "가공", target: 0.5, actual: 0.42, status: "정상" },
  { process: "조립", target: 0.3, actual: 0.61, status: "경고" },
  { process: "도장", target: 0.8, actual: 0.75, status: "정상" },
  { process: "검사", target: 0.2, actual: 0.18, status: "정상" },
  { process: "포장", target: 0.1, actual: 0.22, status: "이상" },
];

export default function QualityKpiPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">품질 KPI 대시보드</h1>
        <p className="mb-8 text-sm text-gray-500">기준일: 2026-06-03 | 갱신 주기: 실시간</p>

        {/* KPI Cards */}
        <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="불량률"
            value="0.43"
            unit="%"
            trend="down"
            trendValue="전월 대비 0.07%p 감소"
            color="green"
          />
          <KpiCard
            title="FAT 합격률"
            value="98.6"
            unit="%"
            trend="up"
            trendValue="전월 대비 0.4%p 증가"
            color="blue"
          />
          <KpiCard
            title="고객 불만 건수"
            value="3"
            unit="건"
            trend="down"
            trendValue="전월 대비 2건 감소"
            color="yellow"
          />
          <KpiCard
            title="품질 비용"
            value="12.4"
            unit="백만원"
            trend="up"
            trendValue="전월 대비 1.2백만원 증가"
            color="red"
          />
        </section>

        {/* 공정별 품질 테이블 */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-700">공정별 불량률 현황</h2>
          <div className="overflow-hidden rounded-xl shadow-sm">
            <table className="w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="px-6 py-3 font-semibold">공정명</th>
                  <th className="px-6 py-3 font-semibold">목표 불량률 (%)</th>
                  <th className="px-6 py-3 font-semibold">실적 불량률 (%)</th>
                  <th className="px-6 py-3 font-semibold">상태</th>
                </tr>
              </thead>
              <tbody>
                {qualityTableData.map((row, index) => {
                  const statusColor =
                    row.status === "정상"
                      ? "text-green-600 bg-green-100"
                      : row.status === "경고"
                      ? "text-yellow-600 bg-yellow-100"
                      : "text-red-600 bg-red-100";

                  return (
                    <tr
                      key={row.process}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{row.process}</td>
                      <td className="px-6 py-4 text-gray-600">{row.target.toFixed(1)}</td>
                      <td className="px-6 py-4 text-gray-600">{row.actual.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
