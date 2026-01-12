# Token Encryption

The auth package now encrypts OAuth access tokens and refresh tokens before storing them in the Payload database.

## Overview

All `access_token` and `refresh_token` values in the Users collection accounts array are now encrypted using AES-256-GCM encryption before being stored in the database. This provides an additional layer of security for sensitive OAuth tokens.

## Encryption Method

- **Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Key Derivation**: SHA-256 hash of PAYLOAD_SECRET environment variable
- **IV**: Random 12-byte initialization vector generated for each encryption
- **Format**: `iv:authTag:encryptedData` (all hex-encoded)

## Security Features

1. **Reversible Encryption**: Tokens can be decrypted when needed for API calls
2. **Unique IVs**: Each encryption uses a unique random initialization vector
3. **Authentication**: GCM mode provides authentication tags to prevent tampering
4. **Key Management**: Uses existing PAYLOAD_SECRET environment variable

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

1. **PAYLOAD_SECRET must be kept secure** - anyone with access to this secret can decrypt stored tokens
2. **Rotate PAYLOAD_SECRET carefully** - changing it will make existing encrypted tokens unreadable
3. **Backup strategy** - ensure proper backup procedures are in place before rotating keys
4. **Audit logs** - warnings are logged when unencrypted tokens are encountered

## Functions

### `encryptToken(token, secret)`
Encrypts a token string using AES-256-GCM.

**Parameters:**
- `token` (string | null | undefined): The token to encrypt
- `secret` (string): The encryption key (typically PAYLOAD_SECRET)

**Returns:** Encrypted token string or null

### `decryptToken(encryptedToken, secret)`
Decrypts a token that was encrypted with encryptToken.

**Parameters:**
- `encryptedToken` (string | null | undefined): The encrypted token
- `secret` (string): The encryption key (typically PAYLOAD_SECRET)

**Returns:** Decrypted token string or null
