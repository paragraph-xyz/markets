# Paragraph Markets

A trading platform for [Paragraph](https://paragraph.com) writer coins, built to showcase the **Paragraph API and SDK**.

**Live Demo:** [paragraph.markets](https://paragraph.markets)
**API & SDK Docs:** [paragraph.com/docs](https://paragraph.com/docs)

## What are Writer Coins?

Writer coins are tokens on the [Base](https://base.org) network that represent ownership in a creator's work on Paragraph. Each writer on Paragraph can have their own coin that fans and supporters can buy and sell. There are two types:

- **Writer Coins** — Tied to a specific creator's overall presence on Paragraph
- **Post Coins** — Tied to individual posts or publications

These coins create a new way for readers to support writers and participate in their success.

## About This Project

Paragraph Markets is both a functional trading platform and a **reference implementation** for developers looking to integrate the Paragraph SDK into their own applications. It demonstrates:

- Fetching and displaying writer coins
- Getting real-time price quotes
- Executing buy and sell transactions
- Displaying price charts and market data
- Wallet integration on Base network

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — React framework with App Router
- **[Paragraph SDK](https://paragraph.com/docs)** — Core API for coins, quotes, and transactions
- **[RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh)** — Wallet connection
- **[TanStack Query](https://tanstack.com/query)** — Data fetching and caching
- **[Tailwind CSS v4](https://tailwindcss.com)** — Styling
- **[lightweight-charts](https://tradingview.github.io/lightweight-charts/)** — Price charts

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- A [WalletConnect](https://cloud.walletconnect.com) project ID

### Installation

```bash
# Clone the repository
git clone https://github.com/paragraph-xyz/markets.git
cd markets

# Install dependencies
bun install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

You can get a WalletConnect project ID for free at [cloud.walletconnect.com](https://cloud.walletconnect.com).

### Development

```bash
# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
# Create production build
bun run build

# Start production server
bun run start
```

### Linting

```bash
# Check for issues
bun run lint

# Auto-fix issues
bun run lint:fix
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   └── (main)/             # Main layout with parallel routes
│       └── @sidebar/       # Trading sidebar (parallel route)
├── components/
│   ├── ui/                 # Base UI components (Radix primitives)
│   ├── coins-grid.tsx      # Grid display of available coins
│   ├── trade-sidebar.tsx   # Buy/sell trading interface
│   ├── price-chart.tsx     # Candlestick/area charts
│   └── providers.tsx       # Wagmi, RainbowKit, Query providers
├── hooks/
│   ├── use-paragraph.ts    # Paragraph SDK integration
│   ├── use-eth-price.ts    # ETH/USD price fetching
│   └── use-gecko-terminal.ts # OHLCV chart data
└── lib/
    └── utils.ts            # Utility functions
```

## Key Integration Points

### Using the Paragraph SDK

The SDK is initialized and used in `src/hooks/use-paragraph.ts`:

```typescript
import { ParagraphAPI } from "@paragraph_xyz/sdk";

const api = new ParagraphAPI();

// Fetch popular coins
const coins = await api.getPopularCoins();

// Get a quote for buying
const quote = await api.getCoinBuyQuote(coinAddress, amountInWei);

// Execute a buy transaction (requires connected wallet)
await api.buyCoin({ address, amountIn, walletClient });
```

### Wallet Integration

RainbowKit and wagmi are configured in `src/components/providers.tsx`. The app is configured for the Base network only.

## Learn More

- **[Paragraph SDK Documentation](https://paragraph.com/docs)** — Full API reference and guides
- **[Paragraph](https://paragraph.com)** — The publishing platform
- **[Base](https://base.org)** — The L2 network where writer coins live

## License

MIT
