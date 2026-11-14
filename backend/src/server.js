import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { GlotService } from './services/glot.service.js';
import { fixCodeWithUserAI } from './services/ai.service.js';

// Load environment variables
import 'dotenv/config';

const executeSchema = z.object({
  code: z.string().min(1).max(100000),
  language: z.string().min(1).max(40),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string()
  })).optional()
});

const fixSchema = z.object({
  code: z.string().min(1).max(100000),
  language: z.string().min(1).max(40),
  provider: z.enum(['openai', 'anthropic', 'gemini']),
  model: z.string().max(100).optional(),
  apiKey: z.string().min(10).max(512)
});

const fastify = Fastify({ logger: false, bodyLimit: 120000 });

let isPrepared = false;

async function setupApp() {
  if (isPrepared) return;
  
  await fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin || origin === 'null') return callback(null, true);
      try {
        const url = new URL(origin);
        const allowed = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol);
        return callback(null, allowed);
      } catch {
        return callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false
  });
  
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  });

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.post('/api/fix', async (request, reply) => {
    const parsed = fixSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid AI settings or code' });
    }

    try {
      const fixedCode = await fixCodeWithUserAI(parsed.data);
      return { code: fixedCode };
    } catch (error) {
      return reply.code(502).send({
        error: error instanceof Error ? error.message : 'AI provider failed'
      });
    }
  });
  
  
  fastify.post('/api/execute', async (request) => {
    try {
      const validated = executeSchema.parse(request.body);
      const judge0Service = new GlotService(process.env.GLOT_API_TOKEN);
      
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
        return { success: false, results: [] };
      } else {
        return {
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        };
      }
    }
  });

  isPrepared = true;
}

if (process.env.NODE_ENV !== 'test') {
  setupApp().then(() => {
    const port = Number(process.env.PORT) || 3000;
    console.log(`Starting server on port ${port}...`);
    try {
      fastify.listen({ port, host: process.env.HOST || '127.0.0.1' }, (err) => {
        if (err) {
          console.error('Error starting server:', err);
          process.exit(1);
        } else {
          console.log(`Server successfully started on http://localhost:${port}`);
        }
      });
    } catch (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  });
}

export default async (req, res) => {
  await setupApp();
  await fastify.ready();
  fastify.server.emit('request', req, res);
};

