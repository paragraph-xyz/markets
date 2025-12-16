# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run Biome linter
npm run lint:fix # Auto-fix linting issues
```

## Architecture Overview

This is a Next.js 16 app for buying/selling coins via the Paragraph SDK on the Base network.

### Key Technologies
- **Next.js 16** with App Router and experimental view transitions
- **Paragraph SDK** (`@paragraph_xyz/sdk`) for coin trading operations
- **RainbowKit + wagmi** for wallet connections (Base chain only)
- **TanStack Query** for data fetching and caching
- **GeckoTerminal API** for OHLCV price chart data
- **lightweight-charts** for price visualization
- **Tailwind CSS v4** with Radix UI primitives

### App Structure

The app uses Next.js parallel routes for the sidebar:
- `src/app/(main)/layout.tsx` - Main layout with header, coin grid, chart panel, and sidebar slot
- `src/app/(main)/@sidebar/` - Parallel route for trading sidebar
- `src/app/(main)/@sidebar/coin/[address]/page.tsx` - Trading sidebar for specific coin

### Data Flow

1. **Coin Data**: `use-paragraph.ts` fetches popular coins and buy/sell quotes from Paragraph SDK
2. **Price Charts**: `use-gecko-terminal.ts` fetches OHLCV data from GeckoTerminal API
3. **Token Prices**: `use-token-prices.ts` and `use-eth-price.ts` fetch USD prices from CoinGecko
4. **Wallet State**: wagmi hooks manage wallet connection and ERC20 balance reads

### Components

- `providers.tsx` - Wraps app with WagmiProvider, QueryClientProvider, RainbowKitProvider
- `trade-sidebar.tsx` - Buy/sell UI with wallet integration
- `price-chart.tsx` - Candlestick/area charts using lightweight-charts
- `coins-grid.tsx` - Grid display of popular coins

## Environment Variables

Required:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID
