import React from 'react';

export type StatusType =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled'
  | string;

interface StatusConfig {
  label: string;
  dot: string;
  badge: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  planned: {
    label: '계획중',
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  in_progress: {
    label: '진행중',
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  completed: {
    label: '완료',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  on_hold: {
    label: '보류',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  cancelled: {
    label: '취소',
    dot: 'bg-red-400',
    badge: 'bg-red-50 text-red-600 border-red-200',
  },
};

const FALLBACK: StatusConfig = {
  label: '알 수 없음',
  dot: 'bg-gray-300',
  badge: 'bg-gray-50 text-gray-500 border-gray-200',
};

interface StatusBadgeProps {
  status: StatusType;
  /** Custom label overrides the default mapping label */
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  pulse = false,
}) => {
  const config = STATUS_MAP[status] ?? FALLBACK;
  const displayLabel = label ?? config.label;

  const sizeClass =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 gap-1'
      : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-medium leading-none',
        sizeClass,
        config.badge,
      ].join(' ')}
    >
      <span className="relative flex">
        {pulse && status === 'in_progress' && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${config.dot}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          } ${config.dot}`}
        />
      </span>
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
