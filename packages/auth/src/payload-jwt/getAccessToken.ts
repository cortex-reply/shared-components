
type AccountRow = {
  provider?: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null; // seconds since epoch
};

export async function getAccessToken(payload: Payload, userId: string) {
  const user = await payload.findByID({ collection: "users", id: userId, depth: 0 });

  const kc = (user as any)?.accounts?.find((a: AccountRow) => a.provider === "keycloak") as AccountRow | undefined;
  if (!kc?.access_token) return null;

  const expiresAt = kc.expires_at ?? 0;
  const stillValid = expiresAt === 0 || Date.now() < expiresAt * 1000 - 30_000; // 30s skew
  if (stillValid) return kc.access_token;

  // Refresh if needed
  if (!kc.refresh_token) return null;

  const resp = await fetch(`${process.env.OAUTH_ISSUER}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: kc.refresh_token,
    }),
  });

  if (!resp.ok) return null;

  const json = await resp.json() as { access_token: string; expires_in: number; refresh_token?: string };

  const newExpiresAt = Math.floor(Date.now() / 1000 + json.expires_in);

  // Persist back into users.accounts[] (update your matching row logic as needed)
  const accounts = ((user as any).accounts ?? []).map((a: any) =>
    a.provider === "keycloak"
      ? {
          ...a,
          access_token: json.access_token,
          expires_at: newExpiresAt,
          refresh_token: json.refresh_token ?? a.refresh_token,
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