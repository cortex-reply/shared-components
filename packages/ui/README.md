# @cortex-shared/ui

Shared UI components built with React, shadcn/ui patterns, and Tailwind CSS.

## Installation

```bash
pnpm add @cortex-shared/ui
```

## Components

- **Button** - Customizable button component with multiple variants

## Usage

```tsx
import { Button, cn } from '@cortex-shared/ui';

export default function App() {
  return (
    <Button variant="default" size="lg">
      Click me
    </Button>
  );
}
```

## Development

```bash
pnpm dev
pnpm build
pnpm lint
pnpm type-check
```

## Documentation

Component documentation is available in the root Storybook. From the repo root:

```bash
pnpm storybook    # View at http://localhost:6006
```
