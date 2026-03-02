import axios from 'axios';

/**
 * Piston API service for code execution (EMKC)
 */
export class PistonService {
  constructor() {
    this.baseURL = 'https://emkc.org/api/v2/piston';
    this.glotURL = 'https://glot.io/api/run';
    this.runtimes = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the service by fetching available runtimes
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      const response = await axios.get(`${this.baseURL}/runtimes`);
      const runtimes = response.data;
      
      // Build language to version mapping
      for (const runtime of runtimes) {
        const language = runtime.language.toLowerCase();
        if (!this.runtimes.has(language)) {
          this.runtimes.set(language, runtime.version);
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to fetch Piston runtimes:', error);
      // Fallback to hardcoded versions
      this.runtimes.set('javascript', '18.15.0');
      this.runtimes.set('python', '3.10.0');
      this.runtimes.set('java', '15.0.2');
      this.runtimes.set('c', '10.2.0');
      this.runtimes.set('cpp', '10.2.0');
      this.runtimes.set('csharp', '6.12.0');
      this.runtimes.set('go', '1.16.2');
      this.runtimes.set('rust', '1.50.0');
      this.runtimes.set('php', '8.0.3');
      this.runtimes.set('ruby', '3.0.0');
      this.runtimes.set('bash', '5.0.17');
      this.initialized = true;
    }
  }

  /**
   * Maps language names to Piston runtime names and versions
   */
  getLanguageRuntime(language) {
    const languageMap = {
      'javascript': 'javascript',
      'node': 'javascript',
      'python': 'python',
      'python3': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp',
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
    
    const version = this.runtimes.get(runtime);
    if (!version) {
      throw new Error(`No version found for language: ${runtime}`);
    }
    
    return { language: runtime, version };
  }

  /**
   * Executes code using Piston API
   */
  async executeCode(code, language, stdin = '') {
    await this.initialize();
    
    try {
      const { language: runtime, version } = this.getLanguageRuntime(language);

      console.log(`[Execution] Using Piston Community Mirror for ${language}...`);

      const response = await axios.post(`${this.baseURL}/execute`, {
        language: runtime,
        version: version,
        files: [
          {
            name: this.getFileName(runtime),
            content: code
          }
        ],
        stdin: stdin || ''
      });

      const { run } = response.data;

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
      console.error('Piston API error:', error.message);
      // Try Glot.io fallback for server errors (5xx)
      if (error.response && error.response.status >= 500) {
        console.log('[Piston] API server error, trying Glot.io fallback...');
        return this.executeWithGlot(code, language, stdin);
      }
      // For user errors (4xx), return the actual error
      return {
        output: '',
        error: error.response?.data?.message || error.message || 'API error'
      };
    }
  }

  /**
   * Executes code using Glot.io as fallback
   */
  async executeWithGlot(code, language, stdin = '') {
    try {
      console.log(`[Execution] Using Glot.io fallback for ${language}...`);
      
      // Map language names to Glot.io format
      const glotLanguage = this.getGlotLanguage(language);
      const glotVersion = this.getGlotVersion(language);
      
      const response = await axios.post(`${this.glotURL}/${glotLanguage}/${glotVersion}`, {
        files: [
          {
            name: 'main.js',
            content: code
          }
        ],
        stdin: stdin || ''
      });

      return {
        output: response.data.stdout || '',
        error: response.data.stderr || null
      };
    } catch (error) {
      console.error('Glot.io fallback error:', error.message);
      return {
        output: '',
        error: 'Both Piston and Glot.io services are unavailable'
      };
    }
  }

  /**
   * Maps language names to Glot.io format
   */
  getGlotLanguage(language) {
    const languageMap = {
      'javascript': 'javascript',
      'node': 'javascript',
      'python': 'python',
      'python3': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp',
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
    return languageMap[language.toLowerCase()] || 'javascript';
  }

  /**
   * Gets Glot.io version for language
   */
  getGlotVersion(language) {
    const versionMap = {
      'javascript': '18.15.0',
      'python': '3.10.0',
      'java': '15.0.2',
      'c': '10.2.0',
      'cpp': '10.2.0',
      'csharp': '6.12.0',
      'go': '1.16.2',
      'rust': '1.50.0',
      'php': '8.0.3',
      'ruby': '3.0.0',
      'bash': '5.0.17'
    };
    return versionMap[this.getGlotLanguage(language)] || '18.15.0';
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
      'cpp': 'main.cpp',
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
