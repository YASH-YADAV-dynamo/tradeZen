import React from 'react';
import { usePrivy } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';

import { PRIVY_APPEARANCE } from './privyConfig';

/**
 * Native-only Privy shell. Renders PrivyElements only after the provider
 * client is ready — avoids "client of null" crashes on first paint.
 */
export function PrivyNativeRuntime({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { isReady } = usePrivy();

  return (
    <>
      {children}
      {isReady ? (
        <PrivyElements
          config={{
            appearance: {
              colorScheme: PRIVY_APPEARANCE.theme,
              accentColor: PRIVY_APPEARANCE.accentColor,
            },
          }}
        />
      ) : null}
    </>
  );
}
