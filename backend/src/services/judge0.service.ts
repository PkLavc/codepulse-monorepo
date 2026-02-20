import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface TestCase {
  input: string;
  expected: string;
}

interface Judge0Response {
  token: string;
  status: {
    id: number;
    description: string;
  };
}

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
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
  private readonly baseURL = 'https://judge0-ce.p.rapidapi.com';
  private readonly apiKey = process.env.JUDGE0_API_KEY;
  private readonly rapidAPIHost = 'judge0-ce.p.rapidapi.com';

  constructor() {
    if (!this.apiKey) {
      throw new Error('JUDGE0_API_KEY environment variable is required');
    }
  }

  /**
   * Maps language names to Judge0 language IDs
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
      'swift': 80,
      'kotlin': 78,
      'typescript': 74
    };

    const langId = languageMap[language.toLowerCase()];
    if (!langId) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return langId;
  }

  /**
   * Submits code to Judge0 for execution
   */
  private async submitCode(submission: Judge0Submission): Promise<string> {
    try {
      const response = await axios.post<Judge0Response>(
        `${this.baseURL}/submissions`,
        submission,
        {
          headers: {
            'X-RapidAPI-Key': this.apiKey,
            'X-RapidAPI-Host': this.rapidAPIHost,
            'Content-Type': 'application/json'
          },
          params: {
            base64_encoded: 'false',
            fields: '*'
          }
        }
      );

      return response.data.token;
    } catch (error) {
      throw new Error(`Failed to submit code to Judge0: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves the result of a submission
   */
  private async getSubmissionResult(token: string): Promise<{ stdout: string; stderr: string; status: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.rapidAPIHost
        },
        params: {
          base64_encoded: 'false',
          fields: 'stdout,stderr,status'
        }
      });

      const data = response.data;
      // Support both shapes: { status: { description: 'Finished' } } and { status: 'Finished' }
      const statusField = data.status;
      const statusStr = typeof statusField === 'string' ? statusField : (statusField?.description ?? 'Unknown');
      return {
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        status: statusStr
      };
    } catch (error) {
      throw new Error(`Failed to get submission result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Waits for submission to complete
   */
  private async waitForCompletion(token: string, maxAttempts: number = 30): Promise<{ stdout: string; stderr: string; status: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getSubmissionResult(token);
      
      if (result.status === 'Finished') {
        return result;
      } else if (result.status === 'In Queue' || result.status === 'Processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error(`Submission failed with status: ${result.status}`);
      }
    }

    throw new Error('Submission timed out');
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
        // Submit code with test case
        const submission: Judge0Submission = {
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expected,
          cpu_time_limit: 2000, // 2 seconds
          memory_limit: 268435456 // 256MB
        };

        const token = await this.submitCode(submission);
        const result = await this.waitForCompletion(token);

        const actualOutput = result.stdout.trim();
        const expectedOutput = testCase.expected.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          status: result.stderr ? 'error' : (passed ? 'passed' : 'failed')
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
      
      const submission: Judge0Submission = {
        source_code: code,
        language_id: languageId,
        stdin: stdin
      };

      const token = await this.submitCode(submission);
      const result = await this.waitForCompletion(token);

      return {
        output: result.stdout,
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
