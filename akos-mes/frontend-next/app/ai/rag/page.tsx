'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, File, BookOpen, Layers, RefreshCw, Trash2, Eye, AlertCircle } from 'lucide-react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── Interface ────────────────────────────────────────────────────────────────

interface KnowledgeDoc extends Record<string, unknown> {
  id: string;
  title: string;
  category: string;
  fileType: string;
  size: string;
  sizeBytes: number;
  chunks: number;
  embeddingModel: string;
  uploadedBy: string;
  updatedAt: string;
  status: string;           // completed / processing / pending / failed
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE: KnowledgeDoc[] = [
  { id: 'D001', title: '제품 품질 기준서 v3.2',          category: '품질관리', fileType: 'PDF',  size: '2.4 MB',  sizeBytes: 2516582,  chunks: 124, embeddingModel: 'text-embedding-3-small', uploadedBy: '이영희', updatedAt: '2026-06-01', status: 'completed' },
  { id: 'D002', title: '조립 공정 표준작업서',             category: '생산',    fileType: 'DOCX', size: '1.8 MB',  sizeBytes: 1887436,  chunks: 87,  embeddingModel: 'text-embedding-3-small', uploadedBy: '김철수', updatedAt: '2026-05-28', status: 'completed' },
  { id: 'D003', title: 'FAT 체크리스트 매뉴얼 v4',        category: 'FAT',     fileType: 'PDF',  size: '3.1 MB',  sizeBytes: 3250585,  chunks: 156, embeddingModel: 'text-embedding-3-small', uploadedBy: '최민준', updatedAt: '2026-06-03', status: 'processing' },
  { id: 'D004', title: '설비 유지보수 가이드 2026',        category: '설비',    fileType: 'PDF',  size: '5.2 MB',  sizeBytes: 5452595,  chunks: 0,   embeddingModel: '-',                     uploadedBy: '배성호', updatedAt: '2026-06-04', status: 'pending' },
  { id: 'D005', title: '자재 규격 및 발주 기준서',          category: '자재',    fileType: 'XLSX', size: '0.9 MB',  sizeBytes: 943718,   chunks: 62,  embeddingModel: 'text-embedding-3-small', uploadedBy: '오지현', updatedAt: '2026-05-20', status: 'completed' },
  { id: 'D006', title: '수주 처리 절차서 v2',              category: '영업',    fileType: 'PDF',  size: '1.2 MB',  sizeBytes: 1258291,  chunks: 48,  embeddingModel: 'text-embedding-3-small', uploadedBy: '한동훈', updatedAt: '2026-05-15', status: 'completed' },
  { id: 'D007', title: '안전보건 관리 규정',               category: '안전',    fileType: 'PDF',  size: '4.1 MB',  sizeBytes: 4300799,  chunks: 210, embeddingModel: 'text-embedding-3-small', uploadedBy: '박준형', updatedAt: '2026-04-01', status: 'completed' },
  { id: 'D008', title: '용접 공정 작업지침서',             category: '생산',    fileType: 'DOCX', size: '2.0 MB',  sizeBytes: 2097152,  chunks: 93,  embeddingModel: 'text-embedding-3-small', uploadedBy: '김철수', updatedAt: '2026-03-20', status: 'completed' },
  { id: 'D009', title: '도장 공정 표준서 (구)',            category: '생산',    fileType: 'PDF',  size: '1.5 MB',  sizeBytes: 1572864,  chunks: 71,  embeddingModel: 'text-embedding-ada-002', uploadedBy: '정수연', updatedAt: '2025-12-10', status: 'completed' },
  { id: 'D010', title: '고객 클레임 처리 매뉴얼',          category: '품질관리', fileType: 'DOCX', size: '0.8 MB',  sizeBytes: 838860,   chunks: 0,   embeddingModel: '-',                     uploadedBy: '이영희', updatedAt: '2026-06-04', status: 'pending' },
  { id: 'D011', title: 'CNC 기계가공 작업매뉴얼',          category: '생산',    fileType: 'PDF',  size: '6.7 MB',  sizeBytes: 7025459,  chunks: 0,   embeddingModel: '-',                     uploadedBy: '강태양', updatedAt: '2026-06-04', status: 'failed' },
  { id: 'D012', title: '납기 관리 프로세스 가이드',         category: '영업',    fileType: 'TXT',  size: '0.3 MB',  sizeBytes: 314572,   chunks: 28,  embeddingModel: 'text-embedding-3-small', uploadedBy: '한동훈', updatedAt: '2026-05-10', status: 'completed' },
  { id: 'D013', title: '프레스 설비 도면집 2025',          category: '설비',    fileType: '도면', size: '12.4 MB', sizeBytes: 13002956, chunks: 0,   embeddingModel: '-',                     uploadedBy: '배성호', updatedAt: '2026-06-03', status: 'processing' },
  { id: 'D014', title: '구매 조달 업무 규정',              category: '자재',    fileType: 'PDF',  size: '1.1 MB',  sizeBytes: 1153433,  chunks: 55,  embeddingModel: 'text-embedding-3-small', uploadedBy: '오지현', updatedAt: '2026-04-22', status: 'completed' },
  { id: 'D015', title: 'ISO 9001 품질매뉴얼 v7',          category: '품질관리', fileType: 'PDF',  size: '3.8 MB',  sizeBytes: 3984588,  chunks: 188, embeddingModel: 'text-embedding-3-small', uploadedBy: '이영희', updatedAt: '2026-02-14', status: 'completed' },
];

// ─── File Type Icon ───────────────────────────────────────────────────────────

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF:  'text-red-500',
  DOCX: 'text-blue-500',
  TXT:  'text-gray-400',
  XLSX: 'text-green-600',
  SOP:  'text-purple-500',
  도면:  'text-orange-500',
  매뉴얼: 'text-indigo-500',
};

