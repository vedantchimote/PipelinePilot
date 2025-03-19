/**
 * Validation Middleware
 * Automatically validates pipeline YAML when state changes
 */

import { Middleware } from '@reduxjs/toolkit';
import { toYAML } from '@/engine/yaml-engine';
import { getGitLabClient } from '@/api/gitlab-client';
import { setValidationStatus, setValidationErrors } from '@/store/uiSlice';
import type { RootState } from '@/types';

// Debounce timer
let validationTimer: ReturnType<typeof setTimeout> | null = null;
const VALIDATION_DELAY = 500; // ms

/**
 * Middleware that triggers YAML validation on pipeline changes
 */
export const validationMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  const result = next(action);

  // Only validate on pipeline actions
  if (action.type?.startsWith('pipeline/')) {
    // Clear existing timer
    if (validationTimer) {
      clearTimeout(validationTimer);
    }

    // Debounce validation
    validationTimer = setTimeout(async () => {
      const state = store.getState();
      const pipelineState = state.pipeline.present;

      // Set validating status
      store.dispatch(setValidationStatus('validating'));

      try {
        // Generate YAML
        const yamlContent = toYAML(pipelineState);

        // Validate with GitLab API
        const client = getGitLabClient();
        const result = await client.validateYAML(yamlContent);

        if (result.valid) {
          store.dispatch(setValidationStatus('valid'));
          store.dispatch(setValidationErrors({}));
        } else {
          store.dispatch(setValidationStatus('invalid'));
          
          // Parse errors and map to job IDs
          const errorsByJob: Record<string, string[]> = {};
          
          result.errors.forEach((error) => {
            // Try to extract job name from error message
            const jobMatch = error.match(/job '([^']+)'/i) || error.match(/\b(\w+)\b/);
            const jobId = jobMatch ? jobMatch[1] : 'global';
            
            if (!errorsByJob[jobId]) {
              errorsByJob[jobId] = [];
            }
            errorsByJob[jobId].push(error);
          });

          store.dispatch(setValidationErrors(errorsByJob));
        }
      } catch (error) {
        // Network error or offline
        console.error('Validation failed:', error);
        store.dispatch(setValidationStatus('offline'));
        store.dispatch(setValidationErrors({}));
      }
    }, VALIDATION_DELAY);
  }

  return result;
};

export default validationMiddleware;
