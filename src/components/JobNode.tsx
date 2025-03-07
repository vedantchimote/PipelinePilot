/**
 * JobNode Component
 * Renders a job node in the React Flow canvas
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { Job_Node_Config } from '@/types';

interface JobNodeData {
  job: Job_Node_Config;
  selected: boolean;
  hasErrors: boolean;
}

export const JobNode = memo(({ data }: NodeProps<JobNodeData>) => {
  const { job, selected, hasErrors } = data;
  const isTrigger = !!job.trigger;

  return (
    <div
      className={`
        relative rounded-lg border-2 bg-gray-800 p-4 shadow-lg transition-all
        ${selected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600'}
        ${hasErrors ? 'border-red-500 ring-2 ring-red-500/50' : ''}
        ${isTrigger ? 'border-purple-500' : ''}
        hover:shadow-xl
        min-w-[200px] max-w-[300px]
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-800"
      />

      {/* Error Indicator */}
      {hasErrors && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}

      {/* Job Name */}
      <div className="font-semibold text-white text-sm mb-2 truncate">
        {job.name}
      </div>

      {/* Stage Badge */}
      <div className="inline-block px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 mb-2">
        {job.stage}
      </div>

      {/* Job Properties */}
      <div className="space-y-1 text-xs text-gray-400">
        {job.image && (
          <div className="truncate">
            <span className="text-gray-500">image:</span> {job.image}
          </div>
        )}
        {job.script && job.script.length > 0 && (
          <div className="truncate">
            <span className="text-gray-500">script:</span> {job.script.length} line(s)
          </div>
        )}
        {isTrigger && (
          <div className="text-purple-400 font-medium">
            Trigger Job
          </div>
        )}
        {job.allow_failure && (
          <div className="text-yellow-400">
            Allow Failure
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-800"
      />
    </div>
  );
});

JobNode.displayName = 'JobNode';

export default JobNode;
