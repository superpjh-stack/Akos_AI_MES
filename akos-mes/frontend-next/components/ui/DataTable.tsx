import React, { useState, useMemo } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string | number);
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

function getValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  pageSize = 15,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getRowKey = (row: T, idx: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(row);
    return (row[rowKey] as string | number) ?? idx;
  };

  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => {
                const key = col.key as string;
                const isSorted = sortKey === key;
                return (
                  <th
                    key={key}
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      'px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs select-none',
                      col.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : '',
                      alignClass[col.align ?? 'left'],
                    ].join(' ')}
                    onClick={() => col.sortable && handleSort(key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <span className="flex flex-col leading-none">
                          <svg
                            className={`w-2.5 h-2.5 ${
                              isSorted && sortDir === 'asc'
                                ? 'text-navy-700'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 10 6"
                            fill="currentColor"
                          >
                            <path d="M5 0L10 6H0z" />
                          </svg>
                          <svg
                            className={`w-2.5 h-2.5 ${
                              isSorted && sortDir === 'desc'
                                ? 'text-navy-700'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 10 6"
                            fill="currentColor"
                          >
                            <path d="M5 6L0 0H10z" />
                          </svg>
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    로딩 중...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, rowIdx) => (
                <tr
                  key={getRowKey(row, rowIdx)}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    'transition-colors duration-100',
                    onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50',
                  ].join(' ')}
                >
                  {columns.map((col) => {
                    const key = col.key as string;
                    const raw = getValue(row, key);
                    return (
                      <td
                        key={key}
                        className={[
                          'px-4 py-3 text-gray-800 whitespace-nowrap',
                          alignClass[col.align ?? 'left'],
                        ].join(' ')}
                      >
                        {col.render ? col.render(raw, row, rowIdx) : String(raw ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && sorted.length > pageSize && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-gray-500">
            전체 <span className="font-medium text-gray-700">{sorted.length}</span>건 중{' '}
            <span className="font-medium text-gray-700">
              {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, sorted.length)}
            </span>
            건 표시
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const page = start + i;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={[
                    'px-2.5 py-1 rounded border text-xs font-medium transition-colors',
                    page === currentPage
                      ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
