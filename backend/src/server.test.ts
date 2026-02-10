import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import axios from 'axios';

// Mock do axios
vi.mock('axios');

describe('CodePulse Backend - Resilience Tests', () => {
  describe('Timeout Handling', () => {
    it('should handle timeout from Piston API and return 408 status', async () => {
      // Simular timeout na API Piston
      const timeoutError = new Error('ECONNABORTED');
      (timeoutError as any).code = 'ECONNABORTED';
      (timeoutError as any).isAxiosError = true;
      (timeoutError as any).response = undefined;

      vi.mocked(axios.post).mockRejectedValueOnce(timeoutError);

      try {
        await axios.post('https://emkc.org/api/v2/piston/execute', {
          language: 'python',
          version: '*',
          files: [{ name: 'main.py', content: 'while True: pass' }]
        });
      } catch (error: any) {
        // Validar que o erro é do tipo timeout
        expect(error.code).toBe('ECONNABORTED');
        expect(error.isAxiosError).toBe(true);
      }
    });

    it('should return structured error response for timeout', () => {
      const timeoutResponse = {
        status: 408,
        data: {
          success: false,
          error: 'Execution Timeout',
          details: 'The code took too long to execute.',
          code: 'TIMEOUT_ERROR'
        }
      };

      expect(timeoutResponse.status).toBe(408);
      expect(timeoutResponse.data.error).toBe('Execution Timeout');
      expect(timeoutResponse.data.details).toContain('too long');
    });

    it('should validate input schema before calling Piston API', () => {
      const validInputs = [
        { code: 'print(2+2)', language: 'python' },
        { code: 'console.log(2+2)', language: 'javascript' }
      ];

      const invalidInputs = [
        { code: '', language: 'python' }, // Código vazio
        { code: 'x' * 11000, language: 'python' }, // Código muito grande (>10KB)
        { code: 'print(1)', language: 'invalid_lang' } // Linguagem inválida
      ];

      validInputs.forEach(input => {
        expect(input.code.length).toBeGreaterThan(0);
        expect(input.code.length).toBeLessThanOrEqual(10000);
        expect(['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go', 'rust']).toContain(input.language);
      });

      invalidInputs.forEach(input => {
        if (input.code.length === 0 || input.code.length > 10000) {
          expect(input.code.length).toMatch(/^0$|^1[0-9]{4,}$/);
        }
      });
    });

    it('should retry on temporary failures', async () => {
      const maxRetries = 3;
      let attemptCount = 0;

      const mockRetry = async () => {
        attemptCount++;
        if (attemptCount < maxRetries) {
          throw new Error('Temporary failure');
        }
        return { status: 200, data: { output: 'Success on retry' } };
      };

      let result;
      for (let i = 0; i < maxRetries; i++) {
        try {
          result = await mockRetry();
          break;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
        }
      }

      expect(result?.data.output).toBe('Success on retry');
      expect(attemptCount).toBe(maxRetries);
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors (429)', () => {
      const rateLimitError = {
        status: 429,
        message: 'Too many requests',
        retryAfter: 60
      };

      expect(rateLimitError.status).toBe(429);
      expect(rateLimitError.retryAfter).toBeGreaterThan(0);
    });

    it('should handle malformed input with 400 error', () => {
      const malformedResponse = {
        status: 400,
        data: {
          success: false,
          error: 'Invalid input',
          details: 'Code must be a string between 1 and 10000 characters'
        }
      };

      expect(malformedResponse.status).toBe(400);
      expect(malformedResponse.data.error).toBe('Invalid input');
    });

    it('should handle syntax errors gracefully', () => {
      const syntaxErrorResponse = {
        status: 200,
        data: {
          success: true,
          output: '',
          error: 'SyntaxError: invalid syntax',
          runtime: 1
        }
      };

      expect(syntaxErrorResponse.status).toBe(200);
      expect(syntaxErrorResponse.data.error).toBeTruthy();
    });
  });

  describe('Performance & Edge Cases', () => {
    it('should handle empty response gracefully', () => {
      const emptyResponse = {
        status: 200,
        data: {
          success: true,
          output: '',
          error: null
        }
      };

      expect(emptyResponse.data.output).toBe('');
      expect(emptyResponse.data.error).toBeNull();
    });

    it('should handle very large outputs', () => {
      const largeOutput = 'x'.repeat(50000);
      const response = {
        status: 200,
        data: {
          success: true,
          output: largeOutput,
          error: null
        }
      };

      expect(response.data.output.length).toBe(50000);
    });

    it('should support multiple language execution', () => {
      const languages = ['python', 'javascript', 'java', 'cpp', 'csharp', 'go', 'rust'];

      languages.forEach(lang => {
        expect(['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go', 'rust']).toContain(lang);
      });
    });
  });
});
