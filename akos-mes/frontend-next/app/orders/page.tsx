"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "진행중" | "완료" | "대기" | "취소" | "검토중";

interface Order {
  id: string;
  orderNo: string;
  customer: string;
  product: string;
  amount: number;
  orderDate: string;
  dueDate: string;
  status: OrderStatus;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_ORDERS: Order[] = [
  {
    id: "1",
    orderNo: "ORD-2026-0001",
    customer: "삼성전자",
    product: "정밀 가공 부품 A",
    amount: 12500000,
    orderDate: "2026-05-10",
    dueDate: "2026-06-20",
    status: "진행중",
  },
  {
    id: "2",
    orderNo: "ORD-2026-0002",
    customer: "LG이노텍",
    product: "PCB 어셈블리 세트",
    amount: 8750000,
    orderDate: "2026-05-15",
    dueDate: "2026-06-10",
    status: "완료",
  },
  {
    id: "3",
    orderNo: "ORD-2026-0003",
    customer: "현대모비스",
    product: "자동차 브래킷 부품",
    amount: 23100000,
    orderDate: "2026-05-20",
    dueDate: "2026-07-05",
    status: "대기",
  },
  {
    id: "4",
    orderNo: "ORD-2026-0004",
    customer: "SK하이닉스",
    product: "반도체 지그 툴",
    amount: 5400000,
    orderDate: "2026-05-22",
    dueDate: "2026-06-15",
    status: "취소",
  },
  {
    id: "5",
    orderNo: "ORD-2026-0005",
    customer: "포스코",
    product: "스틸 프레임 구조물",
    amount: 31800000,
    orderDate: "2026-05-28",
    dueDate: "2026-07-30",
    status: "검토중",
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OrderStatus, string> = {
  진행중: "bg-blue-100 text-blue-800 border border-blue-200",
  완료: "bg-green-100 text-green-800 border border-green-200",
  대기: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  취소: "bg-red-100 text-red-800 border border-red-200",
  검토중: "bg-purple-100 text-purple-800 border border-purple-200",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
}

function KpiCard({ title, value, sub, icon, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKRW(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억원`;
  }
  if (amount >= 10_000) {
    return `${(amount / 10_000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

function calcAvgDays(orders: Order[]): number {
  const active = orders.filter((o) => o.status !== "취소");
  if (active.length === 0) return 0;
  const total = active.reduce((sum, o) => {
    const diff =
      (new Date(o.dueDate).getTime() - new Date(o.orderDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return sum + diff;
  }, 0);
  return Math.round(total / active.length);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_ORDERS.filter(
    (o) =>
      o.orderNo.includes(search) ||
      o.customer.includes(search) ||
      o.product.includes(search)
  );

  const totalAmount = SAMPLE_ORDERS.reduce((s, o) => s + o.amount, 0);
  const inProgress = SAMPLE_ORDERS.filter((o) => o.status === "진행중").length;
  const avgDays = calcAvgDays(SAMPLE_ORDERS);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">수주 / 견적 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          고객 수주 현황과 견적 진행 상태를 관리합니다.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="총 수주건수"
          value={`${SAMPLE_ORDERS.length}건`}
          sub="이번 달 누적"
          icon="📦"
          color="bg-blue-50"
        />
        <KpiCard
          title="총 수주금액"
          value={formatKRW(totalAmount)}
          sub={`${SAMPLE_ORDERS.length}건 합계`}
          icon="💰"
          color="bg-emerald-50"
        />
        <KpiCard
          title="진행중 수주"
          value={`${inProgress}건`}
          sub="현재 생산 중"
          icon="⚙️"
          color="bg-orange-50"
        />
        <KpiCard
          title="평균 납기일"
          value={`${avgDays}일`}
          sub="수주일 기준"
          icon="📅"
          color="bg-purple-50"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Table Header / Search */}
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">수주 목록</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="수주번호, 고객사, 품목 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + 신규 수주
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">수주번호</th>
                <th className="px-6 py-3 font-medium">고객사</th>
                <th className="px-6 py-3 font-medium">품목</th>
                <th className="px-6 py-3 font-medium text-right">수주금액</th>
                <th className="px-6 py-3 font-medium">수주일</th>
                <th className="px-6 py-3 font-medium">납기일</th>
                <th className="px-6 py-3 font-medium">상태</th>
                <th className="px-6 py-3 font-medium text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                      {order.orderNo}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-700">{order.product}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {order.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-gray-500">{order.orderDate}</td>
                    <td className="px-6 py-4 text-gray-500">{order.dueDate}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          상세
                        </button>
                        <button className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                          수정
                        </button>
                        <button className="px-2.5 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>총 {filtered.length}건 표시 중</span>
          <span>마지막 업데이트: 2026-06-03</span>
        </div>
      </div>
    </div>
  );
}
