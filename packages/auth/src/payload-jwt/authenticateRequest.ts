

import { verifySession, verifyToken } from "./user";

import { type Payload } from 'payload'

import { type NextAuthRequest } from "next-auth";

export type AuthRequest = NextAuthRequest

interface AuthError extends Error {
    statusCode: number;
}

function createAuthError(message: string, statusCode: number): AuthError {
    const error = new Error(message) as AuthError;
    error.statusCode = statusCode;
    return error;
}

export type { AuthError };

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

export interface AuthenticateRequestOptions {
    req: AuthRequest
    payload: Payload
}


export async function authenticateRequest({ req, payload }: AuthenticateRequestOptions) {
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
        const session = await verifySession(req)

        if (!session || !session.sub || !session.extra) throw createAuthError("No valid session found", 401);
        const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID!;
        const permissions = ((session.resource_access as Record<string, { roles?: string[] }>)?.[OAUTH_CLIENT_ID]?.roles as string[] | undefined);
        if (!permissions) throw createAuthError("User does not have permission to access this application.", 403);

        if (!payload) throw createAuthError("Payload instance is required for Keycloak user normalisation", 500);
        const payloadUser = (await payload.find({ collection: 'users', depth: 1, limit: 1, draft: false, overrideAccess: true, where: { email: { equals: session.extra.email } } })).docs[0]

        if (!payloadUser && session.extra) {


            // create the user in Payload
            const newUser = await payload.create({
                collection: 'users',
                data: {
                    email: session.extra.email,
                    name: session.extra.name,
                    role: permissions[0] || 'user',
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
                
                method: 'bearer', ...newUser
            }
        } else if (payloadUser) {
            // update user role if changed
            if (payloadUser.role !== permissions[0]) {
                await payload.update({
                    collection: 'users',
                    id: payloadUser.id,
                    data: {
                        role: permissions[0] || 'user',
                    },
                    draft: false,
                    overrideAccess: true,
                })
                console.log(`Updated Payload user role for ${payloadUser.email} to ${permissions}`);
            }

            return { method: 'bearer', ...payloadUser }
        } else {
            throw createAuthError("No user found for the given session", 401);
        }
    }
}

export async function authenticateRequestHeaders({ headers, payload }: { headers: Headers, payload: Payload }) {
    if (!headers.get('authorization')) {
        throw createAuthError("No authorization header provided", 401);
    }

    const session = await verifyToken(headers.get('authorization')!.replace('Bearer ', ''));

    if (!session || !session.sub || !session.extra) throw createAuthError("No valid session found", 401);
    const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID!;
    const permissions = ((session.resource_access as Record<string, { roles?: string[] }>)?.[OAUTH_CLIENT_ID]?.roles as string[] | undefined);
    if (!permissions) throw createAuthError("User does not have permission to access this application.", 403);

    if (!payload) throw createAuthError("Payload instance is required for Keycloak user normalisation", 500);
    const payloadUser = (await payload.find({ collection: 'users', depth: 1, limit: 1, draft: false, overrideAccess: true, where: { email: { equals: session.extra.email } } })).docs[0]

    if (!payloadUser && session.extra) {
        // create the user in Payload
        const newUser = await payload.create({
            collection: 'users',
            data: {
                email: session.extra.email,
                name: session.extra.name,
                role: permissions[0] || 'user',
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
        return { user: newUser }

    } else if (payloadUser) {
        // update user role if changed
        if (payloadUser.role !== permissions[0]) {
            await payload.update({
                collection: 'users',
                id: payloadUser.id,
                data: {
                    role: permissions[0] || 'user',
                },
                draft: false,
                overrideAccess: true,
            })
            console.log(`Updated Payload user role for ${payloadUser.email} to ${permissions}`);
        }

        return {user: payloadUser }

    } else {
        throw createAuthError("No user found for the given session", 401);
    }
}

