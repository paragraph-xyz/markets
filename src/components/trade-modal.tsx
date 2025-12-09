"use client";

import { Check, CheckCircle2, Copy, XCircle } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Coin, useParagraphAPI, useQuote } from "@/hooks/use-paragraph";

interface TradeModalProps {
  coin: Coin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function TradeModal({ coin, open, onOpenChange }: TradeModalProps) {
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
    address: coin?.contractAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!coin && !!address,
    },
  });

  const buyAmountWei = buyAmount ? parseEther(buyAmount) : 0n;
  const { data: buyQuote, isLoading: isQuoteLoading } = useQuote(
    coin?.id || "",
    buyAmountWei,
    !!coin && buyAmountWei > 0n,
  );

  const hasCoinBalance = coinBalance !== undefined && coinBalance > 0n;
  const canSell = isConnected && hasCoinBalance;

  useEffect(() => {
    if (!canSell && activeTab === "sell") {
      setActiveTab("buy");
    }
  }, [canSell, activeTab]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset form state when coin changes
  useEffect(() => {
    setBuyAmount("");
    setSellAmount("");
    setTransactionResult(null);
  }, [coin?.id]);

  useEffect(() => {
    if (open) {
      refetchBalance();
    }
  }, [open, refetchBalance]);

  const handleBuy = async () => {
    if (!coin || !buyAmount) {
      console.warn("Something went wrong", { coin, buyAmount });
      return;
    }

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
    if (!coin || !sellAmount || !coinBalance) return;

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
    const decimals = coin?.metadata.decimals || 18;
    const balance = Number(formatUnits(coinBalance, decimals));
    const amount = (balance * percentage) / 100;
    setSellAmount(amount.toString());
  };

  const handleCloseResult = () => {
    setTransactionResult(null);
    onOpenChange(false);
  };

  if (!coin) return null;

  if (transactionResult) {
    return (
      <Dialog open={open} onOpenChange={handleCloseResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            {transactionResult.type === "success" ? (
              <>
                <CheckCircle2 className="size-12 text-green-500 mb-2" />
                <DialogTitle>
                  {transactionResult.action === "buy"
                    ? "Coins purchased successfully!"
                    : "Coins sold successfully!"}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {transactionResult.action === "buy"
                    ? "You're now invested in this content. Share it to drive engagement and pump the value of your position."
                    : "Your position has been closed and funds are now available. Thanks for supporting quality content!"}
                </DialogDescription>
              </>
            ) : (
              <>
                <XCircle className="size-12 text-destructive mb-2" />
                <DialogTitle>Transaction failed</DialogTitle>
                <div className="flex items-start gap-2 mt-2">
                  <p className="text-sm text-destructive flex-1">
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
          </DialogHeader>
          <Button onClick={handleCloseResult} className="w-full mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const formattedCoinBalance = coinBalance
    ? formatUnits(coinBalance, coin.metadata.decimals || 18)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trade ${coin.metadata.symbol}</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
