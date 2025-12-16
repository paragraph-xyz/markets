"use client";

import { Check, Copy, Globe } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import GeckoTerminal from "@/components/gecko-terminal-icon";
import { Card, CardHeader } from "@/components/ui/card";
import { GlassBubble } from "@/components/ui/glass-bubble";
import type { Coin } from "@/hooks/use-paragraph";
import type { TokenPriceData } from "@/hooks/use-token-prices";
import { formatMarketCap, formatUsdPrice } from "@/lib/utils";

type CoinCardVariant = "writer" | "post";

interface CoinCardProps {
  coin: Coin;
  variant?: CoinCardVariant;
  compact?: boolean;
  isSelected?: boolean;
  priceData?: TokenPriceData;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="X"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function getSocialLinks(coin: Coin, basescanUrl: string, geckoUrl: string) {
  const links: { name: string; url: string; icon: React.ReactNode }[] = [];

  const externalUrl = coin.metadata.external_url;
  if (externalUrl) {
    const isParagraph = externalUrl.toLowerCase().includes("paragraph");
    links.push({
      name: isParagraph ? "Paragraph" : "Website",
      url: externalUrl,
      icon: isParagraph ? (
        <Image
          src="/paragraph.svg"
          alt="Paragraph"
          width={16}
          height={16}
          className="grayscale"
        />
      ) : (
        <Globe className="size-4" />
      ),
    });
  }

  links.push({
    name: "Basescan",
    url: basescanUrl,
    icon: (
      <Image
        src="/etherscan.svg"
        alt="Basescan"
        width={16}
        height={16}
        className="grayscale"
      />
    ),
  });

  links.push({
    name: "GeckoTerminal",
    url: geckoUrl,
    icon: <GeckoTerminal width={16} height={16} className="grayscale" />,
  });

  if (coin.metadata.links) {
    for (const link of coin.metadata.links) {
      if (
        link.name.toLowerCase().includes("twitter") ||
        link.name.toLowerCase().includes("x")
      ) {
        links.push({
          name: "X",
          url: link.url,
          icon: <XIcon className="size-4" />,
        });
      }
    }
  }

  return links;
}

export function CoinCard({
  coin,
  variant = "writer",
  compact = false,
  isSelected = false,
  priceData,
}: CoinCardProps) {
  console.log("[CoinCard]", coin.metadata.symbol, "priceData:", priceData, "address:", coin.contractAddress.toLowerCase());
  const [copied, setCopied] = useState(false);
  const imageUrl = coin.metadata.image || coin.metadata.logoURI;
  const basescanUrl = `https://basescan.org/address/${coin.contractAddress}`;
  const geckoUrl = `https://www.geckoterminal.com/base/pools/${coin.contractAddress}`;
  const socialLinks = getSocialLinks(coin, basescanUrl, geckoUrl);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(coin.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isPost = variant === "post";
  const description = coin.metadata.description;
  const truncatedDescription = isPost
    ? description?.slice(0, 150)
    : description;
  const showEllipsis = isPost && description && description.length > 150;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
          isSelected ? "bg-accent" : ""
        }`}
      >
        <div className="relative size-10 rounded-lg overflow-hidden bg-muted shrink-0">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={coin.metadata.name}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="min-w-0 text-left flex-1">
          <p className="font-medium text-sm truncate">{coin.metadata.name}</p>
          <p className="text-xs text-muted-foreground">
            ${coin.metadata.symbol}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-medium text-sm tabular-nums">
            {formatUsdPrice(priceData?.priceUsd)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md active:scale-[0.98] transition-all duration-150 group cursor-pointer">
      <div className="relative aspect-video w-full overflow-hidden bg-muted rounded-2xl">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={coin.metadata.name}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        <GlassBubble
          variant="pill"
          tint="normal"
          blur="minimal"
          hoverEffect="none"
          className="!absolute top-2 left-2 px-2 py-1 w-fit"
        >
          <span className="text-xs font-medium text-foreground">
            {isPost ? "Post" : "Writer"}
          </span>
        </GlassBubble>
        <GlassBubble
          variant="pill"
          tint="normal"
          blur="minimal"
          hoverEffect="none"
          className="!absolute top-2 right-2 px-2 py-1 w-fit"
        >
          <span className="text-xs font-medium text-foreground">
            ${coin.metadata.symbol}
          </span>
        </GlassBubble>
      </div>
      <CardHeader className=" gap-1 flex-1 flex flex-col">
        <div className="p-2 flex-1">
          <span className="text-lg font-semibold line-clamp-2">
            {coin.metadata.name}
          </span>
          {truncatedDescription && (
            <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
              {truncatedDescription}
              {showEllipsis && "..."}
            </p>
          )}
        </div>
        <div className="px-2 pb-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold tabular-nums">
              {formatUsdPrice(priceData?.priceUsd)}
            </span>
            {priceData?.marketCap != null && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  MC {formatMarketCap(priceData.marketCap)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="p-2">
          <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={link.name}
                onClick={(e) => handleLinkClick(e, link.url)}
              >
                {link.icon}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <button
              type="button"
              className="font-mono hover:text-foreground transition-colors cursor-pointer"
              onClick={(e) => handleLinkClick(e, basescanUrl)}
            >
              {truncateAddress(coin.contractAddress)}
            </button>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="p-0.5 hover:text-foreground transition-colors cursor-pointer"
              title="Copy address"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
