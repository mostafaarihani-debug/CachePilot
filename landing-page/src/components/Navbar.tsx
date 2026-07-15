import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Free Forever', href: '#pricing' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 24px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: scrolled ? 'rgba(11, 13, 17, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(43, 52, 65, 0.5)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ width: '100%', maxWidth: 1200, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4DA3FF, #2B8AFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 800,
            color: 'white',
            fontFamily: 'var(--font-display)',
          }}>
            C
          </div>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#E8EDF5',
            fontFamily: 'var(--font-display)',
          }}>
            CachePilot
          </span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#8A94A6',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E8EDF5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8A94A6')}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#download"
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 14 }}
          >
            <Download style={{ width: 16, height: 16 }} />
            Download Free
          </a>
        </div>
      </div>
    </nav>
  );
}
