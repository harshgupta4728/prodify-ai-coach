import React, { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
};

interface EditorPrefs {
  fontSize: number;
  tabSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
}

// Saved from Settings > Code Editor Preferences
const loadEditorPrefs = (): Partial<EditorPrefs> => {
  try {
    return JSON.parse(localStorage.getItem('prodify-editor-prefs') || '{}');
  } catch {
    return {};
  }
};

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  // Keyboard shortcuts: Ctrl/Cmd+Enter runs, Ctrl/Cmd+Shift+Enter submits
  onRun?: () => void;
  onSubmit?: () => void;
}

export const CodeEditor = ({ language, value, onChange, readOnly = false, height = '350px', onRun, onSubmit }: CodeEditorProps) => {
  const monacoLang = MONACO_LANGUAGE_MAP[language] || 'plaintext';
  const prefs = loadEditorPrefs();

  // The shortcuts are registered once on mount, so they call the latest handlers through refs
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  useEffect(() => {
    runRef.current = onRun;
    submitRef.current = onSubmit;
  }, [onRun, onSubmit]);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => submitRef.current?.());
  };

  return (
    <div className="border rounded-lg overflow-hidden h-full" style={{ minHeight: '200px' }}>
      <Editor
        height={height === '100%' ? '100%' : height}
        language={monacoLang}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleMount}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
              <p className="text-sm">Loading editor...</p>
            </div>
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: prefs.minimap ?? false },
          fontSize: prefs.fontSize ?? 14,
          tabSize: prefs.tabSize ?? (language === 'python' ? 4 : 2),
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
          lineNumbers: prefs.lineNumbers === false ? 'off' : 'on',
          roundedSelection: false,
          cursorStyle: 'line',
          wordWrap: prefs.wordWrap === false ? 'off' : 'on',
        }}
      />
    </div>
  );
};
