# GitLab CI/CD Visual Editor

A modern, visual approach to building GitLab CI/CD pipelines. Create pipelines using an intuitive drag-and-drop interface and export optimized YAML files.

## Features

- 🎨 **Visual Canvas** - Drag and drop jobs, create dependencies visually
- ⚡ **Real-Time YAML** - See your YAML generated in real-time with optimizations
- ✅ **GitLab Integration** - Validate pipelines against GitLab's API
- 📦 **Template Library** - Use pre-built templates for common CI/CD patterns
- 🔄 **Bidirectional Sync** - Import existing YAML files or export your visual pipeline
- 🌙 **Dark Mode** - Beautiful dark-first interface for developers
- ⌨️ **Keyboard Shortcuts** - Power user features for efficient editing
- ♿ **Accessible** - WCAG AA compliant with screen reader support

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gitlab-cicd-visual-editor.git
cd gitlab-cicd-visual-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

## Documentation

Full documentation is available in the `docs/` directory:

- [Quick Start Guide](docs/quickstart.mdx)
- [User Guide](docs/user-guide/creating-pipelines.mdx)
- [API Reference](docs/api-reference/yaml-engine.mdx)
- [Architecture](docs/architecture/overview.mdx)
- [Contributing](docs/contributing/guidelines.mdx)

### Run Documentation Locally

```bash
# Install Mintlify CLI
npm install -g mintlify

# Navigate to docs directory
cd docs

# Start documentation server
mintlify dev
```

Visit `http://localhost:3000` to view the documentation.

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:property    # Run property-based tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
npm run test:watch       # Run tests in watch mode
npm run coverage         # Generate coverage report

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run format:check     # Check formatting
npm run type-check       # Type check
```

### Project Structure

```
gitlab-cicd-visual-editor/
├── src/
│   ├── components/      # React components
│   ├── store/           # Redux store and slices
│   ├── engine/          # YAML engine and utilities
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── test/            # Test utilities and setup
├── e2e/                 # End-to-end tests
├── docs/                # Mintlify documentation
├── .kiro/               # Kiro spec files
│   └── specs/
│       └── gitlab-cicd-visual-editor/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
└── public/              # Static assets
```

## Technology Stack

- **React 18+** with TypeScript
- **React Flow** for node-based canvas
- **Redux Toolkit** for state management
- **Monaco Editor** for YAML preview
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **fast-check** for property-based testing

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing/guidelines.mdx) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

## Testing

The project uses a comprehensive testing strategy:

- **Unit Tests** - Component and function testing with Vitest
- **Property-Based Tests** - Universal correctness properties with fast-check
- **Integration Tests** - External integrations with MSW
- **E2E Tests** - Complete workflows with Playwright

See [Testing Guide](docs/development/testing.mdx) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React Flow](https://reactflow.dev/)
- Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Documentation with [Mintlify](https://mintlify.com/)

## Support

- 📖 [Documentation](docs/introduction.mdx)
- 🐛 [Report Bug](https://github.com/yourusername/gitlab-cicd-visual-editor/issues)
- 💡 [Request Feature](https://github.com/yourusername/gitlab-cicd-visual-editor/issues)
- 💬 [Discussions](https://github.com/yourusername/gitlab-cicd-visual-editor/discussions)

---

Made with ❤️ by the community
