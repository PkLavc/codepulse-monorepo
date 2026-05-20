import { z } from 'zod';

const executeSchema = z.object({
  code: z.string(),
  language: z.string(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string()
  })).optional()
});

const fixSchema = z.object({
  code: z.string(),
  language: z.string()
});

const ALLOWED_ORIGINS = [
  'https://pklavc.com',
  'https://www.pklavc.com',
  'https://pklavc.github.io'
];

const NATIVE_EDGE_LANGUAGES = new Set(['javascript', 'js']);
const AI_MODEL = '@cf/meta/llama-3-8b-instruct';

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function normalizeLanguage(language) {
  return language.trim().toLowerCase();
}

function serializeValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'undefined') return 'undefined';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function executeJavaScriptInEdgeSandbox(code) {
  const stdout = [];
  const stderr = [];
  const sandboxConsole = {
    log: (...args) => stdout.push(args.map(serializeValue).join(' ')),
    info: (...args) => stdout.push(args.map(serializeValue).join(' ')),
    warn: (...args) => stderr.push(args.map(serializeValue).join(' ')),
    error: (...args) => stderr.push(args.map(serializeValue).join(' '))
  };

  try {
    const runner = new Function('console', `"use strict";\n${code}`);
    runner(sandboxConsole);
  } catch (error) {
    stderr.push(error instanceof Error ? error.toString() : String(error));
  }

  return {
    output: stdout.join('\n'),
    error: stderr.join('\n')
  };
}

function extractAiText(result) {
  if (typeof result === 'string') return result;
  if (typeof result?.response === 'string') return result.response;
  if (typeof result?.result?.response === 'string') return result.result.response;
  if (Array.isArray(result?.output_text)) return result.output_text.join('\n');
  if (Array.isArray(result?.result?.output_text)) return result.result.output_text.join('\n');
  return '';
}

function stripCodeFences(text) {
  const match = text.match(/```[a-zA-Z0-9]*\s*\n([\s\S]*?)\n?\s*```/);
  if (match) return match[1].trim();
  return text;
}

function cleanAiResponse(text, originalCode) {
  if (!text) return originalCode;

  // 1. Extract from markdown code fence
  text = stripCodeFences(text);

  // 2. Strip common AI prefix lines (loop until stable)
  const prefixPatterns = [
    /^Linguagem:\s*\S+[ \t]*\n+/i,
    /^C[oó]digo(?:\s+[^\n]*)?\s*:\s*\n+/i,
    /^Aqui(?:\s+est[áa][^\n]*)?\s*:\s*\n+/i,
    /^Here(?:'s| is)[^\n]*:\s*\n+/i,
    /^O c[oó]digo[^\n]*:\s*\n+/i,
    /^Resultado[^\n]*:\s*\n+/i,
    /^Fixed[^\n]*:\s*\n+/i,
    /^Corrected[^\n]*:\s*\n+/i,
    /^Output[^\n]*:\s*\n+/i,
  ];
  let prev;
  do {
    prev = text;
    for (const p of prefixPatterns) text = text.replace(p, '').trimStart();
  } while (text !== prev);

  // 3. Strip trailing explanation lines
  const explanationStart = /^(?:Note[:\s]|Obs[:\s]|Nota[:\s]|This |Here |The |I |Este |Esta |Corrigi|Changed|Fixed|The code|O c[oó]digo)/i;
  const lines = text.split('\n');
  let cutAt = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (explanationStart.test(trimmed)) cutAt = i;
    else break;
  }
  text = lines.slice(0, cutAt).join('\n').trim();

  // 4. Strip inline backtick wrapping: `code`
  if (/^`[^`]+`$/.test(text)) text = text.slice(1, -1);

  return text || originalCode;
}

async function runDeterministicAiExecution(env, language, code, stdin = '') {
  const systemPrompt = `Você é um interpretador/compilador e terminal puro para a linguagem ${language}. Seu único trabalho é ler o código fornecido, executá-lo mentalmente com precisão absoluta e retornar ESTRITAMENTE o que seria impresso no stdout ou stderr de uma IDE real. Não adicione saudações, explicações, comentários ou blocos de código em markdown (\`\`\`). Se houver erro de sintaxe ou execução, retorne exatamente a mensagem de erro padrão que o compilador/interpretador daquela linguagem daria no terminal.`;
  const userPrompt = stdin
    ? `Código:\n${code}\n\nEntrada padrão (stdin):\n${stdin}`
    : `Código:\n${code}`;
  const result = await env.AI.run(AI_MODEL, {
    temperature: 0.0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  return extractAiText(result).trim();
}

async function executeCode(env, code, language, stdin = '') {
  const normalizedLanguage = normalizeLanguage(language);
  if (NATIVE_EDGE_LANGUAGES.has(normalizedLanguage)) {
    return executeJavaScriptInEdgeSandbox(code);
  }

  const aiOutput = await runDeterministicAiExecution(env, language, code, stdin);
  return {
    output: aiOutput,
    error: ''
  };
}

async function executeWithQA(env, code, language, testCases) {
  const tests = [];

  for (const testCase of testCases) {
    const result = await executeCode(env, code, language, testCase.input);
    const actual = (result.output || result.error || '').trim();
    const expected = testCase.expected.trim();

    tests.push({
      input: testCase.input,
      expected: testCase.expected,
      actual,
      status: actual === expected ? 'passed' : 'failed'
    });
  }

  return {
    passed: tests.every((test) => test.status === 'passed'),
    tests
  };
}

async function fixCodeWithAi(env, language, code) {
  const result = await env.AI.run(AI_MODEL, {
    temperature: 0.0,
    messages: [
      {
        role: 'system',
        content:
          `You are a strict ${language} code reviewer. Rules (follow exactly):\n1. If the input is NOT valid ${language} code (e.g. a natural-language sentence, a question, a description) — return it EXACTLY as received, no changes at all.\n2. If the input IS code — fix ONLY: obvious syntax errors, wrong indentation, typos in variable/function names. Do NOT rewrite logic, do NOT add features, do NOT complete missing code.\n3. Return ONLY the final code or unchanged text. Absolutely forbidden: prefixes like "Here is:", "Fixed:", "Código:", "Linguagem:"; trailing explanations; markdown fences (\`\`\`); any commentary.`
      },
      {
        role: 'user',
        content: code
      }
    ]
  });

  const raw = extractAiText(result).trim();
  return cleanAiResponse(raw, code);
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

        if (validated.testCases && validated.testCases.length > 0) {
          const qaResult = await executeWithQA(
            env,
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

        const codeResult = await executeCode(env, validated.code, validated.language);
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

    if (url.pathname === '/api/fix' && request.method === 'POST') {
      try {
        const body = await request.json();
        const validated = fixSchema.parse(body);
        const fixedCode = await fixCodeWithAi(env, validated.language, validated.code);
        return Response.json({ code: fixedCode }, { headers });
      } catch (error) {
        if (error?.name === 'ZodError') {
          return Response.json(
            { error: 'Invalid request body', details: error.errors },
            { status: 400, headers }
          );
        }
        return Response.json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500, headers }
        );
      }
    }

    return new Response('Not Found', { status: 404, headers });
  }
};
