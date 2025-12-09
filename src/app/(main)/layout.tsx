import { Header } from "@/components/header";
import { MainWrapper } from "@/components/main-wrapper";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

export default function MainLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <MainWrapper>{children}</MainWrapper>
        <SidebarWrapper>{sidebar}</SidebarWrapper>
      </div>
    </div>
  );
}
