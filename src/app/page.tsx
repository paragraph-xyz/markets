"use client";

import { useState } from "react";
import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";
import { PostCard } from "@/components/post-card";
import { TradeModal } from "@/components/trade-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WriterCard } from "@/components/writer-card";
import { type Coin, usePopularCoins } from "@/hooks/use-paragraph";

function CoinCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-0 overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

function isPostCoin(coin: Coin): boolean {
  const coinType = coin.metadata.extensions?.coinType?.toLowerCase() || "";
  return (
    coinType.includes("post") || !!coin.metadata.extensions?.paragraph?.noteId
  );
}

export default function Home() {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const { address, isConnected } = useConnection();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();

  const { data: coins, isLoading, error } = usePopularCoins();

  const handleTrade = (coin: Coin) => {
    setSelectedCoin(coin);
    setTradeModalOpen(true);
  };

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Discover Paragraph Coins</h1>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button variant="outline" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect}>Connect Wallet</Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Failed to load coins. Please try again later.
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
              <CoinCardSkeleton key={i} />
            ))}
          </div>
        )}

        {coins && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coins.map((coin) =>
              isPostCoin(coin) ? (
                <PostCard
                  key={coin.id}
                  coin={coin}
                  onTrade={() => handleTrade(coin)}
                />
              ) : (
                <WriterCard
                  key={coin.id}
                  coin={coin}
                  onTrade={() => handleTrade(coin)}
                />
              ),
            )}
          </div>
        )}

        {coins && coins.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No coins found
          </div>
        )}
      </main>

      <TradeModal
        coin={selectedCoin}
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
      />
    </div>
  );
}
