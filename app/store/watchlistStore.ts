import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WatchlistState {
  stocks: string[];
  addStock: (symbol: string) => void;
  removeStock: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      stocks: [],
      addStock: (symbol) => {
        const currentStocks = get().stocks;
        if (!currentStocks.includes(symbol)) {
          set({ stocks: [...currentStocks, symbol] });
        }
      },
      removeStock: (symbol) => {
        set({ stocks: get().stocks.filter((s) => s !== symbol) });
      },
      isInWatchlist: (symbol) => get().stocks.includes(symbol),
    }),
    {
      name: "stock-watchlist",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
