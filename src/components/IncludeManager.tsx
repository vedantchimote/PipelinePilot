/**
 * IncludeManager Component
 * Manage `include:` references for external YAML files
 */

import { memo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addInclude, removeInclude } from '@/store/pipelineSlice';
import type { IncludeEntry } from '@/types';

const INCLUDE_TYPES: { value: IncludeEntry['type']; label: string; placeholder: string; desc: string }[] = [
  { value: 'local', label: 'Local', placeholder: '/path/to/.gitlab-ci.yml', desc: 'File in the same repository' },
  { value: 'template', label: 'Template', placeholder: 'Auto-DevOps.gitlab-ci.yml', desc: 'GitLab built-in template' },
  { value: 'remote', label: 'Remote', placeholder: 'https://example.com/ci.yml', desc: 'Remote URL' },
  { value: 'project', label: 'Project', placeholder: 'group/project', desc: 'File from another project' },
];

export const IncludeManager = memo(({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const includes = useAppSelector((state) => state.pipeline.present.includes || []);
  const [type, setType] = useState<IncludeEntry['type']>('local');
  const [value, setValue] = useState('');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState('');

  const handleAdd = () => {
    if (!value.trim()) return;
    const entry: IncludeEntry = { type, value: value.trim() };
    if (type === 'project' && ref) entry.ref = ref;
    if (type === 'project' && file) entry.file = file;
    dispatch(addInclude(entry));
    setValue('');
    setRef('');
    setFile('');
  };

  const typeIcons: Record<string, string> = {
    local: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    template: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    remote: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    project: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-[540px] mx-4 scale-in overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Include Manager</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Reference external YAML configurations</p>
            </div>
          </div>
          <button onClick={onClose} className="toolbar-btn p-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Current Includes */}
        <div className="px-6 py-4 max-h-[240px] overflow-y-auto space-y-2">
          {includes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No includes configured</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add references to external CI/CD configurations</p>
            </div>
          ) : includes.map((inc, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl group" style={{ background: 'var(--bg-tertiary)' }}>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={typeIcons[inc.type]} />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate" style={{ color: 'var(--text-primary)' }}>{inc.value}</span>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {inc.type}{inc.ref ? ` @ ${inc.ref}` : ''}{inc.file ? ` → ${inc.file}` : ''}
                </span>
              </div>
              <button onClick={() => dispatch(removeInclude(i))} className="toolbar-btn p-1 opacity-0 group-hover:opacity-100 hover:!text-red-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add Include */}
        <div className="px-6 py-5 space-y-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <label className="text-xs font-semibold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>Add Include</label>

          {/* Type selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {INCLUDE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className="px-2 py-2 rounded-lg text-xs font-medium text-center transition-all"
                style={{
                  background: type === t.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-primary)',
                  border: `1px solid ${type === t.value ? 'var(--accent)' : 'var(--border-primary)'}`,
                  color: type === t.value ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Value input */}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={INCLUDE_TYPES.find(t => t.value === type)?.placeholder}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', outline: 'none' }}
          />

          {/* Project-specific fields */}
          {type === 'project' && (
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Branch (e.g. main)" className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', outline: 'none' }} />
              <input type="text" value={file} onChange={(e) => setFile(e.target.value)} placeholder="File path (.gitlab-ci.yml)" className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
          )}

          <button onClick={handleAdd} disabled={!value.trim()} className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40">
            Add Include
          </button>
        </div>
      </div>
    </div>
  );
});

IncludeManager.displayName = 'IncludeManager';
export default IncludeManager;
