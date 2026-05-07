/**
 * DiffViewer Component
 * Compare current pipeline with a saved snapshot — shows added/removed/changed jobs
 */

import { memo, useState } from 'react';
import { useAppSelector } from '@/store';
import type { Pipeline_State } from '@/types';
import { toYAML, fromYAML } from '@/engine/yaml-engine';

interface DiffEntry {
  name: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  changes?: string[];
}

function computeDiff(base: Pipeline_State, current: Pipeline_State): DiffEntry[] {
  const diff: DiffEntry[] = [];
  const baseNames = new Set(Object.values(base.jobs).map((j) => j.name));
  const currentNames = new Set(Object.values(current.jobs).map((j) => j.name));

  // Added jobs
  for (const name of currentNames) {
    if (!baseNames.has(name)) diff.push({ name, type: 'added' });
  }

  // Removed jobs
  for (const name of baseNames) {
    if (!currentNames.has(name)) diff.push({ name, type: 'removed' });
  }

  // Changed/unchanged jobs
  for (const name of currentNames) {
    if (!baseNames.has(name)) continue;
    const baseJob = Object.values(base.jobs).find((j) => j.name === name);
    const currJob = Object.values(current.jobs).find((j) => j.name === name);
    if (!baseJob || !currJob) continue;

    const changes: string[] = [];
    if (baseJob.stage !== currJob.stage) changes.push(`stage: ${baseJob.stage} → ${currJob.stage}`);
    if (baseJob.image !== currJob.image) changes.push(`image changed`);
    if (JSON.stringify(baseJob.script) !== JSON.stringify(currJob.script)) changes.push(`script modified`);
    if (JSON.stringify(baseJob.needs) !== JSON.stringify(currJob.needs)) changes.push(`dependencies changed`);
    if (JSON.stringify(baseJob.rules) !== JSON.stringify(currJob.rules)) changes.push(`rules changed`);
    if (baseJob.allow_failure !== currJob.allow_failure) changes.push(`allow_failure toggled`);

    diff.push({ name, type: changes.length > 0 ? 'changed' : 'unchanged', changes });
  }

  return diff.sort((a, b) => {
    const order = { removed: 0, added: 1, changed: 2, unchanged: 3 };
    return order[a.type] - order[b.type];
  });
}

export const DiffViewer = memo(({ onClose }: { onClose: () => void }) => {
  const currentState = useAppSelector((state) => state.pipeline.present);
  const [baseYaml, setBaseYaml] = useState('');
  const [diff, setDiff] = useState<DiffEntry[] | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'paste' | 'snapshot'>('snapshot');
  const [snapshot] = useState<string>(() => {
    const saved = localStorage.getItem('pipeline_snapshot');
    return saved || '';
  });

  const handleCompare = (yamlStr: string) => {
    try {
      const baseState = fromYAML(yamlStr);
      const result = computeDiff(baseState, currentState);
      setDiff(result);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Invalid YAML');
      setDiff(null);
    }
  };

  const handleSaveSnapshot = () => {
    const yaml = toYAML(currentState);
    localStorage.setItem('pipeline_snapshot', yaml);
    alert('Snapshot saved!');
  };

  const colors = {
    added: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', icon: '+' },
    removed: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', icon: '−' },
    changed: { bg: 'rgba(250,204,21,0.1)', text: '#eab308', icon: '~' },
    unchanged: { bg: 'var(--bg-tertiary)', text: 'var(--text-muted)', icon: '=' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-[560px] mx-4 scale-in overflow-hidden max-h-[80vh] flex flex-col"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Pipeline Diff</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Compare with a previous version</p>
            </div>
          </div>
          <button onClick={onClose} className="toolbar-btn p-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Source tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <button onClick={() => { setMode('snapshot'); if (snapshot) handleCompare(snapshot); }} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${mode === 'snapshot' ? 'bg-indigo-500/15 text-indigo-400' : ''}`} style={mode !== 'snapshot' ? { color: 'var(--text-muted)' } : {}}>Saved Snapshot</button>
          <button onClick={() => setMode('paste')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${mode === 'paste' ? 'bg-indigo-500/15 text-indigo-400' : ''}`} style={mode !== 'paste' ? { color: 'var(--text-muted)' } : {}}>Paste YAML</button>
          <button onClick={handleSaveSnapshot} className="ml-auto text-[10px] px-2 py-1 rounded-md font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Save Snapshot</button>
        </div>

        {/* Paste input */}
        {mode === 'paste' && (
          <div className="px-6 py-3">
            <textarea
              value={baseYaml}
              onChange={(e) => setBaseYaml(e.target.value)}
              placeholder="Paste the base .gitlab-ci.yml here..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
            />
            <button onClick={() => handleCompare(baseYaml)} disabled={!baseYaml.trim()} className="btn-primary w-full mt-2 py-2 rounded-lg text-xs font-semibold disabled:opacity-40">Compare</button>
          </div>
        )}

        {mode === 'snapshot' && !snapshot && (
          <div className="px-6 py-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No snapshot saved yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click "Save Snapshot" to save the current state</p>
          </div>
        )}

        {error && <p className="px-6 py-2 text-xs text-red-400">{error}</p>}

        {/* Diff Results */}
        {diff && (
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-1.5">
            {diff.filter(d => d.type !== 'unchanged').length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No differences found</p>
            )}
            {diff.filter(d => d.type !== 'unchanged').map((d) => (
              <div key={d.name} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: colors[d.type].bg }}>
                <span className="text-sm font-bold w-5 text-center flex-shrink-0" style={{ color: colors[d.type].text }}>{colors[d.type].icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold" style={{ color: colors[d.type].text }}>{d.name}</span>
                  {d.changes && d.changes.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {d.changes.map((c, i) => (
                        <p key={i} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>• {c}</p>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium uppercase" style={{ color: colors[d.type].text }}>{d.type}</span>
              </div>
            ))}
            {diff.filter(d => d.type === 'unchanged').length > 0 && (
              <p className="text-[10px] text-center pt-2" style={{ color: 'var(--text-muted)' }}>{diff.filter(d => d.type === 'unchanged').length} unchanged job(s)</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

DiffViewer.displayName = 'DiffViewer';
export default DiffViewer;
