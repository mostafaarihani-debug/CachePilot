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

export const iconMap: Record<string, typeof Globe> = {
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

export function getCategoryIcon(iconName: string) {
  return iconMap[iconName] || Globe;
}
