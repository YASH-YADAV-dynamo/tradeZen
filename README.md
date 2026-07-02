# TradeZen

TradeZen is a mobile-first trading workspace: browse tokens, watch live
prices and news, log in with a wallet, and swap tokens against a real
backend — one Go API for everything (auth, tokens, prices, news, quotes,
orders, portfolio), reachable over REST, WebSocket, and SSE. Built with
React Native + Expo Router and shared across iOS, Android, and web from one
codebase.

---

## Quick start

```bash
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your backend
npm install
npm run start
```

Scan the QR code with Expo Go, or run `npm run ios` / `npm run android`.

| Script | What it does |
|---|---|
| `npm run start` | Start the Metro dev server |
| `npm run ios` / `npm run android` | Start and open the native simulator |
| `npm run type-check` | `tsc --noEmit` across the whole project |
| `npm run lint` | ESLint over `src` |

**Every tunable value is an env var, not a hardcoded literal.** See
`.env.example` for the full list (API URL, default chain, poll intervals,
WS reconnect backoff, page sizes, gasless default, token storage key) and
`src/core/config/env.ts`, the one file that reads `process.env` — nothing
else in the app does.

---

## Architecture at a glance

```
app/            Expo Router routes — thin, no business logic
src/
  core/         Framework-agnostic infrastructure (API client, realtime, storage, theme, config)
  shared/       Reusable UI kit, hooks, and utils used by 2+ features
  features/     One folder per business domain (auth, markets, trade, portfolio, news, wallet, settings)
  app-shell/    App-wide composition: providers and the custom tab bar
  store/        Barrel re-exporting every store from one place
```

```
+-------------+
|    app/     |  expo-router screens (thin wrappers)
+------+------+
       | imports
+------v------+
|  features/  |  auth, markets, trade, portfolio, news, wallet, settings
+------+------+
       | imports
+------v------+
|   shared/   |  reusable UI kit, hooks, formatters
+------+------+
       | imports
+------v------+
|    core/    |  API client, realtime (WS/SSE), storage factories, design tokens, env config
+-------------+
```

---

## Folder structure

```
app/                                # expo-router routes (UI wiring only)
├── _layout.tsx                     # Root layout → AppProviders (also runs useAuthBootstrap)
├── index.tsx, +not-found.tsx
└── (tabs)/
    ├── _layout.tsx, index.tsx (Markets), portfolio.tsx, settings.tsx

src/
├── core/
│   ├── api/
│   │   ├── ApiClient.ts            # class ApiClient — axios wrapper, normalized errors, Bearer-token headers
│   │   ├── ApiError.ts             # reads the backend's {"error": "<string>"} shape
│   │   └── index.ts                # singleton `apiClient`, baseURL = env.apiUrl
│   ├── realtime/
│   │   ├── ReconnectingSocket.ts   # generic auto-reconnecting WebSocket (used by prices + order status)
│   │   ├── EventStream.ts          # generic SSE wrapper (native via react-native-sse, web via EventSource)
│   │   └── urls.ts                 # builds /ws/* and /sse/* URLs from env
│   ├── config/
│   │   ├── env.ts                  # the ONLY place that reads process.env - every tunable lives here
│   │   └── queryClient.ts          # shared react-query QueryClient
│   ├── storage/
│   │   ├── createPersistedStore.ts # factory: zustand + AsyncStorage, for non-sensitive persisted state
│   │   └── secureTokenStorage.ts   # SecureStore wrapper for the JWT - deliberately NOT AsyncStorage
│   └── theme/                      # design tokens: colors, spacing, radius, typography, shadows
│
├── shared/                         # UI kit, hooks, utils reused by 2+ features
│
├── features/
│   ├── auth/                       # §3.2-3.3, §4.1 of the integration guide
│   │   ├── api/AuthService.ts      # requestNonce, verify
│   │   ├── store/useAuthStore.ts   # in-memory session mirror (token itself lives in SecureStore)
│   │   ├── hooks/                  # useAuthBootstrap, useLogin, useLogout, useAuthSession
│   │   └── utils/                  # jwt.ts (decode/expiry), walletSigner.ts (pluggable signer interface)
│   │
│   ├── markets/                    # §3.4-3.5, §3.12 — tokens + live prices
│   │   ├── api/TokensService.ts, PricesService.ts
│   │   ├── hooks/useTokens.ts, useLivePrices.ts   # see "State management" below
│   │   ├── store/useFavoritesStore.ts             # persisted watchlist (by token address)
│   │   ├── components/PairRow.tsx, FilterBar.tsx
│   │   ├── utils/search.ts
│   │   └── screens/MarketsScreen.tsx
│   │
│   ├── trade/                      # §3.7-3.9, §4.2-4.3 — quote/order flow
│   │   ├── api/QuoteService.ts, OrderService.ts
│   │   ├── hooks/useCreateQuote.ts, useSubmitOrder.ts, useOrderStatus.ts
│   │   ├── store/useTradeSheetStore.ts            # ephemeral - which token is being traded
│   │   ├── utils/amounts.ts                       # decimal <-> base-unit conversion (BigInt-safe)
│   │   └── components/TradeSheet.tsx
│   │
│   ├── portfolio/                  # §3.10 — server-tracked trade history
│   │   ├── api/PortfolioService.ts
│   │   ├── hooks/usePortfolio.ts
│   │   ├── components/TradeRow.tsx, SummaryCard.tsx
│   │   └── screens/PortfolioScreen.tsx
│   │
│   ├── news/                       # §3.6, §3.11 — feed + live SSE updates
│   │   ├── api/NewsService.ts
│   │   ├── hooks/useNews.ts, useLiveNews.ts
│   │   └── components/NewsTicker.tsx
│   │
│   ├── wallet/store/useWalletStore.ts   # persisted chain selection
│   └── settings/                        # wallet connect UI + haptics preference
│
├── app-shell/                      # AppProviders (fonts, safe area, react-query, auth bootstrap), TabBar
└── store/index.ts                  # barrel re-exporting every store
```

