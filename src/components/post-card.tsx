"use client";

import Image from "next/image";
import { Twitter, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Coin } from "@/hooks/use-paragraph";

interface PostCardProps {
  coin: Coin;
  onTrade: () => void;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getSocialLinks(coin: Coin) {
  const links: { name: string; url: string; icon: React.ReactNode }[] = [];

  if (coin.metadata.links) {
    for (const link of coin.metadata.links) {
      if (
        link.name.toLowerCase().includes("twitter") ||
        link.name.toLowerCase().includes("x")
      ) {
        links.push({
          name: "Twitter",
          url: link.url,
          icon: <Twitter className="size-4" />,
        });
      }
    }
  }

  return links;
}

export function PostCard({ coin, onTrade }: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const imageUrl = coin.metadata.image || coin.metadata.logoURI;
  const externalUrl = coin.metadata.external_url;
  const socialLinks = getSocialLinks(coin);
  const preview = coin.metadata.description?.slice(0, 150) || "";

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(coin.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const basescanUrl = `https://basescan.org/address/${coin.contractAddress}`;

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
          <Badge variant="secondary">Post</Badge>
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
        {socialLinks.length > 0 && (
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
        )}
      </CardHeader>
      <CardContent className="py-0">
        {preview && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {preview}
            {coin.metadata.description &&
              coin.metadata.description.length > 150 &&
              "..."}
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
