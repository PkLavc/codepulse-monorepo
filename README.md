# CodePulse Monorepo

CodePulse is a source-code project for a browser-based code editor with a Node.js backend, code execution integrations, and optional AI-assisted code correction.

**Status: source-only / self-hosted.** The public live demo, GitHub Pages deployment, and automatic Cloudflare Worker deployment have been retired. The old Workers AI integration and AI-simulated execution are no longer used by the current source.

## Features

- HTML/CSS/JavaScript code editor with multiple language templates
- AI Settings dialog: each user chooses OpenAI, Anthropic, or Google Gemini, a model, and their own API key
- AI correction through the **local Node.js backend**, which forwards each request to the selected provider
- The API key is held **only in browser tab memory** and sent to the user's configured backend for that request. It is not committed, logged by the app, or stored in browser localStorage
- Real code execution through the Node.js/Glot.io integration when the local backend has a valid `GLOT_API_TOKEN` (separate from AI keys)
- Unit/E2E test infrastructure

## Run locally

Requirements: Node.js 20+, npm 9+.

```bash
git clone https://github.com/PkLavc/codepulse-monorepo.git
cd codepulse-monorepo
npm ci
npm run dev
```

The Node backend listens at `http://127.0.0.1:3000` by default. Open `frontend/index.html` in your browser. Use **AI Settings** to configure a trusted backend URL (default `http://127.0.0.1:3000`), an AI provider, model (optional), and your personal API key.

To execute code through Glot.io, set `GLOT_API_TOKEN` in the backend environment before starting the server. Running code is separate from AI correction, and the AI key is not used for execution.

### AI providers

| Provider | Default model | API key source |
| --- | --- | --- |
| OpenAI | `gpt-4.1-mini` | OpenAI API |
| Anthropic | `claude-sonnet-4-5` | Anthropic API |
| Google Gemini | `gemini-2.5-flash` | Gemini API |

Models are editable because provider catalogs change. API requests incur charges, if any, on the **user's** provider account rather than the CodePulse owner's AI account.

**Security:** Use only a backend you operate and trust. That backend receives your API key in the POST body over HTTP for loopback or HTTPS for remote backends. Keys are never stored by the CodePulse application, but malicious browser extensions or compromised backends can still access them. Do not share the key, and configure provider-side spending limits.

## API

- `GET /health` — server health
- `POST /api/execute` — execute code through the local Glot.io integration; requires the server operator's Glot token
- `POST /api/fix` — AI correction; JSON body with `code`, `language`, `provider`, `model` (optional), and **user-supplied `apiKey`**. The backend forwards it only to the selected provider's official fixed HTTPS API endpoint

The Node server binds to loopback by default. Set `HOST` explicitly only when intentionally exposing it through a trusted reverse proxy. Avoid sending keys through public/shared third-party backends.

The former `backend/src/worker.js` is a disabled compatibility stub returning HTTP 410. It does not execute code or invoke Workers AI. **If you previously deployed the Cloudflare Worker, delete or disable the existing `codepulse-backend` service and its `api-ide.pklavc.com` route in your Cloudflare account**: changing the GitHub source does not automatically remove already deployed services.

## Validation

```bash
npm run lint
npm test
```

The project is provided under the MIT license. Contributions can be proposed via GitHub, but the project no longer offers a publicly hosted editor.

Author: Patrick Araujo — https://github.com/PkLavc
