"use client";

import { useQuery } from "@tanstack/react-query";

const GECKO_TERMINAL_API = "https://api.geckoterminal.com/api/v2";
const NETWORK = "base";

export interface TokenPriceData {
  priceUsd: number | null;
  marketCap: number | null;
}

interface TokenResponse {
  data: Array<{
    id: string;
    attributes: {
      address: string;
      price_usd: string | null;
      fdv_usd: string | null;
      market_cap_usd: string | null;
    };
  }>;
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

const BATCH_SIZE = 25; // GeckoTerminal limits addresses per request

export function useTokenPrices(addresses: string[]) {
  return useQuery({
    queryKey: ["tokenPrices", addresses.join(",")],
    queryFn: async (): Promise<Record<string, TokenPriceData>> => {
      if (addresses.length === 0) {
        console.log("[useTokenPrices] No addresses provided");
        return {};
      }

      const priceMap: Record<string, TokenPriceData> = {};

      // Batch addresses into chunks
      const batches: string[][] = [];
      for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        batches.push(addresses.slice(i, i + BATCH_SIZE));
      }

      console.log("[useTokenPrices] Fetching", addresses.length, "addresses in", batches.length, "batches");

      // Fetch all batches in parallel
      const results = await Promise.all(
        batches.map(async (batch) => {
          const addressList = batch.join(",");
          const url = `${GECKO_TERMINAL_API}/networks/${NETWORK}/tokens/multi/${addressList}`;
          console.log("[useTokenPrices] Fetching batch:", url);

          const response = await fetchWithRetry(url);
          const data: TokenResponse = await response.json();
          console.log("[useTokenPrices] Batch response tokens:", data.data?.length);
          return data;
        }),
      );

      // Merge all results
      for (const data of results) {
        if (!data.data) continue;
        for (const token of data.data) {
          const address = token.attributes.address.toLowerCase();
          const priceUsd = token.attributes.price_usd
            ? Number.parseFloat(token.attributes.price_usd)
            : null;
          const marketCap =
            token.attributes.market_cap_usd != null
              ? Number.parseFloat(token.attributes.market_cap_usd)
              : token.attributes.fdv_usd != null
                ? Number.parseFloat(token.attributes.fdv_usd)
                : null;

          priceMap[address] = { priceUsd, marketCap };
        }
      }

      console.log("[useTokenPrices] Final priceMap size:", Object.keys(priceMap).length);
      return priceMap;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: addresses.length > 0,
  });
}
