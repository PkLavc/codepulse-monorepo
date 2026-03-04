# CodePulse Architecture Documentation

## Project Overview

**CodePulse** is a professional-grade online IDE that has been significantly refactored to use a **standalone HTML architecture**. The system provides:
- **Frontend**: Single-page HTML application with embedded CSS and JavaScript
- **Backend**: External Node.js service deployed on Render
- **Code Execution**: Secure execution via Glot.io API
- **Multi-language Support**: Python, JavaScript, Java, C++, C#, PHP, Go, Ruby

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
│   │       ├── glot.service.ts    # Glot.io service integration
│   │       └── glot.service.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Legacy React component (archived)
│   │   ├── components/
│   │   │   ├── Output.tsx         # Legacy component (archived)
│   │   │   ├── Output.css
│   │   │   └── Output.test.tsx
│   │   ├── main.tsx               # Legacy entry point (archived)
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html                 # **MAIN APPLICATION** - Standalone HTML IDE
│   ├── vite.config.ts             # Vite configuration (legacy)
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
├── vercel.json                    # Vercel deployment configuration (legacy)
├── README.md                      # Project overview
└── CONTRIBUTING.md                # Contribution guidelines
```

## Current Architecture (Updated 2026)

### Frontend Architecture - Standalone HTML Application

The CodePulse IDE is now implemented as a **single-page HTML application** (`index.html`) with the following characteristics:

**Key Features:**
- **No Framework Dependencies**: Pure HTML/CSS/JavaScript implementation
- **Simple Code Editor**: Uses native textarea element for code input
- **Real-time Language Switching**: Dynamic boilerplate code updates
- **Visual Effects**: Particle.js for animated background
- **Responsive Design**: Mobile-friendly layout with CSS Grid/Flexbox
- **External Styling**: CSS loaded from `https://pklavc.github.io/css/`

**Supported Languages:**
- Python
- JavaScript
- Java
- C++
- C#
- PHP
- Go
- Ruby

**Code Editor Features:**
```javascript
// Language boilerplates with Hello CodePulse string
const boilerplates = {
    python: "print('Hello CodePulse!')",
    javascript: "console.log('Hello CodePulse!');",
    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello CodePulse!\");\n    }\n}",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello CodePulse!\" << endl;\n    return 0;\n}",
    csharp: "using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello CodePulse!\");\n    }\n}",
    php: "<?php\necho 'Hello CodePulse!';\n?>",
    go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello CodePulse!\")\n}",
    ruby: "puts 'Hello CodePulse!'"
};
```

**Execution Flow:**
1. User writes code in textarea
2. Selects programming language from dropdown
3. Clicks "Run" button or uses Ctrl+Enter
4. Code sent to backend via fetch API
5. Backend executes code using Glot.io API
6. Results displayed in output area

### Backend Architecture (External Service)

**Deployment:**
- **Platform**: Render serverless functions
- **URL**: `https://codepulse-monorepo-backend.onrender.com`
- **Runtime**: Node.js 20.x

**API Endpoints:**
```typescript
// Health check
GET /health
// Returns: { status: 'ok' }

// Code execution
POST /api/execute
// Body: { code: string; language: string }
// Returns: { output?: string; error?: string; executionTime: number }
```

**Key Features:**
- **Rate Limiting**: Protects against abuse
- **CORS Configuration**: Allows cross-origin requests
- **Error Handling**: Comprehensive error responses
- **Timeout Handling**: 5-second execution timeout
- **Glot.io Integration**: Secure multi-language code execution

### Integration Architecture

**Frontend-Backend Communication:**
```javascript
const BACKEND_URL = 'https://codepulse-monorepo-backend.onrender.com';

async function executeCode() {
    const code = document.getElementById('code').value;
    const language = document.getElementById('language').value;
    
    const response = await fetch(`${BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language })
    });
    
    const data = await response.json();
    // Handle response and display output
}
```

**External Dependencies:**
- **CSS Framework**: `https://pklavc.github.io/css/global.css`
- **Color Theme**: `https://pklavc.github.io/css/color-blue.css`
- **Layout Styles**: `https://pklavc.github.io/css/index.css`
- **Icons**: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
- **JavaScript Libraries**:
  - `https://pklavc.github.io/js/jquery.min.js`
  - `https://pklavc.github.io/js/particles.min.js`
  - `https://pklavc.github.io/js/index.js`