function FileTypeIcon({ type }: { type: string }) {
  const cls = FILE_TYPE_COLORS[type] ?? 'text-gray-400';
  const icon = type === '도면' ? <Layers size={14} /> : type === '매뉴얼' ? <BookOpen size={14} /> : <FileText size={14} />;
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${cls}`}>
      {icon} {type}
    </span>
  );
}

// ─── Embedding Status Badge ───────────────────────────────────────────────────

const EMBED_STATUS: Record<string, { label: string; cls: string }> = {
  completed:  { label: '임베딩완료', cls: 'bg-emerald-100 text-emerald-700' },
  processing: { label: '처리중',     cls: 'bg-blue-100 text-blue-600' },
  pending:    { label: '대기',       cls: 'bg-yellow-100 text-yellow-700' },
  failed:     { label: '실패',       cls: 'bg-red-100 text-red-600' },
};

function EmbedBadge({ status }: { status: string }) {
  const s = EMBED_STATUS[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {status === 'processing' && <RefreshCw size={10} className="animate-spin" />}
      {status === 'failed' && <AlertCircle size={10} />}
      {s.label}
    </span>
  );
}

// ─── Column Definitions ───────────────────────────────────────────────────────

const columns: Column<KnowledgeDoc>[] = [
  { key: 'id', header: 'ID', width: '65px' },
  { key: 'title', header: '문서명' },
  { key: 'category', header: '분류', width: '90px' },
  {
    key: 'fileType', header: '유형', width: '80px', align: 'center',
    render: (v) => <FileTypeIcon type={String(v)} />,
  },
  { key: 'size', header: '크기', width: '85px', align: 'right' },
  {
    key: 'chunks', header: '청크 수', width: '75px', align: 'center',
    render: (v) => (
      <span className={Number(v) > 0 ? 'font-semibold text-[#1e3a5f]' : 'text-gray-300'}>
        {Number(v) > 0 ? Number(v).toLocaleString() : '-'}
      </span>
    ),
  },
  { key: 'embeddingModel', header: '임베딩 모델', width: '185px' },
  { key: 'uploadedBy', header: '업로더', width: '80px' },
  { key: 'updatedAt', header: '업데이트', width: '105px' },
  {
    key: 'status', header: '임베딩 상태', width: '105px', align: 'center',
    render: (v) => <EmbedBadge status={String(v)} />,
  },
  {
    key: 'id', header: '액션', width: '120px', align: 'center',
    render: () => (
      <div className="flex gap-1 justify-center">
        <button className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-gray-500" title="상세">
          <Eye size={12} />
        </button>
        <button className="p-1.5 border border-blue-200 rounded hover:bg-blue-50 text-blue-500" title="재임베딩">
          <RefreshCw size={12} />
        </button>
        <button className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-400" title="삭제">
          <Trash2 size={12} />
        </button>
      </div>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AiRagPage() {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = SAMPLE.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchCat    = !filterValues.category || filterValues.category === 'all' || d.category === filterValues.category;
    const matchType   = !filterValues.fileType  || filterValues.fileType  === 'all' || d.fileType  === filterValues.fileType;
    const matchStatus = !filterValues.status    || filterValues.status    === 'all' || d.status    === filterValues.status;
    return matchSearch && matchCat && matchType && matchStatus;
  });

  const completedCount  = SAMPLE.filter(d => d.status === 'completed').length;
  const processingCount = SAMPLE.filter(d => d.status === 'processing').length;
  const pendingCount    = SAMPLE.filter(d => d.status === 'pending').length;
  const failedCount     = SAMPLE.filter(d => d.status === 'failed').length;
  const totalChunks     = SAMPLE.reduce((s, d) => s + d.chunks, 0);
  const totalSizeBytes  = SAMPLE.reduce((s, d) => s + d.sizeBytes, 0);
  const totalSizeMB     = (totalSizeBytes / 1048576).toFixed(1);

  return (
    <>
      <PageHeader
        title="RAG 지식베이스"
        subtitle="AI 응답 품질 향상을 위한 기업 문서 지식베이스를 관리합니다"
        breadcrumbs={[{ label: 'AI솔루션' }, { label: 'RAG지식베이스' }]}
        actions={[{ label: '+ 문서 업로드', onClick: () => fileInputRef.current?.click(), variant: 'primary' }]}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '등록 문서',    value: SAMPLE.length,      sub: `총 ${totalSizeMB} MB`,                            color: 'border-blue-400',    text: 'text-blue-600',    icon: <File size={18} /> },
            { label: '임베딩 완료',  value: completedCount,     sub: `${totalChunks.toLocaleString()} 청크 생성됨`,      color: 'border-emerald-400', text: 'text-emerald-600', icon: <BookOpen size={18} /> },
            { label: '벡터 수',      value: totalChunks.toLocaleString(), sub: '전체 임베딩 벡터',              color: 'border-indigo-400',  text: 'text-indigo-600',  icon: <Layers size={18} /> },
            { label: '처리 중/대기', value: processingCount + pendingCount, sub: `처리중 ${processingCount} · 대기 ${pendingCount} · 실패 ${failedCount}`, color: 'border-yellow-400', text: 'text-yellow-600', icon: <RefreshCw size={18} /> },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <span className={kpi.text}>{kpi.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${kpi.text}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); /* handle files */ }}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white rounded-lg border-2 border-dashed shadow-sm p-8 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
        >
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.xlsx" className="hidden" />
          <Upload size={32} className={`mx-auto mb-3 ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
          <p className={`text-sm font-semibold ${dragOver ? 'text-blue-600' : 'text-gray-600'}`}>
            파일을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, XLSX 지원 · 파일당 최대 50 MB</p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {['PDF', 'DOCX', 'TXT', 'XLSX', '도면', 'SOP 매뉴얼'].map(t => (
              <span key={t} className="px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">{t}</span>
            ))}
          </div>
        </div>

        {/* Embedding Status Summary Bar */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600">임베딩 현황</span>
            <span className="text-xs text-gray-400">전체 {SAMPLE.length}개 문서</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-3">
            <div className="bg-emerald-400 transition-all" style={{ width: `${(completedCount / SAMPLE.length) * 100}%` }} title={`완료 ${completedCount}`} />
            <div className="bg-blue-400 transition-all" style={{ width: `${(processingCount / SAMPLE.length) * 100}%` }} title={`처리중 ${processingCount}`} />
            <div className="bg-yellow-300 transition-all" style={{ width: `${(pendingCount / SAMPLE.length) * 100}%` }} title={`대기 ${pendingCount}`} />
            <div className="bg-red-400 transition-all" style={{ width: `${(failedCount / SAMPLE.length) * 100}%` }} title={`실패 ${failedCount}`} />
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: '완료', count: completedCount, cls: 'text-emerald-600' },
              { label: '처리중', count: processingCount, cls: 'text-blue-500' },
              { label: '대기', count: pendingCount, cls: 'text-yellow-600' },
              { label: '실패', count: failedCount, cls: 'text-red-500' },
            ].map(s => (
              <span key={s.label} className={`text-xs font-semibold ${s.cls}`}>
                {s.label} {s.count}
              </span>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              마지막 업데이트: <strong className="text-gray-600">2026-06-04 09:32</strong>
            </span>
          </div>
        </div>

        {/* Document List */}
        <PageCard title="문서 목록">
          <SearchFilter
            placeholder="문서명, 분류 검색"
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: 'category', label: '분류',
                options: [
                  { value: '품질관리', label: '품질관리' },
                  { value: '생산',    label: '생산' },
                  { value: 'FAT',    label: 'FAT' },
                  { value: '설비',   label: '설비' },
                  { value: '자재',   label: '자재' },
                  { value: '영업',   label: '영업' },
                  { value: '안전',   label: '안전' },
                ],
              },
              {
                key: 'fileType', label: '유형',
                options: [
                  { value: 'PDF',  label: 'PDF' },
                  { value: 'DOCX', label: 'DOCX' },
                  { value: 'TXT',  label: 'TXT' },
                  { value: 'XLSX', label: 'XLSX' },
                  { value: '도면',  label: '도면' },
                ],
              },
              {
                key: 'status', label: '임베딩 상태',
                options: [
                  { value: 'completed',  label: '임베딩완료' },
                  { value: 'processing', label: '처리중' },
                  { value: 'pending',    label: '대기' },
                  { value: 'failed',     label: '실패' },
                ],
              },
            ]}
            filterValues={filterValues}
            onFilterChange={(k, v) => setFilterValues(prev => ({ ...prev, [k]: v }))}
          />
          <div className="mt-3">
            <DataTable columns={columns} data={filtered} rowKey="id" pageSize={8} />
          </div>
        </PageCard>
      </div>
    </>
  );
}
