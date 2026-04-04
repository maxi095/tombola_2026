import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Button from './Button';

/**
 * PageHeader Component - Premium 2026 v3.2 (Navy Alignment)
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  stats = []
}) {
  return (
    <>
      {breadcrumbs.length > 1 && (
        <div className="pt-10 mb-2 px-1">
          <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <Link to={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
                {idx < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-300" />}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}

      <div className={`sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md -mx-12 px-12 py-5 border-b border-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
          <div className="space-y-0.5 shrink-0">
            <h1 className="text-3xl font-black text-primary tracking-tighter font-manrope">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-500 font-bold text-[14px] tracking-tight">
                {subtitle}
              </p>
            )}
          </div>

          {/* Mini-Dashboard de Métricas ✨🚀 */}
          {stats.length > 0 && (
            <div className="hidden xl:flex items-center gap-8 pl-8 border-l border-slate-200/50 animate-in slide-in-from-left duration-500">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                const variants = {
                  primary: 'text-primary bg-primary/5',
                  success: 'text-green-600 bg-green-500/5',
                  danger: 'text-red-600 bg-red-500/5',
                  slate: 'text-slate-400 bg-slate-100'
                };
                return (
                  <div key={idx} className="flex items-center gap-3 group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-slate-200/20 ${variants[stat.variant] || variants.primary}`}>
                      {Icon && <Icon size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">
                        {stat.label}
                      </p>
                      <p className={`text-[15px] font-black font-manrope leading-none tracking-tight ${variants[stat.variant]?.split(' ')[0]}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'primary'}
              icon={action.icon}
              onClick={action.onClick}
              loading={action.loading}
              className={action.className}
              size={action.size || 'md'}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
