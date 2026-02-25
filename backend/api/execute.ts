import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { Judge0Service } from '../src/services/judge0.service.js';

const executeSchema = z.object({
  code: z.string(),
  language: z.string(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string()
  })).optional()
});

export default async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://pklavc.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validated = executeSchema.parse(req.body);
    const judge0Service = new Judge0Service();

    if (validated.testCases && validated.testCases.length > 0) {
      const qaResult = await judge0Service.executeWithQA(
        validated.code,
        validated.language,
        validated.testCases
      );

      return res.json({
        success: qaResult.passed,
        results: qaResult.tests.map((test, index) => ({
          testId: index + 1,
          status: test.status === 'passed' ? 'passed' : 'failed',
          actual: test.actual
        }))
      });
    } else {
      const codeResult = await judge0Service.executeCode(
        validated.code,
        validated.language
      );

      const executionTime = 100;
      return res.json({
        output: codeResult.output,
        error: codeResult.error,
        executionTime
      });
    }
  } catch (error) {
    console.error('Execute error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    return res.status(500).json({
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: 0
    });
  }
};
