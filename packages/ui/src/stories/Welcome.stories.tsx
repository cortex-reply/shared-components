import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Guides/2 Overview',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<any>;

export default meta;

export const Welcome: StoryObj = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-4xl font-bold">Cortex Shared UI</h1>
      <p className="text-lg text-gray-600">
        Welcome to the Cortex Shared UI component library. This Storybook documents all
        reusable components built with React, shadcn/ui patterns, and Tailwind CSS.
      </p>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Features</h2>
        <ul className="list-inside list-disc space-y-2 text-gray-600">
          <li>Built on Radix UI primitives for accessibility</li>
          <li>Styled with Tailwind CSS for consistency</li>
          <li>Full TypeScript support with type safety</li>
          <li>Responsive and customizable components</li>
          <li>Comprehensive documentation with live examples</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Getting Started</h2>
        <p className="text-gray-600">
          Install the package from npm and start using components in your application:
        </p>
        <pre className="rounded bg-gray-100 p-4 text-sm">
          {`npm install @cortex-shared/ui`}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Components</h2>
        <p className="text-gray-600">
          Browse the components section in the sidebar to see all available components with
          interactive examples.
        </p>
      </div>
    </div>
  ),
};
