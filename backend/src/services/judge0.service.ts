import axios from 'axios';

interface TestCase {
  input: string;
  expected: string;
}

interface Judge0Response {
  stdout: string;
  stderr: string;
  compile_output: string | null;
  exit_code: number;
  status: {
    id: number;
    description: string;
  };
  token: string;
  time: string;
  memory: number;
}

interface QAServiceResponse {
  passed: boolean;
  tests: Array<{
    input: string;
    expected: string;
    actual: string;
    status: 'passed' | 'failed' | 'error';
  }>;
}

export class Judge0Service {
  private readonly baseURL = 'https://ce.judge0.com/submissions';

  constructor() {}

  /**
   * Maps language names to Judge0 CE language IDs
   */
  private getLanguageId(language: string): number {
    const languageMap: Record<string, number> = {
      'javascript': 63,   // JavaScript (Node.js 12.14.0)
      'python': 71,       // Python (3.8.1)
      'java': 62,         // Java (OpenJDK 13.0.1)
      'c': 50,            // C (GCC 9.2.0)
      'cpp': 54,          // C++ (GCC 9.2.0)
      'csharp': 51,       // C# (Mono 6.6.0.161)
      'go': 60,           // Go (1.13.5)
      'rust': 73,         // Rust (1.40.0)
      'php': 68,          // PHP (7.4.1)
      'ruby': 72,         // Ruby (2.7.0)
      'bash': 46,         // Bash (5.0.0)
      'typescript': 74    // TypeScript (3.7.4)
    };
    const id = languageMap[language.toLowerCase()];
    if (!id) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return id;
  }

  /**
   * Executes code with Judge0 CE API
   */
  private async executeWithJudge0(
    languageId: number,
    sourceCode: string,
    stdin: string = ''
  ): Promise<Judge0Response> {
    try {
      const response = await axios.post<Judge0Response>(
        this.baseURL,
        {
          language_id: languageId,
          source_code: sourceCode,
          stdin: stdin
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to execute code with Judge0: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Executes code with test cases and performs QA
   */
  async executeWithQA(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<QAServiceResponse> {
    const languageId = this.getLanguageId(language);
    const results: QAServiceResponse['tests'] = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const result = await this.executeWithJudge0(
          languageId,
          code,
          testCase.input
        );
        const actualOutput = result.stdout ? result.stdout.trim() : '';
        const expectedOutput = testCase.expected.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          status: result.stderr ? 'error' : passed ? 'passed' : 'failed'
        });
      } catch (error) {
        allPassed = false;
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }

    return {
      passed: allPassed,
      tests: results
    };
  }

  /**
   * Executes single code without test cases (for backward compatibility)
   */
  async executeCode(
    code: string,
    language: string,
    stdin?: string
  ): Promise<{ output: string; error: string | null }> {
    try {
      const languageId = this.getLanguageId(language);
      const result = await this.executeWithJudge0(
        languageId,
        code,
        stdin || ''
      );

      return {
        output: result.stdout || '',
        error: result.stderr || null
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