## Key Architectural Changes

### From Previous Architecture

**Removed Components:**
- React framework and dependencies
- TypeScript compilation
- Vite build system
- Monaco Editor integration
- Complex frontend tooling
- Judge0 API integration

**Simplified Architecture:**
- Single HTML file instead of multi-file React application
- Direct API calls instead of complex state management
- Native textarea instead of sophisticated code editor
- External CSS/JS loading instead of build-time bundling
- Glot.io API instead of Judge0 API

### Benefits of Current Architecture

1. **Simplicity**: No build process required
2. **Performance**: Faster loading with minimal dependencies
3. **Maintainability**: Single file to maintain and understand
4. **Accessibility**: Works in any modern browser without setup
5. **Deployment**: Easy deployment to any static hosting
6. **Cost Efficiency**: Render hosting instead of Vercel

## Deployment

### Frontend Deployment

**GitHub Pages:**
- Automatically deployed on push to `main` branch
- URL: https://pklavc.github.io/codepulse-monorepo/
- No build process required - direct HTML serving

**Build Command:** Not required (standalone HTML)

### Backend Deployment

**Render:**
- Serverless Functions deployment
- Build Command: `cd backend && npm install && npm run build`
- Output Directory: `backend/dist/`
- Node.js Runtime: 20.x
- API Routes: All `/api/*` routes mapped to backend handler

**Configuration:** `render.yaml` (to be created)

## CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/ci.yml`):

1. **Trigger**: On push to `main` or pull requests
2. **Lint and Test Job**:
   - Node.js 20.x environment
   - Install dependencies
   - Run ESLint
   - Run unit tests
   - Upload coverage to Codecov
3. **Frontend Deploy Job** (only on main push):
   - Copy `frontend/` directory directly to GitHub Pages
   - No build process required

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
GLOT_API_URL=https://run.glot.io
GLOT_API_TOKEN=your_glot_api_token

# Deployment
RENDER_PROJECT_NAME=codepulse-backend
GH_PAGES_DOMAIN=pklavc.github.io
```

## Development Setup

### Prerequisites
- Node.js 20.x or higher
- NPM package manager
- Access to backend API (deployed on Render)

### Installation

```bash
# Clone repository
git clone https://github.com/PkLavc/codepulse-monorepo.git
cd codepulse-monorepo

# Install dependencies (for backend development)
npm install

# No frontend build required - index.html is standalone
```

### Running Locally

```bash
# For backend development
cd backend && npm run dev

# Frontend runs directly from index.html
# Open index.html in browser to test
```

### Testing

```bash
# Run backend tests
cd backend && npm test

# Manual frontend testing
# Open index.html in browser and test code execution
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML, CSS, JavaScript (standalone) |
| **Backend** | Node.js, Fastify, TypeScript, Axios |
| **Code Execution** | Glot.io API |
| **Visual Effects** | Particle.js |
| **Styling** | External CSS from pklavc.github.io |
| **Deployment** | Render (Backend), GitHub Pages (Frontend) |
| **CI/CD** | GitHub Actions |
| **Package Management** | NPM |

## Code Execution Flow

1. **User Input**: Code written in textarea
2. **Language Selection**: Dropdown selects target language
3. **API Request**: POST to `/api/execute` with code and language
4. **Backend Processing**: Fastify server receives request
5. **Glot.io Integration**: Code sent to Glot.io API for execution
6. **Result Processing**: Execution results processed and returned
7. **Frontend Display**: Results displayed in output area

## Error Handling

**Frontend Error States:**
- **No Code**: "Please enter some code!" message
- **Connection Error**: Network connectivity issues
- **Backend Error**: Server-side execution errors
- **Timeout**: Execution exceeds 5-second limit

**Backend Error Handling:**
- **Syntax Errors**: Proper error message formatting
- **Runtime Errors**: Stack trace and error details
- **Resource Limits**: Memory and CPU timeout handling
- **API Errors**: Glot.io service integration failures

## Security Considerations

- **Sandboxed Execution**: Code runs in Glot.io's secure environment
- **Input Validation**: Backend validates all inputs
- **CORS Protection**: Proper cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse
- **No Local Execution**: All code runs on external secure servers

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