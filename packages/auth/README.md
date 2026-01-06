# @cortex-shared/auth

Shared authentication utilities for Node.js and Next.js applications.

## Installation

```bash
pnpm add @cortex-shared/auth
```

## Features

- JWT token generation and verification
- Password hashing and verification
- Email and password validation
- Password strength checker

## Usage

### JWT Utilities

```typescript
import { generateToken, verifyToken } from '@cortex-shared/auth';

const secret = 'your-secret-key';
const payload = { id: '123', email: 'user@example.com' };

// Generate token
const token = generateToken(payload, secret);

// Verify token
const decoded = verifyToken(token, secret);
```

### Password Utilities

```typescript
import { hashPassword, verifyPassword } from '@cortex-shared/auth';

// Hash password
const hash = await hashPassword('myPassword123!');

// Verify password
const isMatch = await verifyPassword('myPassword123!', hash);
```

### Validation Utilities

```typescript
import {
  isValidEmail,
  isStrongPassword,
  getPasswordStrengthFeedback,
  sanitizeEmail,
} from '@cortex-shared/auth';

// Validate email
if (isValidEmail('user@example.com')) {
  const sanitized = sanitizeEmail('  User@Example.com  ');
  // 'user@example.com'
}

// Check password strength
if (isStrongPassword('MyPassword123!')) {
  const feedback = getPasswordStrengthFeedback('weak');
  // { score: 1, feedback: [...] }
}
```

## Development

```bash
pnpm dev      # Watch mode
pnpm build    # Build
pnpm lint     # Lint
pnpm type-check # Type check
```
