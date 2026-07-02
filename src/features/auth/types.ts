export interface NonceResponse {
  nonce: string;
}

export interface VerifyResponse {
  token: string;
}

export interface AuthSession {
  wallet: string;
  token: string;
  /** Unix seconds, decoded from the JWT payload. */
  expiresAt: number;
}
