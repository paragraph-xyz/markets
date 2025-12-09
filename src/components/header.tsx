"use client";

import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

export function Header() {
  const { address, isConnected } = useConnection();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Discover Paragraph Coins</h1>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <Button variant="outline" size="sm" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect}>Connect Wallet</Button>
        )}
      </div>
    </header>
  );
}
