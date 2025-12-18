import { ParagraphAPI } from "@paragraph-com/sdk";
import { notFound } from "next/navigation";
import { TradeSidebar } from "@/components/trade-sidebar";

interface CoinSidebarPageProps {
  params: Promise<{
    address: string;
  }>;
}

const api = new ParagraphAPI();

export default async function CoinSidebarPage({
  params,
}: CoinSidebarPageProps) {
  const { address } = await params;

  try {
    const coin = await api.coins.get({ contractAddress: address }).single();
    return <TradeSidebar coin={coin} />;
  } catch {
    notFound();
  }
}
