import { CoinsGrid } from "@/components/coins-grid";
import { Header } from "@/components/header";
import { MainWrapper } from "@/components/main-wrapper";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

export default function MainLayout({
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <MainWrapper>
          <CoinsGrid />
        </MainWrapper>
        <SidebarWrapper>{sidebar}</SidebarWrapper>
      </div>
    </div>
  );
}
