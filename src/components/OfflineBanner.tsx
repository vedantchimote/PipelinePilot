/**
 * OfflineBanner Component
 * Displays banner when GitLab API is unreachable
 */

import { memo } from 'react';
import { useAppSelector } from '@/store';

export const OfflineBanner = memo(() => {
  const validationStatus = useAppSelector((state) => state.ui.validationStatus);

  if (validationStatus !== 'offline') return null;

  return (
    <div
      role="alert"
      className="fixed top-16 left-0 right-0 z-40 bg-yellow-900/90 border-b border-yellow-700 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-yellow-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-yellow-100 text-sm font-medium">
              Offline Mode - GitLab API Unreachable
            </p>
            <p className="text-yellow-200 text-xs mt-0.5">
              YAML validation and template fetching are disabled. You can continue editing and
              export your pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-yellow-200">
            <svg
              className="w-4 h-4 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Retrying connection...</span>
          </div>
        </div>
      </div>
    </div>
  );
});

OfflineBanner.displayName = 'OfflineBanner';

export default OfflineBanner;
