import ParagraphIcon from "@/components/paragraph-icon";
import { GlassBubble } from "@/components/ui/glass-bubble";
import { WalletButton } from "@/components/wallet-button";

export function Header() {
  return (
    <header className="sticky top-0 z-[100]">
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
        <GlassBubble
          variant="auto"
          tint="normal"
          blur="normal"
          hoverEffect="expand"
          className="px-5 py-3 rounded-2xl flex items-center"
        >
          <ParagraphIcon size={22} />
          <h1 className="text-xl font-bold font-header ml-2">Paragraph Markets</h1>
        </GlassBubble>
        <WalletButton />
      </div>
    </header>
  );
}
