import { apiClient } from '../../../core/api';
import { createPortfolioService } from './PortfolioService';

export { PortfolioService, createPortfolioService } from './PortfolioService';

export const portfolioService = createPortfolioService(apiClient);
