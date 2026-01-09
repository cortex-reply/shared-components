# Publishing cortex-auth Package

This guide explains how to publish the auth package to npm and GitHub Packages.

## Configuration Overview

The auth package is configured for publishing to:
- **npm**: Published as `cortex-auth` (manual via script)
- **GitHub Packages**: Published as `@cortex-reply/auth` (automatic via GitHub Actions)

## Prerequisites

### 1. NPM Token for npm Registry
1. Go to [npmjs.com](https://www.npmjs.com)
2. Create an account if you don't have one
3. Navigate to Access Tokens → Generate New Token
4. Choose "Automation" or "Publish" level access
5. Add as a GitHub Actions secret named `NPM_TOKEN`

### 2. GitHub Token
The `GITHUB_TOKEN` is automatically provided by GitHub Actions for publishing to GitHub Packages.

## Publishing

### Publish to npm
```bash
# Set your npm token
export NPM_TOKEN=<your-npm-token>

# Run from the root directory
bash scripts/publish-auth.sh
```

### Publish to GitHub Packages (Automatic)
Publishing to GitHub Packages happens automatically via GitHub Actions workflow when you create a tag matching `auth-v*`.

```bash
# Create a release tag
git tag auth-v0.0.2
git push origin auth-v0.0.2
```

This will trigger the workflow defined in [.github/workflows/publish-auth.yml](.github/workflows/publish-auth.yml).

#### Or trigger manually:
Go to Actions → "Publish Auth Package" → Run workflow → Select branch and click "Run workflow"

## Installation for Users

### Install from npm
```bash
npm install cortex-auth
# or
yarn add cortex-auth
# or
pnpm add cortex-auth
```

### Install from GitHub Packages
Add to `.npmrc`:
```
@cortex-reply:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<your-github-token>
```

Then install:
```bash
npm install @cortex-reply/auth
# or
yarn add @cortex-reply/auth
# or
pnpm add @cortex-reply/auth
```

## Package Configuration Details

### package.json Fields
- **name**: `cortex-auth` (for npm) 
- **publishConfig**: Specifies npm registry and public access
- **repository**: Links to the GitHub repository with the package directory
- **keywords**: Helps with npm discoverability

### .npmrc Configuration
The `.npmrc` file in `packages/auth/` handles:
- Routing `@cortex-reply` scope to GitHub Packages
- Using the `GITHUB_TOKEN` environment variable for authentication
- Default registry pointing to npm

## Troubleshooting

### Authentication Errors
- Verify `NPM_TOKEN` is set correctly for npm publishing
- GitHub token is automatically provided by GitHub Actions

### Version Already Published
- Increment the version in `packages/auth/package.json`
- Create a new tag for GitHub Packages: `git tag auth-v<new-version>`

### Workflow Not Triggering
- Verify the tag matches the pattern `auth-v*`
- Check workflow permissions in repository settings

## Setting Up GitHub Secrets

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `NPM_TOKEN` with your npm token value
4. GitHub provides `GITHUB_TOKEN` automatically

## Workflow Details

The GitHub Actions workflow (`.github/workflows/publish-auth.yml`):
1. Triggers on tags matching `auth-v*` or manual workflow dispatch
2. Checks out the code
3. Sets up Node.js with GitHub Packages registry
4. Installs dependencies
5. Builds the auth package
6. Temporarily updates the package name to `@cortex-reply/auth`
7. Publishes to GitHub Packages
8. Restores the original package name
9. Creates a GitHub Release
