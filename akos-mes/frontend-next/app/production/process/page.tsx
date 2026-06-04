"use client";

import { Activity, AlertTriangle, CheckCircle, Settings } from "lucide-react";

type ProcessStatus = "정상가동" | "가동중지" | "점검중" | "대기";

interface ProcessRow {
  id: string;
  name: string;
  line: string;
  cycleTime: number;
  taktTime: number;
  defectRate: number;
  status: ProcessStatus;
}

const processes: ProcessRow[] = [
  { id: "P001", name: "프레스 공정", line: "A라인", cycleTime: 42, taktTime: 45, defectRate: 0.8, status: "정상가동" },
  { id: "P002", name: "용접 공정",   line: "A라인", cycleTime: 38, taktTime: 45, defectRate: 2.3, status: "정상가동" },
  { id: "P003", name: "도장 공정",   line: "B라인", cycleTime: 51, taktTime: 45, defectRate: 5.1, status: "점검중"   },
  { id: "P004", name: "조립 공정",   line: "B라인", cycleTime: 44, taktTime: 45, defectRate: 1.2, status: "정상가동" },
  { id: "P005", name: "검사 공정",   line: "C라인", cycleTime: 30, taktTime: 45, defectRate: 0.3, status: "정상가동" },
  { id: "P006", name: "포장 공정",   line: "C라인", cycleTime: 28, taktTime: 45, defectRate: 0.5, status: "대기"     },
  { id: "P007", name: "절삭 공정",   line: "D라인", cycleTime: 60, taktTime: 45, defectRate: 3.7, status: "가동중지" },
  { id: "P008", name: "열처리 공정", line: "D라인", cycleTime: 90, taktTime: 45, defectRate: 1.9, status: "점검중"   },
];

const totalProcesses  = processes.length;
const normalRunning   = processes.filter((p) => p.status === "정상가동").length;
const utilizationRate = ((normalRunning / totalProcesses) * 100).toFixed(1);
const avgDefectRate   = (processes.reduce((s, p) => s + p.defectRate, 0) / totalProcesses).toFixed(2);

const STATUS_STYLE: Record<ProcessStatus, string> = {
  정상가동: "bg-green-50 text-green-700 border-green-200",
  가동중지: "bg-red-50 text-red-700 border-red-200",
  점검중:   "bg-amber-50 text-amber-700 border-amber-200",
  대기:     "bg-gray-100 text-gray-600 border-gray-200",
};

function StatusBadge({ status }: { status: ProcessStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

function DefectCell({ rate }: { rate: number }) {
  const cls = rate >= 5 ? "text-red-600" : rate >= 3 ? "text-orange-500" : rate >= 1 ? "text-yellow-600" : "text-green-600";
  return <span className={`font-medium ${cls}`}>{rate.toFixed(1)}%</span>;
}

function KpiCard({ title, value, sub, icon, color }: { title: string; value: string; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-lg p-5 flex flex-col gap-2" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  );
}

export default function ProcessPage() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>공정 관리</h1>
        <p className="text-sm text-gray-500 mt-1">전체 공정의 사이클타임, 택타임, 불량률 및 가동 상태를 모니터링합니다.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="공정 수" value={String(totalProcesses)} sub="등록된 전체 공정" icon={<Settings size={18} />} color="#6b7280" />
        <KpiCard title="정상 가동" value={String(normalRunning)} sub="정상가동 공정 수" icon={<CheckCircle size={18} />} color="#16a34a" />
        <KpiCard title="가동률" value={`${utilizationRate}%`} sub="정상가동 / 전체" icon={<Activity size={18} />} color="#2563eb" />
        <KpiCard title="평균 불량률" value={`${avgDefectRate}%`} sub="전체 공정 평균" icon={<AlertTriangle size={18} />} color="#f97316" />
      </div>

      <div className="bg-white rounded-lg" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">공정 현황</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["공정 ID", "공정명", "라인", "사이클타임(초)", "택타임(초)", "불량률", "상태"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.line}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.cycleTime > p.taktTime ? "text-red-600 font-semibold" : "text-gray-800"}>{p.cycleTime}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.taktTime}</td>
                  <td className="px-4 py-3 text-right"><DefectCell rate={p.defectRate} /></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
