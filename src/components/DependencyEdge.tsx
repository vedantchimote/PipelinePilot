/**
 * DependencyEdge Component
 * Renders a dependency edge between jobs in the React Flow canvas
 */

import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

interface DependencyEdgeData {
  isValid?: boolean;
  label?: string;
}

export const DependencyEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<DependencyEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isValid = data?.isValid !== false;
  const label = data?.label;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke={isValid ? '#6b7280' : '#ef4444'}
        fill="none"
        markerEnd={markerEnd}
      />
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12 }}
            startOffset="50%"
            textAnchor="middle"
            fill="#9ca3af"
          >
            {label}
          </textPath>
        </text>
      )}
    </>
  );
});

DependencyEdge.displayName = 'DependencyEdge';

export default DependencyEdge;
