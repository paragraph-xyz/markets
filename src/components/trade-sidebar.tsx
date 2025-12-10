"use client";

import { Check, CheckCircle2, Copy, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createWalletClient, custom, formatUnits, parseEther } from "viem";
import {
  useConfig,
  useConnect,
  useConnection,
  useConnectors,
  useReadContract,
} from "wagmi";
import { getConnectorClient, switchChain } from "wagmi/actions";
import { base } from "wagmi/chains";
import { CompactCoinsList } from "@/components/coins-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Coin, useParagraphAPI, useQuote } from "@/hooks/use-paragraph";

interface TradeSidebarProps {
  coin: Coin;
}

const ETH_AMOUNTS = ["0.001", "0.01", "0.05", "0.1"];
const PERCENTAGE_AMOUNTS = [10, 25, 50, 75, 100];

type TransactionResult =
  | { type: "success"; action: "buy" | "sell" }
  | { type: "error"; message: string }
  | null;

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function TradeSidebar({ coin }: TradeSidebarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionResult, setTransactionResult] =
    useState<TransactionResult>(null);
  const [copiedError, setCopiedError] = useState(false);

  const { address, isConnected } = useConnection();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const config = useConfig();
  const api = useParagraphAPI();

  const { data: coinBalance, refetch: refetchBalance } = useReadContract({
    address: coin.contractAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const buyAmountWei = buyAmount ? parseEther(buyAmount) : 0n;
  const { data: buyQuote, isLoading: isQuoteLoading } = useQuote(
    coin.id,
    buyAmountWei,
    buyAmountWei > 0n,
  );

  const hasCoinBalance = coinBalance !== undefined && coinBalance > 0n;
  const canSell = isConnected && hasCoinBalance;

  useEffect(() => {
    if (!canSell && activeTab === "sell") {
      setActiveTab("buy");
    }
  }, [canSell, activeTab]);

  useEffect(() => {
    refetchBalance();
  }, [refetchBalance]);

  const handleBuy = async () => {
    if (!buyAmount) return;

    setIsLoading(true);
    try {
      await switchChain(config, { chainId: base.id });
      const connectorClient = await getConnectorClient(config, {
        chainId: base.id,
      });
      const walletClient = createWalletClient({
        account: connectorClient.account,
        chain: base,
        transport: custom(connectorClient),
      });
      if (!walletClient.account) {
        throw new Error("No account connected");
      }
      await api.buyCoin({
        coinId: coin.id,
        client: walletClient,
        account: walletClient.account,
        amount: buyAmountWei,
      });
      setTransactionResult({ type: "success", action: "buy" });
    } catch (error) {
      console.error("Buy failed:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      setTransactionResult({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (!sellAmount || !coinBalance) return;

    setIsLoading(true);
    try {
      await switchChain(config, { chainId: base.id });
      const connectorClient = await getConnectorClient(config, {
        chainId: base.id,
      });
      const walletClient = createWalletClient({
        account: connectorClient.account,
        chain: base,
        transport: custom(connectorClient),
      });
      const decimals = coin.metadata.decimals || 18;
      const sellAmountWei = BigInt(
        Math.floor(parseFloat(sellAmount) * 10 ** decimals),
      );

      if (!walletClient.account) {
        throw new Error("No account connected");
      }
      await api.sellCoin({
        coinId: coin.id,
        client: walletClient,
        account: walletClient.account,
        amount: sellAmountWei,
      });
      setTransactionResult({ type: "success", action: "sell" });
    } catch (error) {
      console.error("Sell failed:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      setTransactionResult({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handlePercentageSell = (percentage: number) => {
    if (!coinBalance) return;
    const decimals = coin.metadata.decimals || 18;
    const balance = Number(formatUnits(coinBalance, decimals));
    const amount = (balance * percentage) / 100;
    setSellAmount(amount.toString());
  };

  const handleClose = () => {
    router.push("/");
  };

  const handleCloseResult = () => {
    setTransactionResult(null);
    router.push("/");
  };

  if (transactionResult) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold font-header">
            Trade ${coin.metadata.symbol}
          </h2>
          <button
            type="button"
            onClick={handleCloseResult}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          {transactionResult.type === "success" ? (
            <>
              <CheckCircle2 className="size-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold font-header">
                {transactionResult.action === "buy"
                  ? "Coins purchased successfully!"
                  : "Coins sold successfully!"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                {transactionResult.action === "buy"
                  ? "You're now invested in this content. Share it to drive engagement and pump the value of your position."
                  : "Your position has been closed and funds are now available. Thanks for supporting quality content!"}
              </p>
            </>
          ) : (
            <>
              <XCircle className="size-16 text-destructive mb-4" />
              <h3 className="text-xl font-semibold font-header">Transaction failed</h3>
              <div className="flex items-start gap-2 mt-4 max-w-sm">
                <p className="text-sm text-destructive flex-1 text-left">
                  {transactionResult.message.length > 100
                    ? `${transactionResult.message.slice(0, 100)}...`
                    : transactionResult.message}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      transactionResult.message,
                    );
                    setCopiedError(true);
                    setTimeout(() => setCopiedError(false), 2000);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                  title="Copy full error"
                >
                  {copiedError ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </>
          )}
          <Button onClick={handleCloseResult} className="mt-6">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const formattedCoinBalance = coinBalance
    ? formatUnits(coinBalance, coin.metadata.decimals || 18)
    : "0";

  return (
    <div className="h-full flex flex-col">
      <CompactCoinsList />
      <div className="shrink-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold font-header">
              Trade ${coin.metadata.symbol}
            </h2>
            <p className="text-sm text-muted-foreground">{coin.metadata.name}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "buy" | "sell")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex-1" disabled={!canSell}>
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="buy-amount" className="text-sm font-medium">
                Amount (ETH)
              </label>
              <Input
                id="buy-amount"
                type="number"
                placeholder="0.0"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="flex flex-wrap gap-2">
                {ETH_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBuyAmount(amount)}
                  >
                    {amount} ETH
                  </Button>
                ))}
              </div>
            </div>

            {buyAmount && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You receive</span>
                  <span className="font-medium">
                    {isQuoteLoading
                      ? "Loading..."
                      : buyQuote
                        ? `${Math.floor(
                            parseFloat(
                              formatUnits(
                                BigInt(buyQuote),
                                coin.metadata.decimals || 18,
                              ),
                            ),
                          ).toLocaleString()} $${coin.metadata.symbol}`
                        : "-"}
                  </span>
                </div>
              </div>
            )}

            {isConnected ? (
              <Button
                onClick={handleBuy}
                disabled={!buyAmount || isLoading || isQuoteLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : `Buy $${coin.metadata.symbol}`}
              </Button>
            ) : (
              <Button onClick={handleConnect} className="w-full">
                Connect Wallet
              </Button>
            )}
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="sell-amount" className="text-sm font-medium">
                  Amount (${coin.metadata.symbol})
                </label>
                <span className="text-xs text-muted-foreground">
                  Balance: {parseFloat(formattedCoinBalance).toLocaleString()}
                </span>
              </div>
              <Input
                id="sell-amount"
                type="number"
                placeholder="0.0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                min="0"
              />
              <div className="flex flex-wrap gap-2">
                {PERCENTAGE_AMOUNTS.map((percentage) => (
                  <Button
                    key={percentage}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePercentageSell(percentage)}
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSell}
              disabled={!sellAmount || isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : `Sell $${coin.metadata.symbol}`}
            </Button>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
