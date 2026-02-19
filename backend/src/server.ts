import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { Judge0Service } from './services/judge0.service.js';

// Request/Response types
interface ExecuteRequest {
  code: string;
  language: string;
  testCases?: Array<{
    input: string;
    expected: string;
  }>;
}

interface ExecuteResponse {
  output: string;
  error: string | null;
  executionTime: number;
}

interface QAExecuteResponse {
  passed: boolean;
  tests: Array<{
    input: string;
    expected: string;
    actual: string;
    status: 'passed' | 'failed' | 'error';
  }>;
  executionTime: number;
}

// Validation schema
const executeSchema = z.object({
  code: z.string(),
  language: z.string(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string()
  })).optional()
});

// Initialize Fastify
const fastify = Fastify({ logger: true });

// Main async function to register plugins and start server
const start = async () => {
  // Register plugins
  await fastify.register(cors, { origin: true });
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  });

  // Routes
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  fastify.post<{ Body: ExecuteRequest; Reply: ExecuteResponse | QAExecuteResponse }>('/api/execute', async (request: FastifyRequest) => {
    try {
      const validated = executeSchema.parse(request.body);
      const startTime = Date.now();
      
      // Initialize Judge0 service
      const judge0Service = new Judge0Service();
      
      let result;
      
      if (validated.testCases && validated.testCases.length > 0) {
        // Execute with QA logic
        const qaResult = await judge0Service.executeWithQA(
          validated.code,
          validated.language,
          validated.testCases
        );
        
        
        result = {
          passed: qaResult.passed,
          tests: qaResult.tests,
          executionTime
        };
      } else {
        // Execute single code without test cases
        const codeResult = await judge0Service.executeCode(
          validated.code,
          validated.language
        );
        
        
        result = {
          output: codeResult.output,
          error: codeResult.error,
          executionTime
        };
      }
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - Date.now();
      
      if (error instanceof Error && error.message.includes('testCases')) {
        return {
          passed: false,
          tests: [],
          executionTime: 0
        };
      } else {
        return {
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        };
      }
    }
  });

  // Start server
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Start the server
start();

export default fastify;
