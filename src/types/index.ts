export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  testCases: TestCase[];
  functionSignature: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
  executionTime: number;
}

export interface LanguageConfig {
  name: string;
  pistonLanguage: string;
  monacoLanguage: string;
  defaultCode: string;
}
