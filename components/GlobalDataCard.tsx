import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import TrendValue from "./TrendValue";
import { useGlobalData } from "@/services/coingecko";
import { formatCurrency } from "@/lib/utils";

const GlobalDataCard = () => {
  const { data: globalData, isLoading } = useGlobalData();

  if (isLoading || !globalData)
    return (
      <div className="flex flex-col gap-2">
        <Card className="p-4 flex flex-col gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </Card>
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <Card className="p-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">
              ${formatCurrency(globalData.total_market_cap.usd, 0)}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-sm font-medium text-neutral-500">
                Market Cap
              </div>
              <TrendValue
                value={globalData.market_cap_change_percentage_24h_usd}
                text={`${formatCurrency(
                  Math.abs(globalData.market_cap_change_percentage_24h_usd),
                  1
                )}%`}
              />
            </div>
          </div>
          <img
            src="https://www.coingecko.com/total_market_cap.svg"
            alt="Total Market Cap"
            className="h-full"
          />
        </div>
      </Card>
      <Card className="p-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">
              ${formatCurrency(globalData.total_volume.usd, 0)}
            </div>
            <div className="text-sm font-medium text-neutral-500">
              24h Trading Volume
            </div>
          </div>
          <img
            src="https://www.coingecko.com/total_volume.svg"
            alt="Total Volume"
            className="h-full"
          />
        </div>
      </Card>
    </div>
  );
};

export default GlobalDataCard;
