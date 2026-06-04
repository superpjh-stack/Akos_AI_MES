import React from 'react';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ActionButton[];
}

const variantStyles: Record<NonNullable<ActionButton['variant']>, string> = {
  primary:
    'bg-navy-700 hover:bg-navy-800 text-white border border-navy-700 hover:border-navy-800',
  secondary:
    'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400',
  danger:
    'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions = [],
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 text-xs text-gray-500">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center">
                {idx > 0 && (
                  <svg
                    className="w-3 h-3 mx-1 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-navy-700 hover:underline transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-700 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                disabled={action.disabled}
                className={[
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-sm font-medium',
                  'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  variantStyles[action.variant ?? 'secondary'],
                ].join(' ')}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
