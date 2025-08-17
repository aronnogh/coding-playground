import { TestCase } from '@/types';

export function wrapPythonCode(userCode: string, testCases: TestCase[]): string {
  const testHarness = `
import json
import ast

${userCode}

# Test harness
test_cases = ${JSON.stringify(testCases)}
results = []

for i, test_case in enumerate(test_cases):
    try:
        input_str = test_case["input"]
        expected = test_case["expected"]
        
        # Parse input based on function signature
        # For simple cases, try to evaluate as Python literal
        try:
            # Try to parse as list/tuple first
            if input_str.startswith('[') or input_str.startswith('('):
                args = [ast.literal_eval(input_str)]
            else:
                # Split on spaces and convert to appropriate types
                parts = input_str.strip().split()
                if len(parts) == 1:
                    # Single argument - try to convert to number or keep as string
                    arg = parts[0]
                    if arg.isdigit() or (arg.startswith('-') and arg[1:].isdigit()):
                        args = [int(arg)]
                    else:
                        try:
                            args = [float(arg)]
                        except:
                            args = [arg]  # Keep as string
                else:
                    # Multiple arguments - convert numbers
                    args = []
                    for part in parts:
                        if part.isdigit() or (part.startswith('-') and part[1:].isdigit()):
                            args.append(int(part))
                        else:
                            try:
                                args.append(float(part))
                            except:
                                args.append(part)
        except:
            # Fallback: treat as single string argument
            args = [input_str]
        
        # Call the user's solve function
        result = solve(*args)
        actual_output = str(result)
        
        results.append({
            "passed": actual_output.strip() == expected.strip(),
            "actual": actual_output.strip(),
            "expected": expected.strip(),
            "input": input_str
        })
        
    except Exception as e:
        results.append({
            "passed": False,
            "actual": f"Error: {str(e)}",
            "expected": expected,
            "input": input_str
        })

# Output results as JSON
print(json.dumps(results))
`;
  
  return testHarness;
}

export function wrapJavaScriptCode(userCode: string, testCases: TestCase[]): string {
  const testHarness = `
${userCode}

// Test harness
const testCases = ${JSON.stringify(testCases)};
const results = [];

for (let i = 0; i < testCases.length; i++) {
    try {
        const testCase = testCases[i];
        const inputStr = testCase.input;
        const expected = testCase.expected;
        
        // Parse input
        let args;
        if (inputStr.startsWith('[') || inputStr.startsWith('(')) {
            args = [JSON.parse(inputStr)];
        } else {
            const parts = inputStr.trim().split(' ');
            if (parts.length === 1) {
                const arg = parts[0];
                if (!isNaN(arg)) {
                    args = [Number(arg)];
                } else {
                    args = [arg];
                }
            } else {
                args = parts.map(part => {
                    if (!isNaN(part)) {
                        return Number(part);
                    }
                    return part;
                });
            }
        }
        
        // Call the user's solve function
        const result = solve(...args);
        const actualOutput = String(result);
        
        results.push({
            passed: actualOutput.trim() === expected.trim(),
            actual: actualOutput.trim(),
            expected: expected.trim(),
            input: inputStr
        });
        
    } catch (e) {
        results.push({
            passed: false,
            actual: \`Error: \${e.message}\`,
            expected: testCase.expected,
            input: testCase.input
        });
    }
}

// Output results as JSON
console.log(JSON.stringify(results));
`;

  return testHarness;
}

export function wrapCppCode(userCode: string, testCases: TestCase[]): string {
  // For C++, we'll keep it simpler for now - just wrap with main function
  const testHarness = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${userCode}

int main() {
    // Simple test execution for C++
    // This is a simplified version - in a real implementation,
    // you'd want more sophisticated parsing
    cout << solve() << endl;
    return 0;
}
`;
  
  return testHarness;
}

export function wrapJavaCode(userCode: string, testCases: TestCase[]): string {
  const testHarness = `
${userCode}

public class Main {
    public static void main(String[] args) {
        // Simple test execution for Java
        Solution solution = new Solution();
        System.out.println(solution.solve());
    }
}
`;

  return testHarness;
}

export function wrapCode(language: string, userCode: string, testCases: TestCase[]): string {
  switch (language) {
    case 'python':
      return wrapPythonCode(userCode, testCases);
    case 'javascript':
      return wrapJavaScriptCode(userCode, testCases);
    case 'cpp':
      return wrapCppCode(userCode, testCases);
    case 'java':
      return wrapJavaCode(userCode, testCases);
    default:
      return userCode;
  }
}
