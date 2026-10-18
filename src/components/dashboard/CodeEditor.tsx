import { useEffect, useRef } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

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

// Editor chrome in the app's colours (the background is the --card token); syntax colours are VS Code's dark theme
const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('prodify-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: 'comment', foreground: '6b6b76', fontStyle: 'italic' }],
    colors: {
      'editor.background': '#111113',
      'editorGutter.background': '#111113',
      'editor.lineHighlightBackground': '#ffffff08',
      'editor.lineHighlightBorder': '#00000000',
      'editorLineNumber.foreground': '#4a4a52',
      'editorLineNumber.activeForeground': '#a1a1aa',
      'editorCursor.foreground': '#e4e4e7',
      'editor.selectionBackground': '#ffffff22',
      'editor.inactiveSelectionBackground': '#ffffff12',
      'editorIndentGuide.background1': '#ffffff0f',
      'editorIndentGuide.activeBackground1': '#ffffff26',
      'editorWidget.background': '#151518',
      'editorWidget.border': '#26262b',
      'editorSuggestWidget.background': '#151518',
      'editorSuggestWidget.border': '#26262b',
      'editorSuggestWidget.selectedBackground': '#232328',
      'scrollbarSlider.background': '#ffffff14',
      'scrollbarSlider.hoverBackground': '#ffffff24',
      'scrollbarSlider.activeBackground': '#ffffff30',
    },
  });
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
    // The web font may finish loading after the editor measured its characters
    document.fonts?.ready.then(() => monaco.editor.remeasureFonts());
  };

  return (
    <div className="h-full overflow-hidden bg-card" style={{ minHeight: '200px' }}>
      <Editor
        height={height === '100%' ? '100%' : height}
        language={monacoLang}
        value={value}
        onChange={(val) => onChange(val || '')}
        beforeMount={defineTheme}
        onMount={handleMount}
        theme="prodify-dark"
        loading={
          <div className="flex h-full items-center justify-center gap-2 bg-card text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading editor...
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: prefs.minimap ?? false },
          fontSize: prefs.fontSize ?? 14,
          fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
          tabSize: prefs.tabSize ?? (language === 'python' ? 4 : 2),
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
          lineNumbers: prefs.lineNumbers === false ? 'off' : 'on',
          roundedSelection: false,
          cursorStyle: 'line',
          wordWrap: prefs.wordWrap === false ? 'off' : 'on',
          renderLineHighlight: 'all',
          overviewRulerBorder: false,
        }}
      />
    </div>
  );
};
