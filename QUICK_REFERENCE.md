# Quick Reference Guide

## 🚀 Getting Started (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` - you're ready to code!

## 📝 Common Commands

### Development
```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:property    # Property-based tests only
npm run test:integration # Integration tests only
npm run test:e2e         # E2E tests only
npm run test:watch       # Watch mode
npm run coverage         # Coverage report
```

### Code Quality
```bash
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format code
npm run format:check     # Check formatting
npm run type-check       # TypeScript check
```

## 📁 Key Files & Directories

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Root React component |
| `src/main.tsx` | Application entry point |
| `src/components/` | React components |
| `src/store/` | Redux store and slices |
| `src/engine/` | YAML engine |
| `src/types/` | TypeScript types |
| `src/utils/` | Utility functions |
| `src/test/` | Test utilities |
| `e2e/` | Playwright E2E tests |
| `docs/` | Mintlify documentation |
| `.kiro/specs/` | Requirements, design, tasks |

## 🎯 Implementation Tasks

See `.kiro/specs/gitlab-cicd-visual-editor/tasks.md` for the complete task list.

**Quick Overview:**
1. ✅ Project setup (infrastructure complete)
2. ⏳ Define TypeScript interfaces
3. ⏳ Implement YAML Engine
4. ⏳ Implement dependency graph
5. ⏳ Implement Canvas with React Flow
6. ⏳ Implement Property Panel
7. ⏳ Integrate Monaco Editor
8. ⏳ GitLab API integration
9. ⏳ Template Library
10. ⏳ Import/Export functionality
... (23 tasks total)

## 🧪 Testing Strategy

| Test Type | Tool | Config | Command |
|-----------|------|--------|---------|
| Unit | Vitest | `vitest.config.ts` | `npm run test:unit` |
| Property | fast-check | `vitest.property.config.ts` | `npm run test:property` |
| Integration | MSW | `vitest.integration.config.ts` | `npm run test:integration` |
| E2E | Playwright | `playwright.config.ts` | `npm run test:e2e` |

## 🎨 Styling

**Tailwind CSS** with custom GitLab theme:

```tsx
// Example usage
<div className="bg-gitlab-dark-bg text-gitlab-dark-text">
  <button className="bg-gitlab-accent-blue hover:bg-blue-600">
    Click me
  </button>
</div>
```

**Custom Colors:**
- `gitlab-dark-bg` - Main background (#1F2937)
- `gitlab-dark-surface` - Card/panel background (#374151)
- `gitlab-dark-text` - Primary text (#F3F4F6)
- `gitlab-accent-blue` - Primary accent (#3B82F6)
- `gitlab-accent-purple` - Secondary accent (#8B5CF6)
- `gitlab-accent-green` - Success (#10B981)
- `gitlab-accent-red` - Error (#EF4444)

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS theme |
| `.eslintrc.cjs` | ESLint rules |
| `.prettierrc` | Prettier formatting |
| `package.json` | Dependencies & scripts |

## 📚 Documentation

### View Documentation Locally
```bash
npm install -g mintlify
cd docs
mintlify dev
```

Visit `http://localhost:3000`

### Key Documentation Pages
- Introduction: `docs/introduction.mdx`
- Quick Start: `docs/quickstart.mdx`
- User Guide: `docs/user-guide/creating-pipelines.mdx`
- API Reference: `docs/api-reference/yaml-engine.mdx`
- Architecture: `docs/architecture/overview.mdx`
- Testing: `docs/development/testing.mdx`

## 🔍 Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
import Component from '@/components/Component';
import { store } from '@/store';
import { yamlEngine } from '@/engine/yaml-engine';
import type { Pipeline_State } from '@/types/pipeline';
import { helper } from '@/utils/helper';
```

## 🐛 Debugging

### VS Code
1. Set breakpoints in code
2. Press F5 or Run → Start Debugging
3. Choose "Chrome" or "Firefox"

### Browser DevTools
- React DevTools: Inspect component tree
- Redux DevTools: Time-travel debugging
- Network tab: Monitor API calls

### Test Debugging
```bash
# Debug specific test
npm run test:watch

# Debug E2E test
npx playwright test --debug
```

## 🚨 Common Issues

### Port 5173 in use
```typescript
// vite.config.ts
export default defineConfig({
  server: { port: 3000 }
});
```

### Dependencies not installing
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tests failing
```bash
npm install
npx playwright install
npm run test
```

### ESLint/Prettier conflicts
```bash
npm run format
npm run lint:fix
```

## 📦 Dependencies

### Production
- React 18.2.0 - UI framework
- Redux Toolkit 2.0.1 - State management
- React Flow 11.10.4 - Canvas
- Monaco Editor 0.45.0 - YAML preview
- js-yaml 4.1.0 - YAML parsing
- Axios 1.6.5 - HTTP client

### Development
- TypeScript 5.3.3 - Type safety
- Vite 5.0.11 - Build tool
- Vitest 1.2.0 - Unit testing
- Playwright 1.41.0 - E2E testing
- fast-check 3.15.0 - Property testing
- Tailwind CSS 3.4.1 - Styling

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Flow](https://reactflow.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [fast-check](https://fast-check.dev/)

## 💡 Tips

1. **Use path aliases** - `@/components` instead of `../../components`
2. **Run tests in watch mode** - `npm run test:watch` for rapid feedback
3. **Use Redux DevTools** - Time-travel debugging is powerful
4. **Format on save** - Already configured in VS Code
5. **Check the spec** - Requirements, design, and tasks are comprehensive
6. **Read the docs** - 40+ pages of documentation available

## 🎯 Next Steps

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development server
3. Review `.kiro/specs/gitlab-cicd-visual-editor/tasks.md`
4. Start with Task 2: Define TypeScript interfaces
5. Follow the task list sequentially

## 📞 Getting Help

- **Documentation**: Check `docs/` directory
- **Spec Files**: See `.kiro/specs/gitlab-cicd-visual-editor/`
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions

---

**Quick Start**: `npm install && npm run dev` 🚀
