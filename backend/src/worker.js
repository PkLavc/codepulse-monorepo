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
  // Extract content from inside a markdown code block if present
  const match = text.match(/```[a-zA-Z0-9]*\s*\n([\s\S]*?)\n\s*```/);
  if (match) return match[1].trim();
  return text;
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
          `Você é um revisor de código para ${language}. REGRA FUNDAMENTAL: se o conteúdo fornecido NÃO for código válido em ${language} (por exemplo, uma frase em linguagem natural ou texto em prosa), retorne-o EXATAMENTE como está, sem nenhuma alteração. Se for código, corrija APENAS indentação incorreta, erros de sintaxe óbvios e typos em nomes de variáveis/funções. Não reescreva a lógica, não resolva o problema, não complete código faltando. Retorne SOMENTE o resultado final, sem explicações, sem prefixos como "Código corrigido:", e NUNCA use blocos markdown com \`\`\`.`
      },
      {
        role: 'user',
        content: `Linguagem: ${language}\n\nCódigo:\n${code}`
      }
    ]
  });

  const raw = extractAiText(result).trim();
  return stripCodeFences(raw);
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
