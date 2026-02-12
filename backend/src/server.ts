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

// Request/Response types
interface ExecuteRequest {
  code: string;
  language: string;
}

interface ExecuteResponse {
  output: string;
  error: string | null;
  executionTime: number;
}

// Validation schema
const executeSchema = z.object({
  code: z.string(),
  language: z.string()
});

// Routes
fastify.get('/health', async () => {
  return { status: 'ok' };
});

fastify.post<{ Body: ExecuteRequest; Reply: ExecuteResponse }>('/execute', async (request) => {
  try {
    const validated = executeSchema.parse(request.body);
    const startTime = Date.now();
    
    // Call execution service
    const response = await axios.post('http://localhost:3001/execute', validated);
    const executionTime = Date.now() - startTime;
    
    return {
      output: response.data.output || '',
      error: null,
      executionTime
    };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: 0
    };
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server listening on http://0.0.0.0:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default fastify;
