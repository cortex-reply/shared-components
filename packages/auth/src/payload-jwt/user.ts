
import { jwtVerify, createRemoteJWKSet, decodeJwt } from "jose";
import type { NextRequest } from "next/server";

export interface AuthInfo {
    sub: string;
    exp: number;
    scopes: string[];
    resource_access?: Record<string, any>;
    extra?: Record<string, any>;
}


const OIDC_ISSUER = process.env.OAUTH_ISSUER!; // e.g. https://login.microsoftonline.com/<tenant>/v2.0
const OAUTH_DISCOVERY_URL = `${OIDC_ISSUER}/.well-known/openid-configuration`;

// Fetch JWKS URL from OAuth well-known configuration
async function getJwksUrl(): Promise<string> {
    const wellKnownUrl = OAUTH_DISCOVERY_URL;
    try {
        const response = await fetch(wellKnownUrl);
        const config = await response.json() as { jwks_uri: string };
        return config.jwks_uri;
    } catch (error) {
        console.error("Failed to fetch well-known config:", error);
        // Fallback to the hardcoded path
        const fallbackUrl = `${OAUTH_DISCOVERY_URL}/discovery/v2.0/keys`;
        return fallbackUrl;
    }
}

// Create JWKS instance - will be initialized lazily
let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

async function getJWKS() {
    if (!JWKS) {
        const jwksUrl = await getJwksUrl();
        JWKS = createRemoteJWKSet(new URL(jwksUrl));
    }
    return JWKS;
}

function extractBearer(req: Request): string | undefined {
    const h = req.headers.get("authorization");
    if (!h) return;
    const [scheme, token] = h.split(" ");
    if (scheme.toLowerCase() !== "bearer") return;
    return token;
}

// Verify Next Session and return AuthInfo

export async function verifySession(req: NextRequest): Promise<AuthInfo | undefined> {

    const bearer = extractBearer(req);

    if (bearer) {
        // for development ONLY, use a dummy token
        try {
            const decodedJWT = decodeJwt(bearer);

            // Get JWKS dynamically from well-known endpoint
            const jwks = await getJWKS();

            const { payload, protectedHeader } = await jwtVerify(bearer, jwks, {
                issuer: OIDC_ISSUER,
                algorithms: ["RS256"],
            });

            return {
                sub: (payload.sub as string) ?? "unknown",
                exp: (payload.exp as number) ?? 0,
                scopes: typeof payload.scp === "string" ? payload.scp.split(" ") : [],
                resource_access: payload.resource_access as Record<string, any> | undefined,
                extra: { email: payload.email, name: payload.name },
            };
        } catch (error) {
            console.log("JWT verification failed:", error);
            return undefined;
        }
    }

    // fallback: NextAuth session (optional)

    return undefined;
}



export async function verifyToken(bearer: string): Promise<AuthInfo | undefined> {
    if (bearer) {
        // for development ONLY, use a dummy token
        try {
            const decodedJWT = decodeJwt(bearer);

            // Get JWKS dynamically from well-known endpoint
            const jwks = await getJWKS();

            const { payload, protectedHeader } = await jwtVerify(bearer, jwks, {
                issuer: OIDC_ISSUER,
                algorithms: ["RS256"],
            });

            return {
                sub: (payload.sub as string) ?? "unknown",
                exp: (payload.exp as number) ?? 0,
                scopes: typeof payload.scp === "string" ? payload.scp.split(" ") : [],
                extra: { email: payload.email, name: payload.name },
            };
        } catch (error) {
            console.log("JWT verification failed:", error);
            return undefined;
        }
    }
    return undefined;
}


/**
 * Check if a token is expired
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  const decoded = await verifyToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}
