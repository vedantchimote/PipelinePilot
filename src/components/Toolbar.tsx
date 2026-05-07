/**
 * Toolbar Component
 * Main toolbar with actions and status indicators
 */

import { memo, useCallback, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { ActionCreators } from 'redux-undo';
import { clearPipeline, importYAML, autoLayout } from '@/store/pipelineSlice';
import { toggleTemplateLibrary, toggleTheme, toggleKeyboardShortcuts, setSearchQuery } from '@/store/uiSlice';
import { importYAMLFile, exportYAMLFile } from '@/utils/import-export';
import { markSaved } from '@/store/persistenceSlice';
import { fromYAML } from '@/engine/yaml-engine';
import ValidationStatus from './ValidationStatus';
import AddJobButton from './AddJobButton';
import Tooltip from './Tooltip';
import YAMLParseErrorModal from './YAMLParseErrorModal';
import StageManager from './StageManager';
import IncludeManager from './IncludeManager';
import SimulatorPanel from './SimulatorPanel';

export const Toolbar = memo(() => {
  const dispatch = useAppDispatch();
  const pipelineState = useAppSelector((state) => state.pipeline.present);
  const canUndo = useAppSelector((state) => state.pipeline.past.length > 0);
  const canRedo = useAppSelector((state) => state.pipeline.future.length > 0);
  const theme = useAppSelector((state) => state.ui.theme);
  const searchQuery = useAppSelector((state) => (state.ui as any).searchQuery || '');
  const [yamlError, setYamlError] = useState<{
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
  } | null>(null);
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);
  const [showIncludeManager, setShowIncludeManager] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [pasteToast, setPasteToast] = useState<string | null>(null);

  // Ctrl+V paste YAML import
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Don't intercept paste if focus is in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const text = e.clipboardData?.getData('text/plain');
      if (!text || text.length < 10) return;

      // Quick heuristic: does it look like YAML?
      if (text.includes('stages:') || text.includes('script:') || text.includes('stage:')) {
        e.preventDefault();
        try {
          const state = fromYAML(text);
          dispatch(importYAML(state));
          setPasteToast('Pipeline imported from clipboard');
          setTimeout(() => setPasteToast(null), 2500);
        } catch (err: any) {
          setYamlError({
            message: err.message || 'Failed to parse pasted YAML',
            line: err.line,
            column: err.column,
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [dispatch]);

  // Ctrl+F to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        // Only intercept if no input is focused
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowSearch(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewPipeline = useCallback(() => {
    if (Object.keys(pipelineState.jobs).length === 0) {
      dispatch(clearPipeline());
      return;
    }
    setShowNewConfirm(true);
  }, [dispatch, pipelineState.jobs]);

  const confirmNewPipeline = useCallback(() => {
    dispatch(clearPipeline());
    setShowNewConfirm(false);
  }, [dispatch]);

  const handleImport = useCallback(async () => {
    const result = await importYAMLFile();
    if (result.success && result.data) {
      dispatch(importYAML(result.data));
    } else if (result.error) {
      setYamlError(result.error);
    }
  }, [dispatch]);

  const handleExport = useCallback(() => {
    exportYAMLFile(pipelineState);
  }, [pipelineState]);

  const handleUndo = useCallback(() => {
    if (canUndo) dispatch(ActionCreators.undo());
  }, [dispatch, canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) dispatch(ActionCreators.redo());
  }, [dispatch, canRedo]);

  const handleSave = useCallback(() => {
    dispatch(markSaved());
    const notification = document.createElement('div');
    notification.textContent = 'Pipeline saved';
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }, [dispatch]);

  return (
    <>
    <div className="h-14 glass border-b px-4 flex items-center justify-between z-30 relative" style={{ borderColor: 'var(--border-primary)' }}>
      {/* Left Section - Main Actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>PipelinePilot</h1>
        </div>
        <div className="w-px h-6" style={{ background: 'var(--border-primary)' }} />
        
        <Tooltip content="New pipeline">
          <button onClick={handleNewPipeline} aria-label="New Pipeline" className="toolbar-btn toolbar-btn-labeled">New</button>
        </Tooltip>

        <Tooltip content="Import YAML">
          <button onClick={handleImport} aria-label="Import YAML" className="toolbar-btn toolbar-btn-labeled">Import</button>
        </Tooltip>

        <Tooltip content="Export YAML (Ctrl+E)">
          <button onClick={handleExport} aria-label="Export YAML" className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold">Export</button>
        </Tooltip>

        <div className="w-px h-6" style={{ background: 'var(--border-primary)' }} />

        <Tooltip content="Undo (Ctrl+Z)">
          <button onClick={handleUndo} disabled={!canUndo} aria-label="Undo" className="toolbar-btn disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </button>
        </Tooltip>

        <Tooltip content="Redo (Ctrl+Y)">
          <button onClick={handleRedo} disabled={!canRedo} aria-label="Redo" className="toolbar-btn disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
          </button>
        </Tooltip>

        <Tooltip content="Save (Ctrl+S)">
          <button onClick={handleSave} aria-label="Save" className="toolbar-btn toolbar-btn-labeled">Save</button>
        </Tooltip>

        <div className="w-px h-6" style={{ background: 'var(--border-primary)' }} />

        <AddJobButton />

        <Tooltip content="Manage stages">
          <button
            onClick={() => setShowStageManager(true)}
            aria-label="Manage Stages"
            className="toolbar-btn toolbar-btn-labeled text-xs flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Stages
          </button>
        </Tooltip>

        <Tooltip content="Manage includes">
          <button
            onClick={() => setShowIncludeManager(true)}
            aria-label="Manage Includes"
            className="toolbar-btn toolbar-btn-labeled text-xs flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            Includes
          </button>
        </Tooltip>

        <div className="w-px h-6" style={{ background: 'var(--border-primary)' }} />

        <Tooltip content="Auto-arrange nodes by stage">
          <button
            onClick={() => dispatch(autoLayout())}
            aria-label="Auto Layout"
            className="toolbar-btn toolbar-btn-labeled text-xs flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            Layout
          </button>
        </Tooltip>

        <Tooltip content="Simulate pipeline execution">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            aria-label="Pipeline Simulator"
            className={`toolbar-btn toolbar-btn-labeled text-xs flex items-center gap-1 ${showSimulator ? 'text-green-400' : ''}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Simulate
          </button>
        </Tooltip>
      </div>

      {/* Right Section - Search, Status and Settings */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        {showSearch && (
          <div className="flex items-center gap-1 mr-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  dispatch(setSearchQuery(''));
                  setShowSearch(false);
                }
              }}
              placeholder="Search jobs..."
              autoFocus
              className="px-2.5 py-1 rounded-lg text-xs w-[140px]"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        )}

        <Tooltip content="Search jobs (Ctrl+F)">
          <button
            onClick={() => {
              setShowSearch(prev => !prev);
              if (showSearch) dispatch(setSearchQuery(''));
            }}
            aria-label="Search Jobs"
            className={`toolbar-btn ${showSearch ? 'text-indigo-400' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </Tooltip>

        <ValidationStatus />

        <div className="w-px h-6 mx-1" style={{ background: 'var(--border-primary)' }} />

        <Tooltip content="Open template library">
          <button
            onClick={() => dispatch(toggleTemplateLibrary())}
            aria-label="Template Library"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </Tooltip>

        <Tooltip content="Keyboard shortcuts (Ctrl+/)">
          <button onClick={() => dispatch(toggleKeyboardShortcuts())} aria-label="Keyboard Shortcuts" className="toolbar-btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </Tooltip>

        <Tooltip content={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <button onClick={() => dispatch(toggleTheme())} aria-label="Toggle Theme" className="toolbar-btn">
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </Tooltip>
      </div>
    </div>

    {/* Paste Toast */}
    {pasteToast && (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium fade-in">
        {pasteToast}
      </div>
    )}

    {/* YAML Parse Error Modal */}
    {yamlError && (
      <YAMLParseErrorModal
        error={yamlError}
        onClose={() => setYamlError(null)}
        onRetry={handleImport}
      />
    )}

    {/* New Pipeline Confirmation Modal */}
    {showNewConfirm && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
        <div className="rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 scale-in" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Create New Pipeline?</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            This will clear the current pipeline and all unsaved changes.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNewConfirm(false)} className="toolbar-btn toolbar-btn-labeled px-4 py-2 rounded-lg text-sm">Cancel</button>
            <button onClick={confirmNewPipeline} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">Clear Pipeline</button>
          </div>
        </div>
      </div>
    )}

    {/* Stage Manager Modal */}
    {showStageManager && (
      <StageManager onClose={() => setShowStageManager(false)} />
    )}

    {/* Include Manager Modal */}
    {showIncludeManager && (
      <IncludeManager onClose={() => setShowIncludeManager(false)} />
    )}

    {/* Pipeline Simulator */}
    {showSimulator && <SimulatorPanel />}
  </>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
