/**
 * KeyboardShortcutsPanel Component
 * Modal displaying all keyboard shortcuts
 */

import { memo, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { closeKeyboardShortcuts } from '@/store/uiSlice';
import { trapFocus, focusFirstElement } from '@/utils/focus-trap';

const shortcuts = [
  {
    category: 'Editing',
    items: [
      { key: 'Ctrl+Z', description: 'Undo last action' },
      { key: 'Ctrl+Y', description: 'Redo last undone action' },
      { key: 'Ctrl+C', description: 'Copy selected job' },
      { key: 'Ctrl+V', description: 'Paste copied job' },
      { key: 'Delete', description: 'Delete selected job' },
    ],
  },
  {
    category: 'File Operations',
    items: [
      { key: 'Ctrl+S', description: 'Save pipeline' },
      { key: 'Ctrl+E', description: 'Export YAML' },
      { key: 'Ctrl+I', description: 'Import YAML' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { key: 'Ctrl+/', description: 'Show keyboard shortcuts' },
      { key: 'Esc', description: 'Close panels/modals' },
    ],
  },
];

export const KeyboardShortcutsPanel = memo(() => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.keyboardShortcutsOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus first element when modal opens
      focusFirstElement(modalRef.current);

      // Handle keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        if (modalRef.current) {
          trapFocus(modalRef.current, e);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={() => dispatch(closeKeyboardShortcuts())}
            aria-label="Close keyboard shortcuts"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-8">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-semibold text-white mb-4">{section.category}</h3>
                <div className="space-y-3">
                  {section.items.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between">
                      <span className="text-gray-300">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={() => dispatch(closeKeyboardShortcuts())}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

KeyboardShortcutsPanel.displayName = 'KeyboardShortcutsPanel';

export default KeyboardShortcutsPanel;
