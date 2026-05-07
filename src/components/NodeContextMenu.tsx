/**
 * NodeContextMenu Component
 * Right-click context menu for job nodes
 */

import { memo } from 'react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onClose: () => void;
}

export const NodeContextMenu = memo(({ x, y, onDuplicate, onDelete, onEdit, onClose }: NodeContextMenuProps) => {
  const items = [
    { label: 'Edit Job', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', action: onEdit },
    { label: 'Duplicate Job', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', action: onDuplicate },
    { label: 'Delete Job', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: onDelete, danger: true },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      {/* Menu */}
      <div
        className="fixed z-[101] rounded-lg shadow-xl py-1 min-w-[160px] scale-in"
        style={{
          left: x,
          top: y,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: (item as any).danger ? '#ef4444' : 'var(--text-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
});

NodeContextMenu.displayName = 'NodeContextMenu';
export default NodeContextMenu;
