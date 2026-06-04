'use client';

import React, { useState } from 'react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface WorkStandard extends Record<string, unknown> {
  id: string;
  docNo: string;           // 문서번호
  title: string;           // 제목
  version: string;         // 버전
  process: string;         // 공정
  docType: string;         // 문서유형: SOP / WI / QP / PM
  revisionNo: number;      // 개정 횟수
  author: string;          // 작성자
  approver: string;        // 승인자
  approvedAt: string;      // 승인일
  reviewDueAt: string;     // 차기 검토일
  status: string;          // active / draft / inactive / under_review
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE: WorkStandard[] = [
  { id: 'WS001', docNo: 'SOP-MFG-001', title: '조립라인 A 표준작업지침서', version: 'v3.1', process: '조립', docType: 'SOP', revisionNo: 8, author: '김철수', approver: '박준형', approvedAt: '2026-01-01', reviewDueAt: '2027-01-01', status: 'active' },
  { id: 'WS002', docNo: 'WI-WLD-001', title: '용접 공정 작업지침서', version: 'v2.4', process: '용접', docType: 'WI', revisionNo: 6, author: '이영희', approver: '박준형', approvedAt: '2025-10-15', reviewDueAt: '2026-10-15', status: 'active' },
  { id: 'WS003', docNo: 'SOP-FAT-001', title: 'FAT 최종 검사 절차서', version: 'v4.0', process: 'FAT', docType: 'SOP', revisionNo: 12, author: '최민준', approver: '박준형', approvedAt: '2026-03-01', reviewDueAt: '2027-03-01', status: 'active' },
  { id: 'WS004', docNo: 'SOP-PNT-001', title: '도장 공정 표준서 (개정안)', version: 'v1.0', process: '도장', docType: 'SOP', revisionNo: 0, author: '정수연', approver: '-', approvedAt: '-', reviewDueAt: '-', status: 'draft' },
  { id: 'WS005', docNo: 'SOP-SHP-001', title: '포장 및 출하 절차서', version: 'v2.0', process: '출하', docType: 'SOP', revisionNo: 4, author: '김철수', approver: '박준형', approvedAt: '2024-06-01', reviewDueAt: '2025-06-01', status: 'inactive' },
  { id: 'WS006', docNo: 'QP-MAT-001', title: '자재 입고 검사 기준서', version: 'v1.3', process: '자재', docType: 'QP', revisionNo: 3, author: '오지현', approver: '박준형', approvedAt: '2025-09-01', reviewDueAt: '2026-09-01', status: 'active' },
  { id: 'WS007', docNo: 'SOP-MFG-002', title: '조립라인 B 작업표준서', version: 'v2.5', process: '조립', docType: 'SOP', revisionNo: 7, author: '강태양', approver: '박준형', approvedAt: '2025-11-01', reviewDueAt: '2026-11-01', status: 'active' },
  { id: 'WS008', docNo: 'PM-EQP-001', title: '설비 정기 점검 절차서', version: 'v3.0', process: '설비', docType: 'PM', revisionNo: 5, author: '배성호', approver: '박준형', approvedAt: '2026-02-01', reviewDueAt: '2027-02-01', status: 'active' },
  { id: 'WS009', docNo: 'QP-QLT-001', title: '불량품 처리 절차서', version: 'v2.1', process: '품질', docType: 'QP', revisionNo: 4, author: '이영희', approver: '박준형', approvedAt: '2025-07-01', reviewDueAt: '2026-07-01', status: 'active' },
  { id: 'WS010', docNo: 'SOP-QLT-002', title: '고객 클레임 대응 절차서', version: 'v1.0', process: '품질', docType: 'SOP', revisionNo: 0, author: '이영희', approver: '-', approvedAt: '-', reviewDueAt: '-', status: 'draft' },
  { id: 'WS011', docNo: 'WI-MCH-001', title: 'CNC 기계가공 작업지침서', version: 'v1.5', process: '기계가공', docType: 'WI', revisionNo: 3, author: '강태양', approver: '박준형', approvedAt: '2025-08-01', reviewDueAt: '2026-08-01', status: 'under_review' },
  { id: 'WS012', docNo: 'QP-FAT-001', title: 'FAT 출하검사 품질기준서', version: 'v2.2', process: 'FAT', docType: 'QP', revisionNo: 6, author: '최민준', approver: '박준형', approvedAt: '2026-04-01', reviewDueAt: '2027-04-01', status: 'active' },
  { id: 'WS013', docNo: 'SOP-WLD-002', title: '특수 용접 작업 안전절차서', version: 'v1.1', process: '용접', docType: 'SOP', revisionNo: 1, author: '이영희', approver: '박준형', approvedAt: '2025-12-01', reviewDueAt: '2026-12-01', status: 'active' },
  { id: 'WS014', docNo: 'PM-EQP-002', title: '프레스 설비 점검 기준서', version: 'v1.0', process: '설비', docType: 'PM', revisionNo: 0, author: '배성호', approver: '-', approvedAt: '-', reviewDueAt: '-', status: 'draft' },
  { id: 'WS015', docNo: 'WI-PNT-001', title: '도장 품질 기준 작업지침서', version: 'v2.0', process: '도장', docType: 'WI', revisionNo: 2, author: '정수연', approver: '박준형', approvedAt: '2025-05-01', reviewDueAt: '2026-05-01', status: 'under_review' },
];

