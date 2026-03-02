import axios from 'axios';

/**
 * Piston API service for code execution
 */
export class Judge0Service {
  constructor() {
    this.baseURL = 'https://emkc.org/api/v2/piston';
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
   * Executes code using Piston API
   */
  async executeCode(code, language, stdin) {
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
   * Executes code with test cases and performs QA
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