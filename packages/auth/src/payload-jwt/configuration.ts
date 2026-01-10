import type { User } from '@/types'
import type { Payload } from 'payload'
import { decodeJwt } from 'jose'

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

export async function persistTokens(userId: string, account: AccountType, payload: Payload) {
  
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