---

## State management

The guiding rule: **react-query owns anything that comes from the network;
zustand only owns state that's genuinely local to the device or the current
UI.** This keeps the amount of hand-written state code small — most
features have zero custom store code at all.

| Kind | Where it lives | Examples |
|---|---|---|
| Server data (REST) | react-query cache | tokens, news, portfolio |
| Server data (live, WS/SSE) | **same** react-query cache, updated via `queryClient.setQueryData` | live prices, live order status, live news |
| Sensitive session state | SecureStore + `useAuthStore` (ephemeral mirror) | JWT, wallet address |
| Non-sensitive device state | `createPersistedStore` (zustand + AsyncStorage) | favorites, selected chain, haptics preference |
| Session-only UI state | `createEphemeralStore` (zustand, no persistence) | trade sheet open/closed |

**The live-data pattern** (`useLivePrices`, `useOrderStatus`, `useLiveNews`)
is the same in all three places: open a WebSocket or SSE connection, and on
every message call `queryClient.setQueryData(key, data)` instead of writing
into a separate store. A `useQuery` with the same key still owns the initial
fetch, loading/error states, and a polling fallback (`refetchInterval`) that
only activates once the socket has gone quiet — so there's exactly one
place any screen reads "current prices" or "current order status" from,
regardless of which transport the data arrived over. No manual
socket-state-to-store syncing, no risk of the two drifting apart.

**Auth** is the one place a multi-step async flow (nonce → sign → verify →
persist) is expressed as a single `useMutation` (`useLogin`), so `isPending`
/ `error` / `mutate` cover the whole flow instead of three hand-rolled
`useState` flags.

**Portfolio** has no client-side store at all — `usePositionsStore` from an
earlier iteration of this app is gone. Trade history is entirely
server-tracked (`GET /api/portfolio`), so `usePortfolio` is a plain
`useQuery` and that's the whole feature's state story.

---

## Auth flow

```
POST-free: GET  /api/auth/nonce?wallet=..     →  { nonce }
           signer.signMessage(nonce)           (WalletSigner - see below)
           POST /api/auth/verify {wallet,sig}  →  { token }
           decode token, save to SecureStore, hydrate useAuthStore
```

All of this is `useLogin(signer)` in `features/auth/hooks/useLogin.ts`. On
app start, `useAuthBootstrap()` (called once from `AppProviders`) reads
SecureStore, checks the token's `exp` client-side, and either restores the
session or discards a stale token — so a user doesn't have to reconnect
their wallet every cold start.

**No wallet SDK is wired up yet.** `features/auth/utils/walletSigner.ts`
defines the `WalletSigner` interface (`signMessage`, `signTypedData`) that
both login and the trade sheet depend on; `defaultWalletSigner` throws a
clear error instead of faking a signature. Swap it for a real
implementation (WalletConnect, an injected browser wallet, etc.) in one
place and every call site picks it up.

---

## Trade flow

Implements guide §4.2 (gasless, the default) end to end in
`features/trade/components/TradeSheet.tsx`:

```
POST /api/quote  {chain, sellToken, buyToken, sellAmount, takerAddress}
   → { quoteId, toSign, buyTokens, priceImpact, feeBps, ... }
signer.signTypedData(toSign)
POST /api/order   {quoteId, signature}
   → { orderId, status: "Pending", txHash }
useOrderStatus(orderId)   — WS primary, REST fallback, stops at a terminal status
```

Self-execution (`gasless: false`, guide §4.3) is modeled in the types
(`Quote.tx`) but intentionally has no UI yet, since it requires actually
broadcasting a transaction from the connected wallet — another seam that
lights up once a real `WalletSigner`/wallet SDK is wired in.

---

## Adding something new

- **A new API call** → add a method to the relevant `*Service` class and a
  thin react-query hook next to it; never call `axios`/`fetch` or open a raw
  `WebSocket`/`EventSource` directly from a component.
- **A new live/pushed data source** → follow the `useLivePrices` pattern:
  a `useQuery` for the initial fetch + fallback poll, a `ReconnectingSocket`
  or `EventStream` in a `useEffect` that calls `queryClient.setQueryData`.
  Don't reach for a new zustand store for this.
- **A new tunable value** (URL, interval, page size, flag) → add it to
  `core/config/env.ts` and `.env.example` first, then reference `env.*`.
  Never hardcode it at the call site.
- **A new piece of state that should survive restarts** → `createPersistedStore`
  in the feature's `store/` folder (or `secureTokenStorage`-style handling
  if it's sensitive), and re-export it from `src/store/index.ts`.

---

## Tech stack

- **Expo Router** on **React Native 0.81** / **React 19**
- **TanStack Query** for server + live-data state (REST, WebSocket, SSE all land in the same cache)
- **Zustand** (+ AsyncStorage / SecureStore) for the small amount of state that's genuinely local
- **Axios**, wrapped by `core/api/ApiClient`; native `WebSocket` wrapped by `ReconnectingSocket`; `react-native-sse` wrapped by `EventStream`
- **expo-secure-store** for the JWT
- **Reanimated 4** + **Gesture Handler** for animation
- TypeScript in `strict` mode throughout
