import { apiClient } from '../../../core/api';
import { createQuoteService } from './QuoteService';
import { createOrderService } from './OrderService';

export { QuoteService, createQuoteService } from './QuoteService';
export { OrderService, createOrderService } from './OrderService';

export const quoteService = createQuoteService(apiClient);
export const orderService = createOrderService(apiClient);
