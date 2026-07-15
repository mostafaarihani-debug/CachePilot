import { getCategoryIcon } from '../utils/iconMap';

interface CategoryIconProps {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
}

export function CategoryIcon({ iconName, size = 16, color, className }: CategoryIconProps) {
  const Icon = getCategoryIcon(iconName);
  return <Icon style={{ width: size, height: size, color, flexShrink: 0 }} className={className} />;
}
