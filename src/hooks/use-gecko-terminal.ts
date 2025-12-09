"use client";

import { useQuery } from "@tanstack/react-query";

const GECKO_TERMINAL_API = "https://api.geckoterminal.com/api/v2";
const NETWORK = "base";

export type Timeframe = "1h" | "4h" | "1d" | "1w";

interface TimeframeConfig {
  endpoint: "hour" | "day";
  aggregate: number;
  limit: number;
}

const TIMEFRAME_CONFIG: Record<Timeframe, TimeframeConfig> = {
  "1h": { endpoint: "hour", aggregate: 1, limit: 60 },
  "4h": { endpoint: "hour", aggregate: 4, limit: 42 },
  "1d": { endpoint: "day", aggregate: 1, limit: 30 },
  "1w": { endpoint: "day", aggregate: 1, limit: 90 },
};

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PoolResponse {
  data: Array<{
    id: string;
    attributes: {
      address: string;
      name: string;
      reserve_in_usd: string;
    };
  }>;
}

interface OHLCVResponse {
  data: {
    attributes: {
      ohlcv_list: [number, string, string, string, string, string][];
    };
  };
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && i < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      continue;
    }

    throw new Error(`API request failed: ${response.status}`);
  }

  throw new Error("Max retries exceeded");
}

export function useTokenPools(tokenAddress: string) {
  return useQuery({
    queryKey: ["tokenPools", tokenAddress],
    queryFn: async () => {
      const url = `${GECKO_TERMINAL_API}/networks/${NETWORK}/tokens/${tokenAddress}/pools?page=1`;
      const response = await fetchWithRetry(url);
      const data: PoolResponse = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tokenAddress,
  });
}

export function usePoolOHLCV(
  poolAddress: string | undefined,
  timeframe: Timeframe,
) {
  const config = TIMEFRAME_CONFIG[timeframe];

  return useQuery({
    queryKey: ["poolOHLCV", poolAddress, timeframe],
    queryFn: async () => {
      if (!poolAddress) {
        return [];
      }

      const url = `${GECKO_TERMINAL_API}/networks/${NETWORK}/pools/${poolAddress}/ohlcv/${config.endpoint}?aggregate=${config.aggregate}&limit=${config.limit}`;
      const response = await fetchWithRetry(url);
      const data: OHLCVResponse = await response.json();

      const ohlcvList = data.data?.attributes?.ohlcv_list || [];

      const mapped = ohlcvList
        .map(([timestamp, open, high, low, close, volume]) => ({
          time: timestamp,
          open: Number.parseFloat(open),
          high: Number.parseFloat(high),
          low: Number.parseFloat(low),
          close: Number.parseFloat(close),
          volume: Number.parseFloat(volume),
        }))
        .sort((a, b) => a.time - b.time);

      // Deduplicate by timestamp (lightweight-charts requires unique timestamps)
      const seen = new Set<number>();
      return mapped.filter((item) => {
        if (seen.has(item.time)) {
          return false;
        }
        seen.add(item.time);
        return true;
      });
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!poolAddress,
  });
}

export function usePriceHistory(tokenAddress: string, timeframe: Timeframe) {
  const { data: pools, isLoading: isLoadingPools, error: poolsError } =
    useTokenPools(tokenAddress);

  const topPool = pools?.[0];
  const poolAddress = topPool?.attributes?.address;

  const {
    data: ohlcv,
    isLoading: isLoadingOHLCV,
    error,
  } = usePoolOHLCV(poolAddress, timeframe);

  return {
    data: ohlcv || [],
    poolName: topPool?.attributes?.name,
    isLoading: isLoadingPools || isLoadingOHLCV,
    error: error || poolsError,
    hasPool: !!poolAddress,
  };
}
