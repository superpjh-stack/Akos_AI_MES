"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = "준비중" | "출하예정" | "출하완료" | "납품완료" | "지연";

interface DeliveryRecord {
  id: string;
  deliveryNo: string;
  orderNo: string;
  customer: string;
  scheduledDate: string;
  actualDate: string | null;
  carrier: string;
  status: DeliveryStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDeliveries: DeliveryRecord[] = [
  {
    id: "1",
    deliveryNo: "DLV-2026-0001",
    orderNo: "ORD-2026-0041",
    customer: "(주)현대모비스",
    scheduledDate: "2026-06-05",
    actualDate: null,
    carrier: "CJ대한통운",
    status: "출하예정",
  },
  {
    id: "2",
    deliveryNo: "DLV-2026-0002",
    orderNo: "ORD-2026-0038",
    customer: "삼성전자(주)",
    scheduledDate: "2026-06-03",
    actualDate: "2026-06-03",
    carrier: "한진택배",
    status: "출하완료",
  },
  {
    id: "3",
    deliveryNo: "DLV-2026-0003",
    orderNo: "ORD-2026-0035",
    customer: "LG전자(주)",
    scheduledDate: "2026-06-01",
    actualDate: "2026-06-02",
    carrier: "롯데글로벌로지스",
    status: "납품완료",
  },
  {
    id: "4",
    deliveryNo: "DLV-2026-0004",
    orderNo: "ORD-2026-0040",
    customer: "(주)포스코",
    scheduledDate: "2026-06-02",
    actualDate: null,
    carrier: "CJ대한통운",
    status: "지연",
  },
  {
    id: "5",
    deliveryNo: "DLV-2026-0005",
    orderNo: "ORD-2026-0042",
    customer: "현대자동차(주)",
    scheduledDate: "2026-06-07",
    actualDate: null,
    carrier: "한진택배",
    status: "준비중",
  },
  {
    id: "6",
    deliveryNo: "DLV-2026-0006",
    orderNo: "ORD-2026-0036",
    customer: "SK하이닉스(주)",
    scheduledDate: "2026-05-30",
    actualDate: "2026-05-30",
    carrier: "롯데글로벌로지스",
    status: "납품완료",
  },
  {
    id: "7",
    deliveryNo: "DLV-2026-0007",
    orderNo: "ORD-2026-0043",
    customer: "(주)현대모비스",
    scheduledDate: "2026-06-08",
    actualDate: null,
    carrier: "CJ대한통운",
    status: "준비중",
  },
  {
    id: "8",
    deliveryNo: "DLV-2026-0008",
    orderNo: "ORD-2026-0039",
    customer: "삼성SDI(주)",
    scheduledDate: "2026-06-04",
    actualDate: null,
    carrier: "한진택배",
    status: "출하예정",
  },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color: "blue" | "green" | "red" | "orange";
  icon: React.ReactNode;
}

function KpiCard({ title, value, unit, color, icon }: KpiCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      value: "text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      value: "text-green-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      value: "text-red-700",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      value: "text-orange-700",
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.bg} p-5 flex items-center gap-4 shadow-sm`}
    >
      <div className={`text-3xl ${c.icon}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold ${c.value}`}>
          {value}
          {unit && (
            <span className="text-base font-normal ml-1 text-gray-500">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const styleMap: Record<DeliveryStatus, string> = {
    준비중: "bg-gray-100 text-gray-700 border-gray-300",
    출하예정: "bg-blue-100 text-blue-700 border-blue-300",
    출하완료: "bg-purple-100 text-purple-700 border-purple-300",
    납품완료: "bg-green-100 text-green-700 border-green-300",
    지연: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleMap[status]}`}
    >
      {status}
    </span>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function DeliveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "전체">(
    "전체"
  );

  // KPI calculations
  const totalDeliveries = mockDeliveries.length;
  const delayedDeliveries = mockDeliveries.filter(
    (d) => d.status === "지연"
  ).length;
  const upcomingDeliveries = mockDeliveries.filter(
    (d) => d.status === "출하예정"
  ).length;
  const onTimeRate =
    totalDeliveries > 0
      ? Math.round(
          ((totalDeliveries - delayedDeliveries) / totalDeliveries) * 100
        )
      : 0;

  // Filtered data
  const filteredDeliveries = mockDeliveries.filter((d) => {
    const matchesSearch =
      searchTerm === "" ||
      d.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer.includes(searchTerm) ||
      d.carrier.includes(searchTerm);
    const matchesStatus =
      statusFilter === "전체" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions: Array<DeliveryStatus | "전체"> = [
    "전체",
    "준비중",
    "출하예정",
    "출하완료",
    "납품완료",
    "지연",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">납품관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          출하 및 납품 현황을 조회하고 관리합니다.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="전체 납품건수"
          value={totalDeliveries}
          unit="건"
          color="blue"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>
          }
        />
        <KpiCard
          title="납기준수율"
          value={onTimeRate}
          unit="%"
          color="green"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KpiCard
          title="지연건수"
          value={delayedDeliveries}
          unit="건"
          color="red"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KpiCard
          title="출하예정"
          value={upcomingDeliveries}
          unit="건"
          color="orange"
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <input
          type="text"
          placeholder="납품번호, 수주번호, 고객사, 운송사 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">납품 목록</span>
          <span className="text-xs text-gray-400">
            {filteredDeliveries.length}건 표시
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-semibold">납품번호</th>
                <th className="px-5 py-3 text-left font-semibold">수주번호</th>
                <th className="px-5 py-3 text-left font-semibold">고객사</th>
                <th className="px-5 py-3 text-left font-semibold">납기예정</th>
                <th className="px-5 py-3 text-left font-semibold">실제납품</th>
                <th className="px-5 py-3 text-left font-semibold">운송사</th>
                <th className="px-5 py-3 text-left font-semibold">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400 text-sm"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-gray-800 font-medium">
                      {record.deliveryNo}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">
                      {record.orderNo}
                    </td>
                    <td className="px-5 py-3 text-gray-800">{record.customer}</td>
                    <td className="px-5 py-3 text-gray-700">{record.scheduledDate}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {record.actualDate ?? (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{record.carrier}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
