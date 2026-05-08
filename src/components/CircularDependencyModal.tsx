/**
 * CircularDependencyModal Component
 * Displays circular dependency error with cycle path
 */

import { memo } from 'react';

interface CircularDependencyModalProps {
  cycle: string[];
  onClose: () => void;
}

export const CircularDependencyModal = memo(({ cycle, onClose }: CircularDependencyModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cycle-title"
        className="rounded-2xl shadow-2xl max-w-2xl w-full mx-4 scale-in"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 id="cycle-title" className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Circular Dependency Detected
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Cannot create this dependency because it would create a circular reference in the
                pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Cycle Path:</h3>
            <div className="p-4 rounded-lg border border-red-900/30" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                {[...cycle, cycle[0]].map((jobName, index) => (
                  <div key={`${jobName}-${index}`} className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg font-mono text-sm ${
                        index === 0 || index === cycle.length
                          ? 'bg-red-900/30 text-red-400 border border-red-700'
                          : 'text-white'
                      }`}
                      style={index === 0 || index === cycle.length ? {} : { background: 'var(--bg-tertiary)' }}
                    >
                      {jobName}
                    </span>
                    {index < cycle.length && (
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">What is a circular dependency?</p>
                <p className="text-blue-400">
                  A circular dependency occurs when a job depends on another job that eventually
                  depends back on the first job, creating an infinite loop. GitLab CI/CD requires
                  a directed acyclic graph (DAG) for job dependencies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});

CircularDependencyModal.displayName = 'CircularDependencyModal';

export default CircularDependencyModal;
