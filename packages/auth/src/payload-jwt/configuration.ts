
function upsertAccount(existing: any[] = [], account: any) {
  const provider = account.provider
  const providerAccountId = account.providerAccountId

  const idx = existing.findIndex(
    (a) => a.provider === provider && a.providerAccountId === providerAccountId
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
    session_state: (account as any).session_state ?? null,
  }

  if (idx >= 0) {
    const copy = [...existing]
    copy[idx] = nextRow
    return copy
  }
  return [...existing, nextRow]
}

export async function persistTokens(userId: string, account: any) {
  const payload = await getPayload({ config: payloadConfig })

  const fullUser = await payload.findByID({
    collection: "users",
    id: userId,
    depth: 0,
  })

  const existing = (fullUser as any).accounts ?? []
  const accounts = upsertAccount(existing, account)

  await payload.update({
    collection: "users",
    id: userId,
    data: { accounts },
    overrideAccess: true,
  })
}

