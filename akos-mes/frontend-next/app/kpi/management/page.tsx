"use client";

import { useState } from "react";

interface KpiDefinition {
  id: string;
  name: string;
  formula: string;
  targetValue: number;
  unit: string;
  aggregationCycle: "daily" | "weekly" | "monthly" | "quarterly";
  department: string;
  category: string;
  description: string;
}

const INITIAL_KPI_LIST: KpiDefinition[] = [
  {
    id: "kpi-001",
    name: "설비 종합효율 (OEE)",
    formula: "가동률 × 성능률 × 품질률",
    targetValue: 85,
    unit: "%",
    aggregationCycle: "daily",
    department: "생산부",
    category: "생산효율",
    description: "설비의 전반적인 효율을 측정하는 핵심 지표",
  },
  {
    id: "kpi-002",
    name: "불량률",
    formula: "(불량수량 / 생산수량) × 100",
    targetValue: 0.5,
    unit: "%",
    aggregationCycle: "daily",
    department: "품질부",
    category: "품질",
    description: "전체 생산수량 대비 불량수량의 비율",
  },
  {
    id: "kpi-003",
    name: "납기 준수율",
    formula: "(납기 준수 건수 / 전체 납기 건수) × 100",
    targetValue: 98,
    unit: "%",
    aggregationCycle: "monthly",
    department: "생산관리부",
    category: "납기",
    description: "약속된 납기일 기준 납품 완료 비율",
  },
  {
    id: "kpi-004",
    name: "재고 회전율",
    formula: "매출원가 / 평균재고금액",
    targetValue: 12,
    unit: "회/년",
    aggregationCycle: "monthly",
    department: "구매부",
    category: "재고",
    description: "재고가 얼마나 빠르게 소진되는지를 나타내는 지표",
  },
  {
    id: "kpi-005",
    name: "에너지 원단위",
    formula: "에너지 사용량 / 생산수량",
    targetValue: 2.5,
    unit: "kWh/EA",
    aggregationCycle: "monthly",
    department: "시설부",
    category: "에너지",
    description: "단위 제품 생산에 소요되는 에너지 소비량",
  },
];

const CYCLE_LABELS: Record<KpiDefinition["aggregationCycle"], string> = {
  daily: "일간",
  weekly: "주간",
  monthly: "월간",
  quarterly: "분기",
};

const CATEGORY_COLORS: Record<string, string> = {
  생산효율: "bg-blue-100 text-blue-800",
  품질: "bg-green-100 text-green-800",
  납기: "bg-yellow-100 text-yellow-800",
  재고: "bg-purple-100 text-purple-800",
  에너지: "bg-orange-100 text-orange-800",
};

const EMPTY_KPI: Omit<KpiDefinition, "id"> = {
  name: "",
  formula: "",
  targetValue: 0,
  unit: "",
  aggregationCycle: "monthly",
  department: "",
  category: "",
  description: "",
};

export default function KpiManagementPage() {
  const [kpiList, setKpiList] = useState<KpiDefinition[]>(INITIAL_KPI_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiDefinition | null>(null);
  const [formData, setFormData] = useState<Omit<KpiDefinition, "id">>(EMPTY_KPI);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("전체");
  const [filterCycle, setFilterCycle] = useState("전체");

  const categories = ["전체", ...Array.from(new Set(kpiList.map((k) => k.category)))];
  const cycles = ["전체", "daily", "weekly", "monthly", "quarterly"];

  const filteredList = kpiList.filter((kpi) => {
    const matchesSearch =
      kpi.name.includes(searchTerm) ||
      kpi.department.includes(searchTerm) ||
      kpi.formula.includes(searchTerm);
    const matchesCategory = filterCategory === "전체" || kpi.category === filterCategory;
    const matchesCycle = filterCycle === "전체" || kpi.aggregationCycle === filterCycle;
    return matchesSearch && matchesCategory && matchesCycle;
  });

  const openCreateModal = () => {
    setEditingKpi(null);
    setFormData(EMPTY_KPI);
    setIsModalOpen(true);
  };

  const openEditModal = (kpi: KpiDefinition) => {
    setEditingKpi(kpi);
    const { id, ...rest } = kpi;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.formula || !formData.department) {
      alert("KPI명, 산출공식, 담당부서는 필수 입력 항목입니다.");
      return;
    }
    if (editingKpi) {
      setKpiList((prev) =>
        prev.map((k) => (k.id === editingKpi.id ? { ...formData, id: editingKpi.id } : k))
      );
    } else {
      const newKpi: KpiDefinition = {
        ...formData,
        id: `kpi-${Date.now()}`,
      };
      setKpiList((prev) => [...prev, newKpi]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("이 KPI 정의를 삭제하시겠습니까?")) {
      setKpiList((prev) => prev.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KPI 관리</h1>
            <p className="text-sm text-gray-500 mt-1">
              핵심 성과 지표(KPI) 정의 및 목표값 관리
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            KPI 등록
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">전체 KPI</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpiList.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">카테고리 수</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {new Set(kpiList.map((k) => k.category)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">담당 부서 수</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {new Set(kpiList.map((k) => k.department)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">일간 집계 KPI</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {kpiList.filter((k) => k.aggregationCycle === "daily").length}
            </p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="KPI명, 담당부서, 산출공식 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">카테고리:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">집계주기:</label>
              <select
                value={filterCycle}
                onChange={(e) => setFilterCycle(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cycles.map((c) => (
                  <option key={c} value={c}>
                    {c === "전체" ? "전체" : CYCLE_LABELS[c as KpiDefinition["aggregationCycle"]]}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 whitespace-nowrap">
              {filteredList.length}건
            </p>
          </div>
        </div>

        {/* KPI 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">KPI명</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">카테고리</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">산출공식</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">목표값</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">집계주기</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">담당부서</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredList.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{kpi.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{kpi.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          CATEGORY_COLORS[kpi.category] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {kpi.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {kpi.formula}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-blue-600">
                        {kpi.targetValue}
                        <span className="text-xs text-gray-500 ml-1">{kpi.unit}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {CYCLE_LABELS[kpi.aggregationCycle]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {kpi.department}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(kpi)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          수정
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(kpi.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingKpi ? "KPI 수정" : "KPI 등록"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KPI명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 설비 종합효율 (OEE)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  산출공식 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.formula}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  placeholder="예: 가동률 × 성능률 × 품질률"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    목표값
                  </label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    단위
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="예: %, 회/년, kWh/EA"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  집계주기
                </label>
                <select
                  value={formData.aggregationCycle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aggregationCycle: e.target.value as KpiDefinition["aggregationCycle"],
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">일간</option>
                  <option value="weekly">주간</option>
                  <option value="monthly">월간</option>
                  <option value="quarterly">분기</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당부서 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="예: 생산부, 품질부"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="예: 생산효율, 품질, 납기"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="KPI에 대한 간략한 설명을 입력하세요."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                {editingKpi ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
