import { TradeDirection } from '../types';

const MAINTENANCE_MARGIN_RATE = 0.005;

export const calcMargin = (size: number, leverage: number): number =>
  size / leverage;

export const calcLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  direction: TradeDirection
): number => {
  if (direction === 'long') {
    return entryPrice * (1 - 1 / leverage + MAINTENANCE_MARGIN_RATE);
  }
  return entryPrice * (1 + 1 / leverage - MAINTENANCE_MARGIN_RATE);
};

export const calcPnL = (
  entryPrice: number,
  markPrice: number,
  size: number,
  direction: TradeDirection
): number => {
  if (direction === 'long') {
    return ((markPrice - entryPrice) / entryPrice) * size;
  }
  return ((entryPrice - markPrice) / entryPrice) * size;
};

export const calcPnLPct = (pnl: number, margin: number): number =>
  margin > 0 ? (pnl / margin) * 100 : 0;

export const calcROE = (pnl: number, margin: number): number =>
  margin > 0 ? pnl / margin : 0;

export const calcTPPrice = (
  entryPrice: number,
  direction: TradeDirection,
  pct: number
): number => {
  if (direction === 'long') return entryPrice * (1 + pct);
  return entryPrice * (1 - pct);
};

export const calcSLPrice = (
  entryPrice: number,
  direction: TradeDirection,
  pct: number
): number => {
  if (direction === 'long') return entryPrice * (1 - pct);
  return entryPrice * (1 + pct);
};

export const calcFundingPayment = (size: number, fundingRate: number): number =>
  size * fundingRate;

export const isTakeProfit = (
  markPrice: number,
  takeProfit: number,
  direction: TradeDirection
): boolean => {
  if (direction === 'long') return markPrice >= takeProfit;
  return markPrice <= takeProfit;
};

export const isStopLoss = (
  markPrice: number,
  stopLoss: number,
  direction: TradeDirection
): boolean => {
  if (direction === 'long') return markPrice <= stopLoss;
  return markPrice >= stopLoss;
};
