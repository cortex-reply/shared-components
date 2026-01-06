# Python Packages

This directory contains Python packages for shared utilities and components.

## Structure

Create subdirectories for each Python package. Example:

```
python/
├── cortex-shared-auth/      # Authentication utilities
│   ├── src/
│   │   └── cortex_shared_auth/
│   │       ├── __init__.py
│   │       └── ...
│   └── pyproject.toml
├── cortex-shared-utils/     # General utilities
│   ├── src/
│   │   └── cortex_shared_utils/
│   │       ├── __init__.py
│   │       └── ...
│   └── pyproject.toml
└── pyproject.toml           # Root workspace config
```

## Development

### Setup

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync --all-extras

# Activate virtual environment
source .venv/bin/activate
```

### Commands

```bash
# Install dependencies
uv sync

# Add a new dependency
uv add package-name

# Add a dev dependency
uv add --dev package-name

# Run tests
uv run pytest

# Run linting and formatting
uv run black .
uv run isort .
uv run flake8
uv run mypy
uv run pylint

# Or use tox with uv
uv run tox
```
