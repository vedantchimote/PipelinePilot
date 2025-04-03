/**
 * Import/Export utilities for pipeline files
 */

import { fromYAML, toYAML } from '@/engine/yaml-engine';
import type { Pipeline_State } from '@/types';

/**
 * Imports YAML file and parses to Pipeline_State
 */
export async function importYAMLFile(): Promise<{
  success: boolean;
  data?: Pipeline_State;
  error?: {
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
  };
}> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yml,.yaml';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false });
        return;
      }

      try {
        const content = await file.text();
        const pipelineState = fromYAML(content);
        resolve({ success: true, data: pipelineState });
      } catch (error) {
        console.error('Failed to import YAML:', error);
        
        // Get file content for snippet
        const content = await file.text();
        
        // Extract error details
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        let line: number | undefined;
        let column: number | undefined;
        let snippet: string | undefined;

        // Try to extract line/column from error message
        const lineMatch = errorMessage.match(/line (\d+)/i);
        const columnMatch = errorMessage.match(/column (\d+)/i);
        
        if (lineMatch) line = parseInt(lineMatch[1], 10);
        if (columnMatch) column = parseInt(columnMatch[1], 10);

        // Get snippet if we have line number
        if (line !== undefined) {
          const lines = content.split('\n');
          const startLine = Math.max(0, line - 3);
          const endLine = Math.min(lines.length, line + 2);
          snippet = lines
            .slice(startLine, endLine)
            .map((l: string, i: number) => {
              const lineNum = startLine + i + 1;
              const marker = lineNum === line ? '→ ' : '  ';
              return `${marker}${lineNum.toString().padStart(4, ' ')} | ${l}`;
            })
            .join('\n');
        }

        resolve({
          success: false,
          error: {
            message: errorMessage,
            line,
            column,
            snippet,
          },
        });
      }
    };

    input.click();
  });
}

/**
 * Exports Pipeline_State as YAML file
 */
export function exportYAMLFile(state: Pipeline_State, filename: string = '.gitlab-ci.yml'): void {
  try {
    const yamlContent = toYAML(state);
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export YAML:', error);
    alert(`Failed to export YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Exports Pipeline_State as JSON file
 */
export function exportJSONFile(state: Pipeline_State, filename: string = 'pipeline-state.json'): void {
  try {
    const jsonContent = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export JSON:', error);
    alert(`Failed to export JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Imports JSON file and parses to Pipeline_State
 */
export async function importJSONFile(): Promise<Pipeline_State | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const content = await file.text();
        const pipelineState = JSON.parse(content) as Pipeline_State;
        
        // Basic validation
        if (!pipelineState.version || !pipelineState.jobs || !pipelineState.stages) {
          throw new Error('Invalid pipeline state format');
        }
        
        resolve(pipelineState);
      } catch (error) {
        console.error('Failed to import JSON:', error);
        alert(`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        resolve(null);
      }
    };

    input.click();
  });
}

/**
 * Copies YAML content to clipboard
 */
export async function copyYAMLToClipboard(state: Pipeline_State): Promise<boolean> {
  try {
    const yamlContent = toYAML(state);
    await navigator.clipboard.writeText(yamlContent);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Downloads text content as file
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

export const importExport = {
  importYAMLFile,
  exportYAMLFile,
  exportJSONFile,
  importJSONFile,
  copyYAMLToClipboard,
  downloadTextFile,
};

export default importExport;
