import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useWatchlistStore } from "../store/watchlistStore";
import { useQuery } from "@tanstack/react-query";
import { fetchStockQuotes } from "../api/marketApi";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const WatchlistScreen = () => {
  const { stocks, removeStock } = useWatchlistStore();

  const { data: quotes, isPending: isLoading } = useQuery({
    queryKey: ["watchlist-quotes", stocks],
    queryFn: () => fetchStockQuotes(stocks),
    enabled: stocks.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const renderRightActions = (symbol: string) => {
    return (
      <TouchableOpacity
        className="bg-red-500 justify-center items-center w-20"
        onPress={() => removeStock(symbol)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item: symbol }: { item: string }) => {
    const quote = quotes?.body?.find((q) => q.symbol === symbol);
    const change = quote?.regularMarketChange || 0;
    const changePercent = quote?.regularMarketChangePercent || 0;
    const isPositive = change >= 0;
    const isPreMarket = quote?.marketState === "PRE";
    const isPostMarket = quote?.marketState === "POST";
    const currentPrice = isPreMarket
      ? quote?.preMarketPrice
      : isPostMarket
      ? quote?.postMarketPrice
      : quote?.regularMarketPrice;
    const currentChange = isPreMarket
      ? quote?.preMarketChange
      : isPostMarket
      ? quote?.postMarketChange
      : quote?.regularMarketChange;
    const currentChangePercent = isPreMarket
      ? quote?.preMarketChangePercent
      : isPostMarket
      ? quote?.postMarketChangePercent
      : quote?.regularMarketChangePercent;

    return (
      <Animated.View
        entering={FadeInRight}
        exiting={FadeOutLeft}
        className="mb-2 rounded-lg overflow-hidden"
      >
        <Swipeable renderRightActions={() => renderRightActions(symbol)}>
          <View className="bg-white p-4 flex-row justify-between items-center">
            <View>
              <Text
                className="text-base"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                {symbol}
              </Text>
              <Text
                className="text-sm text-gray-600"
                numberOfLines={1}
                style={{
                  fontFamily: "RubikMedium",
                }}
              >
                {quote?.shortName || quote?.longName || symbol}
              </Text>
              <Text
                className="text-xs text-gray-400"
                style={{
                  fontFamily: "RubikMedium",
                }}
              >
                {quote?.fullExchangeName}
              </Text>
            </View>
            <View className="items-end">
              <Text
                className="text-base"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                ${currentPrice?.toFixed(2) || "0.00"}
              </Text>
              <Text
                className={`text-sm ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
                style={{
                  fontFamily: "RubikSemiBold",
                }}
              >
                {isPositive ? "+" : ""}
                {currentChange?.toFixed(2) || "0.00"} (
                {currentChangePercent?.toFixed(2) || "0.00"}%)
                {(isPreMarket || isPostMarket) && (
                  <Text className="text-xs text-gray-400">
                    {" "}
                    {isPreMarket ? "Pre" : "Post"}
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <View className="h-full pt-16 px-4">
          {stocks.length === 0 ? (
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-lg font-bold mb-2">
                Your watchlist is empty
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Add stocks to your watchlist to track them here
              </Text>
            </View>
          ) : (
            <View>
              <Text
                className="text-white text-lg pb-4"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Watchlist
              </Text>
              <FlatList
                data={stocks}
                renderItem={renderItem}
                keyExtractor={(item) => item}
              />
            </View>
          )}
        </View>

        {isLoading && (
          <View className="flex-1 justify-center items-center">
            <Text>Loading watchlist</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default WatchlistScreen;
