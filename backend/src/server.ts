import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { Judge0Service } from './services/judge0.service.js';

const executeSchema = z.object({
  code: z.string(),
  language: z.string(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string()
  })).optional()
});

const fastify = Fastify({ logger: true });

async function setupApp() {
  await fastify.register(cors, {
    origin: ['https://pklavc.github.io', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  });
  
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  });

  fastify.get('/health', async () => ({ status: 'ok' }));
  
  fastify.post('/api/execute', async (request: FastifyRequest) => {
    try {
      const validated = executeSchema.parse(request.body);
      
      const judge0Service = new Judge0Service();
      
      if (validated.testCases && validated.testCases.length > 0) {
        const qaResult = await judge0Service.executeWithQA(
          validated.code,
          validated.language,
          validated.testCases
        );
        
        return {
          success: qaResult.passed,
          results: qaResult.tests.map((test, index) => ({
            testId: index + 1,
            status: test.status === 'passed' ? 'passed' : 'failed',
            actual: test.actual
          }))
        };
      } else {
        const codeResult = await judge0Service.executeCode(
          validated.code,
          validated.language
        );
        
        const executionTime = 100;

        return {
          output: codeResult.output,
          error: codeResult.error,
          executionTime
        };
      }
      
    } catch (error) {
      
      if (error instanceof Error && error.message.includes('testCases')) {
        return {
          success: false,
          results: [],
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
}


if (!process.env.VERCEL) {
  setupApp().then(() => {
    const port = Number(process.env.PORT) || 3000;
    fastify.listen({ port, host: '0.0.0.0' });
  });
}

export default async (req: any, res: any) => {
  await setupApp();
  await fastify.ready();
  fastify.server.emit('request', req, res);
};
