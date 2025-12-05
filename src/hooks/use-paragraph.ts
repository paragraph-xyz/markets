"use client";

import { useQuery } from "@tanstack/react-query";
import { createParagraphAPI } from "@paragraph_xyz/sdk";

const api = createParagraphAPI();

export type Coin = Awaited<
  ReturnType<typeof api.getPopularCoins>
>["coins"][number];

export type CoinMetadata = Coin["metadata"];

export function usePopularCoins() {
  return useQuery<Coin[]>({
    queryKey: ["popularCoins"],
    queryFn: async () => {
      const response = await api.getPopularCoins();
      return response.coins;
    },
  });
}

export function useQuote(coinId: string, amountWei: bigint, enabled: boolean) {
  return useQuery<string>({
    queryKey: ["quote", coinId, amountWei.toString()],
    queryFn: async () => {
      const response = await api.getQuote(coinId, amountWei);
      return response.quote;
    },
    enabled: enabled && amountWei > 0n,
  });
}

export function useParagraphAPI() {
  return api;
}
