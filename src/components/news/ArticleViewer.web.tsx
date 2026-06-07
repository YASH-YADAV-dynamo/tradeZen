import React, { createContext, useCallback, useContext, useMemo } from 'react';

import type { NewsItem } from '../../api/types';

/**
 * Web reader — most news outlets block iframe embedding via X-Frame-Options /
 * CSP, so a "reader-in-app" surface would only show "refused to connect".
 * On web we open a new browser tab instead, which is the native browsing
 * convention and avoids broken-content UX.
 *
 * Native users get an in-app WebView via `ArticleViewer.native.tsx`.
 */

type Ctx = {
  open: (item: NewsItem) => void;
  close: () => void;
};

const ArticleViewerContext = createContext<Ctx | null>(null);

export const ArticleViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const open = useCallback((item: NewsItem) => {
    if (typeof window === 'undefined') return;
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }, []);

  const value = useMemo<Ctx>(() => ({ open, close: () => undefined }), [open]);
  return <ArticleViewerContext.Provider value={value}>{children}</ArticleViewerContext.Provider>;
};

export function useArticleViewer(): Ctx {
  const ctx = useContext(ArticleViewerContext);
  if (!ctx) throw new Error('useArticleViewer must be used within <ArticleViewerProvider>');
  return ctx;
}
