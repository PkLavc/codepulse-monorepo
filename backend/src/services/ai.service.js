const PROVIDERS = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4.1-mini'
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-5'
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/',
    defaultModel: 'gemini-2.5-flash'
  }
};

export const AI_PROVIDERS = Object.keys(PROVIDERS);

export async function fixCodeWithUserAI({ code, language, provider, apiKey, model }) {
  const config = PROVIDERS[provider];
  if (!config) throw new Error('Unsupported AI provider');
  if (typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    throw new Error('Configure your own AI API key in Settings');
  }
  const requestedModel = model || config.defaultModel;
  if (!/^[a-zA-Z0-9_.:-]{1,100}$/.test(requestedModel)) {
    throw new Error('Invalid AI model identifier');
  }

  const system = [
    'You are a strict code reviewer.',
    'If the input is not code, return the original input unchanged.',
    'For code, fix only obvious syntax errors, indentation and variable-name typos.',
    'Do not add features, modify intended logic or write explanations.',
    'Return only the corrected code, without Markdown fences.'
  ].join(' ');
  const user = `Language: ${language}\n\n${code}`;

  let url;
  let headers = { 'Content-Type': 'application/json' };
  let body;
  if (provider === 'openai') {
    url = config.url;
    headers.Authorization = `Bearer ${apiKey}`;
    body = { model: requestedModel, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
  } else if (provider === 'anthropic') {
    url = config.url;
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = { model: requestedModel, max_tokens: 4096, system, messages: [{ role: 'user', content: user }] };
  } else {
    url = `${config.url}${encodeURIComponent(requestedModel)}:generateContent`;
    headers['x-goog-api-key'] = apiKey;
    body = { system_instruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }] };
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new Error('AI provider timed out');
    }
    throw new Error('Unable to connect to the selected AI provider');
  }
  // Do not echo provider response bodies: they can include sensitive request metadata.
  if (!response.ok) {
    throw new Error(`AI provider returned HTTP ${response.status}. Check the key, model and account quota.`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('AI provider returned invalid JSON');
  }
  let fixed;
  if (provider === 'openai') {
    fixed = result?.choices?.[0]?.message?.content;
  } else if (provider === 'anthropic') {
    fixed = result?.content?.filter((p) => p?.type === 'text').map((p) => p.text).join('\n');
  } else {
    fixed = result?.candidates?.[0]?.content?.parts?.filter((p) => typeof p?.text === 'string').map((p) => p.text).join('\n');
  }
  if (typeof fixed !== 'string' || !fixed.trim()) {
    throw new Error('AI provider returned no code');
  }
  const fenced = fixed.trim().match(/^\x60\x60\x60[^\n]*\n([\s\S]*?)\n?\x60\x60\x60\s*$/);
  return (fenced ? fenced[1] : fixed).trimEnd();
}
