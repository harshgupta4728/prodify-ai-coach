import { useState, useCallback } from 'react';
import { apiService } from '@/lib/api';

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

interface UseCodeExecutionOptions {
  examples: Array<{ input: string; output: string }>;
}

export const useCodeExecution = ({ examples }: UseCodeExecutionOptions) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [compileOutput, setCompileOutput] = useState('');
  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const clearOutput = useCallback(() => {
    setStdout('');
    setStderr('');
    setExitCode(null);
    setCompileOutput('');
    setTestCaseResults([]);
    setError(null);
    setIsTimeout(false);
  }, []);

  const runCode = useCallback(async (code: string, language: string, stdin: string) => {
    setIsRunning(true);
    setError(null);
    setTestCaseResults([]);
    setIsTimeout(false);

    try {
      const result = await apiService.executeCode({ language, code, stdin });

      if (!result.success) {
        setError(result.error || 'Execution failed');
        setStdout('');
        setStderr('');
        setExitCode(null);
        return;
      }

      // Check for compile errors
      if (result.compile && result.compile.code !== 0 && result.compile.stderr) {
        setCompileOutput(result.compile.stderr);
        setStdout('');
        setStderr(result.compile.stderr);
        setExitCode(result.compile.code);
        return;
      }

      setCompileOutput('');
      setStdout(result.run.stdout || '');
      setStderr(result.run.stderr || '');
      setExitCode(result.run.code);
      setIsTimeout(result.isTimeout || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute code');
      setStdout('');
      setStderr('');
      setExitCode(null);
    } finally {
      setIsRunning(false);
    }
  }, []);

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

    const results: TestCaseResult[] = [];

    try {
      for (const example of examples) {
        const result = await apiService.executeCode({
          language,
          code,
          stdin: example.input,
        });

        if (!result.success) {
          results.push({
            input: example.input,
            expectedOutput: example.output,
            actualOutput: result.error || 'Execution failed',
            passed: false,
          });
          continue;
        }

        // Check compile error
        if (result.compile && result.compile.code !== 0 && result.compile.stderr) {
          results.push({
            input: example.input,
            expectedOutput: example.output,
            actualOutput: `Compilation Error:\n${result.compile.stderr}`,
            passed: false,
          });
          // Stop on compile error — same code won't compile for other cases
          break;
        }

        const actualOutput = (result.run.stdout || '').trim();
        const expectedOutput = (example.output || '').trim();
        const passed = actualOutput === expectedOutput;

        results.push({
          input: example.input,
          expectedOutput: example.output,
          actualOutput: result.run.stdout || '',
          passed,
        });
      }

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
    runCode,
    submitCode,
    clearOutput,
  };
};
