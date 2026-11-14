import { afterEach, describe, expect, it, vi } from 'vitest';
import { fixCodeWithUserAI } from './ai.service.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('user-supplied AI integrations', () => {
  const base = {
    code: "console.log('ok')",
    language: 'javascript',
    apiKey: 'test-key-not-a-real-secret'
  };

  it('uses only the supplied OpenAI key and returns code', async () => {
    const mocked = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "console.log('ok');" } }] })
    });
    vi.stubGlobal('fetch', mocked);

    const result = await fixCodeWithUserAI({ ...base, provider: 'openai' });
    expect(result).toBe("console.log('ok');");
    const [url, request] = mocked.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(request.headers.Authorization).toBe('Bearer test-key-not-a-real-secret');
  });

  it('supports Anthropic messages without a shared AI credential', async () => {
    const mocked = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ type: 'text', text: "console.log('ok');" }] })
    });
    vi.stubGlobal('fetch', mocked);
    expect(await fixCodeWithUserAI({ ...base, provider: 'anthropic' })).toBe("console.log('ok');");
    expect(mocked.mock.calls[0][1].headers['x-api-key']).toBe(base.apiKey);
  });

  it('supports Gemini and removes markdown fences', async () => {
    const mocked = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "```javascript\nconsole.log('ok');\n```" }] } }]
      })
    });
    vi.stubGlobal('fetch', mocked);
    expect(await fixCodeWithUserAI({ ...base, provider: 'gemini' })).toBe("console.log('ok');");
    expect(mocked.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
    expect(mocked.mock.calls[0][1].headers['x-goog-api-key']).toBe(base.apiKey);
  });

  it('rejects requests without a user key', async () => {
    await expect(fixCodeWithUserAI({ ...base, apiKey: '', provider: 'openai' })).rejects.toThrow('own AI API key');
  });

  it('does not expose the provider response in errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(fixCodeWithUserAI({ ...base, provider: 'openai' })).rejects.toThrow('HTTP 401');
  });
});
