import { StockTicker } from "@/app/api/marketApi";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useWatchlistStore } from "../app/store/watchlistStore";

interface StockCardProps {
  stockData: StockTicker;
}

export function StockCard({ stockData }: StockCardProps) {
  const isPositive = !stockData.netchange.startsWith("-");
  const { addStock, removeStock, isInWatchlist } = useWatchlistStore();
  const isWatched = isInWatchlist(stockData.symbol);

  const handleWatchlistPress = () => {
    if (isWatched) {
      removeStock(stockData.symbol);
    } else {
      addStock(stockData.symbol);
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-bold">{stockData.symbol}</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {stockData.name}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-lg font-semibold">{stockData.lastsale}</Text>
          <View className="flex-row items-center">
            <Text
              className={`text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {stockData.netchange} ({stockData.pctchange})
            </Text>
          </View>
        </View>
      </View>
      <Pressable
        onPress={handleWatchlistPress}
        className="absolute top-2 right-2"
      >
        <Ionicons
          name={isWatched ? "star" : "star-outline"}
          size={24}
          color={isWatched ? "#fbbf24" : "#0284c7"}
        />
      </Pressable>
    </View>
  );
}
