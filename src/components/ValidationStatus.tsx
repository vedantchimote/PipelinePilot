/**
 * ValidationStatus Component
 * Displays current YAML validation status with high-contrast styling
 */

import { memo } from 'react';
import { useAppSelector } from '@/store';

interface StatusStyle {
  text: string;
  bg: string;
  border: string;
  dot: string;
  pulse?: boolean;
}

export const ValidationStatus = memo(() => {
  const status = useAppSelector((state) => state.ui.validationStatus);
  const errors = useAppSelector((state) => state.ui.validationErrors);
  const errorCount = Object.values(errors).flat().length;

  const isDark = document.documentElement.classList.contains('dark');

  const getStyle = (): StatusStyle => {
    switch (status) {
      case 'validating':
        return isDark
          ? { text: '#93c5fd', bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.4)', dot: '#3b82f6', pulse: true }
          : { text: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd', dot: '#3b82f6', pulse: true };
      case 'valid':
        return isDark
          ? { text: '#6ee7b7', bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.4)', dot: '#10b981' }
          : { text: '#047857', bg: '#d1fae5', border: '#6ee7b7', dot: '#10b981' };
      case 'invalid':
        return isDark
          ? { text: '#fca5a5', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.4)', dot: '#ef4444' }
          : { text: '#b91c1c', bg: '#fee2e2', border: '#fca5a5', dot: '#ef4444' };
      case 'offline':
        return isDark
          ? { text: '#fcd34d', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.4)', dot: '#f59e0b' }
          : { text: '#b45309', bg: '#fef3c7', border: '#fcd34d', dot: '#f59e0b' };
      default: // idle
        return isDark
          ? { text: '#94a3b8', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', dot: '#64748b' }
          : { text: '#475569', bg: '#f1f5f9', border: '#cbd5e1', dot: '#94a3b8' };
    }
  };

  const s = getStyle();

  const displayText = status === 'invalid'
    ? `${errorCount} Error${errorCount !== 1 ? 's' : ''}`
    : status === 'validating' ? 'Validating...'
    : status === 'valid' ? 'Valid'
    : status === 'offline' ? 'Offline'
    : 'Idle';

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      role="status"
      aria-live="polite"
      aria-label={`Validation status: ${displayText}`}
      title={status === 'offline' ? 'GitLab API is unreachable' : undefined}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.pulse ? 'animate-pulse' : ''}`}
        style={{ background: s.dot }}
      />
      <span>{displayText}</span>
    </div>
  );
});

ValidationStatus.displayName = 'ValidationStatus';

export default ValidationStatus;
