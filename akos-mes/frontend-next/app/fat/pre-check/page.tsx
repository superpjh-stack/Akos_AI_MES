'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  description: string;
}

function KpiCard({ title, value, unit, description }: KpiCardProps) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderRadius: '8px',
        padding: '20px',
        flex: '1',
        minWidth: '160px',
      }}
    >
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{title}</p>
      <p style={{ fontSize: '28px', fontWeight: '700', color: '#1e3a5f', marginBottom: '4px' }}>
        {value}
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginLeft: '4px' }}>
          {unit}
        </span>
      </p>
      <p style={{ fontSize: '12px', color: '#9ca3af' }}>{description}</p>
    </div>
  );
}

interface CheckItem {
  id: number;
  priority: 'High' | 'Med' | 'Low';
  item: string;
  basis: string;
  frequency: number;
  risk: string;
  method: string;
  checked: boolean;
}

interface ProjectData {
  items: CheckItem[];
}

const projectOptions = [
  { value: 'PRJ-2024-081', label: 'PRJ-2024-081 / 현대중공업 CNC 라인' },
  { value: 'PRJ-2024-075', label: 'PRJ-2024-075 / 삼성SDI 배터리 모듈' },
  { value: 'PRJ-2024-069', label: 'PRJ-2024-069 / LG에너지 팩 조립' },
];

const projectCheckData: Record<string, ProjectData> = {
  'PRJ-2024-081': {
    items: [
      {
        id: 1,
        priority: 'High',
        item: '서보 드라이버 파라미터 검증',
        basis: '2023년 CNC 라인 FAT 실패 3건 중 2건 원인',
        frequency: 18,
        risk: '높음',
        method: '파라미터 시트 대조 후 JOG 운전 확인',
        checked: false,
      },
      {
        id: 2,
        priority: 'High',
        item: '비상정지 회로 이중화 확인',
        basis: '안전 규격 미달로 인한 출하 지연 패턴',
        frequency: 14,
        risk: '높음',
        method: 'E-STOP 강제 트립 시험 × 3회',
        checked: false,
      },
      {
        id: 3,
        priority: 'Med',
        item: '냉각수 배관 누수 사전 점검',
        basis: '기계 가공 라인 공통 실패 패턴 상위 3위',
        frequency: 11,
        risk: '중간',
        method: '1.5배 수압 시험 30분 유지',
        checked: false,
      },
      {
        id: 4,
        priority: 'Med',
        item: '케이블 트레이 고정 토크 확인',
        basis: '진동 환경 FAT 이후 불량 반복 패턴',
        frequency: 9,
        risk: '중간',
        method: '토크렌치 전수 검사 (규격 토크 ±5%)',
        checked: false,
      },
      {
        id: 5,
        priority: 'Med',
        item: 'PLC I/O 매핑 전체 신호 점검',
        basis: '소프트웨어 통합 단계 누락 항목',
        frequency: 8,
        risk: '중간',
        method: 'I/O 체크시트 100% 확인 후 서명',
        checked: false,
      },
      {
        id: 6,
        priority: 'Low',
        item: '명판 및 라벨링 규격 확인',
        basis: '출하 서류 불일치로 인한 지연 패턴',
        frequency: 6,
        risk: '낮음',
        method: '체크리스트 비교 육안 검사',
        checked: false,
      },
      {
        id: 7,
        priority: 'Low',
        item: '접지 저항 측정 (10Ω 이하)',
        basis: '전기 안전 규격 경미 불합격 패턴',
        frequency: 5,
        risk: '낮음',
        method: '접지 저항계 측정 전 위치별 기록',
        checked: false,
      },
    ],
  },
  'PRJ-2024-075': {
    items: [
      {
        id: 1,
        priority: 'High',
        item: 'BMS 통신 프로토콜 호환성 검증',
        basis: '배터리 모듈 FAT 실패 1위 원인',
        frequency: 22,
        risk: '높음',
        method: 'CAN/RS485 루프백 테스트 전 채널',
        checked: false,
      },
      {
        id: 2,
        priority: 'High',
        item: '셀 전압 밸런싱 허용 편차 확인',
        basis: '출하 후 현장 불량 귀환 주요 패턴',
        frequency: 16,
        risk: '높음',
        method: '전압 편차 ±20mV 이내 전수 측정',
        checked: false,
      },
      {
        id: 3,
        priority: 'Med',
        item: '냉각 플레이트 열저항 측정',
        basis: '열 관리 FAT 재시험 반복 패턴',
        frequency: 10,
        risk: '중간',
        method: '열화상 카메라 스캔 후 기준값 비교',
        checked: false,
      },
      {
        id: 4,
        priority: 'Low',
        item: '방수 등급 IP 시험 사전 확인',
        basis: '방수 실링 누락으로 인한 지연',
        frequency: 7,
        risk: '낮음',
        method: '실링 도포 상태 육안 및 기포 시험',
        checked: false,
      },
    ],
  },
  'PRJ-2024-069': {
    items: [
      {
        id: 1,
        priority: 'High',
        item: '팩 조립 토크 관리 (볼트 전수)',
        basis: '조립 불량으로 인한 FAT 재시험 최다 패턴',
        frequency: 19,
        risk: '높음',
        method: '토크 데이터 로거 100% 기록 후 제출',
        checked: false,
      },
      {
        id: 2,
        priority: 'High',
        item: '절연 내압 시험 (AC 500V, 1분)',
        basis: '안전 규격 미달 출하 지연 반복',
        frequency: 13,
        risk: '높음',
        method: '절연 시험기 자동 테스트 전 팩 적용',
        checked: false,
      },
      {
        id: 3,
        priority: 'Med',
        item: '커넥터 체결 풀림 방지 확인',
        basis: '진동 시험 후 불량 반복 패턴',
        frequency: 9,
        risk: '중간',
        method: '커넥터 체결 육안 및 풀림 토크 검사',
        checked: false,
      },
      {
        id: 4,
        priority: 'Med',
        item: 'SOC 초기값 교정 확인',
        basis: 'BMS 초기화 오류 패턴',
        frequency: 7,
        risk: '중간',
        method: 'BMS 툴 연결 후 SOC 교정 절차 수행',
        checked: false,
      },
      {
        id: 5,
        priority: 'Low',
        item: '외관 스크래치 및 도장 상태',
        basis: '출하 전 외관 불합격 소량 발생',
        frequency: 4,
        risk: '낮음',
        method: '기준 샘플 대조 육안 검사',
        checked: false,
      },
    ],
  },
};

