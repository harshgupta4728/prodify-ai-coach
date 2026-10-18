import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Terminal } from 'lucide-react';
import type { RunInfo, TestCaseResult } from '@/hooks/useCodeExecution';

interface CodeOutputProps {
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number | null;
  isRunning: boolean;
  isTimeout: boolean;
  error: string | null;
  testCaseResults: TestCaseResult[];
  runInfo?: RunInfo | null;
  customInput: string;
  onCustomInputChange: (input: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CodeOutput = ({
  stdout,
  stderr,
  compileOutput,
  exitCode,
  isRunning,
  isTimeout,
  error,
  testCaseResults,
  runInfo,
  customInput,
  onCustomInputChange,
  activeTab,
  onTabChange,
}: CodeOutputProps) => {
  const passedCount = testCaseResults.filter((r) => r.passed).length;
  const totalCount = testCaseResults.length;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2 shrink-0">
        <TabsTrigger value="output" className="text-xs gap-1 data-[state=active]:bg-muted">
          <Terminal className="h-3 w-3" />
          Output
        </TabsTrigger>
        <TabsTrigger value="testcases" className="text-xs gap-1 data-[state=active]:bg-muted">
          {totalCount > 0 && (
            <span className={passedCount === totalCount ? 'text-green-500' : 'text-red-500'}>
              {passedCount}/{totalCount}
            </span>
          )}
          Test Cases
        </TabsTrigger>
        <TabsTrigger value="input" className="text-xs gap-1 data-[state=active]:bg-muted">
          Custom Input{customInput.trim() ? ' •' : ''}
        </TabsTrigger>
      </TabsList>

      {/* Output Tab */}
      <TabsContent value="output" className="flex-1 m-0 p-0 min-h-0">
        <div className="h-full bg-[#1e1e1e] p-3 overflow-auto font-mono text-xs">
          {isRunning ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running... (compiled languages can take up to half a minute)
            </div>
          ) : error ? (
            <div className="text-red-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : isTimeout ? (
            <div className="text-yellow-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Time Limit Exceeded - Your code took too long to execute.</span>
            </div>
          ) : compileOutput ? (
            <div>
              <div className="text-red-400 mb-1 font-semibold">Compilation Error:</div>
              <pre className="text-red-300 whitespace-pre-wrap">{compileOutput}</pre>
            </div>
          ) : stdout || stderr || runInfo ? (
            <div className="space-y-2">
              {runInfo && (
                <div className="space-y-0.5 text-gray-400 border-b border-gray-700 pb-2">
                  <div><span className="text-gray-500">{runInfo.label}:</span> <span className="text-gray-300 break-all">{runInfo.input || '(empty)'}</span></div>
                  {runInfo.expectedOutput !== undefined && (
                    <div><span className="text-gray-500">Expected:</span> <span className="text-gray-300 break-all">{runInfo.expectedOutput}</span></div>
                  )}
                </div>
              )}
              {stdout ? <pre className="text-green-400 whitespace-pre-wrap">{stdout}</pre> : !stderr && <div className="text-gray-500">(no output: did you print or return the answer?)</div>}
              {stderr && (
                <div>
                  <div className="text-red-400 mb-1 font-semibold">stderr:</div>
                  <pre className="text-red-300 whitespace-pre-wrap">{stderr}</pre>
                </div>
              )}
              {exitCode !== null && exitCode !== 0 && (
                <div className="text-yellow-400">Exit code: {exitCode}</div>
              )}
              {runInfo?.passed !== undefined && (
                <div className={runInfo.passed ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                  {runInfo.passed ? '✓ Matches the expected output. Click Submit to check all examples.' : '✗ Doesn\'t match the expected output yet.'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 space-y-1">
              <div>Click Run to try your code on Example 1 (Ctrl+Enter).</div>
              <div>Submit checks every example (Ctrl+Shift+Enter).</div>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Test Cases Tab */}
      <TabsContent value="testcases" className="flex-1 m-0 p-0 min-h-0">
        <div className="h-full bg-[#1e1e1e] p-3 overflow-auto text-xs">
          {isRunning ? (
            <div className="flex items-center gap-2 text-gray-400 font-mono">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running test cases...
            </div>
          ) : testCaseResults.length === 0 ? (
            <div className="text-gray-500 font-mono">
              Click "Submit" to run your code against every example.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-mono">
                {passedCount === totalCount ? (
                  <span className="text-green-400 font-semibold">Accepted: all {totalCount} test cases passed!</span>
                ) : (
                  <span className="text-red-400 font-semibold">
                    {passedCount}/{totalCount} test cases passed
                  </span>
                )}
              </div>
              {testCaseResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${
                    result.passed
                      ? 'border-green-800 bg-green-950/30'
                      : 'border-red-800 bg-red-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 font-mono">
                    {result.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                      Test Case {index + 1}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono">
                    <div>
                      <span className="text-gray-400">Input: </span>
                      <span className="text-gray-300 break-all">{result.input}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Expected: </span>
                      <span className="text-gray-300 break-all">{result.expectedOutput}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Output: </span>
                      <span className={`whitespace-pre-wrap break-all ${result.passed ? 'text-green-300' : 'text-red-300'}`}>
                        {result.actualOutput.trim() || '(empty)'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      {/* Custom Input Tab */}
      <TabsContent value="input" className="flex-1 m-0 p-0 min-h-0">
        <div className="h-full bg-[#1e1e1e] p-3 flex flex-col gap-2">
          <Textarea
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            placeholder="Your own input for Run, in the same format as the examples (e.g. nums = [1,2,3], target = 4). Leave empty to run Example 1."
            className="flex-1 min-h-[60px] bg-transparent text-gray-300 border-gray-700 font-mono text-xs resize-none placeholder:text-gray-600"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
