/**
 * ValidationStatus Component
 * Displays current YAML validation status with theme-aware styling
 */

import { memo } from 'react';
import { useAppSelector } from '@/store';

interface StatusConfig {
  text: string;
  bg: string;
  color: string;
  dot: string;
  pulse?: boolean;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  validating: {
    text: 'Validating...',
    bg: 'rgba(59,130,246,0.12)',
    color: '#60a5fa',
    dot: '#3b82f6',
    pulse: true,
  },
  valid: {
    text: 'Valid',
    bg: 'rgba(16,185,129,0.12)',
    color: '#34d399',
    dot: '#10b981',
  },
  invalid: {
    text: 'Errors',
    bg: 'rgba(239,68,68,0.12)',
    color: '#f87171',
    dot: '#ef4444',
  },
  offline: {
    text: 'Offline',
    bg: 'rgba(245,158,11,0.15)',
    color: '#fbbf24',
    dot: '#f59e0b',
  },
  idle: {
    text: 'Idle',
    bg: 'rgba(148,163,184,0.1)',
    color: '#94a3b8',
    dot: '#64748b',
  },
};

const STATUS_MAP_LIGHT: Record<string, Partial<StatusConfig>> = {
  validating: { bg: 'rgba(59,130,246,0.08)', color: '#2563eb', dot: '#3b82f6' },
  valid:      { bg: 'rgba(16,185,129,0.08)', color: '#059669', dot: '#10b981' },
  invalid:    { bg: 'rgba(239,68,68,0.08)',  color: '#dc2626', dot: '#ef4444' },
  offline:    { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', dot: '#f59e0b' },
  idle:       { bg: 'rgba(100,116,139,0.08)', color: '#475569', dot: '#94a3b8' },
};

export const ValidationStatus = memo(() => {
  const status = useAppSelector((state) => state.ui.validationStatus);
  const errors = useAppSelector((state) => state.ui.validationErrors);
  const errorCount = Object.values(errors).flat().length;

  const isDark = document.documentElement.classList.contains('dark');
  const key = status || 'idle';
  const base = STATUS_MAP[key] || STATUS_MAP.idle;
  const light = STATUS_MAP_LIGHT[key] || STATUS_MAP_LIGHT.idle;
  const config = isDark ? base : { ...base, ...light };

  const displayText = status === 'invalid'
    ? `${errorCount} Error${errorCount !== 1 ? 's' : ''}`
    : config.text;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"
      style={{ background: config.bg, color: config.color }}
      role="status"
      aria-live="polite"
      aria-label={`Validation status: ${displayText}`}
      title={status === 'offline' ? 'GitLab API is unreachable' : undefined}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.pulse ? 'animate-pulse' : ''}`}
        style={{ background: config.dot }}
      />
      <span>{displayText}</span>
    </div>
  );
});

ValidationStatus.displayName = 'ValidationStatus';

export default ValidationStatus;
