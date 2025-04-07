/**
 * Persistence Middleware
 * Auto-saves pipeline state to localStorage
 */

import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '@/types';

// Debounce timer
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const AUTOSAVE_KEY = 'pipeline_autosave';
const AUTOSAVE_TIMESTAMP_KEY = 'pipeline_autosave_timestamp';
const AUTOSAVE_DELAY = 30000; // 30 seconds

/**
 * Middleware that auto-saves pipeline state to localStorage
 */
export const persistenceMiddleware: Middleware<Record<string, never>, RootState> = (store) => (next) => (action: any) => {
  const result = next(action);

  // Only save on pipeline actions
  if (action.type?.startsWith('pipeline/')) {
    // Clear existing timer
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    // Debounce save
    saveTimer = setTimeout(async () => {
      const state = store.getState();
      const pipelineState = state.pipeline.present;

      try {
        // Performance monitoring
        const startTime = performance.now();
        
        // Save to localStorage
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(pipelineState));
        localStorage.setItem(AUTOSAVE_TIMESTAMP_KEY, new Date().toISOString());

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log performance in development mode
        if (import.meta.env.DEV) {
          const jobCount = Object.keys(pipelineState.jobs).length;
          console.log(`💾 Auto-save completed in ${duration.toFixed(2)}ms (${jobCount} jobs)`);
          
          if (duration > 20) {
            console.warn(`⚠️ Auto-save took ${duration.toFixed(2)}ms (threshold: 20ms)`);
          }
        }

        // Update persistence state
        const { markSaved } = await import('../persistenceSlice');
        store.dispatch(markSaved());
      } catch (error) {
        // Handle quota exceeded
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded');
          
          // Offer to export
          if (confirm('Storage quota exceeded. Would you like to export your pipeline?')) {
            const { exportYAMLFile } = await import('@/utils/import-export');
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
