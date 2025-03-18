/**
 * Persistence Middleware
 * Auto-saves pipeline state to localStorage
 */

import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '@/types';

const AUTOSAVE_KEY = 'pipeline_autosave';
const AUTOSAVE_TIMESTAMP_KEY = 'pipeline_autosave_timestamp';
const AUTOSAVE_DELAY = 30000; // 30 seconds

let saveTimer: NodeJS.Timeout | null = null;

/**
 * Middleware that auto-saves pipeline state to localStorage
 */
export const persistenceMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);

  // Only save on pipeline actions
  if (action.type?.startsWith('pipeline/')) {
    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    // Debounce save
    saveTimer = setTimeout(() => {
      const state = store.getState();
      const pipelineState = state.pipeline.present;

      try {
        // Save to localStorage
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(pipelineState));
        localStorage.setItem(AUTOSAVE_TIMESTAMP_KEY, new Date().toISOString());

        // Update persistence state
        const { setLastSaved } = require('../persistenceSlice');
        store.dispatch(setLastSaved(new Date().toISOString()));
      } catch (error) {
        // Handle quota exceeded
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded');
          
          // Offer to export
          if (confirm('Storage quota exceeded. Would you like to export your pipeline?')) {
            const { exportYAMLFile } = require('@/utils/import-export');
            exportYAMLFile(pipelineState);
          }
        } else {
          console.error('Failed to save to localStorage:', error);
        }
      }
    }, AUTOSAVE_DELAY);
  }

  return result;
};

/**
 * Loads saved pipeline state from localStorage
 */
export function loadSavedState() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    const timestamp = localStorage.getItem(AUTOSAVE_TIMESTAMP_KEY);

    if (saved && timestamp) {
      return {
        state: JSON.parse(saved),
        timestamp,
      };
    }
  } catch (error) {
    console.error('Failed to load saved state:', error);
  }

  return null;
}

/**
 * Clears saved state from localStorage
 */
export function clearSavedState() {
  localStorage.removeItem(AUTOSAVE_KEY);
  localStorage.removeItem(AUTOSAVE_TIMESTAMP_KEY);
}

export default persistenceMiddleware;
