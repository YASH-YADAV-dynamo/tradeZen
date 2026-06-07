import type { QuoteResponse } from '../api/types';

/** EIP-712 field definitions for Bebop RFQ order types. */
const RFQ_ORDER_TYPES = {
  SingleOrder: [
    { name: 'partner_id', type: 'uint64' },
    { name: 'expiry', type: 'uint256' },
    { name: 'taker_address', type: 'address' },
    { name: 'maker_address', type: 'address' },
    { name: 'maker_nonce', type: 'uint256' },
    { name: 'taker_token', type: 'address' },
    { name: 'maker_token', type: 'address' },
    { name: 'taker_amount', type: 'uint256' },
    { name: 'maker_amount', type: 'uint256' },
    { name: 'receiver', type: 'address' },
    { name: 'packed_commands', type: 'uint256' },
  ],
  MultiOrder: [
    { name: 'partner_id', type: 'uint64' },
    { name: 'expiry', type: 'uint256' },
    { name: 'taker_address', type: 'address' },
    { name: 'maker_address', type: 'address' },
    { name: 'maker_nonce', type: 'uint256' },
    { name: 'taker_tokens', type: 'address[]' },
    { name: 'maker_tokens', type: 'address[]' },
    { name: 'taker_amounts', type: 'uint256[]' },
    { name: 'maker_amounts', type: 'uint256[]' },
    { name: 'receiver', type: 'address' },
    { name: 'commands', type: 'bytes' },
  ],
  AggregateOrder: [
    { name: 'partner_id', type: 'uint64' },
    { name: 'expiry', type: 'uint256' },
    { name: 'taker_address', type: 'address' },
    { name: 'maker_addresses', type: 'address[]' },
    { name: 'maker_nonces', type: 'uint256[]' },
    { name: 'taker_tokens', type: 'address[][]' },
    { name: 'maker_tokens', type: 'address[][]' },
    { name: 'taker_amounts', type: 'uint256[][]' },
    { name: 'maker_amounts', type: 'uint256[][]' },
    { name: 'receiver', type: 'address' },
    { name: 'commands', type: 'bytes' },
  ],
} as const;

type OrderTypeKey = keyof typeof RFQ_ORDER_TYPES;

export function buildTypedData(quote: QuoteResponse) {
  const orderType = quote.onchainOrderType as OrderTypeKey;
  if (!(orderType in RFQ_ORDER_TYPES)) {
    throw new Error(`Unsupported order type: ${quote.onchainOrderType}`);
  }

  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      [orderType]: RFQ_ORDER_TYPES[orderType],
    },
    domain: {
      name: 'BebopSettlement',
      version: '2',
      chainId: quote.chainId,
      verifyingContract: quote.settlementAddress,
    },
    primaryType: orderType,
    message: quote.toSign,
  };
}
