/**
 * YAML Engine - Bidirectional conversion between Pipeline_State and GitLab CI/CD YAML
 * Based on design document specifications
 */

import * as yaml from 'js-yaml';
import type {
  Pipeline_State,
  Job_Node_Config,
  ValidationResult,
  AnchorMap,
  NodePosition,
  YAMLParseError,
} from '@/types';

// ============================================================================
// YAML to Pipeline_State Parser
// ============================================================================

export function fromYAML(yamlString: string): Pipeline_State {
  try {
    // Parse YAML string
    const parsed = yaml.load(yamlString) as any;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML: expected object');
    }

    // Extract stages
    const stages = parsed.stages || ['build', 'test', 'deploy'];

    // Extract global configuration
    const global = {
      image: parsed.image,
      variables: parsed.variables,
      cache: parsed.cache,
      before_script: parsed.before_script,
      after_script: parsed.after_script,
    };

    // Extract jobs (exclude hidden jobs and reserved keywords)
    const reservedKeywords = [
      'stages',
      'image',
      'variables',
      'cache',
      'before_script',
      'after_script',
      'include',
      'workflow',
      'default',
    ];

    const jobs: Record<string, Job_Node_Config> = {};
    
    for (const [key, value] of Object.entries(parsed)) {
      // Skip reserved keywords and hidden jobs (starting with .)
      if (reservedKeywords.includes(key) || key.startsWith('.')) {
        continue;
      }

      if (typeof value === 'object' && value !== null) {
        const jobConfig = value as any;
        
        jobs[key] = {
          id: key,
          name: key,
          stage: jobConfig.stage || 'test',
          script: Array.isArray(jobConfig.script) ? jobConfig.script : [jobConfig.script || ''],
          image: jobConfig.image,
          variables: jobConfig.variables,
          cache: jobConfig.cache,
          artifacts: jobConfig.artifacts,
          dependencies: jobConfig.dependencies,
          needs: jobConfig.needs,
          rules: jobConfig.rules,
          before_script: jobConfig.before_script,
          after_script: jobConfig.after_script,
          trigger: jobConfig.trigger,
          tags: jobConfig.tags,
          allow_failure: jobConfig.allow_failure,
          when: jobConfig.when,
          timeout: jobConfig.timeout,
          retry: jobConfig.retry,
          services: jobConfig.services,
          environment: jobConfig.environment,
          coverage: jobConfig.coverage,
          parallel: jobConfig.parallel,
        };
      }
    }

    // Generate UI metadata with auto-layout
    const nodePositions = generateLayout(jobs, stages);

    const pipelineState: Pipeline_State = {
      version: '1.0',
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
      global,
      stages,
      jobs,
      ui: {
        nodes: nodePositions,
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    };

    return pipelineState;
  } catch (error: any) {
    if (error.mark) {
      // YAML parsing error with line/column info
      const yamlError = error as any;
      throw {
        name: 'YAMLParseError',
        message: yamlError.message,
        line: yamlError.mark.line + 1,
        column: yamlError.mark.column + 1,
        snippet: yamlError.mark.snippet || '',
      } as YAMLParseError;
    }
    throw error;
  }
}

// ============================================================================
// Pipeline_State to YAML Generator
// ============================================================================

export function toYAML(state: Pipeline_State): string {
  // Detect anchors for repeated configuration
  const anchors = detectAnchors(state);

  // Build YAML object
  const yamlObj: any = {};

  // Add global configuration
  if (state.global.image) yamlObj.image = state.global.image;
  if (state.global.variables) yamlObj.variables = state.global.variables;
  if (state.global.cache) yamlObj.cache = state.global.cache;
  if (state.global.before_script) yamlObj.before_script = state.global.before_script;
  if (state.global.after_script) yamlObj.after_script = state.global.after_script;

  // Add stages
  yamlObj.stages = state.stages;

  // Add anchor definitions
  for (const [anchorName, anchorData] of Object.entries(anchors)) {
    yamlObj[`.${anchorName}`] = anchorData.config;
  }

  // Add jobs (ordered by stage)
  const orderedJobs = orderJobsByStage(state.jobs, state.stages);
  
  for (const job of orderedJobs) {
    const jobConfig: any = {
      stage: job.stage,
    };

    // Add job properties
    if (job.image) jobConfig.image = job.image;
    if (job.script) jobConfig.script = job.script;
    if (job.before_script) jobConfig.before_script = job.before_script;
    if (job.after_script) jobConfig.after_script = job.after_script;
    
    // Check if cache should use anchor
    if (job.cache) {
      const cacheAnchor = findAnchorForConfig(job.cache, anchors);
      jobConfig.cache = cacheAnchor ? `*${cacheAnchor}` : job.cache;
    }
    
    if (job.artifacts) jobConfig.artifacts = job.artifacts;
    if (job.variables) jobConfig.variables = job.variables;
    if (job.dependencies) jobConfig.dependencies = job.dependencies;
    if (job.needs) jobConfig.needs = job.needs;
    if (job.rules) jobConfig.rules = job.rules;
    if (job.tags) jobConfig.tags = job.tags;
    if (job.allow_failure !== undefined) jobConfig.allow_failure = job.allow_failure;
    if (job.when) jobConfig.when = job.when;
    if (job.timeout) jobConfig.timeout = job.timeout;
    if (job.retry) jobConfig.retry = job.retry;
    if (job.services) jobConfig.services = job.services;
    if (job.environment) jobConfig.environment = job.environment;
    if (job.coverage) jobConfig.coverage = job.coverage;
    if (job.parallel) jobConfig.parallel = job.parallel;
    if (job.trigger) jobConfig.trigger = job.trigger;

    yamlObj[job.name] = jobConfig;
  }

  // Convert to YAML string
  return yaml.dump(yamlObj, {
    indent: 2,
    lineWidth: 100,
    noRefs: false, // Allow references (anchors/aliases)
    sortKeys: false, // Maintain order
  });
}

