/**
 * State Restoration Utilities
 * Handles loading and restoring saved pipeline state
 */

import { loadSavedState } from '@/store/middleware/persistenceMiddleware';
import type { Pipeline_State } from '@/types';

export interface RestorationResult {
  state: Pipeline_State | null;
  timestamp: string | null;
  shouldRestore: boolean;
}

/**
 * Checks for saved state and prompts user for restoration
 */
export async function checkForSavedState(): Promise<RestorationResult> {
  const saved = loadSavedState();

  if (!saved) {
    return {
      state: null,
      timestamp: null,
      shouldRestore: false,
    };
  }

  // Calculate time since last save
  const savedTime = new Date(saved.timestamp);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - savedTime.getTime()) / 60000);

  // Format time string
  let timeString: string;
  if (minutesAgo < 1) {
    timeString = 'just now';
  } else if (minutesAgo < 60) {
    timeString = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
  } else {
    const hoursAgo = Math.floor(minutesAgo / 60);
    timeString = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
  }

  // Prompt user
  const shouldRestore = confirm(
    `Found auto-saved pipeline from ${timeString}. Would you like to restore it?`
  );

  return {
    state: shouldRestore ? saved.state : null,
    timestamp: saved.timestamp,
    shouldRestore,
  };
}

/**
 * Validates pipeline state structure
 */
export function validatePipelineState(state: any): state is Pipeline_State {
  if (!state || typeof state !== 'object') {
    return false;
  }

  // Check required fields
  if (!state.version || !state.metadata || !state.jobs || !state.stages || !state.ui) {
    return false;
  }

  // Check metadata structure
  if (!state.metadata.created || !state.metadata.modified) {
    return false;
  }

  // Check jobs structure
  if (typeof state.jobs !== 'object') {
    return false;
  }

  // Check stages structure
  if (!Array.isArray(state.stages)) {
    return false;
  }

  // Check UI structure
  if (!state.ui.nodes || !state.ui.viewport) {
    return false;
  }

  return true;
}

/**
 * Attempts to recover corrupted state
 */
export function recoverCorruptedState(state: any): Pipeline_State | null {
  try {
    // Try to extract valid parts
    const recovered: Partial<Pipeline_State> = {
      version: state.version || '1.0',
      metadata: {
        created: state.metadata?.created || new Date().toISOString(),
        modified: new Date().toISOString(),
      },
      global: state.global || {},
      stages: Array.isArray(state.stages) ? state.stages : ['build', 'test', 'deploy'],
      jobs: typeof state.jobs === 'object' ? state.jobs : {},
      ui: {
        nodes: state.ui?.nodes || {},
        viewport: state.ui?.viewport || { x: 0, y: 0, zoom: 1 },
      },
    };

    if (validatePipelineState(recovered)) {
      return recovered as Pipeline_State;
    }
  } catch (error) {
    console.error('Failed to recover state:', error);
  }

  return null;
}

export const stateRestoration = {
  checkForSavedState,
  validatePipelineState,
  recoverCorruptedState,
};

export default stateRestoration;
