'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabType } from '@/lib/types';

interface AppHeaderProps {
  currentTab: TabType;
  customTitle?: string;
  onBack?: () => void;
  onOpenCrisis: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userInitial?: string;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  onOpenProfile?: () => void;
  onSignOut?: () => void;
  isProfileActive?: boolean;
}

const TAB_TITLES: Record<TabType, string> = {
  today: 'EQ OS',
  library: 'Library',
  story: 'Story'
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  customTitle,
  onBack,
  onOpenCrisis,
  theme,
  onToggleTheme,
  userInitial = 'P',
  userName = 'User',
  userEmail = '',
  isAdmin = false,
  onOpenProfile,
  onSignOut,
  isProfileActive = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    if (onOpenProfile) onOpenProfile();
  };

  const handleSignOutClick = () => {
    setIsMenuOpen(false);
    if (onSignOut) onSignOut();
  };

  const isAtProfileView = customTitle === 'What the OS knows' || isProfileActive;

  return (
    <header className="appbar" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onBack ? (
          <button
            onClick={onBack}
            className="icon-btn"
            style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}
            aria-label="Back"
          >
            <span style={{ fontSize: '18px', fontWeight: 600 }}>&larr;</span>
          </button>
        ) : (
          <div 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            EQ
          </div>
        )}
        <h2>{customTitle || TAB_TITLES[currentTab]}</h2>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleTheme}
          className="icon-btn"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          style={{ width: '32px', height: '32px' }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button
          onClick={onOpenCrisis}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '999px',
            border: '1px solid var(--crit)',
            background: 'var(--crit-soft)',
            color: 'var(--crit)',
            fontSize: '11px',
            fontWeight: 700
          }}
          aria-label="Emergency Crisis Support"
        >
          SOS
        </button>

        {/* Modern Interactive Account Avatar & Dropdown Trigger */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px 2px 2px',
              borderRadius: '999px',
              background: isMenuOpen || isProfileActive ? 'var(--accent-soft)' : 'var(--surface-2)',
              border: isMenuOpen || isProfileActive ? '1.5px solid var(--accent)' : '1px solid var(--line)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Account, Profile & Sign Out menu"
            aria-label="User Account Menu"
            aria-expanded={isMenuOpen}
          >
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: '12px'
            }}>
              {userInitial}
            </span>
            <svg 
              width="10" 
              height="6" 
              viewBox="0 0 10 6" 
              fill="none" 
              style={{
                stroke: 'var(--muted)',
                strokeWidth: 1.5,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                transform: isMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
                marginRight: '2px'
              }}
            >
              <path d="M1 1L5 5L9 1" />
            </svg>
          </button>

          {/* Account Menu Popover */}
          {isMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'popIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Identity Header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--line)',
                backgroundColor: 'var(--surface-2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '15px',
                    flexShrink: 0
                  }}>
                    {userInitial}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b style={{ fontSize: '14px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {userName}
                      </b>
                      {isAdmin && (
                        <span style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: '#ea580c',
                          color: '#ffffff',
                          flexShrink: 0
                        }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p style={{
                      margin: '2px 0 0',
                      fontSize: '11.5px',
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {userEmail || 'Active user session'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div style={{ padding: '6px 0' }}>
                {/* What the OS Knows Profile Link */}
                <button
                  onClick={handleProfileClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    border: 'none',
                    background: isProfileActive ? 'var(--accent-soft)' : 'transparent',
                    color: 'var(--ink)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isProfileActive ? 'var(--accent-soft)' : 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px' }}>👤</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>What the OS knows</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        Profile & guidance settings
                      </div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>&rarr;</span>
                </button>

                {/* Creator Studio link if Admin */}
                {isAdmin && (
                  <a
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--ink)',
                      textDecoration: 'none',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px' }}>🛠️</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Creator Studio</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Curate tools & programs
                        </div>
                      </div>
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>&rarr;</span>
                  </a>
                )}
              </div>

              {/* Bottom Divider & Sign Out */}
              <div style={{
                borderTop: '1px solid var(--line)',
                padding: '6px 8px',
                backgroundColor: 'var(--surface-2)'
              }}>
                <button
                  onClick={handleSignOutClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'var(--crit)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--crit-soft)';
                    e.currentTarget.style.borderColor = 'var(--crit)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '15px' }}>🚪</span>
                  <span>Sign Out of EQ OS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

