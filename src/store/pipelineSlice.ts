/**
 * Pipeline slice - manages pipeline state with undo/redo support
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import undoable from 'redux-undo';
import type { Pipeline_State, Job_Node_Config, NodePosition, IncludeEntry } from '@/types';

// Initial pipeline state
const initialPipelineState: Pipeline_State = {
  version: '1.0',
  metadata: {
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  },
  global: {},
  stages: ['build', 'test', 'deploy'],
  jobs: {},
  ui: {
    nodes: {},
    viewport: { x: 0, y: 0, zoom: 1 },
  },
};

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState: initialPipelineState,
  reducers: {
    // Job actions
    addJob: (state, action: PayloadAction<{ job: Job_Node_Config; position: NodePosition }>) => {
      const { job, position } = action.payload;
      state.jobs[job.id] = job;
      state.ui.nodes[job.id] = position;
      state.metadata.modified = new Date().toISOString();
      
      // Add stage if it doesn't exist
      if (!state.stages.includes(job.stage)) {
        state.stages.push(job.stage);
      }
    },

    updateJob: (
      state,
      action: PayloadAction<{ jobId: string; updates: Partial<Job_Node_Config> }>
    ) => {
      const { jobId, updates } = action.payload;
      if (state.jobs[jobId]) {
        Object.assign(state.jobs[jobId], updates);
        state.metadata.modified = new Date().toISOString();
        
        // Add new stage if changed
        if (updates.stage && !state.stages.includes(updates.stage)) {
          state.stages.push(updates.stage);
        }

        // Re-key job if name changed (name is used as the YAML key and display label)
        if (updates.name && updates.name !== jobId) {
          const newId = updates.name;
          // Move job entry to new key
          state.jobs[newId] = { ...state.jobs[jobId], id: newId };
          delete state.jobs[jobId];
          // Move UI node position to new key
          if (state.ui.nodes[jobId]) {
            state.ui.nodes[newId] = state.ui.nodes[jobId];
            delete state.ui.nodes[jobId];
          }
          // Update all dependency references in other jobs
          Object.values(state.jobs).forEach((job) => {
            if (job.needs && Array.isArray(job.needs)) {
              job.needs = job.needs.map((need) => {
                if (typeof need === 'string') {
                  return need === jobId ? newId : need;
                }
                if (need.job === jobId) {
                  return { ...need, job: newId };
                }
                return need;
              }) as any;
            }
            if (job.dependencies) {
              job.dependencies = job.dependencies.map((dep) =>
                dep === jobId ? newId : dep
              );
            }
          });
        }
      }
    },

    deleteJob: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      delete state.jobs[jobId];
      delete state.ui.nodes[jobId];
      
      // Remove dependencies referencing this job
      Object.values(state.jobs).forEach((job) => {
        if (job.needs) {
          const needsArray = Array.isArray(job.needs) ? job.needs : [job.needs];
          const filtered = needsArray.filter((need) => {
            const needId = typeof need === 'string' ? need : need.job;
            return needId !== jobId;
          });
          job.needs = filtered.length > 0 ? filtered as any : undefined;
        }
        if (job.dependencies) {
          job.dependencies = job.dependencies.filter((id) => id !== jobId);
        }
      });
      
      state.metadata.modified = new Date().toISOString();
    },

    duplicateJob: (state, action: PayloadAction<string>) => {
      const sourceId = action.payload;
      const sourceJob = state.jobs[sourceId];
      if (!sourceJob) return;

      // Generate unique name
      let copyIndex = 1;
      let newName = `${sourceJob.name}_copy`;
      while (state.jobs[newName]) {
        copyIndex++;
        newName = `${sourceJob.name}_copy_${copyIndex}`;
      }

      // Clone the job with new id/name
      state.jobs[newName] = {
        ...JSON.parse(JSON.stringify(sourceJob)),
        id: newName,
        name: newName,
        needs: undefined, // Don't copy dependencies
      };

      // Place it offset from the original
      const sourcePos = state.ui.nodes[sourceId] || { x: 250, y: 100 };
      state.ui.nodes[newName] = {
        x: sourcePos.x + 40,
        y: sourcePos.y + 40,
      };
      state.metadata.modified = new Date().toISOString();
    },

    moveJob: (state, action: PayloadAction<{ jobId: string; position: NodePosition }>) => {
      const { jobId, position } = action.payload;
      if (state.ui.nodes[jobId]) {
        state.ui.nodes[jobId] = position;
        state.metadata.modified = new Date().toISOString();
      }
    },

    // Dependency actions
    addDependency: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      const { sourceId, targetId } = action.payload;
      const targetJob = state.jobs[targetId];
      
      if (targetJob) {
        if (!targetJob.needs) {
          targetJob.needs = [sourceId] as any;
        } else if (Array.isArray(targetJob.needs)) {
          const needIds = targetJob.needs.map((n) => typeof n === 'string' ? n : n.job);
          if (!needIds.includes(sourceId)) {
            (targetJob.needs as any[]).push(sourceId);
          }
        }
        state.metadata.modified = new Date().toISOString();
      }
    },

    removeDependency: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      const { sourceId, targetId } = action.payload;
      const targetJob = state.jobs[targetId];
      
      if (targetJob && targetJob.needs && Array.isArray(targetJob.needs)) {
        const filtered = targetJob.needs.filter((need) => {
          const needId = typeof need === 'string' ? need : need.job;
          return needId !== sourceId;
        });
        targetJob.needs = filtered.length > 0 ? filtered as any : undefined;
        state.metadata.modified = new Date().toISOString();
      }
    },

    // Pipeline actions
    importYAML: (_state, action: PayloadAction<Pipeline_State>) => {
      return action.payload;
    },

    clearPipeline: () => {
      return initialPipelineState;
    },

    // Stage actions
    addStage: (state, action: PayloadAction<string>) => {
      const stage = action.payload;
      if (!state.stages.includes(stage)) {
        state.stages.push(stage);
        state.metadata.modified = new Date().toISOString();
      }
    },

    removeStage: (state, action: PayloadAction<string>) => {
      const stage = action.payload;
      state.stages = state.stages.filter((s) => s !== stage);
      state.metadata.modified = new Date().toISOString();
    },

    reorderStages: (state, action: PayloadAction<string[]>) => {
      state.stages = action.payload;
      state.metadata.modified = new Date().toISOString();
    },

    // Viewport actions
    updateViewport: (state, action: PayloadAction<Partial<{ x: number; y: number; zoom: number }>>) => {
      Object.assign(state.ui.viewport, action.payload);
    },

    // Global config actions
    updateGlobalConfig: (state, action: PayloadAction<Partial<Pipeline_State['global']>>) => {
      Object.assign(state.global, action.payload);
      state.metadata.modified = new Date().toISOString();
    },

    // Bulk operations
    bulkDeleteJobs: (state, action: PayloadAction<string[]>) => {
      const jobIds = action.payload;
      jobIds.forEach((jobId) => {
        delete state.jobs[jobId];
        delete state.ui.nodes[jobId];
      });
      // Clean up references
      Object.values(state.jobs).forEach((job) => {
        if (job.needs) {
          const needsArray = Array.isArray(job.needs) ? job.needs : [job.needs];
          const filtered = needsArray.filter((n) => {
            const needId = typeof n === 'string' ? n : n.job;
            return !jobIds.includes(needId);
          });
          job.needs = filtered.length > 0 ? filtered as any : undefined;
        }
      });
      state.metadata.modified = new Date().toISOString();
    },

    bulkChangeStage: (state, action: PayloadAction<{ jobIds: string[]; stage: string }>) => {
      const { jobIds, stage } = action.payload;
      jobIds.forEach((id) => {
        if (state.jobs[id]) state.jobs[id].stage = stage;
      });
      if (!state.stages.includes(stage)) state.stages.push(stage);
      state.metadata.modified = new Date().toISOString();
    },

    // Auto-layout
    autoLayout: (state) => {
      const stageGroups: Record<string, string[]> = {};
      state.stages.forEach((s) => (stageGroups[s] = []));
      Object.values(state.jobs).forEach((job) => {
        if (!stageGroups[job.stage]) stageGroups[job.stage] = [];
        stageGroups[job.stage].push(job.id);
      });
      const NODE_W = 280;
      const NODE_H = 140;
      const STAGE_GAP = 60;
      const NODE_GAP = 40;
      const START_X = 80;
      const START_Y = 50;
      let yOffset = START_Y;
      state.stages.forEach((stage) => {
        const jobs = stageGroups[stage] || [];
        jobs.forEach((jobId, col) => {
          state.ui.nodes[jobId] = {
            x: START_X + col * (NODE_W + NODE_GAP),
            y: yOffset,
          };
        });
        if (jobs.length > 0) yOffset += NODE_H + STAGE_GAP;
      });
      state.metadata.modified = new Date().toISOString();
    },

    // Includes management
    addInclude: (state, action: PayloadAction<IncludeEntry>) => {
      if (!state.includes) state.includes = [];
      state.includes.push(action.payload);
      state.metadata.modified = new Date().toISOString();
    },

    removeInclude: (state, action: PayloadAction<number>) => {
      if (state.includes) {
        state.includes.splice(action.payload, 1);
        if (state.includes.length === 0) delete state.includes;
      }
      state.metadata.modified = new Date().toISOString();
    },
  },
});

export const {
  addJob,
  updateJob,
  deleteJob,
  duplicateJob,
  moveJob,
  addDependency,
  removeDependency,
  importYAML,
  clearPipeline,
  addStage,
  removeStage,
  reorderStages,
  updateViewport,
  updateGlobalConfig,
  bulkDeleteJobs,
  bulkChangeStage,
  autoLayout,
  addInclude,
  removeInclude,
} = pipelineSlice.actions;

// Wrap with undoable to enable undo/redo
export const pipelineReducer = undoable(pipelineSlice.reducer, {
  limit: 50, // Keep last 50 states
  filter: (action) => {
    // Don't track viewport changes in undo history
    return action.type !== 'pipeline/updateViewport';
  },
});

export default pipelineReducer;
