import { ApiClient } from '../../../core/api';
import { NonceResponse, VerifyResponse } from '../types';

/**
 * Owns the two-step wallet login: request a nonce, then trade a signature
 * over that nonce for a JWT. Neither call needs auth headers — they're how
 * you get one.
 */
export class AuthService {
  constructor(private readonly client: ApiClient) {}

  async requestNonce(wallet: string): Promise<NonceResponse> {
    return this.client.get<NonceResponse>(`/api/auth/nonce?wallet=${encodeURIComponent(wallet)}`);
  }

  async verify(wallet: string, signature: string): Promise<VerifyResponse> {
    return this.client.post<VerifyResponse>('/api/auth/verify', { wallet, signature });
  }
}

export const createAuthService = (client: ApiClient) => new AuthService(client);
