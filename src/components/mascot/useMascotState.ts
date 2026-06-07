import { useOrderStore } from '../../store/orderStore';
import { useTradeStore } from '../../store/tradeStore';

export type MascotTrigger =
  | 'trigger_idle'
  | 'trigger_welcome'
  | 'trigger_point_down'
  | 'trigger_token_confirm'
  | 'trigger_signal_alert'
  | 'trigger_loading'
  | 'trigger_pre_confirm'
  | 'trigger_success'
  | 'trigger_error';

export function useMascotTrigger(): MascotTrigger {
  const quote = useTradeStore((s) => s.quote);
  const isQuoteLoading = useTradeStore((s) => s.isQuoteLoading);
  const quoteError = useTradeStore((s) => s.quoteError);
  const activeOrderStatus = useOrderStore((s) => s.activeOrder?.status);

  if (quoteError) return 'trigger_error';
  if (isQuoteLoading) return 'trigger_loading';
  if (activeOrderStatus === 'Failed') return 'trigger_error';
  if (activeOrderStatus === 'Settled' || activeOrderStatus === 'Confirmed') {
    return 'trigger_success';
  }
  if (activeOrderStatus === 'Pending' || activeOrderStatus === 'Success') {
    return 'trigger_loading';
  }
  if (quote) return 'trigger_pre_confirm';
  return 'trigger_idle';
}
