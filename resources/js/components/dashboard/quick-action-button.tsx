import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  variant?: 'default' | 'primary';
}

const variantStyles = {
  default: {
    card: 'hover:bg-accent hover:border-accent',
  },
  primary: {
    card: 'hover:bg-primary/10 hover:border-primary/50',
  },
};

export function QuickActionButton({
  icon: Icon,
  label,
  description,
  href,
  variant = 'default',
}: QuickActionButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Link href={href}>
      <div
        className={cn(
          'rounded-lg border bg-background p-4 transition-colors',
          styles.card,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold transition-colors group-hover:text-primary">
              <Icon className="size-4" />
              {label}
            </h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
