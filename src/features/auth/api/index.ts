import { apiClient } from '../../../core/api';
import { createAuthService } from './AuthService';

export { AuthService, createAuthService } from './AuthService';

export const authService = createAuthService(apiClient);
