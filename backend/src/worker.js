import { z } from 'zod';
import { GlotService } from './services/glot.service.js';

const executeSchema = z.object({
  code: z.string(),
  language: z.string(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string()
  })).optional()
});

const ALLOWED_ORIGINS = [
  'https://pklavc.com',
  'https://www.pklavc.com',
  'https://pklavc.github.io'
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return Response.json({ status: 'ok' }, { headers });
    }

    if (url.pathname === '/api/execute' && request.method === 'POST') {
      try {
        const body = await request.json();
        const validated = executeSchema.parse(body);
        const glotService = new GlotService(env.GLOT_API_TOKEN);

        if (validated.testCases && validated.testCases.length > 0) {
          const qaResult = await glotService.executeWithQA(
            validated.code,
            validated.language,
            validated.testCases
          );
          return Response.json({
            success: qaResult.passed,
            results: qaResult.tests.map((test, index) => ({
              testId: index + 1,
              status: test.status === 'passed' ? 'passed' : 'failed',
              actual: test.actual
            }))
          }, { headers });
        }

        const codeResult = await glotService.executeCode(validated.code, validated.language);
        return Response.json({
          output: codeResult.output,
          error: codeResult.error,
          executionTime: 100
        }, { headers });

      } catch (error) {
        if (error?.name === 'ZodError') {
          return Response.json(
            { error: 'Invalid request body', details: error.errors },
            { status: 400, headers }
          );
        }
        return Response.json({
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0
        }, { status: 500, headers });
      }
    }

    return new Response('Not Found', { status: 404, headers });
  }
};
