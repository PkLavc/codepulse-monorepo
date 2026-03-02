import axios from 'axios';

/**
 * Mock Piston API service for code execution (for testing when Judge0 CE is not available)
 */
export class MockJudge0Service {
  constructor() {
    this.baseURL = process.env.JUDGE0_BASE_URL || 'http://localhost:2358';
    // Force mock mode for now since we don't have Judge0 CE running
    this.useMock = true;
  }

  /**
   * Maps language names to Piston runtime names
   */
  getLanguageRuntime(language) {
    const languageMap = {
      'javascript': 'javascript',
      'node': 'javascript',
      'python': 'python',
      'python3': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'c++',
      'c++': 'c++',
      'csharp': 'csharp',
      'c#': 'csharp',
      'go': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'bash': 'bash',
      'sh': 'bash',
      'typescript': 'javascript',
      'ts': 'javascript'
    };

    const runtime = languageMap[language.toLowerCase()];
    if (!runtime) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return runtime;
  }

  /**
   * Executes code using mock responses (for testing)
   */
  async executeCode(code, language, stdin) {
    // Always use mock responses for now since we don't have Judge0 CE running
    return this.getMockResponse(code, language, stdin);
  }

  /**
   * Executes code using actual Judge0 CE server
   */
  async executeWithJudge0(code, language, stdin) {
    try {
      const runtime = this.getLanguageRuntime(language);

      const files = [
        {
          name: this.getFileName(runtime),
          content: code
        }
      ];

      const response = await axios.post(`${this.baseURL}/execute`, {
        language: runtime,
        files: files,
        stdin: stdin || '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      });

      const { run, compile } = response.data;

      // Check for compilation errors
      if (compile && compile.stderr) {
        return {
          output: '',
          error: compile.stderr
        };
      }

      // Check for runtime errors
      if (run.stderr) {
        return {
          output: run.stdout || '',
          error: run.stderr
        };
      }

      return {
        output: run.stdout || '',
        error: null
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Returns mock responses for testing
   */
  getMockResponse(code, language, stdin) {
    // Simple mock logic based on common patterns
    if (code.includes('console.log') || code.includes('print(')) {
      // Extract what would be printed (very basic parsing)
      const consoleMatch = code.match(/console\.log\(['"]([^'"]+)['"]\)/);
      const printMatch = code.match(/print\(['"]([^'"]+)['"]\)/);
      
      let output = '';
      if (consoleMatch) {
        output = consoleMatch[1];
      } else if (printMatch) {
        output = printMatch[1];
      } else {
        output = 'Mock execution completed';
      }
      
      return {
        output: output + '\n',
        error: null
      };
    }
    
    if (code.includes('error') || code.includes('throw')) {
      return {
        output: '',
        error: 'Mock runtime error: Something went wrong'
      };
    }

    return {
      output: 'Mock execution completed successfully\n',
      error: null
    };
  }

  /**
   * Executes code with test cases and performs QA using mock responses
   */
  async executeWithQA(code, language, testCases) {
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const result = await this.executeCode(code, language, testCase.input);

        const actualOutput = result.output ? result.output.trim() : '';
        const expectedOutput = testCase.expected.trim();
        const passed = actualOutput === expectedOutput;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          status: result.error ? 'error' : passed ? 'passed' : 'failed'
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
   * Gets the appropriate filename based on runtime
   */
  getFileName(runtime) {
    const extensions = {
      'javascript': 'main.js',
      'python': 'main.py',
      'java': 'Main.java',
      'c': 'main.c',
      'c++': 'main.cpp',
      'csharp': 'Main.cs',
      'go': 'main.go',
      'rust': 'main.rs',
      'php': 'main.php',
      'ruby': 'main.rb',
      'bash': 'main.sh'
    };
    return extensions[runtime] || 'main.txt';
  }
}