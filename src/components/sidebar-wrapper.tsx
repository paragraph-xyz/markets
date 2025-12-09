"use client";

import { usePathname } from "next/navigation";

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
      <aside className="hidden md:block w-[400px] shrink-0 border-l bg-card overflow-y-auto">
        {children}
      </aside>
    </>
  );
}
