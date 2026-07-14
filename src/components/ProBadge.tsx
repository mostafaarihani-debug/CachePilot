import { Crown } from 'lucide-react';

interface ProBadgeProps {
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export function ProBadge({ size = 'sm', onClick }: ProBadgeProps) {
  const isSmall = size === 'sm';

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: 6,
        background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(168, 130, 255, 0.15))',
        border: '1px solid rgba(77, 163, 255, 0.25)',
        fontSize: isSmall ? 10 : 11,
        fontWeight: 700,
        color: 'rgb(77, 163, 255)',
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <Crown className={isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      PRO
    </span>
  );
}
