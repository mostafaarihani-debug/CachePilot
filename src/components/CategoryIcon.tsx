import {
  Globe,
  Cookie,
  FileClock,
  Download,
  Network,
  Store,
  Image,
  LayoutGrid,
  Zap,
  Monitor,
  Box,
  FileText,
} from 'lucide-react';

const iconMap: Record<string, typeof Globe> = {
  Globe,
  Cookie,
  FileTemporary: FileClock,
  Download,
  Network,
  Store,
  Image,
  LayoutGrid,
  Zap,
  Monitor,
  Box,
  FileText,
};

interface CategoryIconProps {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
}

export function CategoryIcon({ iconName, size = 16, color, className }: CategoryIconProps) {
  const Icon = iconMap[iconName] || Globe;
  return <Icon style={{ width: size, height: size, color, flexShrink: 0 }} className={className} />;
}
