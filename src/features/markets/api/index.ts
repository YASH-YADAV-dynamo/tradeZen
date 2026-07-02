import { apiClient } from '../../../core/api';
import { createTokensService } from './TokensService';
import { createPricesService } from './PricesService';

export { TokensService, createTokensService } from './TokensService';
export { PricesService, createPricesService } from './PricesService';

export const tokensService = createTokensService(apiClient);
export const pricesService = createPricesService(apiClient);
