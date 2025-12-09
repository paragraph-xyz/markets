"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CoinCard } from "@/components/coin-card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Coin, usePopularCoins } from "@/hooks/use-paragraph";

function CoinCardSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
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
  const selectedAddress = hasCoinSelected ? pathname.split("/coin/")[1] : null;

  const { data: coins, isLoading, error } = usePopularCoins();

  const wrapperClass = hasCoinSelected
    ? "w-[280px] shrink-0 border-r bg-card/50 overflow-y-auto p-4 hidden md:block"
    : "flex-1 p-4 md:p-8 overflow-y-auto";

  const gridClass = hasCoinSelected
    ? "flex flex-col gap-3"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto";

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
      {hasCoinSelected && (
        <h2 className="font-semibold text-sm mb-3 text-muted-foreground">
          All Coins
        </h2>
      )}
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
              compact={hasCoinSelected}
              isSelected={selectedAddress === coin.contractAddress}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
