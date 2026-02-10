import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import axios from 'axios';
import { z } from 'zod';

const fastify = Fastify({ logger: true });

// Register plugins
await fastify.register(cors, { origin: true });
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
});

// Schema validation
const ExecuteCodeSchema = z.object({
  code: z.string().min(1).max(10000),
  language: z.enum(['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go', 'rust'])
});

type ExecuteCodeRequest = z.infer<typeof ExecuteCodeSchema>;

// Timeout configuration
const EXECUTION_TIMEOUT = 5000; // 5 seconds

// Routes
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.post<{ Body: ExecuteCodeRequest }>('/execute', async (request, reply) => {
  try {
    const { code, language } = ExecuteCodeSchema.parse(request.body);
    
    try {
      // Call Piston API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT);

      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        {
          language,
          version: '*',
          files: [
            {
              name: `main.${getFileExtension(language)}`,
              content: code
            }
          ]
        },
        { signal: controller.signal as any }
      );

      clearTimeout(timeoutId);

      return {
        success: true,
        output: response.data.run.stdout,
        error: response.data.run.stderr || null,
        runtime: response.data.run.code
      };
    } catch (axiosError: any) {
      // Handle timeout errors
      if (axiosError.code === 'ECONNABORTED' || axiosError.message === 'Aborted') {
        reply.status(408);
        return {
          success: false,
          error: 'Execution Timeout',
          details: 'The code took too long to execute. Maximum execution time is 5 seconds.',
          code: 'TIMEOUT_ERROR'
        };
      }

      // Handle other axios errors
      if (axiosError.isAxiosError) {
        reply.status(axiosError.response?.status || 502);
        return {
          success: false,
          error: 'Execution Service Error',
          details: axiosError.response?.statusText || 'Failed to execute code',
          code: 'SERVICE_ERROR'
        };
      }

      throw axiosError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      reply.status(400);
      return { 
        success: false, 
        error: 'Invalid input', 
        details: error.errors,
        code: 'VALIDATION_ERROR'
      };
    }

    reply.status(500);
    return { 
      success: false, 
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    };
  }
});

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    go: 'go',
    rust: 'rs'
  };
  return extensions[language] || language;
}

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://0.0.0.0:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
