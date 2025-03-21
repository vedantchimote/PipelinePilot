/**
 * Toolbar Component
 * Main toolbar with actions and status indicators
 */

import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { ActionCreators } from 'redux-undo';
import { clearPipeline } from '@/store/pipelineSlice';
import { toggleTemplateLibrary, toggleTheme, toggleKeyboardShortcuts } from '@/store/uiSlice';
import { importYAMLFile, exportYAMLFile } from '@/utils/import-export';
import { markSaved } from '@/store/persistenceSlice';
import ValidationStatus from './ValidationStatus';
import AddJobButton from './AddJobButton';

export const Toolbar = memo(() => {
  const dispatch = useAppDispatch();
  const pipelineState = useAppSelector((state) => state.pipeline.present);
  const canUndo = useAppSelector((state) => state.pipeline.past.length > 0);
  const canRedo = useAppSelector((state) => state.pipeline.future.length > 0);
  const theme = useAppSelector((state) => state.ui.theme);

  const handleNewPipeline = useCallback(() => {
    if (confirm('Create new pipeline? This will clear the current pipeline.')) {
      dispatch(clearPipeline());
    }
  }, [dispatch]);

  const handleImport = useCallback(async () => {
    const imported = await importYAMLFile();
    if (imported) {
      const { importYAML } = await import('@/store/pipelineSlice');
      dispatch(importYAML(imported));
    }
  }, [dispatch]);

  const handleExport = useCallback(() => {
    exportYAMLFile(pipelineState);
  }, [pipelineState]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      dispatch(ActionCreators.undo());
    }
  }, [dispatch, canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      dispatch(ActionCreators.redo());
    }
  }, [dispatch, canRedo]);

  const handleSave = useCallback(() => {
    dispatch(markSaved());
    // Show notification
    const notification = document.createElement('div');
    notification.textContent = 'Pipeline saved';
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }, [dispatch]);

  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
      {/* Left Section - Main Actions */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white mr-4">Pipeline Editor</h1>
        
        <button
          onClick={handleNewPipeline}
          title="New Pipeline"
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          New
        </button>

        <button
          onClick={handleImport}
          title="Import YAML"
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Import
        </button>

        <button
          onClick={handleExport}
          title="Export YAML (Ctrl+E)"
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Export
        </button>

        <div className="w-px h-8 bg-gray-700" />

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

        <button
          onClick={handleSave}
          title="Save (Ctrl+S)"
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Save
        </button>

        <div className="w-px h-8 bg-gray-700" />

        <AddJobButton />
      </div>

      {/* Right Section - Status and Settings */}
      <div className="flex items-center gap-3">
        <ValidationStatus />

        <div className="w-px h-8 bg-gray-700" />

        <button
          onClick={() => dispatch(toggleTemplateLibrary())}
          title="Template Library"
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => dispatch(toggleKeyboardShortcuts())}
          title="Keyboard Shortcuts (Ctrl+/)"
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <button
          onClick={() => dispatch(toggleTheme())}
          title="Toggle Theme"
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
