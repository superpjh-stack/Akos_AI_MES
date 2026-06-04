'use client';

import React, { useState } from 'react';
import { PageCard } from '@/components/layout/MainLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable, { Column } from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface TrainingDataset extends Record<string, unknown> {
  id: string;
  name: string;
  dataType: string;        // 유형: 이미지 / 시계열 / 정형 / 텍스트
  dataCount: number;       // 데이터 수
  createdAt: string;       // 생성일
  usedModel: string;       // 사용 모델
  fileSize: string;        // 파일 크기
  uploadedBy: string;      // 업로더
  status: string;          // ready / processing / error / archived
}

interface TrainingHistory extends Record<string, unknown> {
  id: string;
  modelName: string;       // 모델명
  version: string;         // 버전
  datasetId: string;       // 사용 데이터셋 ID
  datasetName: string;     // 사용 데이터셋명
  accuracy: number;        // 정확도 (%)
  loss: number;            // Loss 값
  epochs: number;          // 학습 에폭
  duration: string;        // 학습 소요시간
  trainedAt: string;       // 학습일
  trainedBy: string;       // 학습 실행자
  status: string;          // completed / failed / running
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const DATASETS: TrainingDataset[] = [
  { id: 'DS001', name: '불량 비전검사 이미지셋 v4', dataType: '이미지', dataCount: 12400, createdAt: '2026-05-01', usedModel: 'YOLOv8', fileSize: '4.2 GB', uploadedBy: '이영희', status: 'ready' },
  { id: 'DS002', name: '납기 예측 시계열 데이터', dataType: '시계열', dataCount: 8200, createdAt: '2026-04-10', usedModel: 'XGBoost', fileSize: '156 MB', uploadedBy: '박준형', status: 'ready' },
  { id: 'DS003', name: '설비 진동 센서 데이터', dataType: '시계열', dataCount: 54000, createdAt: '2026-03-05', usedModel: 'LSTM', fileSize: '2.1 GB', uploadedBy: '배성호', status: 'ready' },
  { id: 'DS004', name: '생산량 통계 정형 데이터', dataType: '정형', dataCount: 3600, createdAt: '2026-02-20', usedModel: 'Prophet', fileSize: '28 MB', uploadedBy: '김철수', status: 'archived' },
  { id: 'DS005', name: '불량 비전검사 이미지셋 v5', dataType: '이미지', dataCount: 18000, createdAt: '2026-05-28', usedModel: 'YOLOv8', fileSize: '6.8 GB', uploadedBy: '이영희', status: 'processing' },
  { id: 'DS006', name: '원가 예측 정형 데이터', dataType: '정형', dataCount: 6400, createdAt: '2026-01-15', usedModel: 'LightGBM', fileSize: '42 MB', uploadedBy: '박준형', status: 'ready' },
  { id: 'DS007', name: '공정 이상 탐지 로그셋', dataType: '시계열', dataCount: 29800, createdAt: '2026-01-02', usedModel: 'Isolation Forest', fileSize: '890 MB', uploadedBy: '배성호', status: 'ready' },
  { id: 'DS008', name: '납기 예측 데이터 v4 증강', dataType: '정형', dataCount: 0, createdAt: '2026-05-30', usedModel: 'XGBoost', fileSize: '-', uploadedBy: '박준형', status: 'processing' },
  { id: 'DS009', name: '수율 예측 정형 데이터', dataType: '정형', dataCount: 4200, createdAt: '2025-12-01', usedModel: 'RandomForest', fileSize: '35 MB', uploadedBy: '이영희', status: 'archived' },
  { id: 'DS010', name: '에너지 소비 로그 데이터', dataType: '시계열', dataCount: 2100, createdAt: '2025-11-01', usedModel: 'Linear Regression', fileSize: '18 MB', uploadedBy: '박준형', status: 'archived' },
  { id: 'DS011', name: '품질 검사 텍스트 리포트', dataType: '텍스트', dataCount: 1500, createdAt: '2026-04-25', usedModel: 'BERT', fileSize: '320 MB', uploadedBy: '최민준', status: 'error' },
  { id: 'DS012', name: '조립 공정 이미지 라벨셋', dataType: '이미지', dataCount: 9800, createdAt: '2026-03-18', usedModel: 'ResNet-50', fileSize: '3.6 GB', uploadedBy: '강태양', status: 'ready' },
];

const HISTORIES: TrainingHistory[] = [
  { id: 'TH001', modelName: '불량 비전검사 모델', version: 'v4.0', datasetId: 'DS001', datasetName: '불량 비전검사 이미지셋 v4', accuracy: 96.8, loss: 0.042, epochs: 120, duration: '4h 32m', trainedAt: '2026-05-20', trainedBy: '이영희', status: 'completed' },
  { id: 'TH002', modelName: '납기 예측 모델', version: 'v3.1', datasetId: 'DS002', datasetName: '납기 예측 시계열 데이터', accuracy: 91.2, loss: 0.118, epochs: 200, duration: '1h 15m', trainedAt: '2026-04-15', trainedBy: '박준형', status: 'completed' },
  { id: 'TH003', modelName: '설비 이상 감지 모델', version: 'v2.3', datasetId: 'DS003', datasetName: '설비 진동 센서 데이터', accuracy: 95.4, loss: 0.061, epochs: 80, duration: '6h 48m', trainedAt: '2026-03-10', trainedBy: '배성호', status: 'completed' },
  { id: 'TH004', modelName: '생산량 예측 모델', version: 'v1.0', datasetId: 'DS004', datasetName: '생산량 통계 정형 데이터', accuracy: 85.3, loss: 0.198, epochs: 50, duration: '22m', trainedAt: '2026-02-28', trainedBy: '김철수', status: 'completed' },
  { id: 'TH005', modelName: '불량 비전검사 모델', version: 'v5.0-beta', datasetId: 'DS005', datasetName: '불량 비전검사 이미지셋 v5', accuracy: 0, loss: 0, epochs: 0, duration: '-', trainedAt: '-', trainedBy: '이영희', status: 'running' },
  { id: 'TH006', modelName: '원가 예측 모델', version: 'v2.0', datasetId: 'DS006', datasetName: '원가 예측 정형 데이터', accuracy: 88.7, loss: 0.152, epochs: 150, duration: '45m', trainedAt: '2026-01-20', trainedBy: '박준형', status: 'completed' },
  { id: 'TH007', modelName: '공정 이상 탐지 모델', version: 'v1.2', datasetId: 'DS007', datasetName: '공정 이상 탐지 로그셋', accuracy: 94.1, loss: 0.078, epochs: 60, duration: '3h 10m', trainedAt: '2026-01-05', trainedBy: '배성호', status: 'completed' },
  { id: 'TH008', modelName: '수율 예측 모델', version: 'v1.0', datasetId: 'DS009', datasetName: '수율 예측 정형 데이터', accuracy: 84.2, loss: 0.211, epochs: 100, duration: '38m', trainedAt: '2025-12-10', trainedBy: '이영희', status: 'completed' },
  { id: 'TH009', modelName: '에너지 소비 예측 모델', version: 'v1.0', datasetId: 'DS010', datasetName: '에너지 소비 로그 데이터', accuracy: 79.5, loss: 0.284, epochs: 80, duration: '18m', trainedAt: '2025-11-01', trainedBy: '박준형', status: 'completed' },
  { id: 'TH010', modelName: '품질 리포트 분류 모델', version: 'v1.0-draft', datasetId: 'DS011', datasetName: '품질 검사 텍스트 리포트', accuracy: 0, loss: 0, epochs: 0, duration: '-', trainedAt: '-', trainedBy: '최민준', status: 'failed' },
  { id: 'TH011', modelName: '조립 공정 비전 모델', version: 'v1.0', datasetId: 'DS012', datasetName: '조립 공정 이미지 라벨셋', accuracy: 93.2, loss: 0.089, epochs: 90, duration: '2h 55m', trainedAt: '2026-04-02', trainedBy: '강태양', status: 'completed' },
  { id: 'TH012', modelName: '납기 예측 모델', version: 'v4.0-draft', datasetId: 'DS008', datasetName: '납기 예측 데이터 v4 증강', accuracy: 0, loss: 0, epochs: 0, duration: '-', trainedAt: '-', trainedBy: '박준형', status: 'running' },
];

// ─── Column Definitions ───────────────────────────────────────────────────────

function AccuracyCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-300">-</span>;
  const color = value >= 95 ? 'text-emerald-600' : value >= 88 ? 'text-yellow-600' : 'text-red-500';
  return <span className={`font-semibold ${color}`}>{value.toFixed(1)}%</span>;
}

