# Contributing to GitLab CI/CD Visual Editor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/gitlab-cicd-visual-editor.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running the Application

```bash
npm run dev
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:property    # Property-based tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Watch mode
npm run test:watch

# Coverage
npm run coverage
```

### Code Quality

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Type check
npm run type-check
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `chore:` - Build process or auxiliary tool changes

Examples:
```
feat: add template search functionality
fix: resolve circular dependency detection
docs: update installation guide
test: add property tests for YAML engine
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Create a Pull Request with a clear description

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing Requirements

- All new features must have tests
- Maintain or improve code coverage
- Property-based tests for universal properties
- Integration tests for external dependencies
- E2E tests for critical user workflows

## Documentation

- Update relevant documentation in `docs/`
- Add JSDoc comments for public APIs
- Include examples in documentation
- Keep README.md up to date

## Questions?

- Check the [documentation](docs/introduction.mdx)
- Open a [discussion](https://github.com/yourusername/gitlab-cicd-visual-editor/discussions)
- Ask in [issues](https://github.com/yourusername/gitlab-cicd-visual-editor/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
