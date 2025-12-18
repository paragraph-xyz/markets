"use client";

import { ParagraphAPI } from "@paragraph-com/sdk";
import { useQuery } from "@tanstack/react-query";

const api = new ParagraphAPI();

export type Coin = Awaited<
  ReturnType<typeof api.coins.get>
>["items"][number];

export type CoinMetadata = Coin["metadata"];

export function usePopularCoins() {
  return useQuery<Coin[]>({
    queryKey: ["popularCoins"],
    queryFn: async () => {
      const { items } = await api.coins.get({ sortBy: "popular" });
      return items;
    },
    staleTime: 30000,
  });
}

export function useQuote(coinId: string, amountWei: bigint, enabled: boolean) {
  return useQuery<string>({
    queryKey: ["quote", coinId, amountWei.toString()],
    queryFn: async () => {
      const response = await api.coins.getQuote({ id: coinId }, amountWei);
      return response.quote;
    },
    enabled: enabled && amountWei > 0n,
  });
}

export function useParagraphAPI() {
  return api;
}
