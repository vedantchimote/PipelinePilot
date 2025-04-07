/**
 * Performance Benchmark Utilities
 * Measures and validates performance of critical operations
 */

import type { Pipeline_State, Job_Node_Config } from '@/types';
import { toYAML } from '@/engine/yaml-engine';

export interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  passed: boolean;
  threshold: number;
}

/**
 * Generate a large test pipeline with specified number of jobs
 */
export function generateLargePipeline(jobCount: number): Pipeline_State {
  const stages = ['build', 'test', 'deploy', 'cleanup'];
  const jobs: Record<string, Job_Node_Config> = {};

  for (let i = 0; i < jobCount; i++) {
    const stage = stages[i % stages.length];
    const jobId = `job_${i}`;

    jobs[jobId] = {
      id: jobId,
      name: jobId,
      stage,
      script: [
        'echo "Running job"',
        'npm install',
        'npm run build',
        'npm test',
      ],
      image: 'node:18-alpine',
      variables: {
        NODE_ENV: 'production',
        CI: 'true',
        JOB_INDEX: String(i),
      },
      cache: {
        key: '${CI_COMMIT_REF_SLUG}',
        paths: ['node_modules/', '.npm/'],
      },
      artifacts: {
        paths: ['dist/', 'coverage/'],
        expire_in: '1 week',
      },
      tags: ['docker', 'linux'],
      allow_failure: false,
      timeout: '1h',
    };

    // Add dependencies to previous jobs in same stage
    if (i > 0 && i % stages.length !== 0) {
      jobs[jobId].needs = [`job_${i - 1}`];
    }
  }

  return {
    version: '1.0',
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    global: {
      image: 'node:18',
      variables: {
        GLOBAL_VAR: 'value',
      },
    },
    stages,
    jobs,
    ui: {
      nodes: {},
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  };
}

/**
 * Benchmark YAML generation performance
 */
export function benchmarkYAMLGeneration(
  jobCount: number,
  iterations: number = 10,
  thresholdMs: number = 100
): BenchmarkResult {
  const pipeline = generateLargePipeline(jobCount);
  const times: number[] = [];

  // Warm-up run
  toYAML(pipeline);

  // Benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    toYAML(pipeline);
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    operation: `YAML Generation (${jobCount} jobs)`,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    passed: averageTime < thresholdMs,
    threshold: thresholdMs,
  };
}

/**
 * Format benchmark result for console output
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  const status = result.passed ? '✓ PASS' : '✗ FAIL';
  return `
${status} ${result.operation}
  Iterations: ${result.iterations}
  Average: ${result.averageTime.toFixed(2)}ms
  Min: ${result.minTime.toFixed(2)}ms
  Max: ${result.maxTime.toFixed(2)}ms
  Threshold: ${result.threshold}ms
  Total: ${result.totalTime.toFixed(2)}ms
  `.trim();
}

/**
 * Run all performance benchmarks
 */
export function runAllBenchmarks(): BenchmarkResult[] {
  console.log('🚀 Running Performance Benchmarks...\n');

  const results: BenchmarkResult[] = [];

  // Test with different pipeline sizes
  const testCases = [
    { jobs: 10, threshold: 20 },
    { jobs: 50, threshold: 50 },
    { jobs: 100, threshold: 100 },
    { jobs: 200, threshold: 200 },
  ];

  for (const testCase of testCases) {
    const result = benchmarkYAMLGeneration(testCase.jobs, 10, testCase.threshold);
    results.push(result);
    console.log(formatBenchmarkResult(result));
    console.log('');
  }

  // Summary
  const allPassed = results.every((r) => r.passed);
  console.log(allPassed ? '✓ All benchmarks passed!' : '✗ Some benchmarks failed');

  return results;
}

/**
 * Performance monitoring hook for React components
 * Use in development to track component render times
 */
export function useRenderPerformance(componentName: string, threshold: number = 16) {
  if (import.meta.env.DEV) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > threshold) {
        console.warn(
          `⚠️ ${componentName} render took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }
    };
  }
  
  return () => {}; // No-op in production
}
