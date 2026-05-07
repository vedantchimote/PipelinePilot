/**
 * StageManager Component
 * Allows adding, removing, and reordering pipeline stages
 */

import { memo, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addStage, removeStage, reorderStages } from '@/store/pipelineSlice';

const PRESET_STAGES = ['build', 'test', 'deploy', 'lint', 'scan', 'package', 'release', 'cleanup', 'verify', 'publish'];

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

  // Suggest stages that aren't already added
  const suggestions = PRESET_STAGES.filter(s => !stages.includes(s));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full mx-4 scale-in overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Stage Manager</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Add, remove, or reorder pipeline stages</p>
          </div>
          <button onClick={onClose} className="toolbar-btn p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stage List */}
        <div className="px-5 py-3 max-h-[300px] overflow-y-auto space-y-1">
          {stages.map((stage, i) => {
            const count = jobCountForStage(stage);
            return (
              <div
                key={stage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg group"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <span className="text-xs font-mono font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                  {stage}
                </span>
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {count} job{count !== 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={() => handleMoveStage(i, -1)}
                  disabled={i === 0}
                  className="toolbar-btn p-1 disabled:opacity-20"
                  title="Move up"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  onClick={() => handleMoveStage(i, 1)}
                  disabled={i === stages.length - 1}
                  className="toolbar-btn p-1 disabled:opacity-20"
                  title="Move down"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button
                  onClick={() => handleRemoveStage(stage)}
                  className="toolbar-btn p-1 opacity-0 group-hover:opacity-100 hover:!text-red-500"
                  title={count > 0 ? `Cannot remove — ${count} job(s) use this stage` : 'Remove stage'}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New Stage */}
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
              placeholder="New stage name..."
              className="flex-1 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddStage}
              disabled={!newStage.trim() || stages.includes(newStage.trim().toLowerCase())}
              className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {/* Quick-add suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestions.slice(0, 5).map(s => (
                <button
                  key={s}
                  onClick={() => dispatch(addStage(s))}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px dashed var(--border-secondary)',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-secondary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StageManager.displayName = 'StageManager';
export default StageManager;
