"use client";

import { usePathname } from "next/navigation";
import { ContentPanel } from "@/components/ui/content-panel";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasCoinSelected = pathname.startsWith("/coin/");

  if (!hasCoinSelected) {
    return null;
  }

  return (
    <>
      {/* Mobile: Full screen overlay */}
      <aside className="fixed inset-0 z-50 bg-background md:hidden">
        {children}
      </aside>
      {/* Desktop: Fixed width sidebar in flex layout */}
      <ContentPanel
        className="hidden md:flex h-screen w-[400px] shrink-0 pl-0"
        innerClassName="rounded-lg overflow-hidden"
      >
        {children}
      </ContentPanel>
    </>
  );
}
