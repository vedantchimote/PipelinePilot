/**
 * GitLabPushModal Component
 * Push .gitlab-ci.yml directly to a GitLab branch via API
 */

import { memo, useState } from 'react';
import { useAppSelector } from '@/store';
import { toYAML } from '@/engine/yaml-engine';

interface PushConfig {
  gitlabUrl: string;
  token: string;
  projectId: string;
  branch: string;
  commitMessage: string;
}

export const GitLabPushModal = memo(({ onClose }: { onClose: () => void }) => {
  const pipelineState = useAppSelector((state) => state.pipeline.present);
  const [config, setConfig] = useState<PushConfig>({
    gitlabUrl: localStorage.getItem('gl_url') || 'https://gitlab.com',
    token: localStorage.getItem('gl_token') || '',
    projectId: localStorage.getItem('gl_project') || '',
    branch: localStorage.getItem('gl_branch') || 'main',
    commitMessage: 'Update .gitlab-ci.yml via PipelinePilot',
  });
  const [status, setStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePush = async () => {
    if (!config.token || !config.projectId || !config.branch) return;

    // Persist config (except token for security)
    localStorage.setItem('gl_url', config.gitlabUrl);
    localStorage.setItem('gl_project', config.projectId);
    localStorage.setItem('gl_branch', config.branch);

    setStatus('pushing');
    setErrorMsg('');

    try {
      const yamlContent = toYAML(pipelineState);
      const encodedProject = encodeURIComponent(config.projectId);
      const apiUrl = `${config.gitlabUrl}/api/v4/projects/${encodedProject}/repository/files/.gitlab-ci.yml`;

      // Try update first, then create
      for (const action of ['update', 'create']) {
        const res = await fetch(apiUrl, {
          method: action === 'update' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': config.token,
          },
          body: JSON.stringify({
            branch: config.branch,
            content: yamlContent,
            commit_message: config.commitMessage,
            encoding: 'text',
          }),
        });

        if (res.ok) {
          setStatus('success');
          return;
        }

        if (action === 'update' && res.status === 404) continue; // File doesn't exist, try create
        if (action === 'create' && res.status === 400) {
          // File exists but update failed - unexpected
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `API error: ${res.status}`);
        }

        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error: ${res.status}`);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to push');
    }
  };

  const update = (field: keyof PushConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-[480px] mx-4 scale-in overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Push to GitLab</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Commit .gitlab-ci.yml to a branch</p>
            </div>
          </div>
          <button onClick={onClose} className="toolbar-btn p-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>GitLab URL</label>
            <input type="text" value={config.gitlabUrl} onChange={(e) => update('gitlabUrl', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Personal Access Token</label>
            <input type="password" value={config.token} onChange={(e) => update('token', e.target.value)} placeholder="glpat-..." className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Project ID / Path</label>
              <input type="text" value={config.projectId} onChange={(e) => update('projectId', e.target.value)} placeholder="group/project" className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Branch</label>
              <input type="text" value={config.branch} onChange={(e) => update('branch', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Commit Message</label>
            <input type="text" value={config.commitMessage} onChange={(e) => update('commitMessage', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
          </div>
        </div>

        {/* Status + Actions */}
        <div className="px-6 py-4 space-y-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          {status === 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Successfully pushed to {config.branch}
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {errorMsg}
            </div>
          )}
          <button
            onClick={handlePush}
            disabled={!config.token || !config.projectId || status === 'pushing'}
            className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {status === 'pushing' ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Pushing…</>
            ) : (
              <>Push to GitLab</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

GitLabPushModal.displayName = 'GitLabPushModal';
export default GitLabPushModal;
