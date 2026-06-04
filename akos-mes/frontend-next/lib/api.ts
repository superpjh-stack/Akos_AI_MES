/**
 * api.ts — FastAPI backend call utilities
 *
 * All requests go through the Next.js rewrite proxy:
 *   /api/backend/* → http://localhost:8001/*
 *
 * Usage:
 *   import { api } from '@/lib/api';
 *   const data = await api.get<Order[]>('/orders');
 *   await api.post('/orders', { ... });
 */

// ---------------------------------------------------------------------------
// Base configuration
// ---------------------------------------------------------------------------

const BASE_URL = '/api/backend';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public detail?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options?.headers ?? {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    throw new ApiError(res.status, res.statusText, detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

export const api = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>('GET', path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('POST', path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('PUT', path, body, options);
  },

  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('PATCH', path, body, options);
  },

  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>('DELETE', path, undefined, options);
  },
};

// ---------------------------------------------------------------------------
// Domain-specific helpers
// ---------------------------------------------------------------------------

// -- Dashboard / KPI ---------------------------------------------------------

export interface KpiSummary {
  totalOrders: number;
  inProduction: number;
  fatPending: number;
  oeePercent: number;
  defectRatePercent: number;
  onTimeDeliveryPercent: number;
}

export async function fetchKpiSummary(): Promise<KpiSummary> {
  return api.get<KpiSummary>('/dashboard/kpi');
}

// -- Orders ------------------------------------------------------------------

export interface Order {
  id: string;
  orderNo: string;
  customer: string;
  product: string;
  quantity: number;
  dueDate: string;
  status: 'pending' | 'in_production' | 'fat' | 'delivered' | 'cancelled';
  createdAt: string;
}

export async function fetchOrders(params?: {
  page?: number;
  size?: number;
  status?: Order['status'];
}): Promise<{ items: Order[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.size !== undefined) query.set('size', String(params.size));
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return api.get<{ items: Order[]; total: number }>(`/orders${qs ? `?${qs}` : ''}`);
}

export async function fetchOrder(id: string): Promise<Order> {
  return api.get<Order>(`/orders/${id}`);
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  return api.post<Order>('/orders', data);
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order> {
  return api.patch<Order>(`/orders/${id}`, data);
}

export async function deleteOrder(id: string): Promise<void> {
  return api.delete(`/orders/${id}`);
}

// -- Production --------------------------------------------------------------

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  orderId: string;
  product: string;
  plannedQty: number;
  completedQty: number;
  startDate: string;
  endDate: string;
  line: string;
  status: 'planned' | 'in_progress' | 'paused' | 'completed';
}

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  return api.get<WorkOrder[]>('/production/work-orders');
}

// -- FAT ---------------------------------------------------------------------

export interface FatResult {
  id: string;
  orderId: string;
  checklistId: string;
  result: 'pass' | 'fail' | 'pending';
  testedAt: string | null;
  tester: string;
  remarks?: string;
}

export async function fetchFatResults(orderId?: string): Promise<FatResult[]> {
  const qs = orderId ? `?order_id=${orderId}` : '';
  return api.get<FatResult[]>(`/fat/results${qs}`);
}

// -- AI / Prediction ---------------------------------------------------------

export interface AiPrediction {
  orderId: string;
  defectProbability: number;
  delayProbability: number;
  estimatedCost: number;
  confidence: number;
  generatedAt: string;
}

export async function fetchAiPrediction(orderId: string): Promise<AiPrediction> {
  return api.get<AiPrediction>(`/ai/prediction/${orderId}`);
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendAiChat(
  messages: AiChatMessage[],
  context?: Record<string, unknown>
): Promise<AiChatMessage> {
  return api.post<AiChatMessage>('/ai/chat', { messages, context });
}
