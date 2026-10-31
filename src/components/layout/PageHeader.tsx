import React from 'react';

interface PageHeaderProps {
  title: string;
  kicker?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  kicker,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-soil-600/10">
      <div className="space-y-1">
        {kicker && (
          <span className="text-xs uppercase font-serif tracking-wider font-semibold text-clay-400">
            {kicker}
          </span>
        )}
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-soil-950 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-soil-600 max-w-2xl">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
