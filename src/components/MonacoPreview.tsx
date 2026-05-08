/**
 * MonacoPreview Component
 * Real-time YAML preview using Monaco Editor
 * Registers custom Monaco themes to match each app theme variant
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useAppSelector } from '@/store';
import { toYAML } from '@/engine/yaml-engine';
import type { editor } from 'monaco-editor';

/* ═══════════════════════════════════════════════════
 *  Custom Monaco theme definitions per app theme
 * ═══════════════════════════════════════════════════ */

interface MonacoThemeDef {
  base: 'vs' | 'vs-dark';
  inherit: boolean;
  rules: { token: string; foreground?: string; fontStyle?: string }[];
  colors: Record<string, string>;
}

const MONACO_THEMES: Record<string, MonacoThemeDef> = {
  /* ── Midnight (default dark) ── */
  'pp-midnight': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '818cf8' },
      { token: 'string', foreground: 'a5f3fc' },
      { token: 'number', foreground: 'fbbf24' },
      { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      { token: 'type', foreground: '34d399' },
    ],
    colors: {
      'editor.background': '#0c1222',
      'editor.foreground': '#e2e8f0',
      'editor.lineHighlightBackground': '#131b2e',
      'editorLineNumber.foreground': '#3b4f7a',
      'editorLineNumber.activeForeground': '#818cf8',
      'editor.selectionBackground': '#818cf833',
      'editorCursor.foreground': '#818cf8',
      'editorGutter.background': '#0c1222',
      'editorWidget.background': '#131b2e',
      'editorWidget.border': '#1e2d4a',
    },
  },

  /* ── Dracula ── */
  'pp-dracula': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '8be9fd' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'type', foreground: '50fa7b' },
    ],
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#343746',
      'editorLineNumber.foreground': '#6272a4',
      'editorLineNumber.activeForeground': '#f8f8f2',
      'editor.selectionBackground': '#44475a',
      'editorCursor.foreground': '#f8f8f2',
      'editorGutter.background': '#282a36',
      'editorWidget.background': '#21222c',
      'editorWidget.border': '#44475a',
    },
  },

  /* ── Nord ── */
  'pp-nord': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '81a1c1' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'keyword', foreground: '5e81ac', fontStyle: 'bold' },
      { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
      { token: 'type', foreground: '8fbcbb' },
    ],
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#eceff4',
      'editor.lineHighlightBackground': '#3b4252',
      'editorLineNumber.foreground': '#4c566a',
      'editorLineNumber.activeForeground': '#88c0d0',
      'editor.selectionBackground': '#434c5e',
      'editorCursor.foreground': '#88c0d0',
      'editorGutter.background': '#2e3440',
      'editorWidget.background': '#3b4252',
      'editorWidget.border': '#4c566a',
    },
  },

  /* ── Monokai ── */
  'pp-monokai': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '66d9ef' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'type', foreground: 'a6e22e' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorLineNumber.foreground': '#75715e',
      'editorLineNumber.activeForeground': '#a6e22e',
      'editor.selectionBackground': '#49483e',
      'editorCursor.foreground': '#f8f8f0',
      'editorGutter.background': '#272822',
      'editorWidget.background': '#1e1f1a',
      'editorWidget.border': '#49483e',
    },
  },

  /* ── Synthwave ── */
  'pp-synthwave': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '36f9f6' },
      { token: 'string', foreground: 'ff8b39' },
      { token: 'number', foreground: 'f97e72' },
      { token: 'keyword', foreground: 'fede5d', fontStyle: 'bold' },
      { token: 'comment', foreground: '7a5ca0', fontStyle: 'italic' },
      { token: 'type', foreground: 'ff7edb' },
    ],
    colors: {
      'editor.background': '#1a1028',
      'editor.foreground': '#e8d5ff',
      'editor.lineHighlightBackground': '#241534',
      'editorLineNumber.foreground': '#5b3e8a',
      'editorLineNumber.activeForeground': '#ff7edb',
      'editor.selectionBackground': '#3d296066',
      'editorCursor.foreground': '#ff7edb',
      'editorGutter.background': '#1a1028',
      'editorWidget.background': '#241534',
      'editorWidget.border': '#3d2960',
    },
  },

  /* ── GitHub Dark ── */
  'pp-github-dark': {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'key', foreground: '79c0ff' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'type', foreground: '7ee787' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#e6edf3',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#58a6ff',
      'editor.selectionBackground': '#264f7844',
      'editorCursor.foreground': '#58a6ff',
      'editorGutter.background': '#0d1117',
      'editorWidget.background': '#161b22',
      'editorWidget.border': '#30363d',
    },
  },

  /* ── Light ── */
  'pp-light': {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'key', foreground: '6366f1' },
      { token: 'string', foreground: '059669' },
      { token: 'number', foreground: 'd97706' },
      { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
      { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
      { token: 'type', foreground: '0891b2' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0f172a',
      'editor.lineHighlightBackground': '#f8fafc',
      'editorLineNumber.foreground': '#cbd5e1',
      'editorLineNumber.activeForeground': '#6366f1',
      'editor.selectionBackground': '#6366f122',
      'editorCursor.foreground': '#6366f1',
      'editorGutter.background': '#ffffff',
      'editorWidget.background': '#f8fafc',
      'editorWidget.border': '#e2e8f0',
    },
  },
};

/** Map app theme ID → Monaco theme name */
function getMonacoThemeId(appTheme: string): string {
  switch (appTheme) {
    case 'light':       return 'pp-light';
    case 'dark':        return 'pp-midnight';
    case 'dracula':     return 'pp-dracula';
    case 'nord':        return 'pp-nord';
    case 'monokai':     return 'pp-monokai';
    case 'synthwave':   return 'pp-synthwave';
    case 'github-dark': return 'pp-github-dark';
    default:            return 'pp-midnight';
  }
}

export const MonacoPreview = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const pipelineState = useAppSelector((state) => state.pipeline.present);
  const theme = useAppSelector((state) => state.ui.theme);
  const [themesRegistered, setThemesRegistered] = useState(false);

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

  // Register all custom themes on editor mount
  const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    // Register all custom themes
    for (const [name, def] of Object.entries(MONACO_THEMES)) {
      monaco.editor.defineTheme(name, def);
    }
    setThemesRegistered(true);

    // Apply current theme immediately
    const monacoTheme = getMonacoThemeId(theme);
    monaco.editor.setTheme(monacoTheme);
  };

  // Switch Monaco theme when app theme changes
  useEffect(() => {
    if (monacoRef.current && themesRegistered) {
      const monacoTheme = getMonacoThemeId(theme);
      monacoRef.current.editor.setTheme(monacoTheme);
    }
  }, [theme, themesRegistered]);

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
          theme={themesRegistered ? getMonacoThemeId(theme) : (theme === 'light' ? 'vs' : 'vs-dark')}
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
