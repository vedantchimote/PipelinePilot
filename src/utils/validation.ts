/**
 * Validation utilities for job configuration
 */

import type { Job_Node_Config } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates job configuration
 */
export function validateJobConfig(
  job: Partial<Job_Node_Config>,
  allJobs: Record<string, Job_Node_Config>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!job.name || job.name.trim() === '') {
    errors.push({ field: 'name', message: 'Job name is required' });
  }

  if (!job.stage || job.stage.trim() === '') {
    errors.push({ field: 'stage', message: 'Stage is required' });
  }

  if (!job.script || job.script.length === 0) {
    errors.push({ field: 'script', message: 'Script is required' });
  }

  // Job name uniqueness
  if (job.name && job.id) {
    const duplicate = Object.values(allJobs).find(
      (j) => j.name === job.name && j.id !== job.id
    );
    if (duplicate) {
      errors.push({ field: 'name', message: 'Job name must be unique' });
    }
  }

  // Docker image format validation
  if (job.image) {
    if (!isValidDockerImage(job.image)) {
      errors.push({ field: 'image', message: 'Invalid Docker image format' });
    }
  }

  // Artifact path validation
  if (job.artifacts?.paths) {
    for (const path of job.artifacts.paths) {
      if (!isValidGlobPattern(path)) {
        errors.push({ field: 'artifacts', message: `Invalid artifact path: ${path}` });
      }
    }
  }

  // Cache key validation
  if (job.cache?.key) {
    const keyStr = typeof job.cache.key === 'string' ? job.cache.key : job.cache.key.prefix || '';
    if (keyStr && !isValidCacheKey(keyStr)) {
      errors.push({ field: 'cache', message: 'Invalid cache key syntax' });
    }
  }

  return errors;
}

/**
 * Validates Docker image format
 */
function isValidDockerImage(image: string): boolean {
  // Basic validation: registry/repo:tag or repo:tag
  const pattern = /^([a-z0-9.-]+\/)?[a-z0-9._-]+(:[a-z0-9._-]+)?$/i;
  return pattern.test(image);
}

/**
 * Validates glob pattern for artifacts/cache paths
 */
function isValidGlobPattern(pattern: string): boolean {
  // Basic validation: no invalid characters
  const invalidChars = /[<>"|?]/;
  return !invalidChars.test(pattern) && pattern.trim() !== '';
}

/**
 * Validates cache key variable syntax
 */
function isValidCacheKey(key: string): boolean {
  // Allow alphanumeric, underscores, hyphens, and GitLab CI variables
  const pattern = /^[\w\-${}]+$/;
  return pattern.test(key);
}

/**
 * Gets validation error for a specific field
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

/**
 * Checks if form has any validation errors
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

export const validation = {
  validateJobConfig,
  getFieldError,
  hasValidationErrors,
};

export default validation;
