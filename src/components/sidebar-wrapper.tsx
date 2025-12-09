"use client";

import { usePathname } from "next/navigation";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasCoinSelected = pathname.startsWith("/coin/");

  if (!hasCoinSelected) {
    return null;
  }

  return (
    <aside className="fixed inset-0 z-50 bg-background md:top-[65px] md:bottom-0 md:left-auto md:right-0 md:w-[400px] md:border-l md:bg-card md:animate-in md:slide-in-from-right md:duration-300">
      {children}
    </aside>
  );
}
