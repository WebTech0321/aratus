import localFont from "next/font/local";
import { useState } from "react";
import GlobalDataCard from "@/components/GlobalDataCard";
import TrendingCard from "@/components/TrendingCard";
import LargestGainerCard from "@/components/LargestGainerCard";
import { Switch } from "@/components/ui/switch";
import TokenTable from "@/components/TokenTable";
import { useGlobalData } from "@/services/coingecko";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [showHighLights, setShowHighLights] = useState(true);
  const { data: globalData, isLoading } = useGlobalData();

  return (
    <div
      className={`container px-4 mx-auto py-8 ${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Cryptocurrency Prices by Market Cap
        </h2>
        <div className="flex items-center gap-2">
          <div>Highlights</div>
          <Switch
            checked={showHighLights}
            onCheckedChange={setShowHighLights}
          />
        </div>
      </div>

      {showHighLights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-6">
          <GlobalDataCard />
          <TrendingCard />
          <LargestGainerCard />
        </div>
      )}

      <TokenTable totalTokenCount={globalData?.active_cryptocurrencies ?? 0} />
    </div>
  );
}
