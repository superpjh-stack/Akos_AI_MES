"use client";

import { useState } from "react";

interface QualityStandard {
  id: number;
  productCode: string;
  productName: string;
  inspectionItem: string;
  unit: string;
  minValue: number;
  maxValue: number;
  targetValue: number;
  isActive: boolean;
}

const initialData: QualityStandard[] = [
  {
    id: 1,
    productCode: "PRD-001",
    productName: "알루미늄 케이스 A형",
    inspectionItem: "두께",
    unit: "mm",
    minValue: 2.9,
    maxValue: 3.1,
    targetValue: 3.0,
    isActive: true,
  },
  {
    id: 2,
    productCode: "PRD-001",
    productName: "알루미늄 케이스 A형",
    inspectionItem: "무게",
    unit: "g",
    minValue: 145,
    maxValue: 155,
    targetValue: 150,
    isActive: true,
  },
  {
    id: 3,
    productCode: "PRD-002",
    productName: "스틸 브래킷 B형",
    inspectionItem: "인장강도",
    unit: "MPa",
    minValue: 400,
    maxValue: 600,
    targetValue: 500,
    isActive: true,
  },
  {
    id: 4,
    productCode: "PRD-002",
    productName: "스틸 브래킷 B형",
    inspectionItem: "표면거칠기",
    unit: "Ra",
    minValue: 0.8,
    maxValue: 3.2,
    targetValue: 1.6,
    isActive: false,
  },
  {
    id: 5,
    productCode: "PRD-003",
    productName: "플라스틱 커버 C형",
    inspectionItem: "치수 길이",
    unit: "mm",
    minValue: 99.5,
    maxValue: 100.5,
    targetValue: 100.0,
    isActive: true,
  },
];

export default function QualityStandardPage() {
  const [data, setData] = useState<QualityStandard[]>(initialData);
  const [searchProduct, setSearchProduct] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<QualityStandard | null>(null);
  const [form, setForm] = useState<Omit<QualityStandard, "id">>({
    productCode: "",
    productName: "",
    inspectionItem: "",
    unit: "",
    minValue: 0,
    maxValue: 0,
    targetValue: 0,
    isActive: true,
  });

  const filtered = data.filter(
    (row) =>
      row.productCode.toLowerCase().includes(searchProduct.toLowerCase()) ||
      row.productName.includes(searchProduct)
  );

  function openCreate() {
    setEditTarget(null);
    setForm({
      productCode: "",
      productName: "",
      inspectionItem: "",
      unit: "",
      minValue: 0,
      maxValue: 0,
      targetValue: 0,
      isActive: true,
    });
    setShowModal(true);
  }

  function openEdit(row: QualityStandard) {
    setEditTarget(row);
    setForm({
      productCode: row.productCode,
      productName: row.productName,
      inspectionItem: row.inspectionItem,
      unit: row.unit,
      minValue: row.minValue,
      maxValue: row.maxValue,
      targetValue: row.targetValue,
      isActive: row.isActive,
    });
    setShowModal(true);
  }

  function handleSave() {
    if (editTarget) {
      setData((prev) =>
        prev.map((row) =>
          row.id === editTarget.id ? { ...form, id: editTarget.id } : row
        )
      );
    } else {
      const newId =
        data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
      setData((prev) => [...prev, { ...form, id: newId }]);
    }
    setShowModal(false);
  }

  function handleDelete(id: number) {
    if (confirm("해당 검사 기준을 삭제하시겠습니까?")) {
      setData((prev) => prev.filter((row) => row.id !== id));
    }
  }

  function toggleActive(id: number) {
    setData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, isActive: !row.isActive } : row
      )
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">품질 기준 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          제품별 검사 항목 및 허용 범위(min/max)를 등록하고 관리합니다.
        </p>
      </div>

      {/* 검색 및 등록 */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="제품코드 또는 제품명 검색"
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + 기준 추가
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                제품코드
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                제품명
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                검사항목
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                단위
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                최솟값 (Min)
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                목표값
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">
                최댓값 (Max)
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                상태
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-gray-700">
                    {row.productCode}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{row.productName}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {row.inspectionItem}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{row.unit}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">
                    {row.minValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700 font-semibold">
                    {row.targetValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">
                    {row.maxValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(row.id)}
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        row.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.isActive ? "사용" : "미사용"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={() => openEdit(row)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editTarget ? "검사 기준 수정" : "검사 기준 추가"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  제품코드
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.productCode}
                  onChange={(e) =>
                    setForm({ ...form, productCode: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  제품명
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.productName}
                  onChange={(e) =>
                    setForm({ ...form, productName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  검사항목
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.inspectionItem}
                  onChange={(e) =>
                    setForm({ ...form, inspectionItem: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  단위
                </label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  최솟값 (Min)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.minValue}
                  onChange={(e) =>
                    setForm({ ...form, minValue: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  목표값
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm({ ...form, targetValue: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  최댓값 (Max)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={form.maxValue}
                  onChange={(e) =>
                    setForm({ ...form, maxValue: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  사용 여부
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
