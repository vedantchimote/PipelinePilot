/**
 * MonacoPreview Component
 * Real-time YAML preview using Monaco Editor
 */

import { useEffect, useRef, useMemo } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useAppSelector } from '@/store';
import { toYAML } from '@/engine/yaml-engine';
import type { editor } from 'monaco-editor';

export const MonacoPreview = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const pipelineState = useAppSelector((state) => state.pipeline.present);
  const theme = useAppSelector((state) => state.ui.theme);

  // Memoize YAML generation to avoid unnecessary recalculation
  const yamlContent = useMemo(() => {
    try {
      const startTime = performance.now();
      const yaml = toYAML(pipelineState);
      const endTime = performance.now();
      
      // Log performance in development mode
      if (import.meta.env.DEV) {
        const duration = endTime - startTime;
        const jobCount = Object.keys(pipelineState.jobs).length;
        if (duration > 50) {
          console.warn(`⚠️ YAML generation took ${duration.toFixed(2)}ms for ${jobCount} jobs`);
        }
      }
      
      return yaml;
    } catch (error) {
      return `# Error generating YAML\n# ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }, [pipelineState]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Update editor value when YAML changes
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== yamlContent) {
        editorRef.current.setValue(yamlContent);
      }
    }
  }, [yamlContent]);

  return (
    <div className="h-full w-full flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
      {/* File Tab Header */}
      <div className="h-9 flex items-center gap-2 px-3 border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
        <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>.gitlab-ci.yml</span>
        <div className="flex-1" />
        <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-60" title="Auto-synced" />
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={yamlContent}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            folding: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
            renderLineHighlight: 'none',
            contextmenu: false,
            automaticLayout: true,
            padding: { top: 12 },
            lineDecorationsWidth: 8,
          }}
        />
      </div>
    </div>
  );
};

export default MonacoPreview;
