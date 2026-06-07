# TradeZen

TradeZen is a mobile-first Bebop RFQ trading app built with Expo and React Native. All Bebop API calls go through your Go backend — the frontend only talks to `EXPO_PUBLIC_API_URL`.

## Start

```bash
cp .env.sample .env
npm install
npm run start
```

Scan the QR code with **Expo Go**.

### Privy + Expo Go

In [dashboard.privy.io](https://dashboard.privy.io) → your app → **Clients** → mobile client, add:

```
host.exp.exponent
```

### Backend on a physical device

Keep `EXPO_PUBLIC_API_URL=http://localhost:8080`. On a real phone, the app rewrites `localhost` to your PC's LAN IP. Your Go backend must listen on `0.0.0.0:8080`.

If the phone cannot reach your PC:

```bash
npm run start:tunnel
```

## Web

```bash
npm run start
# press w
```
