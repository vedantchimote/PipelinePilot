/**
 * JobNode Component
 * Premium job node card for the React Flow canvas
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { Job_Node_Config } from '@/types';

interface JobNodeData {
  job: Job_Node_Config;
  selected: boolean;
  hasErrors: boolean;
}

const stageBadgeColors: Record<string, string> = {
  build: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
  test: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
  deploy: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
};

const lightStageBadgeColors: Record<string, string> = {
  build: 'from-blue-50 to-blue-100 text-blue-700 border-blue-200',
  test: 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200',
  deploy: 'from-amber-50 to-amber-100 text-amber-700 border-amber-200',
};

export const JobNode = memo(({ data }: NodeProps<JobNodeData>) => {
  const { job, selected, hasErrors } = data;
  const isTrigger = !!job.trigger;

  const darkBadge = stageBadgeColors[job.stage] || 'from-gray-500/20 to-gray-600/10 text-gray-400 border-gray-500/30';
  const lightBadge = lightStageBadgeColors[job.stage] || 'from-gray-50 to-gray-100 text-gray-700 border-gray-200';

  return (
    <div
      className={`
        relative rounded-xl p-4 transition-all duration-200 cursor-pointer group
        min-w-[220px] max-w-[300px]
        ${selected
          ? 'ring-2 ring-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
          : hasErrors
            ? 'ring-2 ring-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
            : isTrigger
              ? 'ring-1 ring-purple-500/40'
              : 'ring-1 ring-transparent hover:ring-indigo-500/30'
        }
      `}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: selected ? undefined : 'var(--shadow-lg)',
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !rounded-full"
        style={{
          background: 'var(--accent)',
          borderColor: 'var(--bg-secondary)',
        }}
      />

      {/* Error Indicator */}
      {hasErrors && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
      )}

      {/* Trigger Indicator */}
      {isTrigger && (
        <div className="absolute -top-2 -left-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
      )}

      {/* Job Name */}
      <div className="font-semibold text-sm mb-2.5 truncate" style={{ color: 'var(--text-primary)' }}>
        {job.name}
      </div>

      {/* Stage Badge */}
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-gradient-to-r dark:${darkBadge} ${lightBadge}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {job.stage}
      </div>

      {/* Job Properties */}
      <div className="mt-3 space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        {job.image && (
          <div className="flex items-center gap-1.5 truncate">
            <svg className="w-3 h-3 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="truncate">{job.image}</span>
          </div>
        )}
        {job.script && job.script.length > 0 && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            <span>{job.script.length} line{job.script.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {job.allow_failure && (
          <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Allow Failure</span>
          </div>
        )}
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'var(--accent-glow)' }} />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !rounded-full"
        style={{
          background: 'var(--accent)',
          borderColor: 'var(--bg-secondary)',
        }}
      />
    </div>
  );
});

JobNode.displayName = 'JobNode';

export default JobNode;
