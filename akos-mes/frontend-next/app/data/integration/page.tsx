'use client';

import React, { useState, useMemo } from 'react';
import {
  Database, Activity, AlertTriangle, Clock,
  Play, History, Pencil, RefreshCw, Trash2,
} from 'lucide-react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

interface DataSource extends Record<string, unknown> {
  id: string;
  name: string;
  type: 'DB' | 'IoT' | 'ERP' | 'PLC' | 'API' | 'FILE';
  host: string;
  database: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string;
  recordsToday: number;
  errorRate: string;
  owner: string;
}

interface EtlPipeline extends Record<string, unknown> {
  id: string;
  name: string;
  sourceId: string;
  sourceName: string;
  targetTable: string;
  schedule: string;
  lastRun: string;
  duration: string;
  recordsProcessed: number;
  status: 'success' | 'failed' | 'running' | 'pending';
  errorMessage?: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const DATA_SOURCES: DataSource[] = [
  { id: 'DS-001', name: '생산 MES DB',        type: 'DB',   host: '192.168.1.10',      database: 'mes_prod',  status: 'connected',    lastSync: '2026-06-03 08:55', recordsToday: 12450,  errorRate: '0.2%', owner: '이시스템' },
  { id: 'DS-002', name: '설비 IoT 게이트웨이', type: 'IoT',  host: '192.168.2.50',      database: '-',         status: 'connected',    lastSync: '2026-06-03 08:59', recordsToday: 89320,  errorRate: '0.0%', owner: '김설비' },
  { id: 'DS-003', name: 'SAP ERP',            type: 'ERP',  host: 'erp.akos.co.kr',    database: 'SAPDB',     status: 'syncing',      lastSync: '2026-06-03 07:00', recordsToday: 3210,   errorRate: '0.5%', owner: '박ERP' },
  { id: 'DS-004', name: 'PLC Line-1',         type: 'PLC',  host: '192.168.3.11',      database: '-',         status: 'connected',    lastSync: '2026-06-03 09:00', recordsToday: 45600,  errorRate: '0.1%', owner: '최자동화' },
  { id: 'DS-005', name: 'PLC Line-2',         type: 'PLC',  host: '192.168.3.12',      database: '-',         status: 'error',        lastSync: '2026-06-03 06:30', recordsToday: 0,      errorRate: '100%', owner: '최자동화' },
  { id: 'DS-006', name: '품질 검사 API',       type: 'API',  host: 'api.qc.akos.co.kr', database: '-',         status: 'connected',    lastSync: '2026-06-03 08:50', recordsToday: 1890,   errorRate: '1.2%', owner: '정품질' },
  { id: 'DS-007', name: '창고 WMS DB',         type: 'DB',   host: '192.168.1.20',      database: 'wms_prod',  status: 'connected',    lastSync: '2026-06-03 08:45', recordsToday: 4560,   errorRate: '0.3%', owner: '한물류' },
  { id: 'DS-008', name: '에너지 모니터',        type: 'IoT',  host: '192.168.4.01',      database: '-',         status: 'connected',    lastSync: '2026-06-03 08:58', recordsToday: 28800,  errorRate: '0.0%', owner: '오유틸' },
  { id: 'DS-009', name: 'HR 인사 시스템',       type: 'ERP',  host: 'hr.akos.co.kr',     database: 'hrdb',      status: 'disconnected', lastSync: '2026-06-02 18:00', recordsToday: 0,      errorRate: '-',    owner: '강인사' },
  { id: 'DS-010', name: '납품 CSV 파일',        type: 'FILE', host: 'sftp.akos.co.kr',   database: '/inbound',  status: 'connected',    lastSync: '2026-06-03 06:00', recordsToday: 320,    errorRate: '0.0%', owner: '이물류' },
];

const ETL_PIPELINES: EtlPipeline[] = [
  { id: 'ETL-001', name: 'MES → DW 생산실적',   sourceId: 'DS-001', sourceName: '생산 MES DB',        targetTable: 'fact_production', schedule: '매 5분',      lastRun: '08:55', duration: '12s',    recordsProcessed: 450,  status: 'success' },
  { id: 'ETL-002', name: 'IoT → 설비데이터',     sourceId: 'DS-002', sourceName: '설비 IoT 게이트웨이', targetTable: 'fact_equipment',  schedule: '매 1분',      lastRun: '08:59', duration: '8s',     recordsProcessed: 3200, status: 'success' },
  { id: 'ETL-003', name: 'SAP → 수주현황',       sourceId: 'DS-003', sourceName: 'SAP ERP',            targetTable: 'dim_orders',      schedule: '매 1시간',    lastRun: '08:00', duration: '45s',    recordsProcessed: 128,  status: 'success' },
  { id: 'ETL-004', name: 'PLC Line-1 → 가공데이터', sourceId: 'DS-004', sourceName: 'PLC Line-1',      targetTable: 'fact_process',    schedule: '매 30초',     lastRun: '09:00', duration: '5s',     recordsProcessed: 1800, status: 'running' },
  { id: 'ETL-005', name: 'PLC Line-2 → 가공데이터', sourceId: 'DS-005', sourceName: 'PLC Line-2',      targetTable: 'fact_process',    schedule: '매 30초',     lastRun: '06:30', duration: '-',      recordsProcessed: 0,    status: 'failed', errorMessage: 'Connection refused: 192.168.3.12' },
  { id: 'ETL-006', name: 'QC API → 검사결과',    sourceId: 'DS-006', sourceName: '품질 검사 API',       targetTable: 'fact_inspection', schedule: '매 10분',     lastRun: '08:50', duration: '22s',    recordsProcessed: 95,   status: 'success' },
  { id: 'ETL-007', name: 'WMS → 재고현황',       sourceId: 'DS-007', sourceName: '창고 WMS DB',         targetTable: 'fact_inventory',  schedule: '매 30분',     lastRun: '08:30', duration: '38s',    recordsProcessed: 2340, status: 'success' },
  { id: 'ETL-008', name: '에너지 → 전력데이터',   sourceId: 'DS-008', sourceName: '에너지 모니터',       targetTable: 'fact_energy',     schedule: '매 1분',      lastRun: '08:59', duration: '6s',     recordsProcessed: 960,  status: 'success' },
  { id: 'ETL-009', name: 'HR → 작업자정보',       sourceId: 'DS-009', sourceName: 'HR 인사',            targetTable: 'dim_worker',      schedule: '매일 18:00',  lastRun: '어제',  duration: '2m 15s', recordsProcessed: 412,  status: 'success' },
  { id: 'ETL-010', name: '납품 CSV → 출하데이터', sourceId: 'DS-010', sourceName: '납품 CSV 파일',       targetTable: 'fact_shipment',   schedule: '매일 06:00',  lastRun: '06:00', duration: '1m 02s', recordsProcessed: 320,  status: 'success' },
];

// ─── Badge helpers ────────────────────────────────────────────────────────────

const SOURCE_STATUS_STYLE: Record<DataSource['status'], string> = {
  connected:    'bg-green-100 text-green-800',
  syncing:      'bg-blue-100 text-blue-800',
  disconnected: 'bg-gray-100 text-gray-700',
  error:        'bg-red-100 text-red-800',
};
const SOURCE_STATUS_LABEL: Record<DataSource['status'], string> = {
  connected: '연결됨', syncing: '동기중', disconnected: '미연결', error: '오류',
};

const ETL_STATUS_STYLE: Record<EtlPipeline['status'], string> = {
  success: 'bg-green-100 text-green-800',
  running: 'bg-blue-100 text-blue-800',
  pending: 'bg-gray-100 text-gray-700',
  failed:  'bg-red-100 text-red-800',
};
const ETL_STATUS_LABEL: Record<EtlPipeline['status'], string> = {
  success: '성공', running: '실행중', pending: '대기', failed: '실패',
};

const TYPE_STYLE: Record<DataSource['type'], string> = {
  DB:   'bg-indigo-100 text-indigo-700',
  IoT:  'bg-cyan-100 text-cyan-700',
  ERP:  'bg-purple-100 text-purple-700',
  PLC:  'bg-orange-100 text-orange-700',
  API:  'bg-teal-100 text-teal-700',
  FILE: 'bg-yellow-100 text-yellow-700',
};

// ─── Column definitions ───────────────────────────────────────────────────────

const sourceColumns: Column<DataSource>[] = [
  { key: 'id',    header: 'ID',       width: '82px' },
  { key: 'name',  header: '소스명',   sortable: true },
  {
    key: 'type', header: '유형', width: '72px', align: 'center',
    render: (v) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[v as DataSource['type']] ?? 'bg-gray-100 text-gray-600'}`}>
        {String(v)}
      </span>
    ),
  },
  { key: 'host',      header: '호스트',       width: '170px' },
  { key: 'lastSync',  header: '마지막 동기화', width: '148px', sortable: true },
  {
    key: 'recordsToday', header: '오늘 처리건수', width: '110px', align: 'right', sortable: true,
    render: (v) => <span className="font-medium text-gray-800">{Number(v).toLocaleString()}</span>,
  },
  { key: 'errorRate', header: '오류율', width: '72px', align: 'center',
    render: (v) => {
      const s = String(v);
      const isHigh = s !== '-' && parseFloat(s) >= 5;
      return <span className={isHigh ? 'text-red-600 font-semibold' : 'text-gray-700'}>{s}</span>;
    },
  },
  { key: 'owner', header: '담당자', width: '82px' },
  {
    key: 'status', header: '상태', width: '82px', align: 'center',
    render: (v) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${SOURCE_STATUS_STYLE[v as DataSource['status']]}`}>
        {SOURCE_STATUS_LABEL[v as DataSource['status']]}
      </span>
    ),
  },
  {
    key: 'id', header: '액션', width: '150px', align: 'center',
    render: (_v, row) => {
      const src = row as unknown as DataSource;
      return (
        <div className="flex gap-1 justify-center">
          <button
            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
            onClick={() => alert(`연결 테스트: ${src.name}`)}
          >
            <RefreshCw className="w-3 h-3" /> 연결테스트
          </button>
          <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50">
            <Pencil className="w-3 h-3" />
          </button>
          <button className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    },
  },
];

