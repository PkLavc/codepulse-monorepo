# codepulse-monorepo
High-Reliability Code Execution Engine - Monorepo with React Frontend, Node.js Backend, E2E Tests &amp; High QA Coverage

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
