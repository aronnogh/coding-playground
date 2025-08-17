import { NextRequest, NextResponse } from 'next/server';
import { wrapCode } from '@/utils/codeWrapper';
import { TestCase } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { code, language, testCases, isSubmit = false } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // If testCases are provided, wrap the code with test harness
    let executableCode = code;
    let isTestExecution = false;
    
    if (testCases && testCases.length > 0) {
      // For Run: use first 3 test cases, for Submit: use all test cases
      const casesToRun = isSubmit ? testCases : testCases.slice(0, 3);
      executableCode = wrapCode(language, code, casesToRun);
      isTestExecution = true;
    }

    const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [
          {
            name: 'main',
            content: executableCode,
          },
        ],
        stdin: '',
      }),
    });

    if (!pistonResponse.ok) {
      throw new Error(`Piston API error: ${pistonResponse.statusText}`);
    }

    const result = await pistonResponse.json();
    
    // Parse test results if this was a test execution
    if (isTestExecution && result.run.stdout) {
      try {
        const testResults = JSON.parse(result.run.stdout);
        return NextResponse.json({
          testResults,
          stdout: result.run.stdout,
          stderr: result.run.stderr || '',
          exitCode: result.run.code || 0,
          runtime: result.run.runtime || 0,
        });
      } catch (parseError) {
        // If parsing fails, return the raw output
        return NextResponse.json({
          stdout: result.run.stdout || '',
          stderr: result.run.stderr || 'Failed to parse test results',
          exitCode: result.run.code || 1,
          runtime: result.run.runtime || 0,
        });
      }
    }

    return NextResponse.json({
      stdout: result.run.stdout || '',
      stderr: result.run.stderr || '',
      exitCode: result.run.code || 0,
      runtime: result.run.runtime || 0,
    });
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
