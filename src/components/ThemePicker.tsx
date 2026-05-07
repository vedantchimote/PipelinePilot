/**
 * ThemePicker Component
 * Visual theme selector with color swatches for light + 6 dark themes
 */

import { memo, useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTheme } from '@/store/uiSlice';

export type ThemeId = 'light' | 'dark' | 'dracula' | 'nord' | 'monokai' | 'synthwave' | 'github-dark';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  colors: { bg: string; accent: string; text: string };
  isDark: boolean;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light',
    colors: { bg: '#f8fafc', accent: '#6366f1', text: '#0f172a' },
    isDark: false,
  },
  {
    id: 'dark',
    name: 'Midnight',
    colors: { bg: '#0c1222', accent: '#818cf8', text: '#e2e8f0' },
    isDark: true,
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: { bg: '#282a36', accent: '#bd93f9', text: '#f8f8f2' },
    isDark: true,
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: { bg: '#2e3440', accent: '#88c0d0', text: '#eceff4' },
    isDark: true,
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: { bg: '#272822', accent: '#a6e22e', text: '#f8f8f2' },
    isDark: true,
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    colors: { bg: '#1a1028', accent: '#ff7edb', text: '#e8d5ff' },
    isDark: true,
  },
  {
    id: 'github-dark',
    name: 'GitHub',
    colors: { bg: '#0d1117', accent: '#58a6ff', text: '#e6edf3' },
    isDark: true,
  },
];

/** Apply theme classes to document */
export function applyTheme(themeId: ThemeId) {
  const html = document.documentElement;
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return;

  // Remove all theme variant classes
  html.classList.remove('dark', 'theme-dracula', 'theme-nord', 'theme-monokai', 'theme-synthwave', 'theme-github-dark');

  if (theme.isDark) {
    html.classList.add('dark');
    if (themeId !== 'dark') {
      html.classList.add(`theme-${themeId}`);
    }
  }

  localStorage.setItem('theme', themeId);
}

export const ThemePicker = memo(() => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.ui.theme) as string;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Detect current theme ID from stored value
  const activeThemeId = (THEMES.find((t) => t.id === currentTheme) ? currentTheme : 'dark') as ThemeId;
  const activeTheme = THEMES.find((t) => t.id === activeThemeId)!;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (theme: ThemeOption) => {
    applyTheme(theme.id);
    dispatch(setTheme(theme.id as any));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change theme"
        className="toolbar-btn p-1.5 flex items-center gap-1"
      >
        {/* Color dot preview */}
        <div
          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${activeTheme.colors.bg}, ${activeTheme.colors.accent})` }}
        />
        <svg className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[220px] rounded-xl shadow-2xl overflow-hidden scale-in z-50"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        >
          {/* Header */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Theme</p>
          </div>

          {/* Theme list */}
          <div className="px-2 pb-2 space-y-0.5">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors group"
                style={{
                  background: activeThemeId === theme.id ? 'var(--accent-glow)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeThemeId !== theme.id) e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (activeThemeId !== theme.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Swatch */}
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm"
                  style={{
                    background: theme.colors.bg,
                    border: `1.5px solid ${activeThemeId === theme.id ? theme.colors.accent : theme.colors.bg === '#f8fafc' ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: theme.colors.accent }} />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium block" style={{ color: activeThemeId === theme.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {theme.name}
                  </span>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                    {theme.isDark ? 'Dark' : 'Light'}
                  </span>
                </div>

                {/* Active check */}
                {activeThemeId === theme.id && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ThemePicker.displayName = 'ThemePicker';
export default ThemePicker;
