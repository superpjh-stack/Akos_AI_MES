'use client';

import React, { useState } from 'react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CodeGroup extends Record<string, unknown> {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
  codeCount: number;
  createdAt: string;
  createdBy: string;
  status: string;
}

interface CodeValue extends Record<string, unknown> {
  id: string;
  groupCode: string;
  groupName: string;
  codeValue: string;
  codeName: string;
  codeNameEn: string;
  sortOrder: number;
  description: string;
  createdAt: string;
  useYn: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const CODE_GROUPS: CodeGroup[] = [
  { id: 'CG001', groupCode: 'ORDER_STATUS', groupName: '수주상태', description: '고객 수주 처리 단계별 상태 코드', codeCount: 5, createdAt: '2024-01-01', createdBy: '시스템', status: 'active' },
  { id: 'CG002', groupCode: 'DEFECT_TYPE', groupName: '불량유형', description: '제품 불량 분류 유형 코드', codeCount: 6, createdAt: '2024-01-01', createdBy: '시스템', status: 'active' },
  { id: 'CG003', groupCode: 'PROCESS_TYPE', groupName: '공정유형', description: '생산 공정 분류 코드', codeCount: 7, createdAt: '2024-01-01', createdBy: '시스템', status: 'active' },
  { id: 'CG004', groupCode: 'SHIFT_TYPE', groupName: '교대유형', description: '작업 교대 근무 구분 코드', codeCount: 3, createdAt: '2024-01-01', createdBy: '시스템', status: 'active' },
  { id: 'CG005', groupCode: 'MATERIAL_TYPE', groupName: '자재유형', description: '자재 및 부품 분류 코드', codeCount: 4, createdAt: '2024-02-01', createdBy: '박준형', status: 'active' },
  { id: 'CG006', groupCode: 'EQUIP_STATUS', groupName: '설비상태', description: '설비 운전 상태 코드', codeCount: 5, createdAt: '2024-02-01', createdBy: '배성호', status: 'active' },
  { id: 'CG007', groupCode: 'INSP_RESULT', groupName: '검사결과', description: '품질 검사 결과 분류 코드', codeCount: 3, createdAt: '2024-03-01', createdBy: '이영희', status: 'active' },
  { id: 'CG008', groupCode: 'DELIVERY_TYPE', groupName: '납품유형', description: '고객 납품 방식 분류 코드', codeCount: 4, createdAt: '2024-04-01', createdBy: '김철수', status: 'active' },
  { id: 'CG009', groupCode: 'PRIORITY', groupName: '우선순위', description: '작업 처리 우선순위 코드', codeCount: 3, createdAt: '2024-04-01', createdBy: '시스템', status: 'active' },
  { id: 'CG010', groupCode: 'DEPT_CODE', groupName: '부서코드', description: '사내 부서 분류 코드 (구버전)', codeCount: 0, createdAt: '2023-01-01', createdBy: '시스템', status: 'inactive' },
];

const CODE_VALUES: CodeValue[] = [
  { id: 'CV001', groupCode: 'ORDER_STATUS', groupName: '수주상태', codeValue: 'RECEIVED',    codeName: '수주접수',   codeNameEn: 'Received',    sortOrder: 1, description: '고객 수주 접수 완료',        createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV002', groupCode: 'ORDER_STATUS', groupName: '수주상태', codeValue: 'CONFIRMED',   codeName: '수주확정',   codeNameEn: 'Confirmed',   sortOrder: 2, description: '수주 내역 확정',             createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV003', groupCode: 'ORDER_STATUS', groupName: '수주상태', codeValue: 'IN_PROGRESS', codeName: '생산중',     codeNameEn: 'In Progress', sortOrder: 3, description: '생산 진행 중',               createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV004', groupCode: 'ORDER_STATUS', groupName: '수주상태', codeValue: 'SHIPPED',     codeName: '출하완료',   codeNameEn: 'Shipped',     sortOrder: 4, description: '제품 출하 완료',             createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV005', groupCode: 'ORDER_STATUS', groupName: '수주상태', codeValue: 'COMPLETED',   codeName: '수주완료',   codeNameEn: 'Completed',   sortOrder: 5, description: '납품 및 수주 최종 완료',     createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV006', groupCode: 'DEFECT_TYPE',  groupName: '불량유형', codeValue: 'DIMENSION',   codeName: '치수불량',   codeNameEn: 'Dimension',   sortOrder: 1, description: '치수 공차 초과 불량',        createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV007', groupCode: 'DEFECT_TYPE',  groupName: '불량유형', codeValue: 'SURFACE',     codeName: '표면불량',   codeNameEn: 'Surface',     sortOrder: 2, description: '표면 흠집/도장 불량',        createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV008', groupCode: 'DEFECT_TYPE',  groupName: '불량유형', codeValue: 'ASSEMBLY',    codeName: '조립불량',   codeNameEn: 'Assembly',    sortOrder: 3, description: '조립 오류 불량',             createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV009', groupCode: 'DEFECT_TYPE',  groupName: '불량유형', codeValue: 'ELECTRICAL',  codeName: '전기불량',   codeNameEn: 'Electrical',  sortOrder: 4, description: '전기 회로 불량',             createdAt: '2024-03-01', useYn: 'Y' },
  { id: 'CV010', groupCode: 'DEFECT_TYPE',  groupName: '불량유형', codeValue: 'WELD_CRACK',  codeName: '용접균열',   codeNameEn: 'Weld Crack',  sortOrder: 5, description: '용접부 균열 발생',           createdAt: '2024-03-01', useYn: 'Y' },
  { id: 'CV011', groupCode: 'DEFECT_TYPE',  groupName: '불량유형', codeValue: 'MISSING',     codeName: '누락불량',   codeNameEn: 'Missing',     sortOrder: 6, description: '부품 누락',                 createdAt: '2024-04-01', useYn: 'N' },
  { id: 'CV012', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'MACHINING',   codeName: '기계가공',   codeNameEn: 'Machining',   sortOrder: 1, description: '절삭/가공 공정',             createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV013', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'WELDING',     codeName: '용접',       codeNameEn: 'Welding',     sortOrder: 2, description: '용접 공정',                 createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV014', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'PAINTING',    codeName: '도장',       codeNameEn: 'Painting',    sortOrder: 3, description: '도장/표면처리 공정',          createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV015', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'ASSEMBLY',    codeName: '조립',       codeNameEn: 'Assembly',    sortOrder: 4, description: '부품 조립 공정',             createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV016', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'INSPECTION',  codeName: '검사',       codeNameEn: 'Inspection',  sortOrder: 5, description: '품질 검사 공정',             createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV017', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'PACKAGING',   codeName: '포장',       codeNameEn: 'Packaging',   sortOrder: 6, description: '포장 및 출하 공정',           createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV018', groupCode: 'PROCESS_TYPE', groupName: '공정유형', codeValue: 'FAT',         codeName: 'FAT',        codeNameEn: 'FAT',         sortOrder: 7, description: '공장 인수시험 공정',          createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV019', groupCode: 'SHIFT_TYPE',   groupName: '교대유형', codeValue: 'SHIFT1',      codeName: '1교대',      codeNameEn: 'Shift 1',     sortOrder: 1, description: '06:00~14:00',               createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV020', groupCode: 'SHIFT_TYPE',   groupName: '교대유형', codeValue: 'SHIFT2',      codeName: '2교대',      codeNameEn: 'Shift 2',     sortOrder: 2, description: '14:00~22:00',               createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV021', groupCode: 'SHIFT_TYPE',   groupName: '교대유형', codeValue: 'SHIFT3',      codeName: '야간교대',   codeNameEn: 'Night Shift', sortOrder: 3, description: '22:00~06:00',               createdAt: '2024-01-01', useYn: 'Y' },
  { id: 'CV022', groupCode: 'EQUIP_STATUS', groupName: '설비상태', codeValue: 'RUNNING',     codeName: '가동중',     codeNameEn: 'Running',     sortOrder: 1, description: '설비 정상 가동 중',           createdAt: '2024-02-01', useYn: 'Y' },
  { id: 'CV023', groupCode: 'EQUIP_STATUS', groupName: '설비상태', codeValue: 'IDLE',        codeName: '대기중',     codeNameEn: 'Idle',        sortOrder: 2, description: '작업 대기 상태',             createdAt: '2024-02-01', useYn: 'Y' },
  { id: 'CV024', groupCode: 'EQUIP_STATUS', groupName: '설비상태', codeValue: 'BREAKDOWN',   codeName: '고장',       codeNameEn: 'Breakdown',   sortOrder: 3, description: '설비 고장 발생',             createdAt: '2024-02-01', useYn: 'Y' },
  { id: 'CV025', groupCode: 'EQUIP_STATUS', groupName: '설비상태', codeValue: 'MAINTENANCE', codeName: '점검중',     codeNameEn: 'Maintenance', sortOrder: 4, description: '정기/예방 점검 중',           createdAt: '2024-02-01', useYn: 'Y' },
  { id: 'CV026', groupCode: 'EQUIP_STATUS', groupName: '설비상태', codeValue: 'SETUP',       codeName: '셋업',       codeNameEn: 'Setup',       sortOrder: 5, description: '품종 전환/셋업 중',           createdAt: '2024-02-01', useYn: 'Y' },
  { id: 'CV027', groupCode: 'INSP_RESULT',  groupName: '검사결과', codeValue: 'PASS',        codeName: '합격',       codeNameEn: 'Pass',        sortOrder: 1, description: '검사 기준 충족',             createdAt: '2024-03-01', useYn: 'Y' },
  { id: 'CV028', groupCode: 'INSP_RESULT',  groupName: '검사결과', codeValue: 'CONDITIONAL', codeName: '조건부합격', codeNameEn: 'Conditional', sortOrder: 2, description: '재작업 후 합격 판정',         createdAt: '2024-03-01', useYn: 'Y' },
  { id: 'CV029', groupCode: 'INSP_RESULT',  groupName: '검사결과', codeValue: 'FAIL',        codeName: '불합격',     codeNameEn: 'Fail',        sortOrder: 3, description: '검사 기준 미충족',            createdAt: '2024-03-01', useYn: 'Y' },
];

// ─── Column Definitions ───────────────────────────────────────────────────────

const groupColumns: Column<CodeGroup>[] = [
  { key: 'id', header: 'ID', width: '65px' },
  {
    key: 'groupCode', header: '그룹코드', width: '150px',
    render: (v) => <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{String(v)}</span>,
  },
  { key: 'groupName', header: '그룹명', width: '110px' },
  { key: 'description', header: '설명' },
  {
    key: 'codeCount', header: '코드 수', width: '75px', align: 'center',
    render: (v) => (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
        {String(v)}
      </span>
    ),
  },
  { key: 'createdAt', header: '생성일', width: '105px' },
  { key: 'createdBy', header: '생성자', width: '80px' },
  { key: 'status', header: '상태', width: '75px', align: 'center', render: (v) => <StatusBadge status={String(v)} /> },
  {
    key: 'id', header: '액션', width: '130px', align: 'center',
    render: () => (
      <div className="flex gap-1 justify-center">
        <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50">상세</button>
        <button className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50">수정</button>
        <button className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50">삭제</button>
      </div>
    ),
  },
];

const valueColumns: Column<CodeValue>[] = [
  { key: 'id', header: 'ID', width: '65px' },
  {
    key: 'groupCode', header: '그룹코드', width: '140px',
    render: (v) => <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{String(v)}</span>,
  },
  { key: 'groupName', header: '그룹명', width: '90px' },
  {
    key: 'codeValue', header: '코드값', width: '130px',
    render: (v) => <span className="font-mono text-xs font-medium text-gray-800">{String(v)}</span>,
  },
  { key: 'codeName', header: '코드명', width: '95px' },
  { key: 'codeNameEn', header: '영문명', width: '110px' },
  { key: 'sortOrder', header: '정렬순서', width: '75px', align: 'center' },
  { key: 'description', header: '설명' },
  {
    key: 'useYn', header: '사용여부', width: '80px', align: 'center',
    render: (v) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${String(v) === 'Y' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
        {String(v) === 'Y' ? '사용' : '미사용'}
      </span>
    ),
  },
  {
    key: 'id', header: '액션', width: '130px', align: 'center',
    render: () => (
      <div className="flex gap-1 justify-center">
        <button className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50">상세</button>
        <button className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50">수정</button>
        <button className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50">삭제</button>
      </div>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MasterCodesPage() {
  const [grpSearch, setGrpSearch] = useState('');
  const [grpFilter, setGrpFilter] = useState<Record<string, string>>({});
  const [valSearch, setValSearch] = useState('');
  const [valFilter, setValFilter] = useState<Record<string, string>>({});

  const filteredGroups = CODE_GROUPS.filter(g => {
    const q = grpSearch.toLowerCase();
    const matchSearch = !q || g.groupCode.toLowerCase().includes(q) || g.groupName.toLowerCase().includes(q);
    const matchStatus = !grpFilter.status || grpFilter.status === 'all' || g.status === grpFilter.status;
    return matchSearch && matchStatus;
  });

  const filteredValues = CODE_VALUES.filter(c => {
    const q = valSearch.toLowerCase();
    const matchSearch = !q || c.codeValue.toLowerCase().includes(q) || c.codeName.toLowerCase().includes(q);
    const matchGroup = !valFilter.groupCode || valFilter.groupCode === 'all' || c.groupCode === valFilter.groupCode;
    const matchUse = !valFilter.useYn || valFilter.useYn === 'all' || c.useYn === valFilter.useYn;
    return matchSearch && matchGroup && matchUse;
  });

  const activeGroupCount = CODE_GROUPS.filter(g => g.status === 'active').length;
  const totalCodeCount = CODE_GROUPS.reduce((s, g) => s + g.codeCount, 0);
  const activeValueCount = CODE_VALUES.filter(c => c.useYn === 'Y').length;

  return (
    <>
      <PageHeader
        title="코드 관리"
        subtitle="시스템 전반에서 사용하는 공통 코드 그룹 및 코드값을 관리합니다"
        breadcrumbs={[{ label: '기준정보관리' }, { label: '코드관리' }]}
        actions={[
          { label: '+ 코드 그룹 등록', onClick: () => {}, variant: 'secondary' },
          { label: '+ 코드값 등록', onClick: () => {}, variant: 'primary' },
        ]}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '코드 그룹', value: CODE_GROUPS.length, sub: '전체 그룹 수', color: 'border-blue-400', text: 'text-blue-600' },
            { label: '활성 그룹', value: activeGroupCount, sub: '사용 중인 그룹', color: 'border-indigo-400', text: 'text-indigo-600' },
            { label: '전체 코드값', value: totalCodeCount, sub: '그룹 합산 기준', color: 'border-emerald-400', text: 'text-emerald-600' },
            { label: '사용 코드값', value: activeValueCount, sub: '현재 사용 중', color: 'border-gray-300', text: 'text-gray-700' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-3xl font-bold mt-1 ${kpi.text}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Code Group Table */}
        <PageCard title="코드 그룹 목록">
          <SearchFilter
            placeholder="그룹코드, 그룹명 검색"
            searchValue={grpSearch}
            onSearchChange={setGrpSearch}
            filters={[
              { key: 'status', label: '상태', options: [{ value: 'active', label: '활성' }, { value: 'inactive', label: '비활성' }] },
            ]}
            filterValues={grpFilter}
            onFilterChange={(k, v) => setGrpFilter(prev => ({ ...prev, [k]: v }))}
          />
          <div className="mt-3">
            <DataTable columns={groupColumns} data={filteredGroups} rowKey="id" pageSize={8} />
          </div>
        </PageCard>

        {/* Code Value Table */}
        <PageCard title="코드값 목록">
          <SearchFilter
            placeholder="코드값, 코드명 검색"
            searchValue={valSearch}
            onSearchChange={setValSearch}
            filters={[
              {
                key: 'groupCode', label: '그룹코드',
                options: [
                  { value: 'ORDER_STATUS', label: '수주상태' },
                  { value: 'DEFECT_TYPE', label: '불량유형' },
                  { value: 'PROCESS_TYPE', label: '공정유형' },
                  { value: 'SHIFT_TYPE', label: '교대유형' },
                  { value: 'EQUIP_STATUS', label: '설비상태' },
                  { value: 'INSP_RESULT', label: '검사결과' },
                ],
              },
              {
                key: 'useYn', label: '사용여부',
                options: [
                  { value: 'Y', label: '사용' },
                  { value: 'N', label: '미사용' },
                ],
              },
            ]}
            filterValues={valFilter}
            onFilterChange={(k, v) => setValFilter(prev => ({ ...prev, [k]: v }))}
          />
          <div className="mt-3">
            <DataTable columns={valueColumns} data={filteredValues} rowKey="id" pageSize={10} />
          </div>
        </PageCard>
      </div>
    </>
  );
}