const datasetColumns: Column<TrainingDataset>[] = [
  { key: 'id', header: 'ID', width: '70px' },
  { key: 'name', header: '데이터셋명' },
  { key: 'dataType', header: '유형', width: '80px', align: 'center',
    render: (v) => {
      const colorMap: Record<string, string> = { '이미지': 'bg-purple-100 text-purple-700', '시계열': 'bg-blue-100 text-blue-700', '정형': 'bg-green-100 text-green-700', '텍스트': 'bg-orange-100 text-orange-700' };
      return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[String(v)] ?? 'bg-gray-100 text-gray-600'}`}>{String(v)}</span>;
    }
  },
  { key: 'dataCount', header: '데이터 수', width: '95px', align: 'center',
    render: (v) => <span className="text-gray-700">{Number(v) > 0 ? Number(v).toLocaleString() : '-'}</span>
  },
  { key: 'createdAt', header: '생성일', width: '105px' },
  { key: 'usedModel', header: '사용 모델', width: '145px' },
  { key: 'fileSize', header: '파일 크기', width: '90px', align: 'right' },
  { key: 'uploadedBy', header: '담당자', width: '80px' },
  { key: 'status', header: '상태', width: '85px', align: 'center', render: (v) => <StatusBadge status={String(v)} /> },
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

const historyColumns: Column<TrainingHistory>[] = [
  { key: 'id', header: 'ID', width: '70px' },
  { key: 'modelName', header: '모델명' },
  { key: 'version', header: '버전', width: '105px', align: 'center',
    render: (v) => <span className="font-mono text-xs text-gray-700">{String(v)}</span>
  },
  { key: 'datasetName', header: '학습 데이터셋' },
  { key: 'accuracy', header: '정확도', width: '90px', align: 'center', render: (v) => <AccuracyCell value={Number(v)} /> },
  { key: 'loss', header: 'Loss', width: '75px', align: 'center',
    render: (v) => Number(v) === 0 ? <span className="text-gray-300">-</span> : <span className="text-gray-700">{Number(v).toFixed(3)}</span>
  },
  { key: 'epochs', header: 'Epochs', width: '70px', align: 'center',
    render: (v) => Number(v) === 0 ? <span className="text-gray-300">-</span> : <span>{Number(v)}</span>
  },
  { key: 'duration', header: '소요시간', width: '90px', align: 'center' },
  { key: 'trainedAt', header: '학습일', width: '105px' },
  { key: 'trainedBy', header: '실행자', width: '80px' },
  { key: 'status', header: '상태', width: '85px', align: 'center', render: (v) => <StatusBadge status={String(v)} /> },
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

export default function AiTrainingPage() {
  const [dsSearch, setDsSearch] = useState('');
  const [dsFilter, setDsFilter] = useState<Record<string, string>>({});
  const [histSearch, setHistSearch] = useState('');
  const [histFilter, setHistFilter] = useState<Record<string, string>>({});

  const filteredDatasets = DATASETS.filter(d => {
    const q = dsSearch.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.usedModel.toLowerCase().includes(q);
    const matchType = !dsFilter.dataType || dsFilter.dataType === 'all' || d.dataType === dsFilter.dataType;
    const matchStatus = !dsFilter.status || dsFilter.status === 'all' || d.status === dsFilter.status;
    return matchSearch && matchType && matchStatus;
  });

  const filteredHistories = HISTORIES.filter(h => {
    const q = histSearch.toLowerCase();
    const matchSearch = !q || h.modelName.toLowerCase().includes(q) || h.version.toLowerCase().includes(q);
    const matchStatus = !histFilter.status || histFilter.status === 'all' || h.status === histFilter.status;
    return matchSearch && matchStatus;
  });

  const readyCount = DATASETS.filter(d => d.status === 'ready').length;
  const processingCount = DATASETS.filter(d => d.status === 'processing').length;
  const completedCount = HISTORIES.filter(h => h.status === 'completed').length;
  const avgAccuracy = HISTORIES.filter(h => h.accuracy > 0).reduce((s, h) => s + h.accuracy, 0) /
    (HISTORIES.filter(h => h.accuracy > 0).length || 1);

  return (
    <>
      <PageHeader
        title="AI 학습 데이터 관리"
        subtitle="모델 학습에 사용되는 데이터셋 및 모델 학습 이력을 관리합니다"
        breadcrumbs={[{ label: 'AI Agent관리' }, { label: 'AI학습데이터관리' }]}
        actions={[{ label: '+ 데이터 업로드', onClick: () => {}, variant: 'primary' }]}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '전체 데이터셋', value: DATASETS.length, sub: '등록된 데이터셋 수', color: 'border-blue-400', text: 'text-blue-600' },
            { label: '사용 가능', value: readyCount, sub: 'Ready 상태', color: 'border-emerald-400', text: 'text-emerald-600' },
            { label: '처리 중', value: processingCount, sub: '업로드/전처리 중', color: 'border-yellow-400', text: 'text-yellow-600' },
            { label: '평균 모델 정확도', value: `${avgAccuracy.toFixed(1)}%`, sub: `완료된 학습 ${completedCount}건 기준`, color: 'border-gray-300', text: 'text-gray-700' },
          ].map(kpi => (
            <div key={kpi.label} className={`bg-white rounded-lg border border-gray-200 border-l-4 ${kpi.color} shadow-sm p-5`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-3xl font-bold mt-1 ${kpi.text}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Dataset Table */}
        <PageCard title="학습 데이터셋 목록">
          <SearchFilter
            placeholder="데이터셋명, 사용 모델 검색"
            searchValue={dsSearch}
            onSearchChange={setDsSearch}
            filters={[
              { key: 'dataType', label: '데이터 유형', options: [{ value: '이미지', label: '이미지' }, { value: '시계열', label: '시계열' }, { value: '정형', label: '정형' }, { value: '텍스트', label: '텍스트' }] },
              { key: 'status', label: '상태', options: [{ value: 'ready', label: 'Ready' }, { value: 'processing', label: '처리중' }, { value: 'error', label: '오류' }, { value: 'archived', label: '보관됨' }] },
            ]}
            filterValues={dsFilter}
            onFilterChange={(k, v) => setDsFilter(prev => ({ ...prev, [k]: v }))}
          />
          <div className="mt-3">
            <DataTable columns={datasetColumns} data={filteredDatasets} rowKey="id" pageSize={8} />
          </div>
        </PageCard>

        {/* Training History Table */}
        <PageCard title="모델 학습 이력">
          <SearchFilter
            placeholder="모델명, 버전 검색"
            searchValue={histSearch}
            onSearchChange={setHistSearch}
            filters={[
              { key: 'status', label: '학습 상태', options: [{ value: 'completed', label: '완료' }, { value: 'running', label: '학습중' }, { value: 'failed', label: '실패' }] },
            ]}
            filterValues={histFilter}
            onFilterChange={(k, v) => setHistFilter(prev => ({ ...prev, [k]: v }))}
          />
          <div className="mt-3">
            <DataTable columns={historyColumns} data={filteredHistories} rowKey="id" pageSize={8} />
          </div>
        </PageCard>
      </div>
    </>
  );
}
