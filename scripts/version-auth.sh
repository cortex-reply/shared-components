#!/bin/bash
# Semantic versioning helper for auth package
# Usage: ./scripts/version-auth.sh [major|minor|patch]

set -e

PACKAGE_FILE="packages/auth/package.json"

if [ ! -f "$PACKAGE_FILE" ]; then
  echo "❌ Error: $PACKAGE_FILE not found"
  exit 1
fi

# Get current version
CURRENT_VERSION=$(node -e "console.log(require('./$PACKAGE_FILE').version)")

echo "📦 Current version: $CURRENT_VERSION"

# If no argument provided, just show current version
if [ -z "$1" ]; then
  echo "Usage: $0 [major|minor|patch]"
  echo "Example: $0 minor"
  exit 0
fi

# Validate semver increment type
if [[ ! "$1" =~ ^(major|minor|patch)$ ]]; then
  echo "❌ Error: Invalid increment type '$1'. Must be 'major', 'minor', or 'patch'"
  exit 1
fi

# Use npm version to bump version
cd "packages/auth"
npm version "$1" --no-git-tag-version
NEW_VERSION=$(node -e "console.log(require('./package.json').version)")
cd - > /dev/null

echo "✅ Version bumped: $CURRENT_VERSION → $NEW_VERSION"
echo ""
echo "Next steps:"
echo "1. Review the version change in packages/auth/package.json"
echo "2. Commit the version bump: git add packages/auth/package.json && git commit -m \"chore: bump auth to v$NEW_VERSION\""
echo "3. Create a git tag: git tag auth-v$NEW_VERSION"
echo "4. Push to trigger the workflow: git push origin main --tags"
