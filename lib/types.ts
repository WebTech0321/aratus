export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface CoinGeckoGlobalData {
  active_cryptocurrencies: number;
  ended_icos: number;
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage: {
    [token: string]: number;
  };
  markets: number;
  ongoing_icos: number;
  total_market_cap: {
    [currency: string]: number;
  };
  total_volume: {
    [currency: string]: number;
  };
  upcoming_icos: number;
  updated_at: number;
}

export interface CoinGeckoTrendingCoin {
  item: {
    coin_id: number;
    id: string;
    name: string;
    slug: string;
    symbol: string;
    thumb: string;
    data: {
      market_cap: string;
      market_cap_btc: string;
      price: number;
      price_btc: string;
      price_change_percentage_24h: {
        [currency: string]: number;
      };
      sparkline: string;
      total_volume: string;
      total_volume_btc: string;
    };
    market_cap_rank: number;
    large: string;
    small: string;
  };
}

export interface CoinGeckoTrendingData {
  coins: CoinGeckoTrendingCoin[];
}
