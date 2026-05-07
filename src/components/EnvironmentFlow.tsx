/**
 * EnvironmentFlow Component
 * Visualize deploy targets: staging → production with approval gates
 */

import { memo } from 'react';
import { useAppSelector } from '@/store';

interface EnvNode {
  name: string;
  jobs: string[];
  when?: string;
  hasApproval: boolean;
}

export const EnvironmentFlow = memo(({ onClose }: { onClose: () => void }) => {
  const jobs = useAppSelector((state) => state.pipeline.present.jobs);

  // Extract environments from jobs
  const envMap = new Map<string, EnvNode>();
  Object.values(jobs).forEach((job) => {
    if (!job.environment) return;
    const envName = typeof job.environment === 'string' ? job.environment : job.environment.name;
    if (!envName) return;
    const existing = envMap.get(envName) || { name: envName, jobs: [], hasApproval: false };
    existing.jobs.push(job.name);
    if (job.when === 'manual') existing.hasApproval = true;
    envMap.set(envName, existing);
  });

  const envs = Array.from(envMap.values());

  // Try to infer ordering: dev → staging → production
  const ORDER = ['dev', 'development', 'staging', 'stage', 'uat', 'preprod', 'production', 'prod'];
  envs.sort((a, b) => {
    const ai = ORDER.findIndex((o) => a.name.toLowerCase().includes(o));
    const bi = ORDER.findIndex((o) => b.name.toLowerCase().includes(o));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const envColors = [
    { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: '#60a5fa' },
    { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#34d399' },
    { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#fbbf24' },
    { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#f87171' },
    { bg: 'rgba(168,85,247,0.12)', border: '#a855f7', text: '#c084fc' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-[600px] mx-4 scale-in overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Environment Flow</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Deployment targets and approval gates</p>
            </div>
          </div>
          <button onClick={onClose} className="toolbar-btn p-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Flow */}
        <div className="px-6 py-6">
          {envs.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No environments configured</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Add <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-tertiary)' }}>environment:</code> to your jobs to see the flow
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {envs.map((env, i) => {
                const c = envColors[i % envColors.length];
                return (
                  <div key={env.name} className="flex items-center gap-3 flex-shrink-0">
                    {/* Env card */}
                    <div className="rounded-xl px-5 py-4 min-w-[140px] text-center relative" style={{ background: c.bg, border: `1px solid ${c.border}30` }}>
                      {env.hasApproval && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm" title="Manual approval required">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
                        </div>
                      )}
                      <div className="text-sm font-bold" style={{ color: c.text }}>{env.name}</div>
                      <div className="mt-1.5 space-y-0.5">
                        {env.jobs.map((j) => (
                          <div key={j} className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{j}</div>
                        ))}
                      </div>
                      {env.hasApproval && (
                        <div className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-amber-400">Manual Gate</div>
                      )}
                    </div>
                    {/* Arrow */}
                    {i < envs.length - 1 && (
                      <svg className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        {envs.length > 0 && (
          <div className="px-6 py-3 flex items-center gap-4 text-[10px]" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Manual approval</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Auto-deploy</span>
            <span className="ml-auto">{envs.length} environment{envs.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
});

EnvironmentFlow.displayName = 'EnvironmentFlow';
export default EnvironmentFlow;
