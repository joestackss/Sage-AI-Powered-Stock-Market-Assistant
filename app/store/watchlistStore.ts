import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StockTicker } from "../api/marketApi";

interface WatchlistState {
  watchlist: StockTicker[];
  addToWatchlist: (stock: StockTicker) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (stock: StockTicker) => {
        set((state: WatchlistState) => {
          if (
            !state.watchlist.some(
              (item: StockTicker) => item.symbol === stock.symbol
            )
          ) {
            return { watchlist: [...state.watchlist, stock] };
          }
          return state;
        });
      },
      removeFromWatchlist: (symbol: string) => {
        set((state: WatchlistState) => ({
          watchlist: state.watchlist.filter(
            (item: StockTicker) => item.symbol !== symbol
          ),
        }));
      },
      isInWatchlist: (symbol: string) => {
        return get().watchlist.some(
          (item: StockTicker) => item.symbol === symbol
        );
      },
    }),
    {
      name: "stock-watchlist",
    }
  )
);
