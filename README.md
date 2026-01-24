# Cortex Shared Components

A monorepo containing reusable components and utilities for Next.js, Node.js, and Python applications.

## 📦 Packages

### JavaScript/TypeScript Packages

#### [@cortex-shared/ui](./packages/ui)
Reusable React UI components built with shadcn/ui patterns and Tailwind CSS.

**Features:**
- Button component with variants
- Built on Radix UI primitives
- Tailwind CSS styling
- TypeScript support

**Usage:**
```typescript
import { Button } from '@cortex-shared/ui';

export default function App() {
  return <Button variant="default">Click me</Button>;
}
```

#### [@cortex-shared/auth](./packages/auth)
Authentication utilities for Node.js and Next.js applications.

**Features:**
- JWT token generation and verification
- Password hashing and verification
- Email and password validation
- Password strength checker

**Usage:**
```typescript
import { generateToken, verifyPassword } from '@cortex-shared/auth';

const token = generateToken({ id: '123', email: 'user@example.com' }, secret);
const isValid = await verifyPassword('password', hash);
```

### Python Packages

See [python/README.md](./python/README.md) for Python package structure and development.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.0
- Python >= 3.9 (for Python packages)

### Installation

1. Install pnpm (if you haven't already):
```bash
npm install -g pnpm
```

2. Install dependencies:
```bash
pnpm install
```

3. Build all packages:
```bash
pnpm build
```

4. View unified documentation with Storybook:
```bash
pnpm storybook
```
This opens the Storybook documentation at http://localhost:6006 with all components and guides.

## 📝 Development

### Available Scripts

```bash
# Development mode (watch all packages)
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Test all packages
pnpm test
```

### Documentation

#### Unified Storybook

Interactive documentation for all components and utilities:

```bash
pnpm storybook           # View Storybook (http://localhost:6006)
pnpm storybook:build     # Build static site for deployment
```

The Storybook includes:
- **UI Components** - Interactive component explorer with live examples
- **Auth Utilities** - Complete API reference with code examples
- **Python Packages** - Setup and usage guides
- **Guides** - Additional documentation and best practices

## 📚 Package Structure

```
shared-components/
├── packages/
│   ├── ui/                 # UI components
│   │   ├── src/
│   │   ├── .storybook/     # Component stories
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── auth/               # Auth utilities
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── docs/                   # Storybook documentation
│   ├── Welcome.mdx
│   ├── Auth.mdx
│   └── Python.mdx
├── .storybook/             # Root Storybook config
│   ├── main.ts
│   └── preview.ts
├── python/                 # Python packages directory
│   ├── pyproject.toml
│   └── setup.cfg
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Run tests on PR/push
│   │   ├── publish.yml            # Publish to npm
│   │   ├── publish-python.yml     # Publish to PyPI
│   │   └── storybook.yml          # Deploy docs to Pages
│   └── WORKFLOWS.md
├── package.json            # Root workspace config
├── tsconfig.json           # Shared TypeScript config
├── turbo.json              # Turbo repo config
├── .eslintrc.json          # Shared ESLint config
├── .prettierrc              # Shared Prettier config
└── .gitignore
```

## 🔧 Configuration

### TypeScript
All packages share a base TypeScript configuration from `tsconfig.json`. Individual packages can extend this configuration in their own `tsconfig.json` files.

### Linting & Formatting
- **ESLint**: `.eslintrc.json` - Shared linting rules
- **Prettier**: `.prettierrc` - Shared formatting rules

### Build & Task Management
- **Turbo**: `turbo.json` - Monorepo task orchestration
- **pnpm Workspaces**: `package.json` - Workspace configuration

## 📦 Publishing Packages

### NPM Packages

Before publishing, ensure:
1. Version numbers are updated in each package's `package.json`
2. All tests pass
3. All builds are successful

Publish with:
```bash
cd packages/ui
npm publish

cd ../auth
npm publish
```

### Python Packages

Create individual `pyproject.toml` files in subdirectories under `python/` for each Python package. See [python/README.md](./python/README.md) for details.

## 📚 Documentation & Deployment

### Storybook

The unified Storybook is automatically built and deployed to GitHub Pages on every push to `main`.

View the live documentation at: `https://<your-username>.github.io/shared-components/`

To enable GitHub Pages:
1. Go to Settings → Pages
2. Set source to "GitHub Actions"
3. Documentation will deploy automatically

The workflow (`.github/workflows/storybook.yml`):
- Builds all packages
- Generates the Storybook static site
- Deploys to GitHub Pages

## 🧹 Cleanup

To clean up all build artifacts and node_modules:

```bash
pnpm clean    # Remove all node_modules and build outputs
```

## 📖 Adding New Packages

### JavaScript/TypeScript Package

1. Create directory: `mkdir -p packages/my-package/src`
2. Create `package.json`:
```json
{
  "name": "@cortex-shared/my-package",
  "version": "0.0.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```
3. Create `tsconfig.json` extending the root config
4. Run `pnpm install` to add to workspace

### Python Package

1. Create subdirectory: `mkdir -p python/my-package/src/my_package`
2. Create `pyproject.toml` with package configuration
3. See [python/README.md](./python/README.md) for details

## 📄 License

MIT

## 🤝 Contributing

When contributing to this monorepo:
1. Create a feature branch
2. Make changes to relevant packages
3. Update versions appropriately
4. Run `pnpm build && pnpm lint && pnpm test`
5. Create a pull request
   
