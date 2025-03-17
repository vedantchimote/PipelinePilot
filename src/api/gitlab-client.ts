/**
 * GitLab API Client
 * Handles communication with GitLab API for validation and template fetching
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { LintResult, Template } from '@/types';

export class GitLabAPIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private token: string | null;

  constructor(baseURL?: string, token?: string) {
    this.baseURL = baseURL || localStorage.getItem('gitlabBaseURL') || 'https://gitlab.com/api/v4';
    this.token = token || localStorage.getItem('gitlabToken') || null;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: this.token ? { 'PRIVATE-TOKEN': this.token } : {},
    });
  }

  /**
   * Validates GitLab CI/CD YAML syntax
   */
  async validateYAML(yamlContent: string, projectId?: string): Promise<LintResult> {
    try {
      const endpoint = projectId 
        ? `/projects/${encodeURIComponent(projectId)}/ci/lint`
        : '/ci/lint';

      const response = await this.client.post(endpoint, {
        content: yamlContent,
        include_merged_yaml: false,
      });

      return {
        valid: response.data.valid,
        errors: response.data.errors || [],
        warnings: response.data.warnings || [],
        mergedYaml: response.data.merged_yaml,
      };
    } catch (error) {
      return this.handleError(error, 'YAML validation');
    }
  }

  /**
   * Fetches list of official GitLab CI/CD templates
   */
  async fetchTemplates(): Promise<Template[]> {
    try {
      const response = await this.client.get('/templates/gitlab_ci_ymls');
      
      return response.data.map((template: any) => ({
        id: template.key,
        name: template.name,
        description: template.name,
        category: this.categorizeTemplate(template.name),
        source: 'official' as const,
        yaml: '', // Will be fetched separately
      }));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  /**
   * Fetches a specific GitLab CI/CD template by key
   */
  async fetchTemplate(key: string): Promise<string> {
    try {
      const response = await this.client.get(`/templates/gitlab_ci_ymls/${key}`);
      return response.data.content || '';
    } catch (error) {
      console.error(`Failed to fetch template ${key}:`, error);
      return '';
    }
  }

  /**
   * Updates the API client configuration
   */
  updateConfig(baseURL?: string, token?: string): void {
    if (baseURL) {
      this.baseURL = baseURL;
      localStorage.setItem('gitlabBaseURL', baseURL);
    }
    if (token !== undefined) {
      this.token = token;
      if (token) {
        localStorage.setItem('gitlabToken', token);
      } else {
        localStorage.removeItem('gitlabToken');
      }
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: this.token ? { 'PRIVATE-TOKEN': this.token } : {},
    });
  }

  /**
   * Tests the connection to GitLab API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Categorizes template by name
   */
  private categorizeTemplate(name: string): 'build' | 'test' | 'deploy' | 'security' | 'other' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('build') || lowerName.includes('compile')) {
      return 'build';
    }
    if (lowerName.includes('test') || lowerName.includes('coverage')) {
      return 'test';
    }
    if (lowerName.includes('deploy') || lowerName.includes('release')) {
      return 'deploy';
    }
    if (lowerName.includes('security') || lowerName.includes('sast') || lowerName.includes('dast')) {
      return 'security';
    }
    return 'other';
  }

  /**
   * Handles API errors gracefully
   */
  private handleError(error: unknown, operation: string): LintResult {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return {
          valid: false,
          errors: [`${operation} timed out. Please check your network connection.`],
          warnings: [],
        };
      }

      if (!axiosError.response) {
        return {
          valid: false,
          errors: [`${operation} failed: Network error. GitLab API may be unreachable.`],
          warnings: [],
        };
      }

      const status = axiosError.response.status;
      if (status === 401) {
        return {
          valid: false,
          errors: [`${operation} failed: Unauthorized. Please check your GitLab token.`],
          warnings: [],
        };
      }
      if (status === 403) {
        return {
          valid: false,
          errors: [`${operation} failed: Forbidden. You don't have permission to access this resource.`],
          warnings: [],
        };
      }
      if (status === 404) {
        return {
          valid: false,
          errors: [`${operation} failed: Resource not found.`],
          warnings: [],
        };
      }

      return {
        valid: false,
        errors: [`${operation} failed: ${axiosError.message}`],
        warnings: [],
      };
    }

    return {
      valid: false,
      errors: [`${operation} failed: Unknown error`],
      warnings: [],
    };
  }
}

// Singleton instance
let gitlabClient: GitLabAPIClient | null = null;

export function getGitLabClient(): GitLabAPIClient {
  if (!gitlabClient) {
    gitlabClient = new GitLabAPIClient();
  }
  return gitlabClient;
}

export function resetGitLabClient(): void {
  gitlabClient = null;
}

export default GitLabAPIClient;
