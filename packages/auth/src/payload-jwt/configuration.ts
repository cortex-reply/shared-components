import type { User } from '@/types'
import type { SanitizedConfig } from 'payload'
import { decodeJwt } from 'jose'
import { getPayload } from 'payload'
import { payloadAcl } from '../payload-access/access.js'
type AccountType = NonNullable<User['accounts']>[number]

// Add a more permissive type for incoming NextAuth accounts
type IncomingAccount = {
  provider: string
  providerAccountId: string
  type: string  // Changed from strict union to string
  access_token?: string | null
  refresh_token?: string | null
  expires_at?: number | null
  id_token?: string | null
  token_type?: string | null
  scope?: string | null
  session_state?: string | null
  [key: string]: any  // Allow additional properties
}

function upsertAccount(existing: AccountType[] = [], account: IncomingAccount): AccountType[] {
  const provider = account.provider
  const providerAccountId = account.providerAccountId

  const idx = existing.findIndex(
    (a: AccountType) => a.provider === provider && a.providerAccountId === providerAccountId
  )

  const nextRow: AccountType = {
    provider,
    providerAccountId,
    type: account.type as any,  // Cast to match AccountType

    // token fields (must match your Users.accounts[] schema)
    access_token: account.access_token ?? null,
    refresh_token: account.refresh_token ?? null,
    expires_at: account.expires_at ?? null,
    id_token: account.id_token ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    session_state: account.session_state ?? null,
  } as AccountType

  if (idx >= 0) {
    const copy = [...existing]
    copy[idx] = nextRow
    return copy
  }
  return [...existing, nextRow]
}

function profileRoles(profile: { sub: string;[key: string]: unknown }, tokens: { access_token?: string;[key: string]: unknown }) {
  let role = 'user'; // default role
  if (tokens && tokens.access_token) {
    const decodedJWT = decodeJwt(tokens.access_token);
    const permissions = ((decodedJWT.resource_access as Record<string, { roles?: string[] }>)?.[process.env.OAUTH_CLIENT_ID!]?.roles as string[] | undefined);
    role = permissions?.[0] || 'user';
  }
  return { id: profile.sub, role, ...profile }
}

// Change the account parameter type to IncomingAccount
async function persistTokens(userId: string, account: IncomingAccount, payloadConfig: Promise<SanitizedConfig>) {
  const payload = await getPayload({ config: await payloadConfig })

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

const userCollectionDatabaseFields = [{
  name: 'role',
  type: 'select',
  options: [
    {
      label: 'User',
      value: 'user',
    },
    {
      label: 'Admin',
      value: 'admin',
    },
    {
      label: 'Digital Colleague',
      value: 'digital-colleague',
    },
  ],
  defaultValue: 'user',
  required: true,
  admin: {
    description: 'The role of the user',
  },
},
{ name: 'enabled', type: 'checkbox', label: 'Enabled', defaultValue: true },
{
  name: "accounts",
  type: "array",
  admin: { disabled: false }, // optional
  fields: [
    { name: "provider", type: "text", required: true },
    { name: "providerAccountId", type: "text", required: true },
    { name: "type", type: "text" },

    // Add these:
    {
      name: "access_token", type: "text", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
    { name: "refresh_token", type: "text", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
    { name: "expires_at", type: "number", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
    { name: "id_token", type: "text", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
    { name: "token_type", type: "text", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
    { name: "scope", type: "text", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
    { name: "session_state", type: "text", admin: { disabled: true }, access: {
        read: payloadAcl.ownOnly
      },
    },
  ],
}];

export const payloadAuthConfig = {

  userCollectionDatabaseFields,
  persistTokens,

  profileRoles
};