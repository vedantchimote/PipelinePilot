/**
 * Canvas Component
 * Main canvas for visual pipeline editing with React Flow
 */

import { useCallback, useMemo } from 'react';
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
import { wouldCreateCycle } from '@/utils/dependency-graph';
import JobNode from './JobNode';
import DependencyEdge from './DependencyEdge';

const nodeTypes: NodeTypes = {
  job: JobNode,
};

const edgeTypes: EdgeTypes = {
  dependency: DependencyEdge,
};

export const Canvas = () => {
  const dispatch = useAppDispatch();
  const { jobs, stages } = useAppSelector((state) => state.pipeline.present);
  const { nodes: nodePositions, viewport } = useAppSelector((state) => state.pipeline.present.ui);
  const selectedNodeId = useAppSelector((state) => state.ui.selectedNodeId);
  const validationErrors = useAppSelector((state) => state.ui.validationErrors);
  const validationErrorsArray = Object.entries(validationErrors).flatMap(([jobId, errors]) =>
    errors.map((error) => ({ jobId, message: error }))
  );

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
  }, [jobs, nodePositions, selectedNodeId, validationErrors]);

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
        alert('Cannot create dependency: would create a circular dependency');
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
    <div className="w-full h-full bg-gray-900">
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
      >
        <Background color="#374151" gap={16} />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap
          className="bg-gray-800 border-gray-700"
          nodeColor={(node) => {
            if (node.data.hasErrors) return '#ef4444';
            if (node.data.job.trigger) return '#a855f7';
            return '#3b82f6';
          }}
        />
      </ReactFlow>

      {/* Stage Swim Lanes Background */}
      <div className="absolute inset-0 pointer-events-none">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className="absolute left-0 right-0 border-t border-gray-700"
            style={{ top: `${index * 200}px`, height: '200px' }}
          >
            <div className="text-gray-500 text-sm font-medium p-2">{stage}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
