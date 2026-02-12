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
- Node.js 18+
- Yarn package manager
- Playwright for e2e testing

#### Local Setup
```bash
# Install dependencies
yarn install

# Set up Playwright browsers
yarn playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run initial build
yarn build
```

### 4. Start Development
```bash
# Start development servers for all packages
yarn dev

# Or start specific packages
yarn workspace @codepulse/backend dev
yarn workspace @codepulse/frontend dev

# Run tests
yarn test

# Run e2e tests
yarn test:e2e

# Run linting
yarn lint

# Run type checking
yarn typecheck
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