import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  subtitle?: string;
}

export function StatCard({ title, value, icon, variant = 'default', subtitle }: StatCardProps) {
  return (
    <div
      className={cn(
        'stat-card animate-fade-in',
        variant === 'primary' && 'stat-card-primary',
        variant === 'success' && 'stat-card-success',
        variant === 'warning' && 'stat-card-warning'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-sm mt-1',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'default' ? 'bg-accent' : 'bg-white/20'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
