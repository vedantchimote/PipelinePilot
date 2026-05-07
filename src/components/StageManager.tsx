/**
 * StageManager Component
 * Allows adding, removing, and reordering pipeline stages
 */

import { memo, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addStage, removeStage, reorderStages } from '@/store/pipelineSlice';

const PRESET_STAGES = ['build', 'test', 'deploy', 'lint', 'scan', 'package', 'release', 'cleanup', 'verify', 'publish'];

const STAGE_ICONS: Record<string, string> = {
  build:   'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  test:    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  deploy:  'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  lint:    'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  scan:    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  release: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  cleanup: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  verify:  'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  publish: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
};

export const StageManager = memo(({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const stages = useAppSelector((state) => state.pipeline.present.stages);
  const jobs = useAppSelector((state) => state.pipeline.present.jobs);
  const [newStage, setNewStage] = useState('');

  const handleAddStage = useCallback(() => {
    const name = newStage.trim().toLowerCase().replace(/\s+/g, '_');
    if (name && !stages.includes(name)) {
      dispatch(addStage(name));
      setNewStage('');
    }
  }, [dispatch, newStage, stages]);

  const handleRemoveStage = useCallback((stage: string) => {
    const jobsInStage = Object.values(jobs).filter(j => j.stage === stage);
    if (jobsInStage.length > 0) {
      alert(`Cannot remove "${stage}" — ${jobsInStage.length} job(s) still use this stage.`);
      return;
    }
    dispatch(removeStage(stage));
  }, [dispatch, jobs]);

  const handleMoveStage = useCallback((index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stages.length) return;
    const reordered = [...stages];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    dispatch(reorderStages(reordered));
  }, [dispatch, stages]);

  const jobCountForStage = (stage: string) => Object.values(jobs).filter(j => j.stage === stage).length;
  const suggestions = PRESET_STAGES.filter(s => !stages.includes(s));
  const getIcon = (stage: string) => STAGE_ICONS[stage] || 'M4 6h16M4 10h16M4 14h16M4 18h16';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-[520px] mx-4 scale-in overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Stage Manager</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {stages.length} stage{stages.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="toolbar-btn p-1.5 rounded-lg"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stage List */}
        <div className="px-6 py-4 max-h-[360px] overflow-y-auto space-y-2">
          {stages.map((stage, i) => {
            const count = jobCountForStage(stage);
            return (
              <div
                key={stage}
                className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-colors"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                {/* Order indicator */}
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                >
                  {i + 1}
                </span>

                {/* Stage icon */}
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getIcon(stage)} />
                </svg>

                {/* Stage name */}
                <span className="text-sm font-semibold flex-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {stage}
                </span>

                {/* Job count badge */}
                {count > 0 ? (
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}
                  >
                    {count} job{count !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
                    empty
                  </span>
                )}

                {/* Move up */}
                <button
                  onClick={() => handleMoveStage(i, -1)}
                  disabled={i === 0}
                  className="toolbar-btn p-1.5 rounded-md disabled:opacity-15 transition-opacity"
                  title="Move up"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Move down */}
                <button
                  onClick={() => handleMoveStage(i, 1)}
                  disabled={i === stages.length - 1}
                  className="toolbar-btn p-1.5 rounded-md disabled:opacity-15 transition-opacity"
                  title="Move down"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Remove */}
                <button
                  onClick={() => handleRemoveStage(stage)}
                  className="toolbar-btn p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:!text-red-500 transition-opacity"
                  title={count > 0 ? `Cannot remove — ${count} job(s) use this stage` : 'Remove stage'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          {stages.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No stages defined</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add your first stage below</p>
            </div>
          )}
        </div>

        {/* Add New Stage */}
        <div className="px-6 py-5" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-2.5 block" style={{ color: 'var(--text-muted)' }}>
            Add New Stage
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
              placeholder="e.g. lint, scan, release..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
            />
            <button
              onClick={handleAddStage}
              disabled={!newStage.trim() || stages.includes(newStage.trim().toLowerCase())}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {/* Quick-add suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Quick add:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => dispatch(addStage(s))}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px dashed var(--border-secondary)',
                      color: 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                      e.currentTarget.style.borderStyle = 'solid';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-secondary)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.borderStyle = 'dashed';
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StageManager.displayName = 'StageManager';
export default StageManager;
