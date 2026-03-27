import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant: 'paid' | 'pending' | 'present' | 'absent' | 'completed';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const variantClasses = {
    paid: 'badge-paid',
    pending: 'badge-pending',
    present: 'badge-present',
    absent: 'badge-absent',
    completed: 'badge-completed',
  };

  return (
    <span className={cn(variantClasses[variant])}>
      {status}
    </span>
  );
}
