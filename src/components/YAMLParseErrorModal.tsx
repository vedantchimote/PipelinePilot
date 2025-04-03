/**
 * YAMLParseErrorModal Component
 * Displays YAML parsing errors with line/column information
 */

import { memo } from 'react';

interface YAMLParseErrorModalProps {
  error: {
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
  };
  onClose: () => void;
  onRetry?: () => void;
}

export const YAMLParseErrorModal = memo(({ error, onClose, onRetry }: YAMLParseErrorModalProps) => {
  const getSuggestion = (message: string): string | null => {
    if (message.includes('indent')) {
      return 'Check your indentation. YAML uses spaces (not tabs) for indentation.';
    }
    if (message.includes('mapping') || message.includes('key')) {
      return 'Ensure all keys have values and are properly formatted (key: value).';
    }
    if (message.includes('duplicate')) {
      return 'Remove duplicate keys. Each key must be unique within its scope.';
    }
    if (message.includes('unexpected')) {
      return 'Check for missing colons, quotes, or special characters that need escaping.';
    }
    return null;
  };

  const suggestion = getSuggestion(error.message);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="yaml-error-title"
        className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 id="yaml-error-title" className="text-xl font-bold text-white mb-2">
                YAML Parsing Error
              </h2>
              <p className="text-gray-400">
                The YAML file could not be parsed. Please fix the errors and try again.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Location */}
          {(error.line !== undefined || error.column !== undefined) && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Location:</h3>
              <div className="flex gap-4 text-sm">
                {error.line !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Line:</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-white font-mono">
                      {error.line}
                    </span>
                  </div>
                )}
                {error.column !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Column:</span>
                    <span className="px-2 py-1 bg-gray-700 rounded text-white font-mono">
                      {error.column}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Error Message:</h3>
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm font-mono">{error.message}</p>
            </div>
          </div>

          {/* Code Snippet */}
          {error.snippet && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Code Snippet:</h3>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre">{error.snippet}</pre>
              </div>
            </div>
          )}

          {/* Suggestion */}
          {suggestion && (
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-blue-300 mb-1">Suggestion:</p>
                  <p className="text-blue-400">{suggestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Common YAML Tips */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Common YAML Tips:</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-blue-400">•</span>
                <span>Use 2 spaces for indentation (not tabs)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">•</span>
                <span>Strings with special characters should be quoted</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">•</span>
                <span>Lists start with a dash (-) followed by a space</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">•</span>
                <span>Keys and values are separated by a colon and space (: )</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

YAMLParseErrorModal.displayName = 'YAMLParseErrorModal';

export default YAMLParseErrorModal;
