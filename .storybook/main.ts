import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../packages/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/ui/**/*.mdx',
    '../packages/auth/**/*.mdx',
    '../python/*.mdx',
    '../docs/*.mdx',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['./public'],
};
export default config;
