# Project Setup Guide

This guide will help you set up the GitLab CI/CD Visual Editor project for development.

## Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or 20.x ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

Verify installations:
```bash
node --version  # Should be v18.x or v20.x
npm --version   # Should be 9.x or higher
git --version   # Any recent version
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gitlab-cicd-visual-editor.git
cd gitlab-cicd-visual-editor
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies defined in `package.json`:
- React 18+ and React DOM
- Redux Toolkit and React Redux
- React Flow for canvas
- Monaco Editor for YAML preview
- Tailwind CSS for styling
- Vite for build tooling
- Vitest for testing
- Playwright for E2E testing
- fast-check for property-based testing
- And many more...

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure as needed:
```env
# GitLab API Configuration (Optional - for validation and templates)
VITE_GITLAB_API_URL=https://gitlab.com/api/v4
VITE_GITLAB_TOKEN=your_personal_access_token_here

# Application Configuration
VITE_APP_NAME=GitLab CI/CD Visual Editor
VITE_AUTO_SAVE_INTERVAL=30000
VITE_VALIDATION_DEBOUNCE=500

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_TEMPLATES=true
VITE_ENABLE_VALIDATION=true
```

**Note:** GitLab API integration is optional. The application works fully offline without a token.

### 4. Set Up Git Hooks

```bash
npm run prepare
```

This installs Husky git hooks for:
- Pre-commit: Runs lint-staged (linting and formatting)
- Pre-push: Runs tests (optional, can be configured)

### 5. Install Playwright Browsers (for E2E tests)

```bash
npx playwright install
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173` with hot module replacement (HMR).

### Project Structure

```
gitlab-cicd-visual-editor/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── .husky/
│   └── pre-commit              # Git pre-commit hook
├── .vscode/
│   ├── extensions.json         # Recommended VS Code extensions
│   └── settings.json           # VS Code workspace settings
├── docs/                       # Mintlify documentation
│   ├── mint.json
│   ├── introduction.mdx
│   └── ...
├── e2e/                        # Playwright E2E tests
├── public/                     # Static assets
├── src/
│   ├── components/             # React components
│   ├── engine/                 # YAML engine and utilities
│   ├── store/                  # Redux store and slices
│   ├── test/                   # Test utilities and setup
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # Vite environment types
├── .env.example                # Environment variables template
├── .eslintrc.cjs               # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier configuration
├── CHANGELOG.md                # Project changelog
├── CONTRIBUTING.md             # Contributing guidelines
├── LICENSE                     # MIT License
├── README.md                   # Project README
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── playwright.config.ts        # Playwright configuration
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest unit test config
├── vitest.integration.config.ts # Vitest integration test config
└── vitest.property.config.ts   # Vitest property test config
```

### Available Scripts

#### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

#### Testing
```bash
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:property    # Run property-based tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
npm run test:watch       # Run tests in watch mode
npm run coverage         # Generate coverage report
```

#### Code Quality
```bash
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run format:check     # Check formatting
npm run type-check       # Type check
```

## IDE Setup

### VS Code (Recommended)

The project includes VS Code configuration in `.vscode/`:

**Recommended Extensions** (will be suggested automatically):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Playwright Test for VS Code

**Settings** (already configured):
- Format on save
- Auto-fix ESLint issues on save
- Tailwind CSS IntelliSense

### WebStorm / IntelliJ IDEA

1. Open the project
2. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
3. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
4. TypeScript support is enabled by default

## Running Tests

### Unit Tests

```bash
npm run test:unit
```

Tests individual components and functions using Vitest and React Testing Library.

### Property-Based Tests

```bash
npm run test:property
```

Tests universal correctness properties using fast-check.

### Integration Tests

```bash
npm run test:integration
```

Tests external integrations (GitLab API, localStorage) using MSW for mocking.

### E2E Tests

```bash
npm run test:e2e
```

Tests complete user workflows using Playwright in Chrome, Firefox, and Safari.

### Watch Mode

```bash
npm run test:watch
```

Runs tests in watch mode for rapid development.

### Coverage

```bash
npm run coverage
```

Generates coverage report in `coverage/` directory.

## Building for Production

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## Documentation

### Run Documentation Locally

```bash
# Install Mintlify CLI globally
npm install -g mintlify

# Navigate to docs directory
cd docs

# Start documentation server
mintlify dev
```

Visit `http://localhost:3000` to view the documentation.

## Troubleshooting

### Port 5173 Already in Use

Change the port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000, // Change to any available port
  },
});
```

### Dependencies Installation Fails

Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tests Fail

Ensure all dependencies are installed:
```bash
npm install
npx playwright install
```

### ESLint/Prettier Conflicts

Run format and lint fix:
```bash
npm run format
npm run lint:fix
```

## Next Steps

1. **Read the Documentation**: Check `docs/` for comprehensive guides
2. **Review the Spec**: See `.kiro/specs/gitlab-cicd-visual-editor/` for requirements, design, and tasks
3. **Start Implementing**: Follow the task list in `tasks.md`
4. **Run Tests**: Ensure all tests pass before committing
5. **Contribute**: See `CONTRIBUTING.md` for contribution guidelines

## Getting Help

- **Documentation**: [docs/introduction.mdx](docs/introduction.mdx)
- **Issues**: [GitHub Issues](https://github.com/yourusername/gitlab-cicd-visual-editor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gitlab-cicd-visual-editor/discussions)

## License

MIT License - see [LICENSE](LICENSE) file for details.
