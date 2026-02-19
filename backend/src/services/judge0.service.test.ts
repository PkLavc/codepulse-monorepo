// Ensure required env exists before importing modules that read them
process.env.JUDGE0_API_HOST = process.env.JUDGE0_API_HOST ?? 'test-host';
process.env.JUDGE0_API_KEY = process.env.JUDGE0_API_KEY ?? 'test-key';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Judge0Service } from './judge0.service';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Judge0Service', () => {
  let service: Judge0Service;

  beforeEach(() => {
    // Set up environment variable
    process.env.JUDGE0_API_KEY = 'test-api-key';
    service = new Judge0Service();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if JUDGE0_API_KEY is not set', () => {
      delete process.env.JUDGE0_API_KEY;
      expect(() => new Judge0Service()).toThrow('JUDGE0_API_KEY environment variable is required');
    });
  });

  describe('getLanguageId', () => {
    it('should return correct language ID for JavaScript', () => {
      expect(service['getLanguageId']('javascript')).toBe(63);
    });

    it('should return correct language ID for Python', () => {
      expect(service['getLanguageId']('python')).toBe(71);
    });

    it('should throw error for unsupported language', () => {
      expect(() => service['getLanguageId']('unsupported')).toThrow('Unsupported language: unsupported');
    });
  });

  describe('executeCode', () => {
    it('should execute code successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token'
        }
      };

      const mockResult = {
        stdout: 'Hello, World!',
        stderr: '',
        status: 'Finished'
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResult });

      const result = await service.executeCode('console.log("Hello, World!")', 'javascript');

      expect(result.output).toBe('Hello, World!');
      expect(result.error).toBeNull();
    });

    it('should handle execution errors', async () => {
      const mockResponse = {
        data: {
          token: 'test-token'
        }
      };

      const mockResult = {
        stdout: '',
        stderr: 'SyntaxError: Unexpected token',
        status: 'Finished'
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResult });

      const result = await service.executeCode('invalid code', 'javascript');

      expect(result.output).toBe('');
      expect(result.error).toBe('SyntaxError: Unexpected token');
    });
  });

  describe('executeWithQA', () => {
    it('should execute code with test cases and return QA results', async () => {
      const mockResponse = {
        data: {
          token: 'test-token'
        }
      };

      const mockResult = {
        stdout: '42',
        stderr: '',
        status: 'Finished'
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResult });

      const testCases = [
        { input: '10 32', expected: '42' }
      ];

      const result = await service.executeWithQA(
        'console.log(parseInt(process.argv[2]) + parseInt(process.argv[3]))',
        'javascript',
        testCases
      );

      expect(result.passed).toBe(true);
      expect(result.tests).toHaveLength(1);
      expect(result.tests[0]).toEqual({
        input: '10 32',
        expected: '42',
        actual: '42',
        status: 'passed'
      });
    });

    it('should handle failed test cases', async () => {
      const mockResponse = {
        data: {
          token: 'test-token'
        }
      };

      const mockResult = {
        stdout: '40',
        stderr: '',
        status: 'Finished'
      };

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResult });

      const testCases = [
        { input: '10 32', expected: '42' }
      ];

      const result = await service.executeWithQA(
        'console.log(parseInt(process.argv[2]) + parseInt(process.argv[3]))',
        'javascript',
        testCases
      );

      expect(result.passed).toBe(false);
      expect(result.tests).toHaveLength(1);
      expect(result.tests[0]).toEqual({
        input: '10 32',
        expected: '42',
        actual: '40',
        status: 'failed'
      });
    });

    it('should handle multiple test cases', async () => {
      const mockResponse = {
        data: {
          token: 'test-token'
        }
      };

      const mockResults = [
        { stdout: '42', stderr: '', status: 'Finished' },
        { stdout: '100', stderr: '', status: 'Finished' },
        { stdout: '0', stderr: '', status: 'Finished' }
      ];

      vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);
      vi.mocked(axios.get).mockResolvedValue({ data: mockResults[0] });

      const testCases = [
        { input: '10 32', expected: '42' },
        { input: '50 50', expected: '100' },
        { input: '0 0', expected: '0' }
      ];

      const result = await service.executeWithQA(
        'console.log(parseInt(process.argv[2]) + parseInt(process.argv[3]))',
        'javascript',
        testCases
      );

      expect(result.passed).toBe(true);
      expect(result.tests).toHaveLength(3);
    });
  });
});