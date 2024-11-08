import axios from "axios";
import {
  CoinGeckoGlobalData,
  CoinGeckoMarketData,
  CoinGeckoTrendingCoin,
  CoinGeckoTrendingData,
} from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const COINGECKO_API_KEY = process.env.COIN_GECKO_API_KEY;
const BASE_URL = "https://api.coingecko.com/api/v3";

export type MarketDataOrderBy =
  | "id_asc"
  | "id_desc"
  | "market_cap_asc"
  | "market_cap_desc"
  | "volume_asc"
  | "volume_desc";

export async function getMarketData(
  page: number = 1,
  perPage: number = 100,
  sparkline: boolean = true,
  orderBy: MarketDataOrderBy = "market_cap_desc"
): Promise<CoinGeckoMarketData[]> {
  try {
    const response = await axios.get(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=${orderBy}&per_page=${perPage}&page=${page}&sparkline=${sparkline}&price_change_percentage=1h,24h,7d`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-cg-pro-api-key": COINGECKO_API_KEY,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

export async function getGlobalData(): Promise<CoinGeckoGlobalData> {
  try {
    const response = await axios.get(`${BASE_URL}/global`, {
      headers: {
        "Content-Type": "application/json",
        "x-cg-pro-api-key": COINGECKO_API_KEY,
      },
    });

    if (response.status !== 200) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

export async function getTrendingData(): Promise<CoinGeckoTrendingData> {
  try {
    const response = await axios.get(`${BASE_URL}/search/trending`, {
      headers: {
        "Content-Type": "application/json",
        "x-cg-pro-api-key": COINGECKO_API_KEY,
      },
    });

    if (response.status !== 200) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching trending data:", error);
    throw error;
  }
}

export const useMarketData = (page: number, rowsPerPage: number) => {
  return useQuery({
    queryKey: ["market-data", page, rowsPerPage],
    queryFn: () => getMarketData(page, rowsPerPage),
    staleTime: 100000,
  });
};

export const useGlobalData = () => {
  return useQuery({
    queryKey: ["global-data"],
    queryFn: () => getGlobalData(),
    staleTime: 100000,
    refetchInterval: 100000,
  });
};

export const useTrendingData = () => {
  return useQuery({
    queryKey: ["trending-data"],
    queryFn: () => getTrendingData(),
    staleTime: 100000,
    refetchInterval: 100000,
  });
};

export const useLargestMarketCap = () => {
  return useQuery({
    queryKey: ["largest-market-cap"],
    queryFn: () => getMarketData(1, 3, false),
    staleTime: 100000,
    refetchInterval: 100000,
  });
};
