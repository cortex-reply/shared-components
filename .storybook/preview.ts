import type { Preview } from '@storybook/react';
import '../packages/ui/src/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: ['Guides', 'Auth', 'UI', 'Python'],
      },
    },
  },
};

export default preview;
