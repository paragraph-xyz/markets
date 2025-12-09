"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasCoinSelected = pathname.startsWith("/coin/");

  return (
    <main
      className={`flex-1 px-4 py-8 overflow-auto transition-[margin] duration-300 ease-out ${
        hasCoinSelected ? "md:mr-[400px]" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  );
}
