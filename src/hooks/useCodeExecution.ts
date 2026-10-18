import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { outputsMatch } from '@/lib/starterCode';

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

// What the last "Run" used as input, and how its output compares to that example's answer
export interface RunInfo {
  label: string;
  input: string;
  expectedOutput?: string;
  passed?: boolean;
}

interface UseCodeExecutionOptions {
  examples: Array<{ input: string; output: string }>;
}

const compileErrorOf = (result: any): string | null =>
  result.compile && result.compile.code !== 0 && result.compile.stderr ? result.compile.stderr : null;

export const useCodeExecution = ({ examples }: UseCodeExecutionOptions) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [compileOutput, setCompileOutput] = useState('');
  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [runInfo, setRunInfo] = useState<RunInfo | null>(null);

  const clearOutput = useCallback(() => {
    setStdout('');
    setStderr('');
    setExitCode(null);
    setCompileOutput('');
    setTestCaseResults([]);
    setError(null);
    setIsTimeout(false);
    setRunInfo(null);
  }, []);

  // Runs once with the user's own input, or with Example 1 when that box is empty
  const runCode = useCallback(async (code: string, language: string, customInput: string) => {
    const useExample = !customInput.trim() && examples.length > 0;
    const stdin = useExample ? examples[0].input : customInput;
    const info: RunInfo = useExample
      ? { label: 'Example 1', input: examples[0].input, expectedOutput: examples[0].output }
      : { label: 'Custom input', input: customInput };

    setIsRunning(true);
    setError(null);
    setTestCaseResults([]);
    setIsTimeout(false);
    setCompileOutput('');
    setRunInfo(info);

    try {
      const result = await apiService.executeCode({ language, code, stdin });

      if (!result.success) {
        setError(result.error || 'Execution failed');
        setStdout('');
        setStderr('');
        setExitCode(null);
        return;
      }

      const compileError = compileErrorOf(result);
      if (compileError) {
        setCompileOutput(compileError);
        setStdout('');
        setStderr(compileError);
        setExitCode(result.compile.code);
        return;
      }

      const output = result.run.stdout || '';
      setStdout(output);
      setStderr(result.run.stderr || '');
      setExitCode(result.run.code);
      setIsTimeout(result.isTimeout || false);
      if (info.expectedOutput !== undefined) {
        setRunInfo({ ...info, passed: outputsMatch(output, info.expectedOutput) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code');
      setStdout('');
      setStderr('');
      setExitCode(null);
    } finally {
      setIsRunning(false);
    }
  }, [examples]);

  // Runs every example at once and compares each output with the expected answer
  const submitCode = useCallback(async (code: string, language: string) => {
    if (!examples || examples.length === 0) {
      setError('No test cases available for this problem.');
      return;
    }

    setIsRunning(true);
    setError(null);
    setStdout('');
    setStderr('');
    setIsTimeout(false);
    setCompileOutput('');
    setRunInfo(null);

    try {
      const results = await Promise.all(examples.map(async (example): Promise<TestCaseResult> => {
        const base = { input: example.input, expectedOutput: example.output };
        try {
          const result = await apiService.executeCode({ language, code, stdin: example.input });
          if (!result.success) {
            return { ...base, actualOutput: result.error || 'Execution failed', passed: false };
          }
          const compileError = compileErrorOf(result);
          if (compileError) {
            return { ...base, actualOutput: `Compilation Error:\n${compileError}`, passed: false };
          }
          const actualOutput = result.run.stdout || '';
          const runtimeError = !actualOutput.trim() && result.run.stderr ? `\n${result.run.stderr}` : '';
          return { ...base, actualOutput: actualOutput + runtimeError, passed: outputsMatch(actualOutput, example.output) };
        } catch (err) {
          return { ...base, actualOutput: err instanceof Error ? err.message : 'Execution failed', passed: false };
        }
      }));

      setTestCaseResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  }, [examples]);

  return {
    isRunning,
    stdout,
    stderr,
    exitCode,
    compileOutput,
    testCaseResults,
    error,
    isTimeout,
    runInfo,
    runCode,
    submitCode,
    clearOutput,
  };
};
