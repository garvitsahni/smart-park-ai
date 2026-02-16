import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'from-primary to-cyan-400',
    glow: 'glow-primary',
  },
  success: {
    iconBg: 'from-emerald-500 to-green-400',
    glow: 'glow-success',
  },
  warning: {
    iconBg: 'from-amber-500 to-orange-400',
    glow: 'glow-warning',
  },
  danger: {
    iconBg: 'from-rose-500 to-red-400',
    glow: 'glow-danger',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={cn('glass-card-elevated p-6 group hover:scale-[1.02] transition-all duration-300', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${styles.iconBg} flex items-center justify-center shadow-lg group-hover:${styles.glow} transition-all`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={cn(
            'text-sm font-medium px-2 py-1 rounded-full',
            trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="text-3xl font-display font-bold mb-1">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
    </div>
  );
};
