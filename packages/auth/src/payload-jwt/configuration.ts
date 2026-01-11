import type { User } from '@/types'
import type { SanitizedConfig } from 'payload'
import { decodeJwt } from 'jose'
import { getPayload } from 'payload'
import type { NextAuthConfig } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

type AccountType = NonNullable<User['accounts']>[number]

function upsertAccount(existing: AccountType[] = [], account: AccountType) {
  const provider = account.provider
  const providerAccountId = account.providerAccountId

  const idx = existing.findIndex(
    (a: AccountType) => a.provider === provider && a.providerAccountId === providerAccountId
  )

  const nextRow = {
    ...(idx >= 0 ? existing[idx] : {}),
    provider,
    providerAccountId,
    type: account.type,

    // token fields (must match your Users.accounts[] schema)
    access_token: account.access_token ?? null,
    refresh_token: account.refresh_token ?? null,
    expires_at: account.expires_at ?? null,
    id_token: account.id_token ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    session_state: account.session_state ?? null,
  }

  if (idx >= 0) {
    const copy = [...existing]
    copy[idx] = nextRow
    return copy
  }
  return [...existing, nextRow]
}

async function persistTokens(userId: string, account: AccountType, payloadConfig: SanitizedConfig) {
  const payload = await getPayload({ config: payloadConfig })

  const fullUser = await payload.findByID({
    collection: "users",
    id: userId,
    depth: 0,
  })

  const existing = (fullUser as User).accounts ?? []
  const accounts = upsertAccount(existing, account)
  let role = 'user'; // default role
  if (account && account.access_token) {
    const decodedJWT = decodeJwt(account.access_token);
    const permissions = ((decodedJWT.resource_access as Record<string, { roles?: string[] }>)?.[process.env.OAUTH_CLIENT_ID!]?.roles as string[] | undefined);
    role = permissions?.[0] || 'user';
  }
  await payload.update({
    collection: "users",
    id: userId,
    data: { accounts, role },
    overrideAccess: true,
  })
}

type NextAuthConfigFunction = { session: { maxAge?: number }; oauth: { scope?: string } };

const databaseWithBackend = (authConfig: NextAuthConfigFunction, payloadConfig: SanitizedConfig): NextAuthConfig => ({
  secret: process.env.PAYLOAD_SECRET,
  session: {
    maxAge: authConfig.session.maxAge ?? 60 * 30 * 8, // 8 hours
    strategy: 'database',
  },
  providers: [KeycloakProvider({
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    issuer: process.env.OAUTH_ISSUER,
    authorization: { params: { scope: authConfig.oauth.scope ?? "openid profile email offline_access" } },
    profile(profile, tokens) {
      let role = 'user'; // default role
      if (tokens && tokens.access_token) {
        const decodedJWT = decodeJwt(tokens.access_token);
        const permissions = ((decodedJWT.resource_access as Record<string, { roles?: string[] }>)?.[process.env.OAUTH_CLIENT_ID!]?.roles as string[] | undefined);
        role = permissions?.[0] || 'user';
      }
      return { id: profile.sub, role, ...profile }
    },
  }),
  ],
  events: {
    // fires when an OAuth account is linked  [NextAuth](https://next-auth.js.org/configuration/events)
    async linkAccount({ user, account }) {
      await persistTokens(user.id as string, account as unknown as AccountType, payloadConfig)
    },

    // fires on every sign-in  [NextAuth](https://next-auth.js.org/configuration/events)
    async signIn({ user, account }) {
      if (account) await persistTokens(user.id as string, account as unknown as AccountType, payloadConfig)
    },
  },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}


const userCollectionDatabaseFields = {
      name: "accounts",
      type: "array",
      admin: { disabled: false }, // optional
      fields: [
        { name: "provider", type: "text", required: true },
        { name: "providerAccountId", type: "text", required: true },
        { name: "type", type: "text" },

        // Add these:
        { name: "access_token", type: "text", admin: { disabled: true } },
        { name: "refresh_token", type: "text", admin: { disabled: true } },
        { name: "expires_at", type: "number", admin: { disabled: true } },
        { name: "id_token", type: "text", admin: { disabled: true } },
        { name: "token_type", type: "text", admin: { disabled: true } },
        { name: "scope", type: "text", admin: { disabled: true } },
        { name: "session_state", type: "text", admin: { disabled: true } },
      ],
    };


export const payloadAuthConfig = { databaseWithBackend, userCollectionDatabaseFields };