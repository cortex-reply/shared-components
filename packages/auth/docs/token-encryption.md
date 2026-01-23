# Token Encryption

The auth package now encrypts OAuth access tokens and refresh tokens before storing them in the Payload database.

## Overview

All `access_token` and `refresh_token` values in the Users collection accounts array are now encrypted using AES-256-GCM encryption before being stored in the database. This provides an additional layer of security for sensitive OAuth tokens.

## Encryption Method

- **Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Key Derivation**: SHA-256 hash of PAYLOAD_SECRET environment variable combined with user ID
- **IV**: Random 12-byte initialization vector generated for each encryption
- **Format**: `iv:authTag:encryptedData` (all hex-encoded)

## Security Features

1. **Reversible Encryption**: Tokens can be decrypted when needed for API calls
2. **Unique IVs**: Each encryption uses a unique random initialization vector
3. **Authentication**: GCM mode provides authentication tags to prevent tampering
4. **Per-User Encryption**: Each user's tokens are encrypted with a unique key derived from PAYLOAD_SECRET and their user ID
5. **Key Management**: Uses existing PAYLOAD_SECRET environment variable combined with user ID

## Usage

The encryption and decryption are handled automatically by the auth package:

### Storing Tokens (Automatic)

When tokens are stored via `persistTokens()`:
```typescript
await payloadAuthConfig.persistTokens(user.id, account, payloadConfig)
```

### Retrieving Tokens (Automatic)

When tokens are retrieved via `getAccessToken()`:
```typescript
const token = await getAccessToken(payload, session.user.id);
```

## Migration

The decryption function includes backward compatibility for unencrypted tokens:
- If a token doesn't match the encrypted format, it's returned as-is
- A warning is logged for audit purposes
- This allows for gradual migration of existing tokens

## Environment Variables

Requires `PAYLOAD_SECRET` environment variable to be set. This is used as the encryption key.

## Security Considerations

1. **PAYLOAD_SECRET must be kept secure** - anyone with access to this secret and a user ID can decrypt that user's tokens
2. **User ID isolation** - tokens are encrypted per-user, so compromising one user's encryption key doesn't affect other users
3. **Rotate PAYLOAD_SECRET carefully** - changing it will make existing encrypted tokens unreadable for all users
4. **Backup strategy** - ensure proper backup procedures are in place before rotating keys
5. **Audit logs** - warnings are logged when unencrypted tokens are encountered

## Functions

### `encryptToken(token, secret, userId)`
Encrypts a token string using AES-256-GCM.

**Parameters:**
- `token` (string | null | undefined): The token to encrypt
- `secret` (string): The encryption key (typically PAYLOAD_SECRET)
- `userId` (string): The user ID to include in key derivation

**Returns:** Encrypted token string or null

### `decryptToken(encryptedToken, secret, userId)`
Decrypts a token that was encrypted with encryptToken.

**Parameters:**
- `encryptedToken` (string | null | undefined): The encrypted token
- `secret` (string): The encryption key (typically PAYLOAD_SECRET)
- `userId` (string): The user ID to include in key derivation

**Returns:** Decrypted token string or null
