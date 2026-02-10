# codepulse-monorepo
High-Reliability Code Execution Engine - Monorepo with React Frontend, Node.js Backend, E2E Tests &amp; High QA Coverage

[![Build Status](https://github.com/PkLavc/codepulse-monorepo/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/PkLavc/codepulse-monorepo/actions)
[![CodeCov Coverage](https://codecov.io/gh/PkLavc/codepulse-monorepo/branch/main/graph/badge.svg)](https://codecov.io/gh/PkLavc/codepulse-monorepo)
[![Frontend: React + TypeScript](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)](./frontend)
[![Backend: Node.js + Fastify](https://img.shields.io/badge/Backend-Node.js%20%2B%20Fastify-green)](./backend)
[![E2E Tests: Playwright](https://img.shields.io/badge/E2E%20Tests-Playwright-purple)](./e2e)

## 🚀 Deployment & Integration

### Deploy Configuration

CodePulse é estruturado para deploy em múltiplas plataformas:

#### Backend (Vercel)
- Deploy automático via GitHub Actions
- Serverless Functions com Node.js
- Variáveis de ambiente gerenciadas no dashboard Vercel
- URL: `https://codepulse-api.vercel.app`

#### Frontend (GitHub Pages)
- Build automático via GitHub Actions
- Hospedado em `https://pklavc.github.io/codepulse-monorepo`
- VITE_API_URL apontada para Vercel durante build

### Environment Variables

Crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

Variáveis importantes:
- `VITE_API_URL`: URL do backend (ex: https://codepulse-api.vercel.app)
- `CORE_ALLOWED_ORIGINS`: CORS permitido no backend
- `EXECUTION_TIMEOUT`: Timeout de execução em ms (padrão: 5000)

### Deploy Steps

1. **Backend (Vercel)**:
   - Conectar repo GitHub à Vercel
   - Configurar variáveis de ambiente
   - Deploy automático em push para main

2. **Frontend (GitHub Pages)**:
   - GitHub Actions faz build automático
   - Publica em branch `gh-pages`
   - Acesso via GitHub Pages URL

## 📋 Environment Setup

Ver `.env.example` para lista completa de variáveis necessárias:

```
BACKEND:
- NODE_ENV
- PORT (padrão: 3001)
- CORE_ALLOWED_ORIGINS
- EXECUTION_TIMEOUT

FRONTEND:
- VITE_API_URL
- VITE_APP_NAME

DEPLOYMENT:
- GH_PAGES_DOMAIN
- VERCEL_PROJECT_NAME
```

## 🚀 GitHub Pages Deployment

O frontend é automaticamente deployado para GitHub Pages via GitHub Actions.

**URL**: https://pklavc.github.io/codepulse-monorepo

### Configuração necessária:

1. Habilite GitHub Pages nas configurações do repositório
2. Selecione `gh-pages` como branch de deploy
3. O workflow CI automaticamente faz deploy em cada push para main com sucesso

## 📊 Quality Assurance & Testing

### Cobertura de Testes

- **Lint & Style**: ESLint + Prettier validação em cada push
- **Unit Tests**: Jest para backend e frontend
- **Integration Tests**: Testes de integração com Vitest
- **E2E Tests**: Playwright para fluxos de usuário críticos
- **Coverage Reports**: Codecov integrado

### Teste de Resiliência

- Timeout Backend: 5 segundos com status 408
- Validação UI: Alerta visual quando timeout ocorre
- Loop infinito protection: Detecta e interrompe execução

## 🏗️ Arquitetura do Monorepo

```
codepulse-monorepo/
├── frontend/          # React + TypeScript + Monaco Editor
├── backend/           # Fastify + Zod Validation + Rate Limiting
├── e2e/              # Playwright E2E Tests
├── shared/           # Tipagens compartilhadas
├── docs/             # Documentação
├── .github/workflows/ # CI/CD Pipelines
└── index.html        # Landing Page
```

## 🔐 Segurança

- Rate limiting: 10 requisições por minuto por IP
- Validação Zod: Schema validation em todo input
- CORS: Configurado para domínios específicos
- Environment variables: Gerenciados via Vercel

## 📝 License

MIT
