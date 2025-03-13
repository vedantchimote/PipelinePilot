# GitLab CI/CD Visual Editor Documentation

This directory contains the complete documentation for GitLab CI/CD Visual Editor, built with [Mintlify](https://mintlify.com/).

## Documentation Structure

```
docs/
├── mint.json                    # Mintlify configuration
├── introduction.mdx             # Project introduction
├── quickstart.mdx              # Quick start guide
├── installation.mdx            # Installation instructions
├── features.mdx                # Feature overview
├── user-guide/                 # User guides
│   ├── creating-pipelines.mdx
│   ├── canvas-interface.mdx
│   ├── job-configuration.mdx
│   ├── templates.mdx
│   ├── import-export.mdx
│   ├── keyboard-shortcuts.mdx
│   └── validation.mdx
├── concepts/                   # Core concepts
│   ├── pipeline-state.mdx
│   ├── yaml-engine.mdx
│   ├── dependency-graph.mdx
│   └── stages-vs-needs.mdx
├── architecture/               # Architecture docs
│   ├── overview.mdx
│   ├── tech-stack.mdx
│   ├── data-flow.mdx
│   ├── state-management.mdx
│   └── components.mdx
├── api-reference/              # API documentation
│   ├── yaml-engine.mdx
│   ├── gitlab-api-client.mdx
│   ├── redux-actions.mdx
│   └── utilities.mdx
├── development/                # Development guides
│   ├── setup.mdx
│   ├── project-structure.mdx
│   ├── testing.mdx
│   ├── property-based-testing.mdx
│   └── debugging.mdx
├── contributing/               # Contributing guides
│   ├── guidelines.mdx
│   ├── code-style.mdx
│   ├── pull-requests.mdx
│   └── testing-requirements.mdx
└── deployment/                 # Deployment guides
    ├── building.mdx
    ├── environment-variables.mdx
    └── hosting.mdx
```

## Running Documentation Locally

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install Mintlify CLI globally
npm install -g mintlify

# Or use npx (no installation required)
npx mintlify dev
```

### Development Server

```bash
# Navigate to docs directory
cd docs

# Start development server
mintlify dev
```

The documentation will be available at `http://localhost:3000`

## Writing Documentation

### File Format

Documentation files use MDX (Markdown + JSX), allowing you to use React components within Markdown.

### Frontmatter

Each documentation file should start with frontmatter:

```mdx
---
title: Page Title
description: 'Brief description of the page content'
---
```

### Components

Mintlify provides several built-in components:

#### Cards

```mdx
<Card title="Card Title" icon="icon-name" href="/path">
  Card description
</Card>

<CardGroup cols={2}>
  <Card title="Card 1" icon="icon-1" href="/path-1">
    Description 1
  </Card>
  <Card title="Card 2" icon="icon-2" href="/path-2">
    Description 2
  </Card>
</CardGroup>
```

#### Accordions

```mdx
<AccordionGroup>
  <Accordion title="Accordion Title" icon="icon-name">
    Accordion content
  </Accordion>
</AccordionGroup>
```

#### Tabs

```mdx
<Tabs>
  <Tab title="Tab 1">
    Content for tab 1
  </Tab>
  <Tab title="Tab 2">
    Content for tab 2
  </Tab>
</Tabs>
```

#### Steps

```mdx
<Steps>
  <Step title="Step 1">
    Instructions for step 1
  </Step>
  <Step title="Step 2">
    Instructions for step 2
  </Step>
</Steps>
```

#### Callouts

```mdx
<Note>
  This is a note callout
</Note>

<Tip>
  This is a tip callout
</Tip>

<Warning>
  This is a warning callout
</Warning>

<Info>
  This is an info callout
</Info>
```

#### Code Blocks

````mdx
```typescript
// TypeScript code with syntax highlighting
const example = "Hello, World!";
```
````

#### API Parameters

```mdx
<ParamField path="paramName" type="string" required>
  Parameter description
</ParamField>

<ResponseField name="fieldName" type="string">
  Response field description
</ResponseField>
```

### Icons

Mintlify uses [Font Awesome](https://fontawesome.com/icons) icons. Reference icons by name:

```mdx
<Card icon="rocket" title="Get Started">
  ...
</Card>
```

Common icons:
- `rocket` - Getting started
- `book` - Documentation
- `code` - Code/API
- `lightbulb` - Tips/Ideas
- `bug` - Bugs/Issues
- `users` - Community
- `github` - GitHub
- `gitlab` - GitLab

## Documentation Guidelines

### Writing Style

1. **Be Clear and Concise**: Use simple language and short sentences
2. **Use Active Voice**: "Click the button" not "The button should be clicked"
3. **Include Examples**: Show code examples for technical concepts
4. **Add Screenshots**: Visual aids help users understand UI features
5. **Link Related Pages**: Help users discover related content

### Code Examples

- Always test code examples before publishing
- Include necessary imports and context
- Use TypeScript for type safety
- Add comments to explain complex logic

### Screenshots

- Use high-resolution images (2x for retina displays)
- Crop to show only relevant UI
- Add annotations to highlight important elements
- Use consistent browser/OS for screenshots
- Store images in `docs/images/` directory

### Linking

- Use relative links for internal pages: `/user-guide/creating-pipelines`
- Use absolute URLs for external links: `https://gitlab.com`
- Always include link text: `[GitLab Docs](https://docs.gitlab.com)`

## Deployment

Documentation is automatically deployed when changes are pushed to the main branch.

### Manual Deployment

```bash
# Build documentation
mintlify build

# Deploy to Mintlify
mintlify deploy
```

## Contributing to Documentation

1. Fork the repository
2. Create a branch: `git checkout -b docs/your-improvement`
3. Make changes to documentation files
4. Test locally: `mintlify dev`
5. Commit: `git commit -m "docs: improve installation guide"`
6. Push and create a Pull Request

## Documentation Checklist

Before submitting documentation changes:

- [ ] Frontmatter is complete (title, description)
- [ ] Code examples are tested and working
- [ ] Screenshots are high-quality and relevant
- [ ] Links are working (internal and external)
- [ ] Spelling and grammar are correct
- [ ] Content is clear and concise
- [ ] Related pages are linked
- [ ] Navigation is updated in `mint.json` if needed

## Questions?

- Check the [Mintlify Documentation](https://mintlify.com/docs)
- Ask in [GitHub Discussions](https://github.com/yourusername/gitlab-cicd-visual-editor/discussions)
- Open an issue for documentation bugs

## License

Documentation is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
