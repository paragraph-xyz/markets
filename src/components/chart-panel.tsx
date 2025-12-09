"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { PriceChart } from "@/components/price-chart";
import { Button } from "@/components/ui/button";
import { type Timeframe, usePriceHistory } from "@/hooks/use-gecko-terminal";

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
];

export function ChartPanel() {
  const pathname = usePathname();
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");

  const hasCoinSelected = pathname.startsWith("/coin/");
  const tokenAddress = hasCoinSelected ? pathname.split("/coin/")[1] : null;

  const { data, isLoading, hasPool, poolName, error } = usePriceHistory(
    tokenAddress || "",
    timeframe,
  );

  if (!hasCoinSelected || !tokenAddress) {
    return null;
  }

  return (
    <div className="hidden md:flex flex-col flex-1 border-x bg-card/50">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Price Chart</h2>
          {poolName && (
            <p className="text-xs text-muted-foreground">{poolName}</p>
          )}
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(tf.value)}
              className="h-7 px-2 text-xs"
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <PriceChart
          data={data}
          isLoading={isLoading}
          className="w-full aspect-video"
        />
      </div>
      {!isLoading && !hasPool && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center">
            No trading pools found on GeckoTerminal for this token
          </p>
        </div>
      )}
    </div>
  );
}
