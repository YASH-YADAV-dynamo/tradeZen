import { TradeDirection } from '../types';
import { calcLiquidationPrice } from './math';

export interface TradeFormErrors {
  size?: string;
  leverage?: string;
  takeProfit?: string;
  stopLoss?: string;
}

export const validateTradeForm = (params: {
  size: string;
  leverage: number;
  direction: TradeDirection;
  entryPrice: number;
  availableBalance: number;
  takeProfit?: string;
  stopLoss?: string;
}): TradeFormErrors => {
  const errors: TradeFormErrors = {};
  const sizeNum = parseFloat(params.size);
  const tp = params.takeProfit ? parseFloat(params.takeProfit) : undefined;
  const sl = params.stopLoss ? parseFloat(params.stopLoss) : undefined;

  if (!params.size || Number.isNaN(sizeNum)) {
    errors.size = 'Enter a valid amount';
  } else if (sizeNum < 10) {
    errors.size = 'Minimum order is $10';
  } else if (sizeNum > params.availableBalance) {
    errors.size = 'Insufficient balance';
  }

  if (params.leverage < 1 || params.leverage > 10) {
    errors.leverage = 'Leverage must be 1x-10x';
  }

  if (params.takeProfit && params.takeProfit !== '') {
    if (Number.isNaN(tp!)) {
      errors.takeProfit = 'Invalid price';
    } else if (params.direction === 'long' && tp! <= params.entryPrice) {
      errors.takeProfit = 'TP must be above entry for long';
    } else if (params.direction === 'short' && tp! >= params.entryPrice) {
      errors.takeProfit = 'TP must be below entry for short';
    }
  }

  if (params.stopLoss && params.stopLoss !== '') {
    const liqPrice = calcLiquidationPrice(
      params.entryPrice,
      params.leverage,
      params.direction
    );
    if (Number.isNaN(sl!)) {
      errors.stopLoss = 'Invalid price';
    } else if (params.direction === 'long' && sl! >= params.entryPrice) {
      errors.stopLoss = 'SL must be below entry for long';
    } else if (params.direction === 'short' && sl! <= params.entryPrice) {
      errors.stopLoss = 'SL must be above entry for short';
    } else if (params.direction === 'long' && sl! <= liqPrice) {
      errors.stopLoss = 'SL too close to liquidation price';
    } else if (params.direction === 'short' && sl! >= liqPrice) {
      errors.stopLoss = 'SL too close to liquidation price';
    }
  }

  return errors;
};

export const isFormValid = (errors: TradeFormErrors): boolean =>
  Object.keys(errors).length === 0;
