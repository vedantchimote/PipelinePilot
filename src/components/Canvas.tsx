/**
 * Canvas Component
 * Main canvas for visual pipeline editing with React Flow
 */

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  moveJob,
  addDependency,
  removeDependency,
  deleteJob,
} from '@/store/pipelineSlice';
import { selectNode } from '@/store/uiSlice';
import { wouldCreateCycle, detectCycle } from '@/utils/dependency-graph';
import JobNode from './JobNode';
import DependencyEdge from './DependencyEdge';
import CircularDependencyModal from './CircularDependencyModal';

const nodeTypes: NodeTypes = {
  job: JobNode,
};

const edgeTypes: EdgeTypes = {
  dependency: DependencyEdge,
};

export const CanvasInner = () => {
  const dispatch = useAppDispatch();
  const { jobs, stages } = useAppSelector((state) => state.pipeline.present);
  const { nodes: nodePositions, viewport } = useAppSelector((state) => state.pipeline.present.ui);
  const selectedNodeId = useAppSelector((state) => state.ui.selectedNodeId);
  const validationErrors = useAppSelector((state) => state.ui.validationErrors);
  
  // Memoize validation errors array to avoid recalculation
  const validationErrorsArray = useMemo(() => 
    Object.entries(validationErrors).flatMap(([jobId, errors]) =>
      errors.map((error) => ({ jobId, message: error }))
    ),
    [validationErrors]
  );

  const [circularDependencyCycle, setCircularDependencyCycle] = useState<string[] | null>(null);
  const { fitView } = useReactFlow();
  const prevJobCountRef = useRef(Object.keys(jobs).length);

  // Auto-fit view when job count changes significantly (e.g., template import, clear)
  useEffect(() => {
    const currentJobCount = Object.keys(jobs).length;
    const prevCount = prevJobCountRef.current;
    prevJobCountRef.current = currentJobCount;

    // Fit view when jobs are added/removed (especially on template import)
    if (currentJobCount !== prevCount && currentJobCount > 0) {
      // Small delay to let React Flow finish laying out nodes
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [jobs, fitView]);

  // Performance monitoring in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      const jobCount = Object.keys(jobs).length;
      if (jobCount > 50) {
        console.log(`📊 Canvas rendering ${jobCount} jobs`);
      }
    }
  }, [jobs]);

  // Convert jobs to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    return Object.values(jobs).map((job) => ({
      id: job.id,
      type: 'job',
      position: nodePositions[job.id] || { x: 0, y: 0 },
      data: {
        job,
        selected: selectedNodeId === job.id,
        hasErrors: validationErrorsArray.some((err) => err.jobId === job.id),
      },
    }));
  }, [jobs, nodePositions, selectedNodeId, validationErrorsArray]);

  // Convert dependencies to React Flow edges
  const edges: Edge[] = useMemo(() => {
    const edgeList: Edge[] = [];

    Object.values(jobs).forEach((job) => {
      if (job.needs) {
        const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
        needs.forEach((need) => {
          const targetId = typeof need === 'string' ? need : need.job;
          edgeList.push({
            id: `${targetId}-${job.id}`,
            source: targetId,
            target: job.id,
            type: 'dependency',
            data: {
              isValid: jobs[targetId] !== undefined,
            },
          });
        });
      }
    });

    return edgeList;
  }, [jobs]);

  // Handle node position changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          dispatch(moveJob({ jobId: change.id, position: change.position }));
        }
      });
    },
    [dispatch]
  );

  // Handle edge changes (deletion)
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          const [sourceId, targetId] = change.id.split('-');
          dispatch(removeDependency({ sourceId, targetId }));
        }
      });
    },
    [dispatch]
  );

  // Handle new edge creation
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Check for cycle
      if (wouldCreateCycle(jobs, connection.target, connection.source)) {
        // Detect the cycle path
        const cycle = detectCycle(jobs, connection.target, connection.source);
        if (cycle) {
          // Map job IDs to job names for display
          const cycleNames = cycle.map((jobId) => jobs[jobId]?.name || jobId);
          setCircularDependencyCycle(cycleNames);
        }
        return;
      }

      dispatch(
        addDependency({
          sourceId: connection.source,
          targetId: connection.target,
        })
      );
    },
    [dispatch, jobs]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      dispatch(selectNode(node.id));
    },
    [dispatch]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    dispatch(selectNode(null));
  }, [dispatch]);

  // Handle node deletion
  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      nodesToDelete.forEach((node) => {
        if (confirm(`Delete job "${node.data.job.name}"?`)) {
          dispatch(deleteJob(node.id));
        }
      });
    },
    [dispatch]
  );

  return (
    <div className="w-full h-full" style={{ background: 'var(--bg-primary)' }} role="main" aria-label="Pipeline canvas">
      {/* Validation Status Live Region */}
      {validationErrorsArray.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          className="sr-only"
        >
          {validationErrorsArray.length} validation error{validationErrorsArray.length > 1 ? 's' : ''} found
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={viewport}
        fitView
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        aria-label="Pipeline diagram"
      >
        <Background color="var(--border-primary)" gap={20} size={1} />
        <Controls className="react-flow-controls-themed" showInteractive={false} />
        <MiniMap
          className="react-flow-minimap-themed"
          maskColor="var(--minimap-mask)"
          nodeColor={(node) => {
            if (node.data.hasErrors) return '#ef4444';
            if (node.data.job.trigger) return '#a855f7';
            const stage = node.data.job.stage;
            const stageColors: Record<string, string> = {
              build: '#3b82f6', test: '#10b981', deploy: '#f59e0b',
              scan: '#a855f7', verify: '#06b6d4', release: '#f43f5e',
              lint: '#0ea5e9', package: '#8b5cf6',
            };
            return stageColors[stage] || '#6366f1';
          }}
          nodeStrokeWidth={0}
          nodeBorderRadius={4}
        />
      </ReactFlow>

      {/* Stage Swim Lanes Background */}
      <div className="absolute inset-0 pointer-events-none">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className="absolute left-0 right-0"
            style={{ top: `${index * 200}px`, height: '200px', borderTop: '1px solid var(--border-primary)' }}
          >
            <div className="text-xs font-medium px-3 py-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stage}</div>
          </div>
        ))}
      </div>

      {/* Circular Dependency Modal */}
      {circularDependencyCycle && (
        <CircularDependencyModal
          cycle={circularDependencyCycle}
          onClose={() => setCircularDependencyCycle(null)}
        />
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider so useReactFlow() hook works
const Canvas = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
);

export default Canvas;
