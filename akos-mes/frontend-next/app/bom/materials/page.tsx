"use client";

import React from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type MaterialStatus = "재고충분" | "재고부족" | "안전재고" | "발주중" | "단종";

interface Material {
  id: string;
  name: string;
  code: string;
  unit: string;
  stock: number;
  safeStock: number;
  unitPrice: number;
  supplier: string;
  status: MaterialStatus;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const materials: Material[] = [
  {
    id: "MAT-001",
    name: "알루미늄 판재 (2mm)",
    code: "ALU-2T-001",
    unit: "장",
    stock: 320,
    safeStock: 100,
    unitPrice: 45000,
    supplier: "(주)한국알루미늄",
    status: "재고충분",
  },
  {
    id: "MAT-002",
    name: "스테인리스 볼트 M8×20",
    code: "STS-BLT-M820",
    unit: "개",
    stock: 85,
    safeStock: 200,
    unitPrice: 350,
    supplier: "대성산업(주)",
    status: "재고부족",
  },
  {
    id: "MAT-003",
    name: "실리콘 패킹 (50mm)",
    code: "SIL-PKG-50",
    unit: "m",
    stock: 150,
    safeStock: 150,
    unitPrice: 3200,
    supplier: "한일고무공업",
    status: "안전재고",
  },
  {
    id: "MAT-004",
    name: "PCB 기판 v2.1",
    code: "PCB-V21-STD",
    unit: "장",
    stock: 40,
    safeStock: 80,
    unitPrice: 125000,
    supplier: "스마트회로(주)",
    status: "발주중",
  },
  {
    id: "MAT-005",
    name: "구형 커넥터 A타입",
    code: "CON-A-OLD",
    unit: "개",
    stock: 12,
    safeStock: 50,
    unitPrice: 8800,
    supplier: "-",
    status: "단종",
  },
];

// ── KPI Derived Values ────────────────────────────────────────────────────────

const totalMaterials = materials.length;
const lowStockCount = materials.filter((m) => m.stock < m.safeStock).length;
const atSafeStockCount = materials.filter(
  (m) => m.stock === m.safeStock
).length;
const totalInventoryValue = materials.reduce(
  (sum, m) => sum + m.stock * m.unitPrice,
  0
);

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "red" | "yellow" | "blue" | "green";
}) {
  const accentColor: Record<string, string> = {
    red: "text-red-600",
    yellow: "text-yellow-500",
    blue: "text-blue-600",
    green: "text-emerald-600",
  };
  const borderColor: Record<string, string> = {
    red: "border-red-400",
    yellow: "border-yellow-400",
    blue: "border-blue-400",
    green: "border-emerald-400",
  };
  const color = accent ?? "blue";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 ${borderColor[color]} p-5 flex flex-col gap-1`}
    >
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-3xl font-bold ${accentColor[color]} leading-tight`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: MaterialStatus }) {
  const styles: Record<MaterialStatus, string> = {
    재고충분: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    재고부족: "bg-red-100 text-red-700 border border-red-300",
    안전재고: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    발주중: "bg-blue-100 text-blue-700 border border-blue-300",
    단종: "bg-gray-100 text-gray-500 border border-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StockCell({
  stock,
  safeStock,
}: {
  stock: number;
  safeStock: number;
}) {
  let cellClass = "font-semibold ";
  if (stock < safeStock) {
    cellClass += "text-red-600";
  } else if (stock === safeStock) {
    cellClass += "text-yellow-600";
  } else {
    cellClass += "text-emerald-700";
  }

  return (
    <span className={cellClass}>
      {stock.toLocaleString()}
      <span className="text-gray-400 font-normal ml-1 text-xs">
        / {safeStock.toLocaleString()}
      </span>
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자재 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            BOM 자재 현황 및 재고 모니터링
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          + 자재 등록
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="등록 자재 종류"
          value={totalMaterials}
          sub="총 등록된 자재 수"
          accent="blue"
        />
        <KpiCard
          label="재고 부족 자재"
          value={lowStockCount}
          sub="안전재고 미달 항목"
          accent="red"
        />
        <KpiCard
          label="안전재고 이하"
          value={atSafeStockCount}
          sub="안전재고와 동일한 항목"
          accent="yellow"
        />
        <KpiCard
          label="총 재고 금액"
          value={`₩${(totalInventoryValue / 1_000_000).toFixed(1)}M`}
          sub={`${totalInventoryValue.toLocaleString()}원`}
          accent="green"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">자재 목록</h2>
          <span className="text-xs text-gray-400">
            총 {materials.length}개 자재
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">자재코드</th>
                <th className="px-6 py-3">자재명</th>
                <th className="px-6 py-3">단위</th>
                <th className="px-6 py-3">
                  재고 / 안전재고
                  <span className="ml-1 text-gray-400 font-normal normal-case">
                    (현재 / 기준)
                  </span>
                </th>
                <th className="px-6 py-3">단가</th>
                <th className="px-6 py-3">공급업체</th>
                <th className="px-6 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {m.code}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {m.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.unit}</td>
                  <td className="px-6 py-4">
                    <StockCell stock={m.stock} safeStock={m.safeStock} />
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    ₩{m.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.supplier}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
