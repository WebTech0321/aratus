import { Card } from "./ui/card";
import { useLargestMarketCap } from "@/services/coingecko";
import { Skeleton } from "./ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import TrendValue from "./TrendValue";

const LargestGainerCard = () => {
  const { data: largestGainer, isLoading } = useLargestMarketCap();

  if (isLoading || !largestGainer)
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
        <div className="text-lg font-bold">{`🚀 Largest Market Cap`}</div>
      </div>
      <div className="flex flex-col gap-1">
        {largestGainer?.map((coin) => (
          <div
            key={coin.id}
            className="p-2 hover:bg-neutral-100 rounded-md flex items-center gap-2"
          >
            <img src={coin.image} alt={coin.name} className="w-6 h-6" />
            <div className="text-sm font-medium text-neutral-700">
              {coin.name}
            </div>

            <div className="text-sm font-medium ms-auto">
              ${formatCurrency(coin.current_price, "auto")}
            </div>
            <TrendValue
              value={coin.price_change_percentage_24h}
              text={`${formatCurrency(
                Math.abs(coin.price_change_percentage_24h),
                1
              )}%`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LargestGainerCard;
