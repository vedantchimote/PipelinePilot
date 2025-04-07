/**
 * ValidationStatus Component
 * Displays current YAML validation status
 */

import { memo } from 'react';
import { useAppSelector } from '@/store';

export const ValidationStatus = memo(() => {
  const status = useAppSelector((state) => state.ui.validationStatus);
  const errors = useAppSelector((state) => state.ui.validationErrors);
  const errorCount = Object.values(errors).flat().length;

  const getStatusConfig = () => {
    switch (status) {
      case 'validating':
        return {
          icon: '⟳',
          text: 'Validating...',
          color: 'text-blue-400',
          bg: 'bg-blue-900/20',
        };
      case 'valid':
        return {
          icon: '✓',
          text: 'Valid',
          color: 'text-green-400',
          bg: 'bg-green-900/20',
        };
      case 'invalid':
        return {
          icon: '✗',
          text: `${errorCount} Error${errorCount !== 1 ? 's' : ''}`,
          color: 'text-red-400',
          bg: 'bg-red-900/20',
        };
      case 'offline':
        return {
          icon: '⚠',
          text: 'Offline',
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
        };
      default:
        return {
          icon: '○',
          text: 'Idle',
          color: 'text-gray-400',
          bg: 'bg-gray-900/20',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.color} text-sm font-medium validation-status`}
      role="status"
      aria-live="polite"
      aria-label={`Validation status: ${config.text}`}
      title={status === 'offline' ? 'GitLab API is unreachable' : undefined}
    >
      <span className={status === 'validating' ? 'animate-spin' : ''} aria-hidden="true">{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
});

ValidationStatus.displayName = 'ValidationStatus';

export default ValidationStatus;
