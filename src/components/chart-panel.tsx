"use client";

import { ChartArea, ChartCandlestick } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { type ChartType, PriceChart } from "@/components/price-chart";
import { Button } from "@/components/ui/button";
import { ContentPanel } from "@/components/ui/content-panel";
import { type Timeframe, usePriceHistory } from "@/hooks/use-gecko-terminal";

const CHART_TYPES: { icon: React.ReactNode; value: ChartType }[] = [
  { icon: <ChartArea className="size-4" />, value: "area" },
  { icon: <ChartCandlestick className="size-4" />, value: "candle" },
];

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
];

export function ChartPanel() {
  const pathname = usePathname();
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");
  const [chartType, setChartType] = useState<ChartType>("candle");

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
    <ContentPanel
      className="hidden md:flex flex-1 h-screen"
      innerClassName="flex flex-col rounded-lg"
    >
      <div className="p-4 flex items-center justify-between">
        {poolName && (
          <p className="text-sm font-semibold text-muted-foreground">
            {poolName}
          </p>
        )}
        <div className="flex gap-1 items-center">
          {CHART_TYPES.map((ct) => (
            <Button
              key={ct.value}
              variant={chartType === ct.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType(ct.value)}
              className="h-7 px-2 min-w-10"
            >
              {ct.icon}
            </Button>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(tf.value)}
              className="h-7 px-2 text-xs min-w-10"
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <PriceChart
          data={data}
          chartType={chartType}
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
    </ContentPanel>
  );
}
