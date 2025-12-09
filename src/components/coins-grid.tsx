"use client";

import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { WriterCard } from "@/components/writer-card";
import { type Coin, usePopularCoins } from "@/hooks/use-paragraph";

function CoinCardSkeleton() {
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
  const { data: coins, isLoading, error } = usePopularCoins();

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load coins. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton list
            <CoinCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!coins || coins.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No coins found
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coins.map((coin) => (
          <Link
            key={coin.id}
            href={`/coin/${coin.contractAddress}`}
            prefetch={true}
          >
            {isPostCoin(coin) ? (
              <PostCard coin={coin} />
            ) : (
              <WriterCard coin={coin} />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