// ============================================================================
// Validation
// ============================================================================

export function validateSyntax(yamlString: string): ValidationResult {
  try {
    yaml.load(yamlString);
    return { valid: true, errors: [] };
  } catch (error: any) {
    return {
      valid: false,
      errors: [
        {
          line: error.mark?.line + 1,
          column: error.mark?.column + 1,
          message: error.message,
        },
      ],
    };
  }
}

// ============================================================================
// Anchor Detection
// ============================================================================

export function detectAnchors(state: Pipeline_State): AnchorMap {
  const anchors: AnchorMap = {};
  const configBlocks = new Map<string, { config: any; jobs: string[] }>();

  // Collect cache configurations
  for (const [jobId, job] of Object.entries(state.jobs)) {
    if (job.cache) {
      const key = JSON.stringify(job.cache);
      if (!configBlocks.has(key)) {
        configBlocks.set(key, { config: job.cache, jobs: [] });
      }
      configBlocks.get(key)!.jobs.push(jobId);
    }
  }

  // Generate anchors for blocks used by 2+ jobs
  let anchorIndex = 0;
  for (const { config, jobs } of configBlocks.values()) {
    if (jobs.length >= 2) {
      const anchorName = `cache_${anchorIndex++}`;
      anchors[anchorName] = { config, usedBy: jobs };
    }
  }

  // TODO: Add detection for variables, before_script, after_script

  return anchors;
}

// ============================================================================
// Auto-Layout Algorithm
// ============================================================================

export function generateLayout(
  jobs: Record<string, Job_Node_Config>,
  stages: string[]
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};
  const stageHeight = 200; // Vertical spacing between stages
  const jobWidth = 300; // Horizontal spacing between jobs
  const jobsPerStage = new Map<string, string[]>();

  // Group jobs by stage
  for (const [jobId, job] of Object.entries(jobs)) {
    if (!jobsPerStage.has(job.stage)) {
      jobsPerStage.set(job.stage, []);
    }
    jobsPerStage.get(job.stage)!.push(jobId);
  }

  // Position jobs within each stage
  stages.forEach((stage, stageIndex) => {
    const jobsInStage = jobsPerStage.get(stage) || [];
    const stageY = stageIndex * stageHeight;

    jobsInStage.forEach((jobId, jobIndex) => {
      positions[jobId] = {
        x: jobIndex * jobWidth,
        y: stageY,
      };
    });
  });

  return positions;
}

// ============================================================================
// Helper Functions
// ============================================================================

function orderJobsByStage(
  jobs: Record<string, Job_Node_Config>,
  stages: string[]
): Job_Node_Config[] {
  const jobArray = Object.values(jobs);

  // Sort by stage order, then alphabetically by name
  return jobArray.sort((a, b) => {
    const stageIndexA = stages.indexOf(a.stage);
    const stageIndexB = stages.indexOf(b.stage);

    if (stageIndexA !== stageIndexB) {
      return stageIndexA - stageIndexB;
    }

    return a.name.localeCompare(b.name);
  });
}

function findAnchorForConfig(config: any, anchors: AnchorMap): string | null {
  const configKey = JSON.stringify(config);

  for (const [anchorName, anchorData] of Object.entries(anchors)) {
    if (JSON.stringify(anchorData.config) === configKey) {
      return anchorName;
    }
  }

  return null;
}

// ============================================================================
// Export YAML Engine Interface
// ============================================================================

export const yamlEngine = {
  fromYAML,
  toYAML,
  validateSyntax,
  detectAnchors,
  generateLayout,
};

export default yamlEngine;
