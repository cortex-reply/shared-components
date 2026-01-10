

import { verifySession } from "./user";

import { type Payload } from 'payload'

import { NextAuthRequest } from "next-auth";


 interface User {
  id: string;
  email: string;
  emailVerified?: string | null;
  name?: string | null;
  image?: string | null;
  /**
   * The role of the user
   */
  role: 'user' | 'admin' | 'digital-colleague';
  enabled?: boolean | null;
  accounts?:
    | {
        provider: string;
        providerAccountId: string;
        type: 'oidc' | 'oauth' | 'email' | 'webauthn';
        id?: string | null;
      }[]
    | null;
  sessions?:
    | {
        sessionToken: string;
        expires: string;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
  enableAPIKey?: boolean | null;
  apiKey?: string | null;
  apiKeyIndex?: string | null;
}


export async function authenticateRequest({ req, payload }: { req: NextAuthRequest, payload?: Payload }) {
    let type = 'cookie'
    if (req.auth) {
        const user = req.auth.user as User
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            method: 'cookie',
        }
    } else {
        type = 'bearer'
        const session = await verifySession(req)
        if (!session || !session.sub || !session.extra) throw new Error("No valid session found")
        if (!payload) throw new Error("Payload instance is required for Keycloak user normalisation")
        const payloadUser = (await payload.find({ collection: 'users', depth: 1, limit: 1, draft: false, overrideAccess: true, where: { email: { equals: session.extra.email } } })).docs[0]

        if (!payloadUser && session.extra) {
            // create the user in Payload
            const newUser = await payload.create({
                collection: 'users',
                data: {
                    email: session.extra.email,
                    name: session.extra.name,
                    role: 'user',
                    enabled: true,
                    accounts: [
                        {
                            provider: 'keycloak', providerAccountId: session.sub, type: 'oidc',
                        }
                    ],
                },
                draft: false,
                overrideAccess: true,
            })
            console.log("Created new Payload user for Keycloak user:", newUser.id, newUser.email)
            return {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                method: 'bearer',
            }
        } else if (payloadUser) {
            return {
                id: payloadUser.id,
                email: payloadUser.email,
                name: payloadUser.name,
                role: payloadUser.role,
                method: 'bearer',
            }
        } else {
            throw new Error("No user found for the given session")
        }
    }
}