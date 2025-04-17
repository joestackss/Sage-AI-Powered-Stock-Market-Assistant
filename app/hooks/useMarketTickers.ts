import { useQuery } from "@tanstack/react-query";
import { StockTicker } from "./api/marketApi";

type MarketType = "STOCKS" | "ETF" | "MUTUALFUNDS" | "FUTURES";

export const useMarketTickers = (marketType: MarketType) => {
  return useQuery<StockTicker[]>({
    queryKey: ["marketTickers", marketType],
    queryFn: async () => {
      const response = await fetch(`/markets/tickers?type=${marketType}`);
      if (!response.ok) {
        throw new Error("Failed to fetch market tickers");
      }
      return response.json();
    },
  });
};
