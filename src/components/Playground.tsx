'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeEditor from '@/components/CodeEditor';
import Timer from '@/components/Timer';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { LANGUAGES } from '@/config/languages';
import { Problem, TestResult, ExecutionResult, TestCase } from '@/types';
import { Play, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Split from 'split.js';

interface PlaygroundProps {
  problems: Problem[];
}

export default function Playground({ problems }: PlaygroundProps) {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(problems[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');
  
  const horizontalSplitRef = useRef<HTMLDivElement>(null);
  const verticalSplitRef = useRef<HTMLDivElement>(null);
  const splitInstanceRef = useRef<any>(null);
  const verticalSplitInstanceRef = useRef<any>(null);

  // Initialize code with problem's function signature when problem or language changes
  useEffect(() => {
    if (selectedLanguage.name === 'Python') {
      setCode(`${selectedProblem.functionSignature}
    # Your code here
    pass`);
    } else if (selectedLanguage.name === 'JavaScript') {
      // Convert Python signature to JavaScript
      const jsSignature = selectedProblem.functionSignature
        .replace('def ', 'function ')
        .replace(':', ' {');
      setCode(`${jsSignature}
    // Your code here
}`);
    } else {
      setCode(selectedLanguage.defaultCode);
    }
  }, [selectedLanguage, selectedProblem]);

  // Initialize Split.js
  useEffect(() => {
    if (horizontalSplitRef.current && !splitInstanceRef.current) {
      splitInstanceRef.current = Split(['#problem-panel', '#editor-panel'], {
        sizes: [33, 67],
        minSize: [300, 400],
        gutterSize: 8,
        cursor: 'col-resize',
      });
    }

    if (verticalSplitRef.current && !verticalSplitInstanceRef.current) {
      verticalSplitInstanceRef.current = Split(['#editor-container', '#results-container'], {
        direction: 'vertical',
        sizes: [60, 40],
        minSize: [200, 150],
        gutterSize: 8,
        cursor: 'row-resize',
      });
    }

    return () => {
      if (splitInstanceRef.current) {
        splitInstanceRef.current.destroy();
        splitInstanceRef.current = null;
      }
      if (verticalSplitInstanceRef.current) {
        verticalSplitInstanceRef.current.destroy();
        verticalSplitInstanceRef.current = null;
      }
    };
  }, []);

  const executeCode = async (testCases?: TestCase[], isSubmit = false) => {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedLanguage.pistonLanguage,
          testCases,
          isSubmit,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Execution error:', error);
      return {
        stdout: '',
        stderr: 'Failed to execute code',
        exitCode: 1,
        runtime: 0,
      };
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    const result = await executeCode(selectedProblem.testCases, false);
    
    if (result.testResults) {
      // Convert API test results to our TestResult format
      const convertedResults: TestResult[] = result.testResults.map((apiResult: any, index: number) => ({
        testCase: selectedProblem.testCases.slice(0, 3)[index],
        passed: apiResult.passed,
        actualOutput: apiResult.actual,
        executionTime: 0, // We don't track individual execution time anymore
      }));
      setTestResults(convertedResults);
      setOutput(`Executed first 3 test cases. Check "Test Cases" tab for results.`);
      setActiveTab('tests');
    } else {
      setOutput(result.stderr ? `Error: ${result.stderr}` : result.stdout);
      setActiveTab('output'); // Switch to output tab on error
    }
    
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await executeCode(selectedProblem.testCases, true);
    
    if (result.testResults) {
      // Convert API test results to our TestResult format
      const convertedResults: TestResult[] = result.testResults.map((apiResult: any, index: number) => ({
        testCase: selectedProblem.testCases[index],
        passed: apiResult.passed,
        actualOutput: apiResult.actual,
        executionTime: 0,
      }));
      setTestResults(convertedResults);
      setOutput(`Executed all ${selectedProblem.testCases.length} test cases. Check "Test Cases" tab for results.`);
      setActiveTab('tests');
    } else {
      setOutput(result.stderr ? `Error: ${result.stderr}` : result.stdout);
      setActiveTab('output'); // Switch to output tab on error
    }
    
    setIsSubmitting(false);
  };

  const handleReset = () => {
    // Reset to the function signature for the current problem
    if (selectedLanguage.name === 'Python') {
      setCode(`${selectedProblem.functionSignature}
    # Your code here
    pass`);
    } else if (selectedLanguage.name === 'JavaScript') {
      const jsSignature = selectedProblem.functionSignature
        .replace('def ', 'function ')
        .replace(':', ' {');
      setCode(`${jsSignature}
    // Your code here
}`);
    } else {
      setCode(selectedLanguage.defaultCode);
    }
    setOutput('');
    setTestResults([]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground" ref={horizontalSplitRef}>
      {/* Left Panel - Problem Description */}
      <div id="problem-panel" className="border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Select
            value={selectedProblem.id}
            onValueChange={(value) => {
              const problem = problems.find(p => p.id === value);
              if (problem) setSelectedProblem(problem);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {problems.map((problem) => (
                <SelectItem key={problem.id} value={problem.id}>
                  {problem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{selectedProblem.title}</h2>
          
          <div className="mb-6">
            <MarkdownRenderer content={selectedProblem.description} />
          </div>
          
          <h3 className="font-semibold mb-2">Examples:</h3>
          <div className="space-y-2">
            {selectedProblem.testCases.slice(0, 2).map((testCase, index) => (
              <div key={index} className="bg-muted p-3 rounded-md">
                <div className="text-sm">
                  <div><strong>Input:</strong> {testCase.input}</div>
                  <div><strong>Expected:</strong> {testCase.expected}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Editor and Results */}
      <div id="editor-panel" className="flex flex-col" ref={verticalSplitRef}>
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select
              value={selectedLanguage.name}
              onValueChange={(value) => {
                const language = LANGUAGES.find(l => l.name === value);
                if (language) setSelectedLanguage(language);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.name} value={language.name}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex space-x-2">
              <Button onClick={handleRun} disabled={isRunning} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          <Timer />
        </div>

        {/* Code Editor */}
        <div id="editor-container">
          <CodeEditor
            language={selectedLanguage.monacoLanguage}
            value={code}
            onChange={setCode}
          />
        </div>

        {/* Results Panel */}
        <div id="results-container" className="border-t border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="tests">Test Cases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="output" className="h-full p-4">
              <div className="h-full">
                <pre className="bg-muted p-4 rounded-md h-full overflow-auto font-mono text-sm">
                  {output || 'Click "Run" to see output...'}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="tests" className="h-full p-4">
              <div className="h-full overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-muted-foreground">Click "Run" or "Submit" to run test cases...</div>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md border ${
                          result.passed 
                            ? 'bg-green-900/20 border-green-500' 
                            : 'bg-red-900/20 border-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Test Case {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {result.executionTime}ms
                            </span>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Input:</strong> {result.testCase.input}</div>
                          <div><strong>Expected:</strong> {result.testCase.expected}</div>
                          <div><strong>Actual:</strong> {result.actualOutput || '(empty)'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