// ─── Column Definitions ───────────────────────────────────────────────────────

const docTypeColors: Record<string, string> = {
  SOP: 'bg-blue-100 text-blue-700',
  WI:  'bg-purple-100 text-purple-700',
  QP:  'bg-green-100 text-green-700',
  PM:  'bg-orange-100 text-orange-700',
};

const TODAY = new Date('2026-06-04');

function reviewDueCls(dateStr: string): string {
  if (dateStr === '-') return '';
  const due = new Date(dateStr);
  const diff = Math.ceil((due.getTime() - TODAY.getTime()) / 86400000);
  if (diff < 0) return 'text-red-500 font-semibold';
  if (diff <= 90) return 'text-yellow-600 font-semibold';
  return 'text-gray-700';
}

const columns: Column<WorkStandard>[] = [
  {
    key: 'docNo', header: '문서번호', width: '130px',
    render: (v) => <span className="font-mono text-xs font-semibold text-gray-800">{String(v)}</span>,
  },
  { key: 'title', header: '제목' },
  {
    key: 'version', header: '버전', width: '72px', align: 'center',
    render: (v) => <span className="font-mono text-xs text-gray-600">{String(v)}</span>,
  },
  { key: 'process', header: '공정', width: '85px' },
  {
    key: 'docType', header: '유형', width: '65px', align: 'center',
    render: (v) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${docTypeColors[String(v)] ?? 'bg-gray-100 text-gray-600'}`}>
        {String(v)}
      </span>
    ),
  },
  { key: 'author', header: '작성자', width: '80px' },
  { key: 'approver', header: '승인자', width: '80px' },
  { key: 'approvedAt', header: '승인일', width: '105px' },
  {
    key: 'reviewDueAt', header: '검토예정일', width: '105px',
    render: (v) => {
      const s = String(v);
      if (s === '-') return <span className="text-gray-300">-</span>;
      return <span className={reviewDueCls(s)}>{s}</span>;
    },
  },
  {
    key: 'status', header: '상태', width: '90px', align: 'center',
    render: (v) => <StatusBadge status={String(v)} />,
  },
  {
    key: 'id', header: '액션', width: '175px', align: 'center',
    render: () => (
      <div className="flex gap-1 justify-center">
        <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50">상세</button>
        <button className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50">수정</button>
        <button className="px-2 py-1 text-xs border border-yellow-200 text-yellow-700 rounded hover:bg-yellow-50">개정요청</button>
        <button className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50">삭제</button>
      </div>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MasterStandardsPage() {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filtered = SAMPLE.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.docNo.toLowerCase().includes(q) || s.author.toLowerCase().includes(q);
    const matchProcess = !filterValues.process || filterValues.process === 'all' || s.process === filterValues.process;
    const matchType = !filterValues.docType || filterValues.docType === 'all' || s.docType === filterValues.docType;
    const matchStatus = !filterValues.status || filterValues.status === 'all' || s.status === filterValues.status;
    return matchSearch && matchProcess && matchType && matchStatus;
  });

  const activeCount = SAMPLE.filter(s => s.status === 'active').length;
  const draftCount = SAMPLE.filter(s => s.status === 'draft').length;
  const underReviewCount = SAMPLE.filter(s => s.status === 'under_review').length;
  const totalRevisions = SAMPLE.reduce((s, r) => s + r.revisionNo, 0);

  const nearReviewCount = SAMPLE.filter(s => {
    if (s.reviewDueAt === '-') return false;
    const due = new Date(s.reviewDueAt);
    const diff = Math.ceil((due.getTime() - TODAY.getTime()) / 86400000);
    return diff >= 0 && diff <= 90;
  }).length;

  return (
    <>
      <PageHeader
        title="작업표준 관리"
        subtitle="공정별 SOP 문서, 작업지침서 및 품질기준서를 관리합니다"
        breadcrumbs={[{ label: '기준정보관리' }, { label: '작업표준관리' }]}
        actions={[
          { label: '+ 개정 요청', onClick: () => {}, variant: 'secondary' },
          { label: '+ 표준서 등록', onClick: () => {}, variant: 'primary' },
        ]}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '전체 표준서', value: SAMPLE.length, sub: '등록된 문서 수', color: 'border-blue-400', text: 'text-blue-600' },
            { label: '시행 중', value: activeCount, sub: '승인된 유효 문서', color: 'border-emerald-400', text: 'text-emerald-600' },
            { label: '검토/초안', value: draftCount + underReviewCount, sub: `초안 ${draftCount}건 · 검토중 ${underReviewCount}건`, color: 'border-yellow-400', text: 'text-yellow-600' },
            { label: '검토 임박', value: nearReviewCount, sub: '90일 이내 검토 예정', color: 'border-red-300', text: 'text-red-500' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-3xl font-bold mt-1 ${kpi.text}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2">
          <span className="font-medium text-gray-600">검토예정일 기준:</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>기한 초과</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>90일 이내 임박</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>정상</span>
          <span className="ml-auto text-gray-400">총 개정 횟수: <strong className="text-gray-700">{totalRevisions}회</strong></span>
        </div>

        {/* Standards Table */}
        <PageCard title="SOP 문서 목록">
          <SearchFilter
            placeholder="문서번호, 제목, 작성자 검색"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: 'process', label: '공정',
                options: [
                  { value: '조립', label: '조립' },
                  { value: '용접', label: '용접' },
                  { value: 'FAT', label: 'FAT' },
                  { value: '도장', label: '도장' },
                  { value: '품질', label: '품질' },
                  { value: '자재', label: '자재' },
                  { value: '설비', label: '설비' },
                  { value: '기계가공', label: '기계가공' },
                  { value: '출하', label: '출하' },
                ],
              },
              {
                key: 'docType', label: '유형',
                options: [
                  { value: 'SOP', label: 'SOP (표준작업절차)' },
                  { value: 'WI', label: 'WI (작업지침서)' },
                  { value: 'QP', label: 'QP (품질절차서)' },
                  { value: 'PM', label: 'PM (예방보전절차)' },
                ],
              },
              {
                key: 'status', label: '상태',
                options: [
                  { value: 'active', label: '시행중' },
                  { value: 'draft', label: '초안' },
                  { value: 'under_review', label: '검토중' },
                  { value: 'inactive', label: '폐기' },
                ],
              },
            ]}
            filterValues={filterValues}
            onFilterChange={(k, v) => setFilterValues(prev => ({ ...prev, [k]: v }))}
          />
          <div className="mt-3">
            <DataTable columns={columns} data={filtered} rowKey="id" pageSize={10} />
          </div>
        </PageCard>
      </div>
    </>
  );
}
