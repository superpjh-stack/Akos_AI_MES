'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, UserCheck, UserX, Clock, Plus, KeyRound, Pencil, Trash2, Eye,
} from 'lucide-react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

type UserRole = 'ADMIN' | 'PM' | '생산관리자' | '품질담당자' | '현장작업자' | '경영진';
type UserStatus = 'active' | 'inactive' | 'pending';
type Department = '경영지원팀' | '생산관리팀' | '품질관리팀' | 'FAT팀' | 'IT팀' | '설계팀' | '영업팀' | '현장';

interface MesUser {
  id: string;
  name: string;
  email: string;
  department: Department;
  role: UserRole;
  lastLogin: string;
  createdAt: string;
  status: UserStatus;
}

// ─── Sample Data (12행) ───────────────────────────────────────────────────────

const SAMPLE_USERS: MesUser[] = [
  { id: 'U001', name: '박준형',  email: 'jh.park@akos.com',   department: 'IT팀',      role: 'ADMIN',    lastLogin: '2026-06-04 08:32', createdAt: '2024-01-15', status: 'active' },
  { id: 'U002', name: '이수진',  email: 'sj.lee@akos.com',    department: '경영지원팀', role: '경영진',   lastLogin: '2026-06-04 09:05', createdAt: '2024-01-20', status: 'active' },
  { id: 'U003', name: '김철수',  email: 'cs.kim@akos.com',    department: '생산관리팀', role: 'PM',       lastLogin: '2026-06-04 07:55', createdAt: '2024-02-01', status: 'active' },
  { id: 'U004', name: '최민준',  email: 'mj.choi@akos.com',   department: '생산관리팀', role: '생산관리자', lastLogin: '2026-06-04 08:10', createdAt: '2024-02-15', status: 'active' },
  { id: 'U005', name: '이영희',  email: 'yh.lee@akos.com',    department: '품질관리팀', role: '품질담당자', lastLogin: '2026-06-03 17:20', createdAt: '2024-03-01', status: 'active' },
  { id: 'U006', name: '강태양',  email: 'ty.kang@akos.com',   department: '현장',       role: '현장작업자', lastLogin: '2026-06-03 22:05', createdAt: '2024-03-10', status: 'active' },
  { id: 'U007', name: '오지현',  email: 'jh.oh@akos.com',     department: '현장',       role: '현장작업자', lastLogin: '2026-06-04 06:30', createdAt: '2024-04-01', status: 'active' },
  { id: 'U008', name: '정수연',  email: 'sy.jung@akos.com',   department: '설계팀',     role: 'PM',       lastLogin: '2026-06-02 16:40', createdAt: '2024-04-15', status: 'active' },
  { id: 'U009', name: '윤서영',  email: 'sy.yoon@akos.com',   department: 'IT팀',       role: 'ADMIN',    lastLogin: '2026-05-15 11:00', createdAt: '2024-05-10', status: 'inactive' },
  { id: 'U010', name: '한동훈',  email: 'dh.han@akos.com',    department: '영업팀',     role: '경영진',   lastLogin: '2026-06-01 14:00', createdAt: '2024-05-20', status: 'active' },
  { id: 'U011', name: '신혜진',  email: 'hj.shin@akos.com',   department: '품질관리팀', role: '품질담당자', lastLogin: '2026-06-04 08:50', createdAt: '2024-06-01', status: 'active' },
  { id: 'U012', name: '배성호',  email: 'sh.bae@akos.com',    department: '현장',       role: '현장작업자', lastLogin: '2026-06-03 23:10', createdAt: '2024-07-01', status: 'active' },
  { id: 'U013', name: '임재원',  email: 'jw.lim@akos.com',    department: '생산관리팀', role: '생산관리자', lastLogin: '-',               createdAt: '2026-06-01', status: 'pending' },
  { id: 'U014', name: '조민서',  email: 'ms.jo@akos.com',     department: '현장',       role: '현장작업자', lastLogin: '-',               createdAt: '2026-06-03', status: 'pending' },
];

// ─── Role badge colours ───────────────────────────────────────────────────────

