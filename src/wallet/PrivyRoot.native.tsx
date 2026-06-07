import React from 'react';
import { PrivyProvider } from '@privy-io/expo';

import { isPrivyConfigured } from '../config/wallet';
import { privyProviderProps } from './privyConfig';
import { PrivyNativeRuntime } from './PrivyNativeRuntime';

export const PrivyRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isPrivyConfigured()) return <>{children}</>;

  return (
    <PrivyProvider
      appId={privyProviderProps.appId}
      clientId={privyProviderProps.clientId}
      config={{
        embedded: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      <PrivyNativeRuntime>{children}</PrivyNativeRuntime>
    </PrivyProvider>
  );
};
