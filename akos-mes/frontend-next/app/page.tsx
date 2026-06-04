'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Factory,
  TestTube2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { PageCard } from '@/components/layout/MainLayout';
import { fetchKpiSummary, fetchOrders, type KpiSummary, type Order } from '@/lib/api';

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number; // positive = up, negative = down, 0/undefined = neutral
  changeLabel?: string;
  icon: React.ReactNode;
  color: string; // tailwind bg-* or inline style color
  loading?: boolean;
}

function KpiCard({ title, value, unit, change, changeLabel, icon, color, loading }: KpiCardProps) {
  const trendIcon =
    change === undefined || change === 0 ? (
      <Minus size={13} />
    ) : change > 0 ? (
      <ArrowUpRight size={13} />
    ) : (
      <ArrowDownRight size={13} />
    );

  const trendColor =
    change === undefined || change === 0
      ? '#9ca3af'
      : change > 0
      ? '#16a34a'
      : '#dc2626';

  return (
    <div
      className="bg-white rounded-lg p-5 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: color,
          }}
        >
          {icon}
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="flex items-end gap-1.5">
          <span className="text-2xl font-bold text-gray-900 leading-none tabular-nums">
            {value}
          </span>
          {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
        </div>
      )}

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-1" style={{ color: trendColor }}>
          {trendIcon}
          <span className="text-xs font-medium">
            {change !== undefined && change !== 0 ? `${Math.abs(change)}% ` : ''}
            {changeLabel ?? ''}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: '접수',
  in_production: '생산중',
  fat: 'FAT',
  delivered: '납품완료',
  cancelled: '취소',
};

const STATUS_COLOR: Record<Order['status'], { bg: string; text: string }> = {
  pending:      { bg: '#f3f4f6', text: '#6b7280' },
  in_production: { bg: '#eff6ff', text: '#2563eb' },
  fat:          { bg: '#fffbeb', text: '#d97706' },
  delivered:    { bg: '#f0fdf4', text: '#16a34a' },
  cancelled:    { bg: '#fef2f2', text: '#dc2626' },
};

function StatusBadge({ status }: { status: Order['status'] }) {
  const { bg, text } = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ backgroundColor: bg, color: text }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Mock data fallback (used when backend is unavailable)
// ---------------------------------------------------------------------------

const MOCK_KPI: KpiSummary = {
  totalOrders: 142,
  inProduction: 23,
  fatPending: 7,
  oeePercent: 84.2,
  defectRatePercent: 1.8,
  onTimeDeliveryPercent: 96.5,
};

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNo: 'SO-2024-0312',
    customer: '현대중공업',
    product: 'PLC 제어반 A타입',
    quantity: 5,
    dueDate: '2024-08-15',
    status: 'in_production',
    createdAt: '2024-07-01',
  },
  {
    id: '2',
    orderNo: 'SO-2024-0308',
    customer: '삼성SDI',
    product: '배터리 BMS 패널',
    quantity: 12,
    dueDate: '2024-08-10',
    status: 'fat',
    createdAt: '2024-06-28',
  },
  {
    id: '3',
    orderNo: 'SO-2024-0301',
    customer: 'LG에너지솔루션',
    product: '모터 드라이브 유닛',
    quantity: 8,
    dueDate: '2024-08-05',
    status: 'pending',
    createdAt: '2024-06-20',
  },
  {
    id: '4',
    orderNo: 'SO-2024-0295',
    customer: 'SK하이닉스',
    product: '반도체 클린룸 제어기',
    quantity: 3,
    dueDate: '2024-07-30',
    status: 'delivered',
    createdAt: '2024-06-15',
  },
  {
    id: '5',
    orderNo: 'SO-2024-0289',
    customer: '포스코',
    product: '용광로 제어 시스템',
    quantity: 2,
    dueDate: '2024-07-25',
    status: 'in_production',
    createdAt: '2024-06-10',
  },
];

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, ordersData] = await Promise.all([
        fetchKpiSummary(),
        fetchOrders({ page: 1, size: 10 }),
      ]);
      setKpi(kpiData);
      setOrders(ordersData.items);
    } catch {
      // Backend not running — use mock data for development
      setKpi(MOCK_KPI);
      setOrders(MOCK_ORDERS);
      setError('백엔드 연결 실패 — 샘플 데이터를 표시합니다');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const kpiCards: KpiCardProps[] = [
    {
      title: '전체 수주',
      value: kpi?.totalOrders ?? '-',
      unit: '건',
      change: 5.2,
      changeLabel: '전월 대비',
      icon: <ShoppingCart size={18} color="#2563eb" />,
      color: '#eff6ff',
      loading,
    },
    {
      title: '생산 중',
      value: kpi?.inProduction ?? '-',
      unit: '건',
      change: 0,
      changeLabel: '전주 동일',
      icon: <Factory size={18} color="#7c3aed" />,
      color: '#f5f3ff',
      loading,
    },
    {
      title: 'FAT 대기',
      value: kpi?.fatPending ?? '-',
      unit: '건',
      change: -2,
      changeLabel: '전주 대비',
      icon: <TestTube2 size={18} color="#d97706" />,
      color: '#fffbeb',
      loading,
    },
    {
      title: 'OEE',
      value: kpi?.oeePercent ?? '-',
      unit: '%',
      change: 1.4,
      changeLabel: '전월 대비',
      icon: <TrendingUp size={18} color="#16a34a" />,
      color: '#f0fdf4',
      loading,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-0.5">스마트공장 현황 한눈에 보기</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <RefreshCw size={14} />
          새로고침
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
        >
          <AlertTriangle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Cards — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="bg-white rounded-lg p-5 flex items-center justify-between"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">불량률</p>
            <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
              {loading ? '-' : `${kpi?.defectRatePercent ?? '-'}`}
              <span className="text-sm font-normal text-gray-500 ml-1">%</span>
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">목표 2.0% 이하 달성</p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: '56px', height: '56px', backgroundColor: '#f0fdf4' }}
          >
            <span className="text-2xl">✅</span>
          </div>
        </div>

        <div
          className="bg-white rounded-lg p-5 flex items-center justify-between"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">납기 준수율</p>
            <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
              {loading ? '-' : `${kpi?.onTimeDeliveryPercent ?? '-'}`}
              <span className="text-sm font-normal text-gray-500 ml-1">%</span>
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">전월 대비 +1.2%p</p>
          </div>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff' }}
          >
            <span className="text-2xl">🚚</span>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <PageCard
        title="최근 수주 현황"
        subtitle="최근 등록된 수주 목록입니다"
        actions={
          <a
            href="/business/orders/sales"
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            전체 보기
          </a>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['수주번호', '고객사', '제품명', '수량', '납기일', '상태'].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
                      }
                      onClick={() => (window.location.href = `/business/orders/sales/${order.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-600">
                        {order.orderNo}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{order.customer}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                        {order.product}
                      </td>
                      <td className="px-4 py-3 text-gray-700 tabular-nums">
                        {order.quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums whitespace-nowrap">
                        {order.dueDate}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && orders.length === 0 && (
            <div className="px-4 py-12 text-center text-gray-400 text-sm">
              등록된 수주가 없습니다
            </div>
          )}
        </div>
      </PageCard>
    </div>
  );
}
