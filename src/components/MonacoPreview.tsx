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
    <div className="h-full w-full bg-gray-900">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={yamlContent}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          folding: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 14,
          fontFamily: 'Consolas, "Courier New", monospace',
          renderLineHighlight: 'none',
          contextmenu: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default MonacoPreview;
