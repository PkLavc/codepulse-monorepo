# CodePulse Architecture Documentation

## Project Overview

**CodePulse** is a professional-grade monorepo showcasing software engineering excellence with:
- **Frontend**: React + TypeScript + Vite with Monaco Editor
- **Backend**: Node.js + Fastify + Judge0 API integration
- **E2E Tests**: Playwright for comprehensive testing
- **High QA Coverage**: Quality assurance and testing reports

## Repository Structure

```
codepulse-monorepo/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI/CD Pipeline (Lint, Test, Deploy)
├── backend/
│   ├── src/
│   │   ├── server.ts              # Fastify server with API routes
│   │   └── services/
│   │       ├── judge0.service.ts  # Judge0 API integration service
│   │       └── judge0.service.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Main application component
│   │   ├── components/
│   │   │   ├── Output.tsx         # Output display component with styling
│   │   │   ├── Output.css
│   │   │   └── Output.test.tsx
│   │   ├── main.tsx               # React entry point
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts             # Vite configuration
│   ├── tsconfig.json
│   └── package.json
├── e2e/
│   ├── tests/                     # Playwright E2E tests
│   ├── playwright.config.ts       # Playwright configuration
│   └── package.json
├── docs/
│   ├── QA_REPORT.md               # Quality Assurance report
│   └── ARCHITECTURE.md            # This file
├── .env.example                   # Environment variables template
├── package.json                   # Root package.json with workspaces
├── vercel.json                    # Vercel deployment configuration
├── README.md                      # Project overview
└── CONTRIBUTING.md                # Contribution guidelines
```

## Backend Architecture

### Fastify Server (`backend/src/server.ts`)

The backend is built with Fastify, a lightweight and efficient Node.js framework:

**Key Features:**
- **CORS Configuration**: Enables cross-origin requests from frontend and other sources
- **Rate Limiting**: Protects API from abuse (100 requests per 15 minutes)
- **Health Check Endpoint**: GET `/health` for monitoring
- **Code Execution Endpoint**: POST `/api/execute` for code execution with or without test cases

**API Routes:**

```typescript
GET /health
// Returns: { status: 'ok' }

POST /api/execute
// Body: { code: string; language: string; testCases?: Array<{ input: string; expected: string }> }
// Returns: { output?: string; error?: string; executionTime: number; passed?: boolean; tests?: Array }
```

### Judge0 Service (`backend/src/services/judge0.service.ts`)

Integrates with Judge0 API via RapidAPI for secure code execution:

**Supported Languages:**
- JavaScript (ID: 63)
- Python (ID: 71)
- Java (ID: 62)
- C (ID: 50)
- C++ (ID: 54)
- C# (ID: 51)
- Go (ID: 60)
- Rust (ID: 73)
- PHP (ID: 68)
- Ruby (ID: 72)
- Swift (ID: 80)
- Kotlin (ID: 78)
- TypeScript (ID: 74)

**Methods:**

1. `executeCode(code, language, stdin?)`: Executes code without test cases
2. `executeWithQA(code, language, testCases)`: Runs code against test cases for validation
3. `getLanguageId(language)`: Maps language names to Judge0 IDs
4. `submitCode(submission)`: Submits code to Judge0
5. `getSubmissionResult(token)`: Retrieves execution results
6. `waitForCompletion(token)`: Polls for completion (max 30 attempts)

**Configuration:**
- Base URL: `https://judge0-ce.p.rapidapi.com`
- Requires: `JUDGE0_API_KEY` environment variable
- CPU Time Limit: 2 seconds per execution
- Memory Limit: 256MB

## Frontend Architecture

### App Component (`frontend/src/App.tsx`)

Main React component built with TypeScript and Vite:

**Features:**
- **Monaco Editor Integration**: Professional code editor with syntax highlighting
- **State Management**: Uses React hooks (useState, useRef)
- **API Integration**: Communicates with backend via fetch API
- **Error Handling**: Displays errors and loading states
- **Multi-language Support**: Switch between JavaScript, Python, and other languages

**Key States:**
- `code`: Currently edited code
- `output`: Execution output
- `error`: Error messages
- `isLoading`: Loading indicator

**Component Flow:**
1. User writes code in Monaco Editor
2. Clicks "Execute" button
3. Code is sent to backend via `/api/execute`
4. Backend executes using Judge0
5. Results displayed in Output component

