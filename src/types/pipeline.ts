/**
 * Core type definitions for GitLab CI/CD Pipeline Visual Editor
 * Based on design document specifications
 */

// ============================================================================
// Core Pipeline Types
// ============================================================================

export interface Pipeline_State {
  version: string;
  metadata: PipelineMetadata;
  global: GlobalConfig;
  stages: string[];
  jobs: Record<string, Job_Node_Config>;
  includes?: IncludeEntry[];
  ui: UIMetadata;
}

export interface PipelineMetadata {
  created: string; // ISO timestamp
  modified: string; // ISO timestamp
  name?: string;
}

export interface GlobalConfig {
  image?: string;
  variables?: Record<string, string | Variable>;
  cache?: CacheConfig;
  before_script?: string[];
  after_script?: string[];
}

// ============================================================================
// Job Configuration Types
// ============================================================================

export interface Job_Node_Config {
  id: string; // Unique identifier
  name: string; // Job name (key in .gitlab-ci.yml)
  stage: string;
  script: string[];
  image?: string;
  variables?: Record<string, string | Variable>;
  cache?: CacheConfig;
  artifacts?: ArtifactsConfig;
  dependencies?: string[]; // Job names for artifact dependencies
  needs?: string[] | NeedsConfig[]; // Job names for DAG execution
  rules?: Rule[];
  before_script?: string[];
  after_script?: string[];
  trigger?: TriggerConfig;
  tags?: string[];
  allow_failure?: boolean;
  when?: 'on_success' | 'on_failure' | 'always' | 'manual' | 'delayed';
  timeout?: string;
  retry?: number | RetryConfig;
  services?: string[] | ServiceConfig[];
  environment?: string | EnvironmentConfig;
  coverage?: string;
  parallel?: number | ParallelConfig;
  extends?: string; // Reference to a hidden job template (.base_*)
}

export interface Variable {
  value: string;
  protected?: boolean;
  masked?: boolean;
}

export interface CacheConfig {
  key?: string | CacheKeyConfig;
  paths: string[];
  policy?: 'pull' | 'push' | 'pull-push';
  untracked?: boolean;
  when?: 'on_success' | 'on_failure' | 'always';
}

export interface CacheKeyConfig {
  files?: string[];
  prefix?: string;
}

export interface ArtifactsConfig {
  paths: string[];
  exclude?: string[];
  expire_in?: string;
  expose_as?: string;
  name?: string;
  when?: 'on_success' | 'on_failure' | 'always';
  reports?: Record<string, string | string[]>;
  untracked?: boolean;
}

export interface Rule {
  if?: string; // Condition expression
  when?: 'on_success' | 'on_failure' | 'always' | 'manual' | 'delayed' | 'never';
  allow_failure?: boolean;
  variables?: Record<string, string>;
  changes?: string[];
  exists?: string[];
}

export interface TriggerConfig {
  project: string;
  branch?: string;
  strategy?: 'depend';
  include?: string | string[];
}

export interface IncludeEntry {
  type: 'local' | 'remote' | 'template' | 'project';
  value: string;
  ref?: string;
  file?: string;
}

export interface RetryConfig {
  max: number;
  when?: string | string[];
}

export interface NeedsConfig {
  job: string;
  artifacts?: boolean;
  project?: string;
  ref?: string;
}

export interface ServiceConfig {
  name: string;
  alias?: string;
  entrypoint?: string[];
  command?: string[];
}

export interface EnvironmentConfig {
  name: string;
  url?: string;
  on_stop?: string;
  auto_stop_in?: string;
  kubernetes?: KubernetesConfig;
}

export interface KubernetesConfig {
  namespace: string;
}

export interface ParallelConfig {
  matrix: Array<Record<string, string[]>>;
}

// ============================================================================
// UI Metadata Types
// ============================================================================

export interface UIMetadata {
  nodes: Record<string, NodePosition>;
  viewport: ViewportState;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

// ============================================================================
// YAML Engine Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
}

export interface AnchorMap {
  [anchorName: string]: {
    config: any;
    usedBy: string[]; // Job IDs that reference this anchor
  };
}

// ============================================================================
// GitLab API Types
// ============================================================================

export interface LintResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  merged_yaml?: string; // Expanded YAML with includes resolved
  mergedYaml?: string; // Alias for merged_yaml
}

export interface Template {
  id: string;
  key?: string;
  name: string;
  description?: string;
  content?: string; // May be lazy-loaded
  category?: string;
  tags?: string[];
  source?: 'official' | 'custom' | 'example';
  yaml?: string;
}

// ============================================================================
// Dependency Graph Types
// ============================================================================

export interface DependencyGraph {
  nodes: Set<string>; // Job IDs
  edges: Map<string, Set<string>>; // source -> targets
}

export interface DependencyEdge {
  source: string; // Source job ID
  target: string; // Target job ID
  type: 'needs' | 'dependencies' | 'stage';
}

// ============================================================================
// Error Types
// ============================================================================

export class YAMLParseError extends Error {
  line: number;
  column: number;
  snippet: string;

  constructor(message: string, line: number, column: number, snippet: string) {
    super(message);
    this.name = 'YAMLParseError';
    this.line = line;
    this.column = column;
    this.snippet = snippet;
  }
}

export class CircularDependencyError extends Error {
  cycle: string[]; // Job IDs in the cycle

  constructor(message: string, cycle: string[]) {
    super(message);
    this.name = 'CircularDependencyError';
    this.cycle = cycle;
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type JobStatus = 'valid' | 'invalid' | 'warning';

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'offline';

export type ThemeMode = 'dark' | 'light';

// ============================================================================
// Type Guards
// ============================================================================

export function isVariable(value: string | Variable): value is Variable {
  return typeof value === 'object' && 'value' in value;
}

export function isNeedsConfig(value: string | NeedsConfig): value is NeedsConfig {
  return typeof value === 'object' && 'job' in value;
}

export function isEnvironmentConfig(
  value: string | EnvironmentConfig
): value is EnvironmentConfig {
  return typeof value === 'object' && 'name' in value;
}

export function isCacheKeyConfig(value: string | CacheKeyConfig): value is CacheKeyConfig {
  return typeof value === 'object' && ('files' in value || 'prefix' in value);
}

export function isRetryConfig(value: number | RetryConfig): value is RetryConfig {
  return typeof value === 'object' && 'max' in value;
}

export function isParallelConfig(value: number | ParallelConfig): value is ParallelConfig {
  return typeof value === 'object' && 'matrix' in value;
}
