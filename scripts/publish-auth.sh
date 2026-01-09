#!/bin/bash
# Publish cortex-auth using semantic-release

set -e

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "⚠️  .env file not found. Make sure NPM_TOKEN and GITHUB_TOKEN are set as environment variables."
fi

echo "🚀 Running semantic-release for @cortex-shared/auth..."
echo ""

cd packages/auth
semantic-release
cd - > /dev/null

echo ""
echo "✅ Semantic release completed"
