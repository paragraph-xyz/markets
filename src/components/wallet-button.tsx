"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogOut, Wallet } from "lucide-react";
import { useDisconnect } from "wagmi";
import { GlassBubble } from "@/components/ui/glass-bubble";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletButton() {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <GlassBubble
                    onClick={openConnectModal}
                    variant="pill"
                    tint="normal"
                    blur="normal"
                    hoverEffect="expand"
                    className="px-4 py-2 cursor-pointer flex items-center gap-2"
                  >
                    <Wallet className="size-4" />
                    <span className="font-medium">Connect</span>
                  </GlassBubble>
                );
              }

              if (chain.unsupported) {
                return (
                  <GlassBubble
                    onClick={openConnectModal}
                    variant="pill"
                    tint="normal"
                    blur="normal"
                    color="primary"
                    hoverEffect="expand"
                    className="px-4 py-2 cursor-pointer"
                  >
                    <span className="font-medium text-destructive">Wrong network</span>
                  </GlassBubble>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <GlassBubble
                      variant="icon"
                      tint="normal"
                      blur="normal"
                      hoverEffect="expand"
                      className="cursor-pointer"
                    >
                      <Wallet className="size-4 h-10 w-10 p-2" />
                    </GlassBubble>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2">
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                      <span className="text-sm text-muted-foreground">
                        {account.displayName}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => disconnect()}
                      className="px-3 py-2"
                    >
                      <LogOut className="size-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
