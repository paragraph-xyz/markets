"use client";

import { useQuery } from "@tanstack/react-query";

interface PriceResponse {
  ethereum: {
    usd: number;
  };
}

export function useEthPrice() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch ETH price: ${response.status}`);
      }
      const data: PriceResponse = await response.json();
      return data.ethereum.usd;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  return {
    ethPrice: data,
    isLoading,
    error,
  };
}
