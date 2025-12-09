"use client";

import { Check, Copy, Globe } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import GeckoTerminal from "@/components/gecko-terminal-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Coin } from "@/hooks/use-paragraph";

interface WriterCardProps {
  coin: Coin;
  onTrade: () => void;
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

export function WriterCard({ coin, onTrade }: WriterCardProps) {
  const [copied, setCopied] = useState(false);
  const imageUrl = coin.metadata.image || coin.metadata.logoURI;
  const externalUrl = coin.metadata.external_url;
  const basescanUrl = `https://basescan.org/address/${coin.contractAddress}`;
  const geckoUrl = `https://www.geckoterminal.com/base/pools/${coin.contractAddress}`;
  const socialLinks = getSocialLinks(coin, basescanUrl, geckoUrl);

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(coin.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full pt-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={coin.metadata.name}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-3xl font-bold text-white drop-shadow-lg">
            ${coin.metadata.symbol}
          </span>
        </div>
      </div>
      <CardHeader className="py-2 gap-1">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="default">Writer</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <a
              href={basescanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-foreground transition-colors"
            >
              {truncateAddress(coin.contractAddress)}
            </a>
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
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold hover:underline line-clamp-2"
        >
          {coin.metadata.name}
        </a>
        <div className="flex items-center gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={link.name}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </CardHeader>
      <CardContent className="py-0">
        {coin.metadata.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {coin.metadata.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <Button onClick={onTrade} className="w-full">
          Trade
        </Button>
      </CardFooter>
    </Card>
  );
}
