import axios from 'axios';

interface TestCase {
  input: string;
  expected: string;
}

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: Array<{
    name?: string;
    content: string;
  }>;
  stdin?: string;
  args?: string[];
  compileTimeout?: number;
  runTimeout?: number;
  compileMemoryLimit?: number;
  runMemoryLimit?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
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
  private readonly baseURL = 'https://emkc.org/api/v2/piston/execute';

  constructor() {}

  /**
   * Maps language names to Piston versions
   */
  private getLanguageVersion(language: string): string {
    const languageMap: Record<string, string> = {
      'javascript': '18.15.0',
      'python': '3.10.0',
      'java': '15.0.2',
      'c': '11.2.0',
      'cpp': '11.2.0',
      'csharp': '6.12.0',
      'go': '1.19.5',
      'rust': '1.67.0',
      'php': '8.2.1',
      'ruby': '3.1.3',
      'swift': '5.7.1',
      'kotlin': '1.7.21',
      'typescript': '4.9.4'
    };

    const version = languageMap[language.toLowerCase()];
    if (!version) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return version;
  }

  /**
   * Executes code with Piston API
   */
  private async executeWithPiston(request: PistonExecuteRequest): Promise<PistonExecuteResponse> {
    try {
      const response = await axios.post<PistonExecuteResponse>(
        this.baseURL,
        request
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute code with Piston: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const version = this.getLanguageVersion(language);
    const results: QAServiceResponse['tests'] = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const request: PistonExecuteRequest = {
          language,
          version,
          files: [{
            content: code
          }],
          stdin: testCase.input,
          runTimeout: 5000,
          runMemoryLimit: 268435456
        };

        const result = await this.executeWithPiston(request);

        const actualOutput = result.run.stdout.trim();
        const expectedOutput = testCase.expected.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          status: result.run.stderr ? 'error' : (passed ? 'passed' : 'failed')
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
      const version = this.getLanguageVersion(language);
      
      const request: PistonExecuteRequest = {
        language,
        version,
        files: [{
          content: code
        }],
        stdin: stdin,
        runTimeout: 5000,
        runMemoryLimit: 268435456
      };

      const result = await this.executeWithPiston(request);

      return {
        output: result.run.stdout,
        error: result.run.stderr || null
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
