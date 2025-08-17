import { LanguageConfig } from '@/types';

export const LANGUAGES: LanguageConfig[] = [
  {
    name: 'Python',
    pistonLanguage: 'python',
    monacoLanguage: 'python',
    defaultCode: `def solve():
    # Your code here
    pass`,
  },
  {
    name: 'JavaScript',
    pistonLanguage: 'javascript',
    monacoLanguage: 'javascript',
    defaultCode: `function solve() {
    // Your code here
}`,
  },
  {
    name: 'C++',
    pistonLanguage: 'cpp',
    monacoLanguage: 'cpp',
    defaultCode: `// C++
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int solve() {
    // Your code here
    return 0;
}`,
  },
  {
    name: 'Java',
    pistonLanguage: 'java',
    monacoLanguage: 'java',
    defaultCode: `public class Solution {
    public static int solve() {
        // Your code here
        return 0;
    }
}`,
  },
];
