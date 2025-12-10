import Link from "next/link";
import ParagraphIcon from "@/components/paragraph-icon";
import { GlassBubble } from "@/components/ui/glass-bubble";
import { WalletButton } from "@/components/wallet-button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="w-full px-4 pt-4 pb-4 flex items-center justify-between gap-4">
        <Link href="/" className="pointer-events-auto">
          <GlassBubble
            variant="auto"
            tint="heavy"
            blur="normal"
            hoverEffect="expand"
            className="px-5 py-3 rounded-2xl flex items-center"
          >
            <ParagraphIcon size={22} className="mr-4" />
            <h1 className="text-xl font-bold font-header">Paragraph Markets</h1>
          </GlassBubble>
        </Link>
        <div className="pointer-events-auto">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
