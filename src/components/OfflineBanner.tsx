/**
 * OfflineBanner Component
 * Compact, dismissible notice when GitLab API is unreachable
 */

import { memo, useState } from 'react';
import { useAppSelector } from '@/store';

export const OfflineBanner = memo(() => {
  const validationStatus = useAppSelector((state) => state.ui.validationStatus);
  const [dismissed, setDismissed] = useState(false);

  if (validationStatus !== 'offline' || dismissed) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-2 px-4 py-1.5 text-xs"
      style={{
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border-primary)',
        color: 'var(--text-secondary)',
      }}
    >
      <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>
        <strong className="font-medium" style={{ color: 'var(--text-primary)' }}>Offline mode</strong> — GitLab API unreachable. Validation disabled, editing and export still work.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto toolbar-btn p-0.5"
        aria-label="Dismiss offline notice"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

export default OfflineBanner;
