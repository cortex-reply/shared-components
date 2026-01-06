# GitHub Workflows

This repository includes automated GitHub Actions workflows for CI/CD.

## Workflows

### CI (`ci.yml`)

Runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

Actions:
- Type checking
- Linting
- Building all packages
- Running tests

Matrix testing across Node.js 18.x and 20.x

### Publish NPM Packages (`publish.yml`)

Triggered by:
- Git tags matching `v*` (e.g., `v0.1.0`)
- Git tags matching `@cortex-shared/*@*` (package-specific tags)

Actions:
- Builds all packages
- Publishes `@cortex-shared/ui` to npm
- Publishes `@cortex-shared/auth` to npm

**Required:** `NPM_TOKEN` secret configured in GitHub repository settings.

### Publish Python Packages (`publish-python.yml`)

Triggered by:
- Git tags matching `python-v*` (e.g., `python-v0.1.0`)
- Manual workflow dispatch

Actions:
- Sets up Python environment
- Installs dependencies with uv
- Builds Python packages
- Publishes to PyPI

**Required:** `PYPI_API_TOKEN` secret configured in GitHub repository settings (configured automatically by PyPI trusted publishers).

## Setup

### NPM Publishing

1. Generate an npm access token:
   - Go to https://www.npmjs.com/settings/~/tokens
   - Create a new token with "Publish" permissions
   - Copy the token

2. Add to GitHub secrets:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Create new secret `NPM_TOKEN` with the token value

### Python Publishing

1. For PyPI, use [trusted publishers](https://docs.pypi.org/trusted-publishers/):
   - Create PyPI account
   - In PyPI settings, add trusted publisher for your repo
   - No secrets needed if using trusted publishers

2. Or create a PyPI API token:
   - Go to https://pypi.org/manage/account/tokens/
   - Create new token
   - Add to GitHub secrets as `PYPI_API_TOKEN`

## Publishing Workflow

### NPM Packages

1. Make changes to packages
2. Update version numbers in respective `package.json` files
3. Commit changes
4. Create a git tag: `git tag v0.1.0`
5. Push tag: `git push origin v0.1.0`
6. Workflow automatically publishes to npm

### Python Packages

1. Make changes to Python packages
2. Update version numbers in respective `pyproject.toml` files
3. Commit changes
4. Create a git tag: `git tag python-v0.1.0`
5. Push tag: `git push origin python-v0.1.0`
6. Workflow automatically publishes to PyPI

## Manual Triggering

To manually trigger the Python publish workflow without creating a tag:
- Go to Actions → Publish Python Packages → Run workflow
- Select desired branch and run

## Monitoring

Check the Actions tab in your GitHub repository to view:
- Workflow run history
- Build logs
- Publication status
