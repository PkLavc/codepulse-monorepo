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
  private readonly baseURL = 'https://ce.judge0.com';

  constructor() {}

  /**
   * Maps language names to Judge0 CE language IDs
   */
  private getLanguageId(language: string): number {
    const languageMap: Record<string, number> = {
      'javascript': 63,
      'python': 71,
      'java': 62,
      'c': 50,
      'cpp': 54,
      'csharp': 51,
      'go': 60,
      'rust': 73,
      'php': 68,
      'ruby': 72,
      'bash': 46,
      'typescript': 74
    };
    const id = languageMap[language.toLowerCase()];
    if (!id) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return id;
  }

  /**
   * Polls Judge0 CE for submission result
   */
  private async pollResult(token: string, maxAttempts = 30): Promise<Judge0Response> {
    const delayMs = 500;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get<Judge0Response>(`${this.baseURL}/submissions/${token}`);
        const { status } = response.data;
        
        // Status codes: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit, etc.
        if (status.id > 2) {
          return response.data;
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        throw new Error(`Failed to poll Judge0: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    throw new Error('Submission timed out after polling for 15 seconds');
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
      const response = await axios.post<{ token: string }>(`${this.baseURL}/submissions`, {
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin
      });
      
      const token = response.data.token;
      const result = await this.pollResult(token);
      return result;
    } catch (error) {
      throw new Error(`Failed to execute code with Judge0: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
