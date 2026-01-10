export interface User {
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
        access_token?: string | null;
        refresh_token?: string | null;
        expires_at?: number | null;
        id_token?: string | null;
        token_type?: string | null;
        scope?: string | null;
        session_state?: string | null;
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