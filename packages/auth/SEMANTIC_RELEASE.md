# Semantic Release Configuration for cortex-auth

This directory uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) to automate versioning and publishing.

## Commit Message Convention

We follow [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: A new feature (MINOR version bump)
- **fix**: A bug fix (PATCH version bump)
- **perf**: A code change that improves performance (PATCH version bump)
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace, etc.)
- **refactor**: Code refactor without feature/fix changes
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, etc.

### Breaking Changes
Add `BREAKING CHANGE:` in the footer to trigger a MAJOR version bump:

```
feat: redesign authentication API

BREAKING CHANGE: The login() function signature has changed.
Use authenticate() instead.
```

### Examples

**Feature (MINOR)**
```
feat(jwt): add token refresh functionality
```

**Bug Fix (PATCH)**
```
fix(password): handle special characters in validation
```

**Breaking Change (MAJOR)**
```
feat(api): update authentication interface

BREAKING CHANGE: old auth methods are deprecated
```

## Automatic Release Workflow

1. **Commit** with conventional commit message to `main`, `beta`, or `alpha` branch
2. **Push** to trigger the release workflow
3. **semantic-release** automatically:
   - Determines next version (major/minor/patch)
   - Generates CHANGELOG.md
   - Updates package.json
   - Publishes to npm as `cortex-auth`
   - Publishes to GitHub Packages as `@cortex-reply/auth`
   - Creates a GitHub Release
   - Commits version bump back to the repo

## No Manual Versioning Needed

You don't need to manually run version scripts. Just commit with proper messages:

```bash
# Make changes
git add .
git commit -m "feat(auth): add 2FA support"
git push origin main
# → Automatic: version bumped, published to both registries, GitHub release created
```

## Prerequisites

GitHub Actions secrets needed:
- `NPM_TOKEN`: Your npm registry token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Publishing to Different Channels

### Stable Release (main branch)
Push to `main` - publishes as latest

### Beta Release (beta branch)
Push to `beta` - publishes with `beta` tag

### Alpha Release (alpha branch)
Push to `alpha` - publishes with `alpha` tag

## Helpful Tools

### commitizen (optional)
Interactive commit helper:
```bash
pnpm add -D commitizen cz-conventional-changelog
# Then use:
git cz
```

### commitlint (optional)
Enforce commit message conventions:
```bash
pnpm add -D commitlint @commitlint/config-conventional
```