const failurePatternData = [
  { name: '파라미터\n설정 오류', count: 38, fill: '#ef4444' },
  { name: '통신\n프로토콜', count: 31, fill: '#f97316' },
  { name: '배선/케이블\n불량', count: 27, fill: '#eab308' },
  { name: '냉각/열관리\n미흡', count: 22, fill: '#3b82f6' },
  { name: '안전회로\n미달', count: 19, fill: '#8b5cf6' },
];

const priorityStyle: Record<string, { bg: string; color: string; label: string }> = {
  High: { bg: '#fee2e2', color: '#dc2626', label: '높음' },
  Med: { bg: '#fff7ed', color: '#ea580c', label: '중간' },
  Low: { bg: '#f3f4f6', color: '#6b7280', label: '낮음' },
};

export default function FatPreCheckPage() {
  const [selectedProject, setSelectedProject] = useState('PRJ-2024-081');
  const [checkItems, setCheckItems] = useState<Record<string, CheckItem[]>>(() => {
    const initial: Record<string, CheckItem[]> = {};
    for (const key of Object.keys(projectCheckData)) {
      initial[key] = projectCheckData[key].items.map((item) => ({ ...item }));
    }
    return initial;
  });

  const currentItems = checkItems[selectedProject] ?? [];
  const checkedCount = currentItems.filter((i) => i.checked).length;
  const totalCount = currentItems.length;

  function handleCheck(id: number) {
    setCheckItems((prev) => ({
      ...prev,
      [selectedProject]: prev[selectedProject].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  }

  function handleProjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedProject(e.target.value);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 24px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
          FAT 관리 &gt; 사전점검 추천
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a5f', marginBottom: '8px' }}>
          FAT 사전점검 추천
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          과거 FAT 실패 패턴 분석 기반 프로젝트별 사전 점검 항목을 제안하여 출하 전 품질 안정성 및 FAT 리드타임을 단축합니다.
        </p>
      </div>

      {/* KPI 카드 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KpiCard title="사전점검 추천" value="12" unit="건" description="현재 활성 프로젝트 기준" />
        <KpiCard title="실패 패턴 DB" value="247" unit="건" description="누적 FAT 실패 데이터" />
        <KpiCard title="평균 FAT 단축" value="1.8" unit="일" description="사전점검 적용 프로젝트" />
        <KpiCard title="예방 성공률" value="78" unit="%" description="점검 후 무결 출하 비율" />
      </div>

      {/* 프로젝트 선택 + 진행률 */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a5f', whiteSpace: 'nowrap' }}>
            프로젝트 선택
          </label>
          <select
            value={selectedProject}
            onChange={handleProjectChange}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#374151',
              backgroundColor: 'white',
              minWidth: '300px',
              outline: 'none',
            }}
          >
            {projectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>점검 진행률</span>
          <div
            style={{
              width: '160px',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
                height: '100%',
                background: '#2563eb',
                borderRadius: '4px',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>
            {checkedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
        {/* 사전점검 추천 테이블 */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f' }}>
              사전점검 추천 리스트
            </h2>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              {selectedProject} — AI 분석 기반 우선순위 정렬
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['우선순위', '점검항목', '근거 (과거 실패 패턴)', '빈도', '위험도', '점검방법', '완료'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, idx) => {
                  const ps = priorityStyle[item.priority];
                  return (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: item.checked ? '#f0fdf4' : idx % 2 === 0 ? 'white' : '#fafafa',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: ps.bg,
                            color: ps.color,
                          }}
                        >
                          {ps.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontWeight: '500',
                          color: '#1e3a5f',
                          maxWidth: '180px',
                        }}
                      >
                        {item.item}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#4b5563', maxWidth: '200px' }}>
                        {item.basis}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                        {item.frequency}회
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span
                          style={{
                            color: ps.color,
                            fontWeight: '600',
                            fontSize: '12px',
                          }}
                        >
                          {item.risk}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#6b7280', maxWidth: '180px', fontSize: '12px' }}>
                        {item.method}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleCheck(item.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#2563eb',
                            cursor: 'pointer',
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              style={{
                padding: '8px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onClick={() => {
                setCheckItems((prev) => ({
                  ...prev,
                  [selectedProject]: prev[selectedProject].map((item) => ({ ...item, checked: false })),
                }));
              }}
            >
              초기화
            </button>
            <button
              style={{
                padding: '8px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              점검 결과 저장
            </button>
          </div>
        </div>

        {/* 과거 실패 패턴 TOP5 바차트 */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f', marginBottom: '4px' }}>
            과거 실패 패턴 TOP 5
          </h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
            전체 FAT 실패 247건 기준
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={failurePatternData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#374151' }}
                width={80}
              />
              <Tooltip
                formatter={(value: any) => [`${Number(value)}건`, '발생 횟수']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {failurePatternData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* 범례 */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {failurePatternData.map((entry) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: entry.fill,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#4b5563' }}>{entry.name.replace('\n', ' ')}</span>
                <span style={{ marginLeft: 'auto', fontWeight: '600', color: '#1e3a5f' }}>
                  {entry.count}건
                </span>
              </div>
            ))}
          </div>

          {/* 안내 박스 */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
            }}
          >
            <p style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600', marginBottom: '4px' }}>
              AI 분석 인사이트
            </p>
            <p style={{ fontSize: '12px', color: '#3b82f6', lineHeight: '1.6' }}>
              파라미터 설정 오류 및 통신 프로토콜 문제가 전체 실패의 약 28%를 차지합니다.
              사전점검 체크리스트 적용 시 FAT 리드타임 평균 1.8일 단축 효과가 확인되었습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
