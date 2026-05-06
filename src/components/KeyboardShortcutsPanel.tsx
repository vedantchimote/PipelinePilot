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
      { key: 'Delete', description: 'Delete selected job' },
      { key: 'Shift+Click', description: 'Multi-select nodes' },
    ],
  },
  {
    category: 'File Operations',
    items: [
      { key: 'Ctrl+S', description: 'Save pipeline' },
      { key: 'Ctrl+E', description: 'Export YAML' },
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden scale-in"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 id="shortcuts-title" className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
          <button
            onClick={() => dispatch(closeKeyboardShortcuts())}
            aria-label="Close keyboard shortcuts"
            className="toolbar-btn"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between py-1">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shortcut.description}</span>
                      <kbd className="px-2 py-1 rounded-md text-xs font-mono font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
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
        <div className="p-5 border-t flex justify-end" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={() => dispatch(closeKeyboardShortcuts())}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

KeyboardShortcutsPanel.displayName = 'KeyboardShortcutsPanel';

export default KeyboardShortcutsPanel;