const etlColumns: Column<EtlPipeline>[] = [
  { key: 'id',   header: 'ID',       width: '82px' },
  { key: 'name', header: '파이프라인명', sortable: true },
  { key: 'sourceName',  header: '소스',     width: '140px' },
  { key: 'targetTable', header: '대상 테이블', width: '140px',
    render: (v) => <span className="font-mono text-xs text-gray-700">{String(v)}</span>,
  },
  { key: 'schedule', header: '스케줄',    width: '100px' },
  { key: 'lastRun',  header: '마지막 실행', width: '90px' },
  { key: 'duration', header: '소요시간',  width: '80px', align: 'center' },
  {
    key: 'recordsProcessed', header: '처리건수', width: '90px', align: 'right', sortable: true,
    render: (v) => <span className="font-medium text-gray-800">{Number(v).toLocaleString()}</span>,
  },
  {
    key: 'status', header: '상태', width: '78px', align: 'center',
    render: (v) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ETL_STATUS_STYLE[v as EtlPipeline['status']]}`}>
        {ETL_STATUS_LABEL[v as EtlPipeline['status']]}
      </span>
    ),
  },
  {
    key: 'id', header: '액션', width: '140px', align: 'center',
    render: (_v, row) => {
      const p = row as unknown as EtlPipeline;
      return (
        <div className="flex gap-1 justify-center">
          <button
            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-green-200 text-green-700 rounded hover:bg-green-50"
            onClick={() => alert(`즉시 실행: ${p.name}`)}
          >
            <Play className="w-3 h-3" /> 즉시실행
          </button>
          <button className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded hover:bg-gray-50">
            <History className="w-3 h-3" /> 이력
          </button>
          <button className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50">
            <Pencil className="w-3 h-3" /> 수정
          </button>
        </div>
      );
    },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabType = 'sources' | 'pipelines';

export default function DataIntegrationPage() {
  const [tab, setTab] = useState<TabType>('sources');

  // DataSource filter state
  const [srcSearch, setSrcSearch]   = useState('');
  const [srcFilter, setSrcFilter]   = useState<Record<string, string>>({});

  // ETL filter state
  const [etlSearch, setEtlSearch]   = useState('');
  const [etlFilter, setEtlFilter]   = useState<Record<string, string>>({});

  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Filtered lists
  const filteredSources = useMemo(() => {
    const q = srcSearch.toLowerCase();
    return DATA_SOURCES.filter(d => {
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.host.toLowerCase().includes(q);
      const matchType   = !srcFilter.type   || srcFilter.type === 'all'   || d.type === srcFilter.type;
      const matchStatus = !srcFilter.status || srcFilter.status === 'all' || d.status === srcFilter.status;
      return matchSearch && matchType && matchStatus;
    });
  }, [srcSearch, srcFilter]);

  const filteredPipelines = useMemo(() => {
    const q = etlSearch.toLowerCase();
    return ETL_PIPELINES.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sourceName.toLowerCase().includes(q);
      const matchStatus = !etlFilter.status || etlFilter.status === 'all' || p.status === etlFilter.status;
      return matchSearch && matchStatus;
    });
  }, [etlSearch, etlFilter]);

  // KPI values
  const connectedCount  = DATA_SOURCES.filter(d => d.status === 'connected' || d.status === 'syncing').length;
  const totalRecords    = DATA_SOURCES.reduce((s, d) => s + d.recordsToday, 0);
  const errorRateAvg    = '1.8%';
  const lastRunLabel    = '1분 전';

  return (
    <>
      <PageHeader
        title="데이터 통합관리"
        subtitle="외부 데이터 소스 연결 현황 및 ETL 파이프라인 실행 이력을 관리합니다."
        breadcrumbs={[{ label: '데이터관리' }, { label: '데이터통합관리' }]}
        actions={[{ label: '+ 소스 추가', onClick: () => showToast('소스 추가 폼 열기'), variant: 'primary' }]}
      />

      <div className="p-6 space-y-6">

        {/* KPI 카드 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '연결된 소스',   value: `${connectedCount} / ${DATA_SOURCES.length}`, sub: '정상 연결 / 전체',     color: 'border-l-blue-600',   textColor: 'text-blue-600',   icon: <Database className="w-6 h-6 text-blue-400" /> },
            { label: '오늘 처리건수', value: totalRecords.toLocaleString(),                sub: '전체 소스 합계',        color: 'border-l-green-600',  textColor: 'text-green-600',  icon: <Activity className="w-6 h-6 text-green-400" /> },
            { label: '전체 오류율',   value: errorRateAvg,                                 sub: '가중평균 오류율',       color: 'border-l-red-500',    textColor: 'text-red-500',    icon: <AlertTriangle className="w-6 h-6 text-red-400" /> },
            { label: '마지막 실행',   value: lastRunLabel,                                 sub: 'ETL-002 IoT 파이프라인', color: 'border-l-indigo-600', textColor: 'text-indigo-600', icon: <Clock className="w-6 h-6 text-indigo-400" /> },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                  <p className={`text-2xl font-bold mt-1 tabular-nums ${kpi.textColor}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                <div className="mt-1">{kpi.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 탭 전환 */}
        <div className="flex gap-1 border-b border-gray-200">
          {(['sources', 'pipelines'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {t === 'sources' ? '데이터 소스' : 'ETL 파이프라인'}
            </button>
          ))}
        </div>

        {/* 데이터 소스 탭 */}
        {tab === 'sources' && (
          <PageCard title={`데이터 소스 목록 (${filteredSources.length}건)`}>
            <SearchFilter
              placeholder="소스명, 호스트 검색"
              searchValue={srcSearch}
              onSearchChange={setSrcSearch}
              filters={[
                {
                  key: 'type', label: '유형',
                  options: (['DB', 'IoT', 'ERP', 'PLC', 'API', 'FILE'] as const).map(v => ({ value: v, label: v })),
                },
                {
                  key: 'status', label: '상태',
                  options: [
                    { value: 'connected',    label: '연결됨' },
                    { value: 'syncing',      label: '동기중' },
                    { value: 'disconnected', label: '미연결' },
                    { value: 'error',        label: '오류' },
                  ],
                },
              ]}
              filterValues={srcFilter}
              onFilterChange={(k, v) => setSrcFilter(prev => ({ ...prev, [k]: v }))}
              onReset={() => { setSrcSearch(''); setSrcFilter({}); }}
            />
            <div className="mt-3">
              <DataTable
                columns={sourceColumns}
                data={filteredSources as unknown as never[]}
                rowKey="id"
                pageSize={8}
                emptyMessage="조건에 맞는 데이터 소스가 없습니다."
              />
            </div>
          </PageCard>
        )}

        {/* ETL 파이프라인 탭 */}
        {tab === 'pipelines' && (
          <PageCard title={`ETL 파이프라인 (${filteredPipelines.length}건)`}>
            {/* 실패 항목 경고 배너 */}
            {ETL_PIPELINES.some(p => p.status === 'failed') && (
              <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded px-4 py-2 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>주의:</strong> {ETL_PIPELINES.filter(p => p.status === 'failed').map(p => p.name).join(', ')} 파이프라인이 실패 상태입니다.
                </span>
              </div>
            )}
            <SearchFilter
              placeholder="파이프라인명 검색"
              searchValue={etlSearch}
              onSearchChange={setEtlSearch}
              filters={[
                {
                  key: 'status', label: '상태',
                  options: [
                    { value: 'success', label: '성공' },
                    { value: 'running', label: '실행중' },
                    { value: 'pending', label: '대기' },
                    { value: 'failed',  label: '실패' },
                  ],
                },
              ]}
              filterValues={etlFilter}
              onFilterChange={(k, v) => setEtlFilter(prev => ({ ...prev, [k]: v }))}
              onReset={() => { setEtlSearch(''); setEtlFilter({}); }}
            />
            <div className="mt-3">
              <DataTable
                columns={etlColumns}
                data={filteredPipelines as unknown as never[]}
                rowKey="id"
                pageSize={8}
                emptyMessage="조건에 맞는 파이프라인이 없습니다."
              />
            </div>
          </PageCard>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e3a5f] text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          {toast}
        </div>
      )}
    </>
  );
}
