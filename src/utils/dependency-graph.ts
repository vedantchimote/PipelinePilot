/**
 * Dependency Graph Utilities
 * Provides cycle detection, referential integrity validation, and cascade deletion
 */

import type { Job_Node_Config } from '@/types';

/**
 * Detects cycles in the dependency graph using depth-first search
 * @param jobs - Record of all jobs in the pipeline
 * @returns Array of job IDs forming a cycle, or empty array if no cycle
 */
export function detectCycle(jobs: Record<string, Job_Node_Config>): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(jobId: string): string[] | null {
    if (recursionStack.has(jobId)) {
      // Found a cycle - return the path from this job
      const cycleStart = path.indexOf(jobId);
      return path.slice(cycleStart).concat(jobId);
    }

    if (visited.has(jobId)) {
      return null;
    }

    visited.add(jobId);
    recursionStack.add(jobId);
    path.push(jobId);

    const job = jobs[jobId];
    if (job?.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      
      for (const need of needs) {
        const needId = typeof need === 'string' ? need : need.job;
        const cycle = dfs(needId);
        if (cycle) {
          return cycle;
        }
      }
    }

    path.pop();
    recursionStack.delete(jobId);
    return null;
  }

  // Check all jobs as potential starting points
  for (const jobId of Object.keys(jobs)) {
    if (!visited.has(jobId)) {
      const cycle = dfs(jobId);
      if (cycle) {
        return cycle;
      }
    }
  }

  return [];
}

/**
 * Validates that all job dependencies reference existing jobs
 * @param jobs - Record of all jobs in the pipeline
 * @returns Array of validation errors
 */
export function validateDependencies(
  jobs: Record<string, Job_Node_Config>
): Array<{ jobId: string; invalidDependency: string; message: string }> {
  const errors: Array<{ jobId: string; invalidDependency: string; message: string }> = [];
  const jobIds = new Set(Object.keys(jobs));

  for (const [jobId, job] of Object.entries(jobs)) {
    // Validate 'needs' dependencies
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      
      for (const need of needs) {
        const needId = typeof need === 'string' ? need : need.job;
        
        if (!jobIds.has(needId)) {
          errors.push({
            jobId,
            invalidDependency: needId,
            message: `Job "${jobId}" depends on non-existent job "${needId}"`,
          });
        }
      }
    }

    // Validate 'dependencies' (artifact dependencies)
    if (job.dependencies) {
      for (const depId of job.dependencies) {
        if (!jobIds.has(depId)) {
          errors.push({
            jobId,
            invalidDependency: depId,
            message: `Job "${jobId}" has artifact dependency on non-existent job "${depId}"`,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Removes all dependencies to/from a job when it's deleted (cascade deletion)
 * @param jobs - Record of all jobs in the pipeline
 * @param deletedJobId - ID of the job being deleted
 * @returns Updated jobs record with dependencies removed
 */
export function removeJobDependencies(
  jobs: Record<string, Job_Node_Config>,
  deletedJobId: string
): Record<string, Job_Node_Config> {
  const updatedJobs: Record<string, Job_Node_Config> = {};

  for (const [jobId, job] of Object.entries(jobs)) {
    if (jobId === deletedJobId) {
      continue; // Skip the deleted job
    }

    const updatedJob = { ...job };

    // Remove from 'needs' array
    if (updatedJob.needs) {
      const needs = Array.isArray(updatedJob.needs) ? updatedJob.needs : [updatedJob.needs];
      const filteredNeeds = needs.filter((need) => {
        const needId = typeof need === 'string' ? need : need.job;
        return needId !== deletedJobId;
      });

      if (filteredNeeds.length === 0) {
        delete updatedJob.needs;
      } else {
        updatedJob.needs = filteredNeeds as any;
      }
    }

    // Remove from 'dependencies' array
    if (updatedJob.dependencies) {
      const filteredDeps = updatedJob.dependencies.filter((dep) => dep !== deletedJobId);
      
      if (filteredDeps.length === 0) {
        delete updatedJob.dependencies;
      } else {
        updatedJob.dependencies = filteredDeps;
      }
    }

    updatedJobs[jobId] = updatedJob;
  }

  return updatedJobs;
}

/**
 * Checks if adding a dependency would create a cycle
 * @param jobs - Record of all jobs in the pipeline
 * @param fromJobId - Job that will depend on toJobId
 * @param toJobId - Job that fromJobId will depend on
 * @returns true if adding the dependency would create a cycle
 */
export function wouldCreateCycle(
  jobs: Record<string, Job_Node_Config>,
  fromJobId: string,
  toJobId: string
): boolean {
  // Create a temporary jobs object with the new dependency
  const tempJobs = { ...jobs };
  const fromJob = tempJobs[fromJobId];
  
  if (!fromJob) return false;

  const updatedJob = { ...fromJob };
  const currentNeeds = updatedJob.needs 
    ? (Array.isArray(updatedJob.needs) ? updatedJob.needs : [updatedJob.needs])
    : [];
  
  updatedJob.needs = [...currentNeeds, toJobId] as any;
  tempJobs[fromJobId] = updatedJob;

  // Check for cycles in the temporary graph
  const cycle = detectCycle(tempJobs);
  return cycle.length > 0;
}

/**
 * Gets all jobs that depend on a given job
 * @param jobs - Record of all jobs in the pipeline
 * @param jobId - ID of the job to find dependents for
 * @returns Array of job IDs that depend on the given job
 */
export function getDependents(
  jobs: Record<string, Job_Node_Config>,
  jobId: string
): string[] {
  const dependents: string[] = [];

  for (const [currentJobId, job] of Object.entries(jobs)) {
    if (job.needs) {
      const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
      const hasNeed = needs.some((need) => {
        const needId = typeof need === 'string' ? need : need.job;
        return needId === jobId;
      });

      if (hasNeed) {
        dependents.push(currentJobId);
      }
    }

    if (job.dependencies?.includes(jobId)) {
      if (!dependents.includes(currentJobId)) {
        dependents.push(currentJobId);
      }
    }
  }

  return dependents;
}

/**
 * Gets all jobs that a given job depends on
 * @param jobs - Record of all jobs in the pipeline
 * @param jobId - ID of the job to find dependencies for
 * @returns Array of job IDs that the given job depends on
 */
export function getDependencies(
  jobs: Record<string, Job_Node_Config>,
  jobId: string
): string[] {
  const job = jobs[jobId];
  if (!job) return [];

  const dependencies = new Set<string>();

  if (job.needs) {
    const needs = Array.isArray(job.needs) ? job.needs : [job.needs];
    needs.forEach((need) => {
      const needId = typeof need === 'string' ? need : need.job;
      dependencies.add(needId);
    });
  }

  if (job.dependencies) {
    job.dependencies.forEach((dep) => dependencies.add(dep));
  }

  return Array.from(dependencies);
}

export const dependencyGraph = {
  detectCycle,
  validateDependencies,
  removeJobDependencies,
  wouldCreateCycle,
  getDependents,
  getDependencies,
};

export default dependencyGraph;
