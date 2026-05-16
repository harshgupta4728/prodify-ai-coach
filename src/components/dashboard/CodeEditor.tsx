import React from 'react';
import Editor from '@monaco-editor/react';

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
};

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export const CodeEditor = ({ language, value, onChange, readOnly = false, height = '350px' }: CodeEditorProps) => {
  const monacoLang = MONACO_LANGUAGE_MAP[language] || 'plaintext';

  return (
    <div className="border rounded-lg overflow-hidden h-full" style={{ minHeight: '200px' }}>
      <Editor
        height={height === '100%' ? '100%' : height}
        language={monacoLang}
        value={value}
        onChange={(val) => onChange(val || '')}
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
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: language === 'python' ? 4 : 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12 },
          lineNumbers: 'on',
          roundedSelection: false,
          cursorStyle: 'line',
          wordWrap: 'on',
        }}
      />
    </div>
  );
};
