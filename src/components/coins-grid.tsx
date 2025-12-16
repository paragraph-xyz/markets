"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { CoinCard } from "@/components/coin-card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Coin, usePopularCoins } from "@/hooks/use-paragraph";
import { useTokenPrices } from "@/hooks/use-token-prices";

function CoinCardSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-xl bg-background/50 backdrop-blur p-3 flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-2 overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="p-2 space-y-4 mt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
        </div>
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

export function CoinsGrid() {
  const pathname = usePathname();
  const hasCoinSelected = pathname.startsWith("/coin/");

  const { data: coins, isLoading, error } = usePopularCoins();

  const addresses = useMemo(
    () => coins?.map((coin) => coin.contractAddress) ?? [],
    [coins],
  );
  const { data: priceData, isLoading: priceLoading, error: priceError } = useTokenPrices(addresses);

  console.log("[CoinsGrid] addresses:", addresses);
  console.log("[CoinsGrid] priceData:", priceData);
  console.log("[CoinsGrid] priceLoading:", priceLoading);
  console.log("[CoinsGrid] priceError:", priceError);

  // When a coin is selected, don't render the grid here - it will be in the sidebar
  if (hasCoinSelected) {
    return null;
  }

  const wrapperClass = "flex-1 p-4 md:p-8 overflow-y-auto";
  const gridClass =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto";

  if (error) {
    return (
      <div className={wrapperClass}>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load coins. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={wrapperClass}>
        <div className={gridClass}>
          {Array.from({ length: hasCoinSelected ? 12 : 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
            <CoinCardSkeleton key={i} compact={hasCoinSelected} />
          ))}
        </div>
      </div>
    );
  }

  if (!coins || coins.length === 0) {
    return (
      <div className={wrapperClass}>
        <div className="text-center py-12 text-muted-foreground">
          No coins found
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className={gridClass}>
        {coins.map((coin) => (
          <Link
            key={coin.id}
            href={`/coin/${coin.contractAddress}`}
            prefetch={true}
            scroll={false}
          >
            <CoinCard
              coin={coin}
              variant={isPostCoin(coin) ? "post" : "writer"}
              priceData={priceData?.[coin.contractAddress.toLowerCase()]}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CompactCoinsList() {
  const pathname = usePathname();
  const selectedAddress = pathname.startsWith("/coin/")
    ? pathname.split("/coin/")[1]
    : null;

  const { data: coins, isLoading } = usePopularCoins();

  const addresses = useMemo(
    () => coins?.map((coin) => coin.contractAddress) ?? [],
    [coins],
  );
  const { data: priceData } = useTokenPrices(addresses);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
          <CoinCardSkeleton key={i} compact />
        ))}
      </div>
    );
  }

  if (!coins || coins.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-b flex-1 min-h-0 overflow-y-auto">
      {coins.map((coin) => (
        <Link
          key={coin.id}
          href={`/coin/${coin.contractAddress}`}
          prefetch={true}
          scroll={false}
        >
          <CoinCard
            coin={coin}
            variant={isPostCoin(coin) ? "post" : "writer"}
            compact
            isSelected={selectedAddress === coin.contractAddress}
            priceData={priceData?.[coin.contractAddress.toLowerCase()]}
          />
        </Link>
      ))}
    </div>
  );
}
