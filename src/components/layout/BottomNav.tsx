import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { soundFx } from '@/utils/audio';

interface BottomNavItem {
  path: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: BottomNavItem[] = [
  {
    path: '/',
    label: 'Matchroom',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    ),
  },
  {
    path: '/leaderboard',
    label: 'Oracles',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  },
  {
    path: '/group',
    label: 'Leagues',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    soundFx.playClick();
    navigate(path);
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(calc(100vw - 32px), var(--max-width))',
        zIndex: 'var(--z-nav)' as any,
        background: 'rgba(14, 16, 26, 0.88)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        padding: '6px 8px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 0',
              borderRadius: 'var(--radius-lg)',
              background: active ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              border: `1px solid ${active ? 'var(--color-border-accent)' : 'transparent'}`,
              color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              boxShadow: active ? '0 0 16px rgba(245, 208, 97, 0.15)' : 'none',
            }}
          >
            {item.icon(active)}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: active ? 700 : 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
