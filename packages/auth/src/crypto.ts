import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Encrypts a token using AES-256-GCM encryption
 * @param token - The token string to encrypt
 * @param secret - The encryption key (PAYLOAD_SECRET)
 * @returns The encrypted token in format: iv:authTag:encryptedData (hex encoded)
 */
export function encryptToken(token: string | null | undefined, secret: string): string | null {
  if (!token) return null;
  
  try {
    // Generate a 32-byte key from the secret using SHA-256
    const key = createHash('sha256').update(secret).digest();
    
    // Generate a random 12-byte initialization vector
    const iv = randomBytes(12);
    
    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt the token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag for GCM mode
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting token:', error);
    return null;
  }
}

/**
 * Decrypts a token that was encrypted with encryptToken
 * @param encryptedToken - The encrypted token string in format: iv:authTag:encryptedData
 * @param secret - The encryption key (PAYLOAD_SECRET)
 * @returns The decrypted token string
 */
export function decryptToken(encryptedToken: string | null | undefined, secret: string): string | null {
  if (!encryptedToken) return null;
  
  try {
    // Parse the encrypted token format
    const parts = encryptedToken.split(':');
    if (parts.length !== 3) {
      // Token might be unencrypted (backward compatibility during migration)
      console.warn('Token format is invalid or unencrypted');
      return encryptedToken;
    }
    
    const [ivHex, authTagHex, encryptedData] = parts;
    
    // Generate the same key from the secret
    const key = createHash('sha256').update(secret).digest();
    
    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the token
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error);
    return null;
  }
}
