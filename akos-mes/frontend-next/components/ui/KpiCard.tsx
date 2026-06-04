import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  /** change unit label, e.g. "% vs 전월" */
  changeLabel?: string;
  icon?: React.ReactNode;
  /** accent color class for the left border, e.g. 'border-blue-600' */
  accentColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

function ChangeIndicator({ change, label }: { change: number; label?: string }) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const colorClass = isNeutral
    ? 'text-gray-500'
    : isPositive
    ? 'text-green-600'
    : 'text-red-500';

  const arrow = isNeutral ? '—' : isPositive ? '▲' : '▼';

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
      <span>{arrow}</span>
      <span>
        {isNeutral ? '변동없음' : `${Math.abs(change)}${label ?? ''}`}
      </span>
    </span>
  );
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  change,
  changeLabel,
  icon,
  accentColor = 'border-[#1e3a5f]',
  loading = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={[
        'relative bg-white border border-gray-200 rounded shadow-sm',
        'border-l-4',
        accentColor,
        'px-4 py-4 flex flex-col gap-2',
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-150' : '',
      ].join(' ')}
    >
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-7 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">
              {title}
            </p>
            {icon && (
              <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-50 border border-gray-100
                flex items-center justify-center text-gray-400">
                {icon}
              </div>
            )}
          </div>

          {/* Value row */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 leading-none tabular-nums">
              {typeof value === 'number' ? value.toLocaleString('ko-KR') : value}
            </span>
            {unit && (
              <span className="text-sm text-gray-500 font-medium">{unit}</span>
            )}
          </div>

          {/* Change row */}
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <ChangeIndicator change={change} label={changeLabel} />
              {changeLabel && change !== 0 && (
                <span className="text-xs text-gray-400">{changeLabel}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KpiCard;
