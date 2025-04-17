import { StockTicker } from "@/app/api/marketApi";
import React from "react";
import { View, Text } from "react-native";

interface StockCardProps {
  stockData: StockTicker;
}

export function StockCard({ stockData }: StockCardProps) {
  const isPositive = !stockData.netchange.startsWith("-");

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
    </View>
  );
}
