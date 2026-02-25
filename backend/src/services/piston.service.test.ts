import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Judge0Service } from './judge0.service';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('Judge0Service (Judge0 CE)', () => {
  let service: Judge0Service;

  beforeEach(() => {
    service = new Judge0Service();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize without errors', () => {
      expect(() => new Judge0Service()).not.toThrow();
    });
  });

  describe('getLanguageId', () => {
    it('should return correct id for JavaScript', () => {
      expect(service['getLanguageId']('javascript')).toBe(63);
    });

    it('should return correct id for Python', () => {
      expect(service['getLanguageId']('python')).toBe(71);
    });

    it('should throw error for unsupported language', () => {
      expect(() => service['getLanguageId']('unsupported')).toThrow('Unsupported language: unsupported');
    });
  });

  describe('executeCode', () => {
    it('should execute code successfully', async () => {
      const mockResponse = {
        stdout: 'Hello, World!\n',
        stderr: '',
        compile_output: null,
        exit_code: 0,
        status: {
          id: 3,
          description: 'Accepted'
        },
        token: 'test-token',
        time: '0.001',
        memory: 380
      };

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'test-token' } });
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await service.executeCode('console.log("Hello, World!")', 'javascript');
      expect(result.output).toBe('Hello, World!\n');
      expect(result.error).toBeNull();
    });

    it('should handle execution errors', async () => {
      const mockResponse = {
        stdout: '',
        stderr: 'SyntaxError: Unexpected token',
        compile_output: null,
        exit_code: 1,
        status: {
          id: 6,
          description: 'Compilation Error'
        },
        token: 'test-token',
        time: '0.001',
        memory: 380
      };

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'test-token' } });
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await service.executeCode('invalid code', 'javascript');
      expect(result.output).toBe('');
      expect(result.error).toBe('SyntaxError: Unexpected token');
    });

    it('should handle code with stdin', async () => {
      const mockResponse = {
        stdout: '42\n',
        stderr: '',
        compile_output: null,
        exit_code: 0,
        status: {
          id: 3,
          description: 'Accepted'
        },
        token: 'test-token',
        time: '0.001',
        memory: 380
      };

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'test-token' } });
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse });

      const result = await service.executeCode('print(int(input()) + int(input()))', 'python', '10\n32');
      expect(result.output).toBe('42\n');
      expect(result.error).toBeNull();
    });
  });

  describe('executeWithQA', () => {
    it('should execute code with test cases and return QA results', async () => {
      const mockResponse = {
        stdout: '42\n',
        stderr: '',
        compile_output: null,
        exit_code: 0,
        status: {
          id: 3,
          description: 'Accepted'
        },
        token: 'test-token',
        time: '0.001',
        memory: 380
      };

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'test-token' } });
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse });

      const testCases = [
        { input: '10\n32', expected: '42' }
      ];

      const result = await service.executeWithQA(
        'print(int(input()) + int(input()))',
        'python',
        testCases
      );

      expect(result.passed).toBe(true);
      expect(result.tests).toHaveLength(1);
      expect(result.tests[0]).toEqual({
        input: '10\n32',
        expected: '42',
        actual: '42',
        status: 'passed'
      });
    });

    it('should handle failed test cases', async () => {
      const mockResponse = {
        stdout: '40\n',
        stderr: '',
        compile_output: null,
        exit_code: 0,
        status: {
          id: 3,
          description: 'Accepted'
        },
        token: 'test-token',
        time: '0.001',
        memory: 380
      };

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'test-token' } });
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse });

      const testCases = [
        { input: '10\n32', expected: '42' }
      ];

      const result = await service.executeWithQA(
        'print(int(input()) + int(input()))',
        'python',
        testCases
      );

      expect(result.passed).toBe(false);
      expect(result.tests).toHaveLength(1);
      expect(result.tests[0]).toEqual({
        input: '10\n32',
        expected: '42',
        actual: '40',
        status: 'failed'
      });
    });

    it('should handle multiple test cases', async () => {
      const mockResponses = [
        {
          stdout: '42\n',
          stderr: '',
          compile_output: null,
          exit_code: 0,
          status: { id: 3, description: 'Accepted' },
          token: 'test-token',
          time: '0.001',
          memory: 380
        },
        {
          stdout: '100\n',
          stderr: '',
          compile_output: null,
          exit_code: 0,
          status: { id: 3, description: 'Accepted' },
          token: 'test-token',
          time: '0.001',
          memory: 380
        },
        {
          stdout: '0\n',
          stderr: '',
          compile_output: null,
          exit_code: 0,
          status: { id: 3, description: 'Accepted' },
          token: 'test-token',
          time: '0.001',
          memory: 380
        }
      ];

      vi.mocked(axios.post)
        .mockResolvedValueOnce({ data: { token: 'test-token-1' } })
        .mockResolvedValueOnce({ data: { token: 'test-token-2' } })
        .mockResolvedValueOnce({ data: { token: 'test-token-3' } });

      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: mockResponses[0] })
        .mockResolvedValueOnce({ data: mockResponses[1] })
        .mockResolvedValueOnce({ data: mockResponses[2] });

      const testCases = [
        { input: '10\n32', expected: '42' },
        { input: '50\n50', expected: '100' },
        { input: '0\n0', expected: '0' }
      ];

      const result = await service.executeWithQA(
        'print(int(input()) + int(input()))',
        'python',
        testCases
      );

      expect(result.passed).toBe(true);
      expect(result.tests).toHaveLength(3);
    });
  });
});
