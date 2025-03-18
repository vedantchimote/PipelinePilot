/**
 * UndoRedoButtons Component
 * Undo and Redo buttons with keyboard shortcuts
 */

import { memo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { ActionCreators } from 'redux-undo';

export const UndoRedoButtons = memo(() => {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector((state) => state.pipeline.past.length > 0);
  const canRedo = useAppSelector((state) => state.pipeline.future.length > 0);

  const handleUndo = () => {
    if (canUndo) {
      dispatch(ActionCreators.undo());
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      dispatch(ActionCreators.redo());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button
        onClick={handleRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
      </button>
    </div>
  );
});

UndoRedoButtons.displayName = 'UndoRedoButtons';

export default UndoRedoButtons;
