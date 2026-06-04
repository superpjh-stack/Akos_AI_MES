"use client";

import { useState } from "react";

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
type DataFormat = "CSV" | "XLSX" | "JSON" | "Parquet";

interface Dataset {
  id: string;
  name: string;
  description: string;
  sizeEstimate: string;
}

interface DownloadHistory {
  id: string;
  dataset: string;
  period: string;
  format: DataFormat;
  requestedAt: string;
  status: "완료" | "처리중" | "실패";
  fileSize: string;
}

// ─────────────────────────────────────────────
// 목업 데이터
// ─────────────────────────────────────────────
const DATASETS: Dataset[] = [
  { id: "production", name: "생산 실적 데이터", description: "공정별 생산량, 불량률, 가동률", sizeEstimate: "~2MB/일" },
  { id: "quality", name: "품질 검사 데이터", description: "검사 항목, 측정값, 판정 결과", sizeEstimate: "~1MB/일" },
  { id: "equipment", name: "설비 센서 데이터", description: "온도, 진동, 전류 등 IoT 센서값", sizeEstimate: "~50MB/일" },
  { id: "inventory", name: "재고/자재 데이터", description: "입출고, 현재고, 자재 소비량", sizeEstimate: "~500KB/일" },
  { id: "energy", name: "에너지 소비 데이터", description: "전력, 가스, 용수 사용량", sizeEstimate: "~200KB/일" },
  { id: "ai_inference", name: "AI 추론 결과 데이터", description: "불량 예측, 이상 감지 점수, 신뢰도", sizeEstimate: "~3MB/일" },
];

const FORMAT_OPTIONS: { value: DataFormat; label: string; ext: string }[] = [
  { value: "CSV", label: "CSV", ext: ".csv" },
  { value: "XLSX", label: "Excel (XLSX)", ext: ".xlsx" },
  { value: "JSON", label: "JSON", ext: ".json" },
  { value: "Parquet", label: "Parquet", ext: ".parquet" },
];

const MOCK_HISTORY: DownloadHistory[] = [
  { id: "dl-001", dataset: "생산 실적 데이터", period: "2026-05-01 ~ 2026-05-31", format: "CSV", requestedAt: "2026-06-01 09:15", status: "완료", fileSize: "58.3 MB" },
  { id: "dl-002", dataset: "설비 센서 데이터", period: "2026-05-20 ~ 2026-05-26", format: "Parquet", requestedAt: "2026-06-01 11:42", status: "완료", fileSize: "342.1 MB" },
  { id: "dl-003", dataset: "AI 추론 결과 데이터", period: "2026-06-01 ~ 2026-06-02", format: "JSON", requestedAt: "2026-06-02 14:08", status: "처리중", fileSize: "—" },
  { id: "dl-004", dataset: "품질 검사 데이터", period: "2026-04-01 ~ 2026-04-30", format: "XLSX", requestedAt: "2026-05-30 16:55", status: "실패", fileSize: "—" },
];

// ─────────────────────────────────────────────
// 상태 뱃지
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: DownloadHistory["status"] }) {
  const styles: Record<DownloadHistory["status"], string> = {
    완료: "bg-green-100 text-green-800",
    처리중: "bg-yellow-100 text-yellow-800",
    실패: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function DataDownloadPage() {
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<DataFormat>("CSV");
  const [history, setHistory] = useState<DownloadHistory[]>(MOCK_HISTORY);
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadRequest = () => {
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!selectedDataset) { setErrorMsg("데이터셋을 선택해 주세요."); return; }
    if (!startDate || !endDate) { setErrorMsg("기간을 모두 입력해 주세요."); return; }
    if (startDate > endDate) { setErrorMsg("시작일이 종료일보다 늦을 수 없습니다."); return; }

    setIsRequesting(true);
    setTimeout(() => {
      const dataset = DATASETS.find((d) => d.id === selectedDataset);
      const newEntry: DownloadHistory = {
        id: `dl-${Date.now()}`,
        dataset: dataset?.name ?? selectedDataset,
        period: `${startDate} ~ ${endDate}`,
        format: selectedFormat,
        requestedAt: new Date().toLocaleString("ko-KR", { hour12: false }).replace(",", ""),
        status: "처리중",
        fileSize: "—",
      };
      setHistory((prev) => [newEntry, ...prev]);
      setIsRequesting(false);
      setSuccessMsg("다운로드 요청이 접수되었습니다. 처리 완료 후 목록에서 확인하세요.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">데이터 다운로드</h1>
          <p className="mt-1 text-sm text-gray-500">데이터셋·기간·출력 형식을 선택하고 원하는 데이터를 내보냅니다.</p>
        </div>

        {/* 요청 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">다운로드 요청</h2>

          {successMsg && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">{successMsg}</div>
          )}
          {errorMsg && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{errorMsg}</div>
          )}

          {/* 데이터셋 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">데이터셋 선택</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DATASETS.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds.id)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    selectedDataset === ds.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{ds.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ds.description}</p>
                  <p className="text-xs text-blue-600 mt-1">{ds.sizeEstimate}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* 출력 형식 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">출력 형식</label>
            <div className="flex flex-wrap gap-3">
              {FORMAT_OPTIONS.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setSelectedFormat(fmt.value)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedFormat === fmt.value
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {fmt.label}
                  <span className="ml-1 text-xs opacity-70">{fmt.ext}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleDownloadRequest}
              disabled={isRequesting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              {isRequesting ? "요청 중…" : "다운로드 요청"}
            </button>
          </div>
        </div>

        {/* 다운로드 이력 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">다운로드 이력</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4">요청 ID</th>
                  <th className="pb-3 pr-4">데이터셋</th>
                  <th className="pb-3 pr-4">기간</th>
                  <th className="pb-3 pr-4">형식</th>
                  <th className="pb-3 pr-4">요청 시각</th>
                  <th className="pb-3 pr-4">상태</th>
                  <th className="pb-3 pr-4">파일 크기</th>
                  <th className="pb-3">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">{row.id}</td>
                    <td className="py-3 pr-4 text-gray-900 font-medium">{row.dataset}</td>
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{row.period}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-mono">{row.format}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{row.requestedAt}</td>
                    <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                    <td className="py-3 pr-4 text-gray-500">{row.fileSize}</td>
                    <td className="py-3">
                      {row.status === "완료" ? (
                        <button className="text-blue-600 hover:underline text-xs font-medium">내려받기</button>
                      ) : row.status === "실패" ? (
                        <button className="text-red-500 hover:underline text-xs font-medium">재시도</button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">다운로드 이력이 없습니다.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