### Output Component (`frontend/src/components/Output.tsx`)

Dedicated component for displaying code execution results:

**Features:**
- **Loading State**: Shows spinner while code executes
- **Error Visualization**: Distinguishes between syntax errors, timeouts, and runtime errors
- **Timeout Detection**: Identifies when execution exceeds 5 seconds
- **Visual Indicators**: Emojis and badges for quick status recognition
- **Empty State**: Helpful message when no results available
- **Status Footer**: Real-time status indicators

**Props:**
```typescript
interface OutputProps {
  output: string;
  error: string | null;
  isLoading: boolean;
  isTimeout?: boolean;
}
```

## Deployment

### Frontend Deployment

**GitHub Pages:**
- Automatically deployed on push to `main` branch
- URL: https://pklavc.github.io/codepulse-monorepo/
- Configured in CI/CD pipeline

**Build Command:** `yarn build` (Vite builds to `dist/`)

### Backend Deployment

**Vercel:**
- Serverless Functions deployment
- Build Command: `cd backend && yarn install && yarn build`
- Output Directory: `backend/dist/`
- Node.js Runtime: 18.x
- API Routes: All `/api/*` routes mapped to backend handler

**Configuration:** `vercel.json`

## CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/ci.yml`):

1. **Trigger**: On push to `main` or pull requests
2. **Lint and Test Job**:
   - Node.js 18.x environment
   - Install dependencies
   - Run ESLint
   - Run unit tests
   - Upload coverage to Codecov
3. **Frontend Deploy Job** (only on main push):
   - Build frontend
   - Deploy to GitHub Pages

## Environment Configuration

**Key Environment Variables** (`.env.example`):

```env
# Backend
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=CodePulse

# APIs
JUDGE0_API_KEY=your_judge0_rapidapi_key_here
PISTON_API_URL=https://emkc.org/api/v2/piston/execute

# Deployment
VERCEL_PROJECT_NAME=codepulse-api
GH_PAGES_DOMAIN=pklavc.github.io
```

## Development Setup

### Prerequisites
- Node.js 18.x or higher
- Yarn package manager
- Judge0 RapidAPI key (for code execution)

### Installation

```bash
# Clone repository
git clone https://github.com/PkLavc/codepulse-monorepo.git
cd codepulse-monorepo

# Install dependencies (all workspaces)
yarn install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Judge0 API key
```

### Running Locally

```bash
# Run all workspaces in development mode
yarn dev

# Or run individual workspaces
cd backend && yarn dev
cd frontend && yarn dev
```

### Testing

```bash
# Run all tests
yarn test

# Run linting
yarn lint

# Run E2E tests
cd e2e && yarn test
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Monaco Editor |
| **Backend** | Node.js, Fastify, TypeScript, Axios |
| **Code Execution** | Judge0 API (RapidAPI) |
| **Testing** | Playwright, Vitest, Jest |
| **Deployment** | Vercel (Backend), GitHub Pages (Frontend) |
| **CI/CD** | GitHub Actions |
| **Package Management** | Yarn Workspaces |

## Key Achievements

✅ **Professional Monorepo Structure**: Clean separation of concerns with shared configuration
✅ **High Code Quality**: ESLint, TypeScript, comprehensive testing
✅ **Secure Code Execution**: Sandboxed execution via Judge0 API
✅ **Responsive UI**: Monaco Editor with real-time code feedback
✅ **Automated Deployment**: CI/CD pipeline with GitHub Actions
✅ **QA Documentation**: Comprehensive testing reports and coverage
✅ **Multiple Language Support**: 13+ programming languages
✅ **Error Handling**: Graceful error messages and timeout detection

## Future Enhancements

- [ ] Add WebSocket support for real-time code execution feedback
- [ ] Implement user authentication and code history
- [ ] Add collaborative coding features
- [ ] Create IDE plugins for integration
- [ ] Support for Docker-based code execution
- [ ] Advanced performance metrics and profiling
- [ ] Code snippet library and templates

## License

This project is open source and available under the MIT License.

## Author

**Patrick Araujo** - Software Engineer
- GitHub: [@PkLavc](https://github.com/PkLavc)
- Portfolio: [pklavc.github.io](https://pklavc.github.io)
