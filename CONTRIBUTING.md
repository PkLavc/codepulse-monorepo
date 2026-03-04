# Contributing to CodePulse Monorepo

Thank you for considering contributing to the CodePulse Monorepo! This project demonstrates modern monorepo architecture patterns and full-stack development practices. Your contributions help improve the quality and functionality of this comprehensive development platform.

## Quick Start for Contributors

Welcome! Here's everything you need to get started contributing to the CodePulse Monorepo:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/codepulse-monorepo.git
cd codepulse-monorepo
```

### 2. Understand the Project
This repository demonstrates:
- **Monorepo Architecture** with Yarn workspaces
- **Full-Stack Development** with TypeScript across frontend and backend
- **Modern Tooling** including ESLint, Prettier, and Jest
- **Testing Strategies** with unit and e2e testing
- **Quality Assurance** with comprehensive test coverage reporting

### 3. Set Up the Environment

#### Prerequisites
- Node.js 20+
- NPM package manager
- Playwright for e2e testing

#### Local Setup
```bash
# Install dependencies
npm install

# Set up Playwright browsers
npm install @playwright/test
npx playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run initial build
npm run build
```

### 4. Start Development
```bash
# Start development servers for all packages
npm run dev

# Or start specific packages
cd backend && npm run dev
cd frontend && npm run dev

# Run tests
npm test

# Run e2e tests
cd e2e && npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### 5. Make Your Changes
- Create a new branch: `git checkout -b feature/your-feature-name`
- Make your changes following the project's code style
- Add tests for new functionality
- Update documentation if needed

### 6. Test Your Changes
```bash
# Run tests
yarn test

# Run linting
yarn lint

# Run type checking
yarn typecheck
```

### 7. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 8. Create Pull Request
- Go to GitHub and create a pull request
- Fill out the PR template (see .github/PULL_REQUEST_TEMPLATE.md)
- Reference any related issues

## How to Contribute

Your help can come in many ways. Here are some ways you can make a difference:

*   **Reporting Issues (Bugs)**: If you find something that isn't working as it should in any of the projects, please open an "issue" on GitHub. Be as clear as possible and specify which project is affected.
*   **Suggesting Improvements**: Have an idea for a new feature or to enhance something that already exists? I'd love to hear it! Open an "issue" and describe your suggestion, indicating the relevant project.
*   **Submitting Pull Requests**: If you've coded a solution or a new feature, feel free to submit a Pull Request. Make sure your changes are focused on a specific project and follow its style and practices.

## Code of Conduct

This project follows a Code of Conduct. All participants are expected to respect it. If you witness or experience unacceptable behavior, please contact me. You can find me on GitHub, or on Reddit at u/PkLavc.

## Reporting Issues (Bugs)

Found a bug? Open an issue with: Project name, what happened, and how to reproduce it. Simple as that.

## Suggesting Improvements

When suggesting an improvement, please include:

*   **Which sub-project is the improvement for?**
*   A clear and concise description of the improvement.
*   Why you think this improvement would be valuable.
*   Any alternative solutions you considered.

## Guidelines for Pull Requests

Before submitting a Pull Request, please make sure to:

1.  **Focus on a specific sub-project**: Your changes should be for one of the portfolio projects.
2.  **Branching**: Fork the repository and create your branch from `main` (or the relevant branch for the specific project, if indicated).
3.  **Code Style**: Follow the code style and best practices of the sub-project (e.g., TypeScript conventions, NestJS, Docker).
4.  **Commit Messages**: Write clear and concise commit messages. Try to use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) pattern when possible.
5.  **Tests**: Include comprehensive tests that cover your changes, ensuring good code coverage where applicable.
6.  **Pass Tests**: Make sure all existing tests pass and the project compiles successfully.
7.  **Linting/Static Analysis**: Fix any linting or static analysis warnings.
8.  **Link to Issue**: If your Pull Request resolves an existing issue, clearly link it in the Pull Request description.

## Current Architecture (Updated)

### Frontend (Standalone HTML Application)
The CodePulse IDE is now a **single-page HTML application** with the following characteristics:

- **Architecture**: Standalone HTML file with embedded CSS and JavaScript
- **No Framework Dependencies**: Pure HTML/CSS/JavaScript implementation
- **Code Editor**: Uses a simple textarea for code input
- **Language Support**: Python, JavaScript, Java, C++, C#, PHP, Go, Ruby
- **Backend Integration**: Connects to external backend at `https://codepulse-monorepo-backend.vercel.app`
- **API Endpoint**: `/api/execute` for code execution
- **Visual Effects**: Particle.js for background effects
- **Styling**: External CSS from `https://pklavc.github.io/css/` (global.css, color-blue.css, index.css)

### Backend (External Service)
- **Deployment**: Vercel serverless functions
- **URL**: `https://codepulse-monorepo-backend.vercel.app`
- **API**: `/api/execute` endpoint for code execution
- **Integration**: Uses Judge0 API via RapidAPI for secure code execution

### Key Changes from Previous Architecture
- **Removed**: React, TypeScript, Vite, Monaco Editor dependencies
- **Simplified**: Single HTML file instead of complex frontend build system
- **Externalized**: Backend runs as separate service on Vercel
- **Streamlined**: Direct API communication without complex frontend tooling

## Development Workflow

### For Frontend Changes
1. Edit `index.html` directly
2. Test locally by opening the file in a browser
3. Ensure backend API is accessible at the configured URL
4. Test code execution for all supported languages

### For Backend Changes
1. Work on the backend repository separately
2. Deploy to Vercel
3. Update frontend configuration if needed

### Testing
- Manual testing through the web interface
- Verify code execution for all supported languages
- Test error handling and timeout scenarios
- Validate visual effects and responsive design

## Important Notes

- **No Build Process**: The frontend requires no build tools or compilation
- **External Dependencies**: Relies on external CSS and JavaScript libraries
- **Backend Independence**: Frontend and backend are completely separate
- **Direct API Calls**: Simple fetch API calls to external backend service
- **Cross-Origin**: Proper CORS configuration required on backend

## Getting Help

If you have questions or need assistance:

1. Check the existing issues and discussions
2. Review the updated architecture documentation
3. Look at the current implementation in `index.html`
4. Test the live application at https://pklavc.github.io/codepulse-monorepo/

Your contributions are valuable in improving this streamlined, standalone IDE application!