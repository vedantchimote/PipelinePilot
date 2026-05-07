/**
 * BulkActionsBar Component
 * Floating toolbar when multiple nodes are selected via Shift+Click
 */

import { memo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { bulkDeleteJobs, bulkChangeStage } from '@/store/pipelineSlice';
import { clearMultiSelect } from '@/store/uiSlice';

export const BulkActionsBar = memo(() => {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((state) => (state.ui as any).selectedNodeIds || []);
  const stages = useAppSelector((state) => state.pipeline.present.stages);
  const [showStageMenu, setShowStageMenu] = useState(false);

  if (selectedIds.length < 2) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl scale-in"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Selection count */}
      <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
        {selectedIds.length} selected
      </span>

      <div className="w-px h-5" style={{ background: 'var(--border-primary)' }} />

      {/* Change Stage */}
      <div className="relative">
        <button
          onClick={() => setShowStageMenu(!showStageMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Move to Stage
        </button>
        {showStageMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowStageMenu(false)} />
            <div
              className="absolute bottom-full mb-1 left-0 rounded-lg shadow-xl py-1 min-w-[140px] z-50"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
            >
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    dispatch(bulkChangeStage({ jobIds: selectedIds, stage: s }));
                    setShowStageMenu(false);
                    dispatch(clearMultiSelect());
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete All */}
      <button
        onClick={() => {
          if (confirm(`Delete ${selectedIds.length} selected jobs?`)) {
            dispatch(bulkDeleteJobs(selectedIds));
            dispatch(clearMultiSelect());
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete All
      </button>

      <div className="w-px h-5" style={{ background: 'var(--border-primary)' }} />

      {/* Clear Selection */}
      <button
        onClick={() => dispatch(clearMultiSelect())}
        className="toolbar-btn p-1.5 rounded-lg"
        title="Clear selection (Esc)"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

BulkActionsBar.displayName = 'BulkActionsBar';
export default BulkActionsBar;
