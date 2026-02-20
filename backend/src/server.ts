import Fastify, { FastifyRequest } from 'fastify';
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

// Corrected QAExecuteResponse interface
interface QAExecuteResponse {
  success: boolean;
  results: Array<{
    testId: number;
    status: 'passed' | 'failed';
    actual: string;
  }>;
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
  await fastify.register(cors, {
    origin: [
      'https://pklavc.github.io',
      'https://pklavc.github.io/',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://codepulse-api.vercel.app',
      'https://codepulse-backend.vercel.app',
      'https://codepulse-monorepo-backend.vercel.app'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  });
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
      
      // Initialize Judge0 service
      const judge0Service = new Judge0Service();
      
      // let executionTime = 0; // Removed: executionTime will be defined only for ExecuteResponse

      if (validated.testCases && validated.testCases.length > 0) {
        // Execute with QA logic
        const qaResult = await judge0Service.executeWithQA(
          validated.code,
          validated.language,
          validated.testCases
        );
        
        return { // Directly return QAExecuteResponse
          success: qaResult.passed,
          results: qaResult.tests.map((test, index) => ({
            testId: index + 1,
            status: test.status === 'passed' ? 'passed' : 'failed',
            actual: test.actual
          }))
        };
      } else {
        // Execute single code without test cases
        const codeResult = await judge0Service.executeCode(
          validated.code,
          validated.language
        );
        
        // For single code execution, we can simulate executionTime or get it from Judge0 later if available.
        // For now, let's keep it 0 or a placeholder.
        const executionTime = 100; // Placeholder for single execution time

        return { // Directly return ExecuteResponse
          output: codeResult.output,
          error: codeResult.error,
          executionTime
        };
      }
      
    } catch (error) {
      
      if (error instanceof Error && error.message.includes('testCases')) {
        return { // Return QAExecuteResponse for testCases error
          success: false,
          results: [],
        };
      } else {
        return { // Return ExecuteResponse for other errors
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
    
    // For Vercel, we don't call listen() directly
    if (process.env.VERCEL) {
      console.log('Running on Vercel environment');
    } else {
      await fastify.listen({ port, host: '0.0.0.0' });
      console.log(`Server listening on http://0.0.0.0:${port}`);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Start the server (only for local development)
if (!process.env.VERCEL) {
  start();
}

// Export the fastify instance for Vercel
export default fastify;
