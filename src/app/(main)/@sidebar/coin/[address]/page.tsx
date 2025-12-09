import { createParagraphAPI } from "@paragraph_xyz/sdk";
import { notFound } from "next/navigation";
import { TradeSidebar } from "@/components/trade-sidebar";

interface CoinSidebarPageProps {
  params: Promise<{
    address: string;
  }>;
}

const api = createParagraphAPI();

export default async function CoinSidebarPage({
  params,
}: CoinSidebarPageProps) {
  const { address } = await params;

  try {
    const coin = await api.getCoinByContract(address);
    return <TradeSidebar coin={coin} />;
  } catch {
    notFound();
  }
}
