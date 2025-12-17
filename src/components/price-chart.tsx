"use client";

import {
  type AreaData,
  AreaSeries,
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { OHLCVData } from "@/hooks/use-gecko-terminal";

export type ChartType = "area" | "candle";

interface PriceChartProps {
  data: OHLCVData[];
  chartType?: ChartType;
  isLoading?: boolean;
  className?: string;
}

export function PriceChart({
  data,
  chartType = "area",
  isLoading,
  className,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: lightweight-charts v5 series types are complex
  const seriesRef = useRef<any>(null);

  // Create chart when we have data and container
  useEffect(() => {
    if (!containerRef.current || !data.length) {
      return;
    }

    // Clean up existing chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#737373",
      },
      grid: {
        vertLines: { color: "rgba(64, 64, 64, 0.2)" },
        horzLines: { color: "rgba(64, 64, 64, 0.2)" },
      },
      rightPriceScale: {
        borderColor: "#404040",
      },
      timeScale: {
        borderColor: "#404040",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          labelBackgroundColor: "#404040",
        },
        horzLine: {
          labelBackgroundColor: "#404040",
        },
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    if (chartType === "candle") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        priceFormat: {
          type: "price",
          precision: 8,
          minMove: 0.00000001,
        },
      });

      const candleData: CandlestickData<Time>[] = data.map((item) => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      series.setData(candleData);
      seriesRef.current = series;
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: "rgba(13, 89, 242, 0.75)",
        topColor: "rgba(13, 89, 242, 0.4)",
        bottomColor: "rgba(13, 89, 242, 0.05)",
        lineWidth: 2,
        priceFormat: {
          type: "price",
          precision: 8,
          minMove: 0.00000001,
        },
      });

      const areaData: AreaData<Time>[] = data.map((item) => ({
        time: item.time as Time,
        value: item.close,
      }));

      series.setData(areaData);
      seriesRef.current = series;
    }
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, chartType]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading chart...</span>
        </div>
      </div>
    );
  }

  // Always render the container, show message overlay if no data
  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!data.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No price data available</p>
            <p className="text-xs mt-1">
              This token may not have trading pools yet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
