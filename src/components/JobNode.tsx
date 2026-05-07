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
  dimmed?: boolean;
  multiSelected?: boolean;
  simActive?: boolean;
}

const STAGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  build:   { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', dot: '#3b82f6' },
  test:    { bg: 'rgba(16,185,129,0.15)',   text: '#34d399', dot: '#10b981' },
  deploy:  { bg: 'rgba(245,158,11,0.15)',   text: '#fbbf24', dot: '#f59e0b' },
  scan:    { bg: 'rgba(168,85,247,0.15)',   text: '#c084fc', dot: '#a855f7' },
  verify:  { bg: 'rgba(6,182,212,0.15)',    text: '#22d3ee', dot: '#06b6d4' },
  release: { bg: 'rgba(244,63,94,0.15)',    text: '#fb7185', dot: '#f43f5e' },
  lint:    { bg: 'rgba(14,165,233,0.15)',   text: '#38bdf8', dot: '#0ea5e9' },
  package: { bg: 'rgba(139,92,246,0.15)',   text: '#a78bfa', dot: '#8b5cf6' },
};

const STAGE_COLORS_LIGHT: Record<string, { bg: string; text: string; dot: string }> = {
  build:   { bg: 'rgba(59,130,246,0.1)',   text: '#2563eb', dot: '#3b82f6' },
  test:    { bg: 'rgba(16,185,129,0.1)',    text: '#059669', dot: '#10b981' },
  deploy:  { bg: 'rgba(245,158,11,0.1)',    text: '#d97706', dot: '#f59e0b' },
  scan:    { bg: 'rgba(168,85,247,0.1)',    text: '#7c3aed', dot: '#a855f7' },
  verify:  { bg: 'rgba(6,182,212,0.1)',     text: '#0891b2', dot: '#06b6d4' },
  release: { bg: 'rgba(244,63,94,0.1)',     text: '#e11d48', dot: '#f43f5e' },
  lint:    { bg: 'rgba(14,165,233,0.1)',    text: '#0284c7', dot: '#0ea5e9' },
  package: { bg: 'rgba(139,92,246,0.1)',    text: '#6d28d9', dot: '#8b5cf6' },
};

const DEFAULT_DARK  = { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', dot: '#64748b' };
const DEFAULT_LIGHT = { bg: 'rgba(100,116,139,0.08)', text: '#475569', dot: '#64748b' };

export const JobNode = memo(({ data }: NodeProps<JobNodeData>) => {
  const { job, selected, hasErrors, dimmed, multiSelected, simActive } = data;
  const isTrigger = !!job.trigger;

  // Detect theme from the document class (set by App.tsx)
  const isDark = document.documentElement.classList.contains('dark');
  const palette = isDark
    ? (STAGE_COLORS[job.stage] || DEFAULT_DARK)
    : (STAGE_COLORS_LIGHT[job.stage] || DEFAULT_LIGHT);

  return (
    <div
      className={`
        relative rounded-xl p-4 transition-all duration-200 cursor-pointer group
        min-w-[220px] max-w-[300px]
        ${selected
          ? 'ring-2 ring-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
          : multiSelected
            ? 'ring-2 ring-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
            : simActive
              ? 'ring-2 ring-green-400/60 shadow-[0_0_24px_rgba(34,197,94,0.25)]'
              : hasErrors
                ? 'ring-2 ring-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                : isTrigger
                  ? 'ring-1 ring-purple-500/40'
                  : 'ring-1 ring-transparent hover:ring-indigo-500/30'
        }
      `}
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${simActive ? 'rgba(34,197,94,0.4)' : 'var(--border-primary)'}`,
        boxShadow: selected ? undefined : 'var(--shadow-lg)',
        opacity: dimmed ? 0.3 : 1,
        transition: 'all 0.3s ease',
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
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
        style={{ background: palette.bg, color: palette.text }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: palette.dot }} />
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
