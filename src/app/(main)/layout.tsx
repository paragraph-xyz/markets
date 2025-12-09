import { ChartPanel } from "@/components/chart-panel";
import { CoinsGrid } from "@/components/coins-grid";
import { Header } from "@/components/header";
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
      <div className="flex-1 flex overflow-hidden">
        <CoinsGrid />
        <ChartPanel />
        <SidebarWrapper>{sidebar}</SidebarWrapper>
      </div>
    </div>
  );
}
