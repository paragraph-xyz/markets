import { WalletButton } from "@/components/wallet-button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full px-4 py-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">Paragraph Markets</h1>
        <WalletButton />
      </div>
    </header>
  );
}
