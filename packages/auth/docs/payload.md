# PayloadCMS Authentication

`cortex-auth` provides boilerplate authentication patterns for PayloadCMS and associated API routes.

## Features

- JWT / Bearer token based API usage
- Application authentication and session management
- Payload native authentication integrated with OIDC providers (like Keycloak)
- Oauth Token Exchange patterns

## Installation

```bash
npm install cortex-auth
# or
pnpm add cortex-auth
```

## Setup

`pnpm i payload-authjs next-auth@^5.0.0-beta`
This plugin integrates Auth.js into Payload CMS by getting the user session from Auth.js. You need to setup Auth.js before you can use this plugin.

There is some base-level setup required to use authentication. We use payload-authjs and authjs as well as custom code within this module.

### Create your Auth.js configuration

Define your Auth.js configuration in a file (e.g. `auth.config.ts`):

[Database with independant backend](#database-with-backend)

### Add Auth.js route handler

Add the Auth.js route handler under `/app/(auth)api/auth/[...nextauth]/route.ts`:

```js
// app/(auth)/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Create your Auth.js instance

Next, create your Auth.js instance in a file (e.g. `auth.ts`).

> ⚠ But unlike what you would normally do in Auth.js, you need to create the Payload instance first and using the `getAuthjsInstance` function to retrieve the Auth.js instance.

```js
// lib/auth.ts
import payloadConfig from "@payload-config";
import { getPayload } from "payload";
import { getAuthjsInstance } from "payload-authjs";

const payload = await getPayload({ config: payloadConfig });
export const { handlers, signIn, signOut, auth } = getAuthjsInstance(payload);
```

### Add the payload-authjs plugin to Payload CMS

```js
// payload.config.ts
import { authjsPlugin } from "payload-authjs";
import { authConfig } from "./auth.config";

export const config = buildConfig({
  plugins: [
    authjsPlugin({
      authjsConfig: authConfig,
    }),
  ],
});
```

### Add Auth.js proxy / middleware (optional)

Add optional `proxy.ts`/`middleware.ts` to keep the session alive, this will update the session expiry each time it's called.

> Since Next.js 16, the `middleware` has been replaced with the `proxy` and uses the nodejs runtime. See the [Next.js docs](https://nextjs.org/docs/app/guides/upgrading/version-16#middleware-to-proxy).

##### Next.js 16 or above

```ts
// proxy.ts
export { auth as proxy } from "./auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin).*)"],
};
```

##### Next.js 15

> ⚠ Unlike what you would normally do in Auth.js, you cannot use the `middleware` of `@/auth` directly. You have to create a new Auth.js instance to be [edge-compatible](https://authjs.dev/guides/edge-compatibility).

```ts
// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|admin).*)"],
};
```

### Database with Backend

We store the session in the Payload database.
Optionally, we can also store the auth tokens in the database to be used for onward API calls.

#### Browser flow

1. Users access the application 
2. are redirected to the oAuth provider to authenticate
3. Users are given a session and a session cookie to identify them for subsequent requests.
4. We also store the tokens in the database (NOT in the users browser)

#### Direct API flow
1. User accesses the API with a pre-retrievd `Bearer` token.
2. The API route establishes the user **AND creates the user if they dont exist**
3. The API route can obtain the users token from the database
4. The token is refreshed if required before returning it.


#### Extend the Users collection..

```js
//.. existing imports
import { payloadAuthConfig } from 'cortex-auth';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    baseFilter: () => ({
      enabled: {
        not_equals: false,
      },
    }),
  },
  // existing config
  fields: [
    // any other fields
    ...payloadAuthConfig.userCollectionDatabaseFields,
  ],
}
```

#### Setup Authentication

```js
// auth.config.ts

import type { NextAuthConfig } from "next-auth";

import payloadConfig from '@/payload.config';
import KeycloakProvider from "next-auth/providers/keycloak";

import { payloadAuthConfig } from 'cortex-auth';


export const authConfig: NextAuthConfig = {
secret: process.env.PAYLOAD_SECRET,
  session: {
    maxAge: 60 * 30 * 8, // 8 hours
    strategy: 'database',
  },
  providers: [KeycloakProvider({
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    issuer: process.env.OAUTH_ISSUER,
    authorization: { params: { scope: "openid profile email offline_access" } },
    profile (profile, tokens) { return payloadAuthConfig.profileRoles(profile, tokens) },
  }),
  ],
  events: {
  // fires when an OAuth account is linked  [NextAuth](https://next-auth.js.org/configuration/events)
  async linkAccount({ user, account }) {
    await payloadAuthConfig.persistTokens(user.id, account, payloadConfig)
  },

  // fires on every sign-in  [NextAuth](https://next-auth.js.org/configuration/events)
  async signIn({ user, account }) {
    if (account) await payloadAuthConfig.persistTokens(user.id, account, payloadConfig)
  },
}
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}
```

#### Example API

```js
import { auth } from "@/lib/auth";
import payloadConfig from '@payload-config'
import { getPayload } from 'payload'
import { getAccessToken } from 'cortex-auth'

export const GET = auth(async (req) => {
  const session = req.auth;
  if (!session?.user?.id) return new Response("Unauthorised", { status: 401 });
    const payload = await getPayload({ config: payloadConfig })

  const token = await getAccessToken(payload, session.user.id);
  if (!token) return new Response("No access token", { status: 401 });

  return Response.json({message : session.user, token: `${token.slice(0,15)}......`}, { status: 200 });
});
```


#### Environment Variables
```bash
PAYLOAD_SECRET=xxxxx
DATABASE_URI=postgres://payload:payload@172.17.0.1:5432/test
NEXT_PUBLIC_SERVER_URL=http://localhost:4011


OAUTH_CLIENT_ID=test-app
OAUTH_CLIENT_SECRET=xxxxxx
OAUTH_ISSUER="https://keycloak.cortexreply.ai/realms/development"

```
