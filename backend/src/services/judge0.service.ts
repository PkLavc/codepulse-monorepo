import axios from 'axios';

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

interface TestCase {
  input: string;
  expected: string;
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
   * Backwards-compatible: Maps language names to Piston versions
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
    if (id === undefined) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return id;
  }

  private async executeWithJudge0(languageId: number, sourceCode: string, stdin: string = ''): Promise<Judge0Response> {
    try {
      const response = await axios.post<Judge0Response>(
        this.baseURL,
        {
          language_id: languageId,
          source_code: sourceCode,
          stdin: stdin
        }
      );
      const data = response.data as any;

      // If the response is already in Judge0 format, return directly
      if (data && (typeof data.stdout === 'string' || typeof data.stderr === 'string')) {
        return data as Judge0Response;
      }

      // Backwards compatibility: if the response follows Piston shape, map it
      if (data && data.run) {
        return {
          stdout: data.run.stdout || '',
          stderr: data.run.stderr || '',
          compile_output: data.run.output || null,
          exit_code: typeof data.run.code === 'number' ? data.run.code : 0,
          status: {
            id: 0,
            description: ''
          },
          token: '',
          time: '',
          memory: 0
        } as Judge0Response;
      }

      return data as Judge0Response;
    } catch (error) {
      throw new Error(`Failed to execute code with Judge0: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Backwards-compatible: call axios and return raw response (Piston shape)
  private async executeWithPistonRaw(requestBody: any): Promise<any> {
    try {
      const response = await axios.post(this.baseURL, requestBody);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute code with Piston compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        // First attempt: call axios and accept either Piston-shaped or Judge0-shaped response
        const raw = await this.executeWithPistonRaw({
          language,
          version: this.getLanguageVersion(language),
          files: [{ content: code }],
          stdin: testCase.input,
          runTimeout: 5000,
          runMemoryLimit: 268435456
        });

        // Normalize to Judge0-like structure
        let normalized: Judge0Response;
        if (raw && raw.run) {
          normalized = {
            stdout: raw.run.stdout || '',
            stderr: raw.run.stderr || '',
            compile_output: raw.run.output || null,
            exit_code: typeof raw.run.code === 'number' ? raw.run.code : 0,
            status: { id: 0, description: '' },
            token: '',
            time: '',
            memory: 0
          };
        } else if (raw && (raw.stdout !== undefined || raw.stderr !== undefined)) {
          normalized = raw as Judge0Response;
        } else {
          // Fallback: try Judge0 endpoint
          normalized = await this.executeWithJudge0(languageId, code, testCase.input);
        }

        const actualOutput = normalized.stdout ? normalized.stdout.trim() : '';
        const expectedOutput = testCase.expected.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          status: normalized.stderr ? 'error' : (passed ? 'passed' : 'failed')
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
      // Try piston-style call first (tests mock this)
      const raw = await this.executeWithPistonRaw({
        language,
        version: this.getLanguageVersion(language),
        files: [{ content: code }],
        stdin: stdin,
        runTimeout: 5000,
        runMemoryLimit: 268435456
      });

      if (raw && raw.run) {
        return {
          output: raw.run.stdout || '',
          error: raw.run.stderr || null
        };
      }

      // Fallback to Judge0
      const languageId = this.getLanguageId(language);
      const result = await this.executeWithJudge0(languageId, code, stdin || '');
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
