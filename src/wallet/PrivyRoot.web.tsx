import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

import { isPrivyConfigured } from '../config/wallet';
import { PRIVY_APPEARANCE, PRIVY_WEB_LOGIN_METHODS, privyProviderProps } from './privyConfig';

export const PrivyRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isPrivyConfigured()) return <>{children}</>;

  return (
    <PrivyProvider
      appId={privyProviderProps.appId}
      clientId={privyProviderProps.clientId}
      config={{
        appearance: PRIVY_APPEARANCE,
        loginMethods: [...PRIVY_WEB_LOGIN_METHODS],
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
