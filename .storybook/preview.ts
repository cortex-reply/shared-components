import type { Preview, Renderer } from '@storybook/react';
import '../packages/ui/src/globals.css';
import { withThemeByClassName } from '@storybook/addon-themes';

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
    decorators: [
  withThemeByClassName<Renderer>({
    themes: {
      light: '',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
 ]
  },
};

export default preview;
