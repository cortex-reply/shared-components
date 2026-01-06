import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export interface TokenOptions {
  expiresIn?: string | number;
  issuer?: string;
  audience?: string;
  subject?: string;
}

const DEFAULT_EXPIRES_IN = '24h';

/**
 * Generate a JWT token with the provided payload
 */
export function generateToken(
  payload: TokenPayload,
  secret: string,
  options: TokenOptions = {}
): string {
  const tokenOptions = {
    expiresIn: options.expiresIn || DEFAULT_EXPIRES_IN,
    ...(options.issuer && { issuer: options.issuer }),
    ...(options.audience && { audience: options.audience }),
    ...(options.subject && { subject: options.subject }),
  };

  return jwt.sign(payload, secret, tokenOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string, secret: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload | null;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}
