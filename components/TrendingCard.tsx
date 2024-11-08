import { useMemo } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { useTrendingData } from "@/services/coingecko";
import { formatCurrency } from "@/lib/utils";
import TrendValue from "./TrendValue";

const TrendingCard = () => {
  const { data: trendingData, isLoading } = useTrendingData();

  const trendingCoins = useMemo(
    () => trendingData?.coins.slice(0, 3),
    [trendingData]
  );

  if (isLoading || !trendingCoins)
    return (
      <Card className="p-4 flex flex-col gap-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
      </Card>
    );

  return (
    <Card className="p-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="text-lg font-bold">{`🔥 Trending`}</div>
      </div>
      <div className="flex flex-col gap-1">
        {trendingCoins?.map((coin) => (
          <div
            key={coin.item.id}
            className="p-2 hover:bg-neutral-100 rounded-md flex items-center gap-2"
          >
            <img
              src={coin.item.thumb}
              alt={coin.item.name}
              className="w-6 h-6"
            />
            <div className="text-sm font-medium text-neutral-700">
              {coin.item.name}
            </div>

            <div className="text-sm font-medium ms-auto">
              ${formatCurrency(coin.item.data.price, "auto")}
            </div>
            <TrendValue
              value={coin.item.data.price_change_percentage_24h.usd}
              text={`${formatCurrency(
                Math.abs(coin.item.data.price_change_percentage_24h.usd),
                1
              )}%`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TrendingCard;
