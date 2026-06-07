/**
 * Default barrel — Metro/Webpack will pick the platform-specific file
 * (`.web.tsx` on web, `.native.tsx` on iOS/Android). This file exists only so
 * TypeScript can resolve a stable import path from consumers.
 */
export { ArticleViewerProvider, useArticleViewer } from './ArticleViewer.native';
