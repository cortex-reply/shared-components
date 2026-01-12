import type { User } from '@/types'
import type { Payload } from 'payload'
import { decryptToken, encryptToken } from '../crypto'

type AccountRow = NonNullable<User['accounts']>[number]

export async function getAccessToken(payload: Payload, userId: string) {
  const user = await payload.findByID({ collection: "users", id: userId, depth: 0 });

  const kc = (user as Partial<User>)?.accounts?.find((a: AccountRow) => a.provider === "keycloak") as AccountRow | undefined;
  
  // Check if keycloak account exists
  if (!kc) return null;
  
  // Get the PAYLOAD_SECRET for decryption
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error('PAYLOAD_SECRET environment variable is required for token decryption');
  }

  // Decrypt the access token
  const decryptedAccessToken = decryptToken(kc.access_token, secret);
  if (!decryptedAccessToken) return null;

  const expiresAt = kc.expires_at ?? 0;
  const stillValid = expiresAt === 0 || Date.now() < expiresAt * 1000 - 30_000; // 30s skew
  if (stillValid) return decryptedAccessToken;

  // Refresh if needed
  const decryptedRefreshToken = decryptToken(kc.refresh_token, secret);
  if (!decryptedRefreshToken) return null;

  const resp = await fetch(`${process.env.OAUTH_ISSUER}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: decryptedRefreshToken,
    }),
  });

  if (!resp.ok) return null;

  const json = await resp.json() as { access_token: string; expires_in: number; refresh_token?: string };

  const newExpiresAt = Math.floor(Date.now() / 1000 + json.expires_in);

  // Encrypt new tokens before persisting back into users.accounts[]
  const accounts = ((user as Partial<User>).accounts ?? []).map((a: AccountRow | undefined) =>
    a?.provider === "keycloak"
      ? {
          ...a,
          access_token: encryptToken(json.access_token, secret),
          expires_at: newExpiresAt,
          // Use new refresh token if provided, otherwise keep the existing encrypted one
          refresh_token: json.refresh_token ? encryptToken(json.refresh_token, secret) : a.refresh_token,
        }
      : a
  );

  await payload.update({
    collection: "users",
    id: userId,
    data: { accounts },
    overrideAccess: true,
  });

  return json.access_token;
}