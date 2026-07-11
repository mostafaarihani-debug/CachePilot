import { useAppStore } from '../store';
import type { AppPage } from '../types';
import {
  LayoutDashboard,
  Search,
  History,
  Settings,
} from 'lucide-react';
import logoUrl from '../assets/logo.png';

const navItems: { id: AppPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scan', label: 'Scan', icon: Search },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const colors = {
  bgElevated: 'rgb(21, 26, 33)',
  border: 'rgb(43, 52, 65)',
  primary: 'rgb(77, 163, 255)',
  primaryBg: 'rgba(77, 163, 255, 0.1)',
  surface: 'rgb(26, 32, 40)',
  text: 'rgb(232, 237, 245)',
  textSecondary: 'rgb(169, 180, 194)',
  textMuted: 'rgb(116, 130, 148)',
};

export function Sidebar() {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <aside
      className="flex flex-col"
      style={{
        width: 256,
        height: '100%',
        backgroundColor: colors.bgElevated,
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ padding: 24, borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={logoUrl}
              alt="CachePilot"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
              CachePilot
            </h1>
            <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
              PC Cache Cleaner
            </p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: 16 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
                backgroundColor: isActive ? colors.primaryBg : 'transparent',
                color: isActive ? colors.primary : colors.textSecondary,
              }}
            >
              <Icon style={{ width: 20, height: 20 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: `1px solid ${colors.border}` }}>
        <div
          style={{
            textAlign: 'center',
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.surface,
          }}
        >
          <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
            Keep your PC clean
          </p>
        </div>
      </div>
    </aside>
  );
}