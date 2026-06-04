import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFilterProps {
  placeholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = '검색어를 입력하세요',
  searchValue,
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onReset,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    searchValue.trim() !== '' ||
    Object.values(filterValues).some((v) => v !== '' && v !== 'all');

  const handleReset = useCallback(() => {
    onSearchChange('');
    if (onReset) onReset();
    inputRef.current?.focus();
  }, [onSearchChange, onReset]);

  return (
    <div
      className={[
        'flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2',
        className,
      ].join(' ')}
    >
      {/* Search input */}
      <div className="flex items-center flex-1 min-w-[180px] gap-2">
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent min-w-0"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="검색어 지우기"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Divider */}
      {filters.length > 0 && (
        <div className="h-5 w-px bg-gray-200 flex-shrink-0" />
      )}

      {/* Filter selects */}
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 whitespace-nowrap">{filter.label}</label>
          <select
            value={filterValues[filter.key] ?? 'all'}
            onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white outline-none
              focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] cursor-pointer"
          >
            <option value="all">전체</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Reset button */}
      {hasActiveFilters && onReset && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors ml-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          초기화
        </button>
      )}
    </div>
  );
};

export default SearchFilter;