const ROLE_STYLE: Record<UserRole, string> = {
  'ADMIN':     'bg-purple-100 text-purple-700 border border-purple-200',
  'PM':        'bg-blue-100 text-blue-700 border border-blue-200',
  '생산관리자': 'bg-sky-100 text-sky-700 border border-sky-200',
  '품질담당자': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  '현장작업자': 'bg-gray-100 text-gray-600 border border-gray-200',
  '경영진':    'bg-amber-100 text-amber-700 border border-amber-200',
};

// ─── Confirm modal (inline, lightweight) ─────────────────────────────────────

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white font-medium ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'none' }
  | { type: 'delete'; user: MesUser }
  | { type: 'reset-pw'; user: MesUser };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MesUser[]>(SAMPLE_USERS);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q
        || u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || u.id.toLowerCase().includes(q);
      const matchDept   = !filterValues.department || filterValues.department === 'all' || u.department === filterValues.department;
      const matchRole   = !filterValues.role       || filterValues.role === 'all'       || u.role === filterValues.role;
      const matchStatus = !filterValues.status     || filterValues.status === 'all'     || u.status === filterValues.status;
      return matchSearch && matchDept && matchRole && matchStatus;
    });
  }, [users, search, filterValues]);

  // KPI counts
  const totalCount    = users.length;
  const activeCount   = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;
  const pendingCount  = users.filter(u => u.status === 'pending').length;

  // Column definitions
  const columns: Column<Record<string, unknown>>[] = [
    { key: 'id',         header: 'ID',         width: '70px' },
    { key: 'name',       header: '이름',        width: '85px', sortable: true },
    { key: 'email',      header: '이메일' },
    { key: 'department', header: '부서',        width: '110px', sortable: true },
    {
      key: 'role', header: '역할', width: '110px',
      render: (v) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLE[v as UserRole] ?? 'bg-gray-100 text-gray-600'}`}>
          {String(v)}
        </span>
      ),
    },
    { key: 'lastLogin',  header: '최근 로그인', width: '145px', sortable: true },
    { key: 'createdAt',  header: '등록일',      width: '100px', sortable: true },
    {
      key: 'status', header: '상태', width: '80px', align: 'center',
      render: (v) => <StatusBadge status={String(v)} />,
    },
    {
      key: 'id', header: '액션', width: '185px', align: 'center',
      render: (_v, row) => {
        const u = row as unknown as MesUser;
        return (
          <div className="flex gap-1 justify-center flex-wrap">
            <button
              className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              onClick={() => showToast(`${u.name} 상세 보기`)}
            >
              <Eye className="w-3 h-3" /> 상세
            </button>
            <button
              className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
              onClick={() => showToast(`${u.name} 수정 폼 열기`)}
            >
              <Pencil className="w-3 h-3" /> 수정
            </button>
            <button
              className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-amber-200 text-amber-600 rounded hover:bg-amber-50"
              onClick={() => setModal({ type: 'reset-pw', user: u })}
            >
              <KeyRound className="w-3 h-3" /> PW초기화
            </button>
            <button
              className="inline-flex items-center gap-0.5 px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50"
              onClick={() => setModal({ type: 'delete', user: u })}
            >
              <Trash2 className="w-3 h-3" /> 삭제
            </button>
          </div>
        );
      },
    },
  ];

  // Modal actions
  const handleDelete = () => {
    if (modal.type !== 'delete') return;
    setUsers(prev => prev.filter(u => u.id !== modal.user.id));
    showToast(`${modal.user.name} 계정이 삭제되었습니다.`);
    setModal({ type: 'none' });
  };

  const handleResetPw = () => {
    if (modal.type !== 'reset-pw') return;
    showToast(`${modal.user.name} 비밀번호가 초기화되었습니다.`);
    setModal({ type: 'none' });
  };

  return (
    <>
      <PageHeader
        title="사용자 관리"
        subtitle="시스템 사용자 계정, 역할 및 접근 권한을 관리합니다"
        breadcrumbs={[{ label: '시스템관리' }, { label: '사용자관리' }]}
        actions={[{
          label: '+ 사용자 등록',
          onClick: () => showToast('사용자 등록 폼 열기'),
          variant: 'primary',
        }]}
      />

      <div className="p-6 space-y-6">

        {/* KPI 카드 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '전체 사용자',  value: totalCount,    sub: '등록된 계정 수',      color: 'border-l-blue-500',    textColor: 'text-blue-600',    icon: <Users className="w-6 h-6 text-blue-400" /> },
            { label: '활성 사용자',  value: activeCount,   sub: '정상 로그인 가능',    color: 'border-l-emerald-500', textColor: 'text-emerald-600', icon: <UserCheck className="w-6 h-6 text-emerald-400" /> },
            { label: '비활성 계정',  value: inactiveCount, sub: '로그인 차단 상태',    color: 'border-l-gray-400',    textColor: 'text-gray-500',    icon: <UserX className="w-6 h-6 text-gray-400" /> },
            { label: '승인 대기',    value: pendingCount,  sub: '신규 등록 승인 필요', color: 'border-l-yellow-400',  textColor: 'text-yellow-600',  icon: <Clock className="w-6 h-6 text-yellow-400" /> },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.textColor}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
                </div>
                <div className="mt-1">{kpi.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 역할 분포 요약 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">역할별 현황</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROLE_STYLE) as UserRole[]).map(role => {
              const cnt = users.filter(u => u.role === role).length;
              return (
                <span key={role} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${ROLE_STYLE[role]}`}>
                  {role}
                  <span className="bg-white/70 rounded-full px-1.5">{cnt}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* 사용자 목록 테이블 */}
        <PageCard title={`사용자 목록 (${filtered.length}건)`}>
          <SearchFilter
            placeholder="이름, 이메일, ID 검색"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: 'department',
                label: '부서',
                options: [
                  { value: '경영지원팀', label: '경영지원팀' },
                  { value: '생산관리팀', label: '생산관리팀' },
                  { value: '품질관리팀', label: '품질관리팀' },
                  { value: 'FAT팀',      label: 'FAT팀' },
                  { value: 'IT팀',       label: 'IT팀' },
                  { value: '설계팀',     label: '설계팀' },
                  { value: '영업팀',     label: '영업팀' },
                  { value: '현장',       label: '현장' },
                ],
              },
              {
                key: 'role',
                label: '역할',
                options: (Object.keys(ROLE_STYLE) as UserRole[]).map(r => ({ value: r, label: r })),
              },
              {
                key: 'status',
                label: '상태',
                options: [
                  { value: 'active',   label: '활성' },
                  { value: 'inactive', label: '비활성' },
                  { value: 'pending',  label: '승인대기' },
                ],
              },
            ]}
            filterValues={filterValues}
            onFilterChange={(k, v) => setFilterValues(prev => ({ ...prev, [k]: v }))}
            onReset={() => { setSearch(''); setFilterValues({}); }}
          />
          <div className="mt-3">
            <DataTable
              columns={columns}
              data={filtered as unknown as Record<string, unknown>[]}
              rowKey="id"
              pageSize={8}
              emptyMessage="조건에 맞는 사용자가 없습니다."
            />
          </div>
        </PageCard>
      </div>

      {/* ── 삭제 확인 모달 ── */}
      {modal.type === 'delete' && (
        <ConfirmModal
          title="사용자 삭제"
          message={`"${modal.user.name}" (${modal.user.email}) 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmLabel="삭제"
          confirmClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDelete}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {/* ── 비밀번호 초기화 확인 모달 ── */}
      {modal.type === 'reset-pw' && (
        <ConfirmModal
          title="비밀번호 초기화"
          message={`"${modal.user.name}" 계정의 비밀번호를 초기화하시겠습니까? 초기화 후 이메일로 임시 비밀번호가 발송됩니다.`}
          confirmLabel="초기화"
          confirmClass="bg-amber-500 hover:bg-amber-600"
          onConfirm={handleResetPw}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {/* ── Toast 알림 ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e3a5f] text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          {toastMsg}
        </div>
      )}
    </>
  );
}
