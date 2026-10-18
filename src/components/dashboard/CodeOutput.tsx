import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Terminal, ListChecks, Keyboard } from 'lucide-react';
import type { RunInfo, TestCaseResult } from '@/hooks/useCodeExecution';
import { cn } from '@/lib/utils';
import { TAB_STRIP, TAB_STRIP_TRIGGER } from '@/components/common/tabStrip';

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

const Label = ({ children }: { children: ReactNode }) => (
  <span className="text-muted-foreground">{children} </span>
);

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
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col bg-card">
      <TabsList className={TAB_STRIP}>
        <TabsTrigger value="output" className={TAB_STRIP_TRIGGER}>
          <Terminal className="h-3.5 w-3.5" />
          Output
        </TabsTrigger>
        <TabsTrigger value="testcases" className={TAB_STRIP_TRIGGER}>
          <ListChecks className="h-3.5 w-3.5" />
          {totalCount > 0 && (
            <span className={cn('font-mono', allPassed ? 'text-success' : 'text-destructive')}>
              {passedCount}/{totalCount}
            </span>
          )}
          Test Cases
        </TabsTrigger>
        <TabsTrigger value="input" className={TAB_STRIP_TRIGGER}>
          <Keyboard className="h-3.5 w-3.5" />
          Custom Input{customInput.trim() ? ' •' : ''}
        </TabsTrigger>
      </TabsList>

      {/* Output Tab */}
      <TabsContent value="output" className="flex-1 m-0 p-0 min-h-0">
        <div className="h-full p-3 overflow-auto font-mono text-xs leading-5">
          {isRunning ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running... (compiled languages can take up to half a minute)
            </div>
          ) : error ? (
            <div className="text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : isTimeout ? (
            <div className="text-warning flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Time Limit Exceeded - Your code took too long to execute.</span>
            </div>
          ) : compileOutput ? (
            <div>
              <div className="text-destructive mb-1 font-semibold">Compilation Error:</div>
              <pre className="text-destructive/90 whitespace-pre-wrap">{compileOutput}</pre>
            </div>
          ) : stdout || stderr || runInfo ? (
            <div className="space-y-2">
              {runInfo && (
                <div className="space-y-0.5 border-b pb-2">
                  <div><Label>{runInfo.label}:</Label><span className="break-all">{runInfo.input || '(empty)'}</span></div>
                  {runInfo.expectedOutput !== undefined && (
                    <div><Label>Expected:</Label><span className="break-all">{runInfo.expectedOutput}</span></div>
                  )}
                </div>
              )}
              {stdout ? <pre className="text-foreground whitespace-pre-wrap">{stdout}</pre> : !stderr && <div className="text-muted-foreground">(no output: did you print or return the answer?)</div>}
              {stderr && (
                <div>
                  <div className="text-destructive mb-1 font-semibold">stderr:</div>
                  <pre className="text-destructive/90 whitespace-pre-wrap">{stderr}</pre>
                </div>
              )}
              {exitCode !== null && exitCode !== 0 && (
                <div className="text-warning">Exit code: {exitCode}</div>
              )}
              {runInfo?.passed !== undefined && (
                <div className={cn('font-semibold', runInfo.passed ? 'text-success' : 'text-warning')}>
                  {runInfo.passed ? '✓ Matches the expected output. Click Submit to check all examples.' : '✗ Doesn\'t match the expected output yet.'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground space-y-1.5">
              <div>Run tries your code on Example 1 <kbd className="kbd ml-1">Ctrl</kbd> <kbd className="kbd">Enter</kbd></div>
              <div>Submit checks every example <kbd className="kbd ml-1">Ctrl</kbd> <kbd className="kbd">Shift</kbd> <kbd className="kbd">Enter</kbd></div>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Test Cases Tab */}
      <TabsContent value="testcases" className="flex-1 m-0 p-0 min-h-0">
        <div className="h-full p-3 overflow-auto font-mono text-xs leading-5">
          {isRunning ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running test cases...
            </div>
          ) : testCaseResults.length === 0 ? (
            <div className="text-muted-foreground">
              Click "Submit" to run your code against every example.
            </div>
          ) : (
            <div className="space-y-3">
              <div className={cn('font-semibold', allPassed ? 'text-success' : 'text-destructive')}>
                {allPassed ? `Accepted: all ${totalCount} test cases passed!` : `${passedCount}/${totalCount} test cases passed`}
              </div>
              {testCaseResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-md border p-3',
                    result.passed ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
                  )}
                >
                  <div className={cn('flex items-center gap-2 mb-2', result.passed ? 'text-success' : 'text-destructive')}>
                    {result.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    Test Case {index + 1}
                  </div>
                  <div className="space-y-0.5">
                    <div><Label>Input:</Label><span className="break-all">{result.input}</span></div>
                    <div><Label>Expected:</Label><span className="break-all">{result.expectedOutput}</span></div>
                    <div>
                      <Label>Output:</Label>
                      <span className={cn('whitespace-pre-wrap break-all', result.passed ? 'text-success' : 'text-destructive')}>
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
        <div className="h-full p-3 flex flex-col gap-2">
          <Textarea
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            placeholder="Your own input for Run, in the same format as the examples (e.g. nums = [1,2,3], target = 4). Leave empty to run Example 1."
            className="flex-1 min-h-[60px] bg-background font-mono text-xs resize-none"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
