import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'circle' | 'dots' | 'bars';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  /** Show full-page overlay */
  overlay?: boolean;
  color?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, { spinner: string; text: string }> = {
  xs: { spinner: 'w-3 h-3', text: 'text-xs' },
  sm: { spinner: 'w-4 h-4', text: 'text-xs' },
  md: { spinner: 'w-6 h-6', text: 'text-sm' },
  lg: { spinner: 'w-8 h-8', text: 'text-base' },
  xl: { spinner: 'w-12 h-12', text: 'text-lg' },
};

function CircleSpinner({
  sizeClass,
  color,
}: {
  sizeClass: string;
  color: string;
}) {
  return (
    <svg
      className={`${sizeClass} animate-spin ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}

function DotsSpinner({ color }: { color: string }) {
  return (
    <span className={`flex items-end gap-1 ${color}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.15}s` }}
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
        />
      ))}
    </span>
  );
}

function BarsSpinner({ color }: { color: string }) {
  return (
    <span className={`flex items-end gap-0.5 h-5 ${color}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            animationDelay: `${i * 0.1}s`,
            animation: 'barPulse 0.8s ease-in-out infinite alternate',
          }}
          className="w-1 bg-current rounded-sm"
        />
      ))}
      <style>{`
        @keyframes barPulse {
          0%   { height: 30%; }
          100% { height: 100%; }
        }
      `}</style>
    </span>
  );
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'circle',
  label,
  overlay = false,
  color = 'text-[#1e3a5f]',
  className = '',
}) => {
  const { spinner: spinnerSize, text: textSize } = sizeMap[size];

  const inner = (
    <div
      role="status"
      aria-label={label ?? '로딩 중'}
      className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}
    >
      {variant === 'circle' && (
        <CircleSpinner sizeClass={spinnerSize} color={color} />
      )}
      {variant === 'dots' && <DotsSpinner color={color} />}
      {variant === 'bars' && <BarsSpinner color={color} />}

      {label && (
        <span className={`${textSize} text-gray-500 font-medium`}>{label}</span>
      )}
      <span className="sr-only">{label ?? '로딩 중'}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 py-6">
          {inner}
        </div>
      </div>
    );
  }

  return inner;
};

export default LoadingSpinner;
