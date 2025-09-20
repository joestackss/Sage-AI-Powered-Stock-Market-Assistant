import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useWatchlistStore } from "../store/watchlistStore";
import { useChatStore } from "../store/chatStore";
import { useQuery } from "@tanstack/react-query";
import { fetchStockQuotes } from "../api/marketApi";
import { formatStockForAI } from "../../utils/aiService";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const WatchlistScreen = () => {
  const router = useRouter();
  const { stocks, removeStock } = useWatchlistStore();
  const { setContext } = useChatStore();

  const { data: quotes, isPending: isLoading } = useQuery({
    queryKey: ["watchlist-quotes", stocks],
    queryFn: () => fetchStockQuotes(stocks),
    enabled: stocks.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleAnalyzeStock = (symbol: string) => {
    const quote = quotes?.body?.find((q) => q.symbol === symbol);
    if (quote) {
      const stockContext = formatStockForAI(
        {
          symbol,
          lastsale: quote.regularMarketPrice?.toString() || "0",
          netchange: quote.regularMarketChange?.toString() || "0",
          pctchange: quote.regularMarketChangePercent?.toFixed(2) + "%" || "0%",
          name: quote.longName,
        },
        // No profile data available here, but AI can still provide analysis
        undefined
      );

      setContext(stockContext);
      router.push("/(tabs)/ai-chat");
    }
  };

  const handleAnalyzePortfolio = () => {
    // Clear context for portfolio analysis
    setContext(undefined);
    router.push("/(tabs)/ai-chat");
  };

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
          <View className="bg-white p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
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

            {/* AI Analysis Button */}
            <View className="mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={() => handleAnalyzeStock(symbol)}
                className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-row items-center justify-center"
              >
                <Ionicons name="sparkles" size={16} color="#2563eb" />
                <Text
                  className="text-blue-600 text-sm ml-2"
                  style={{ fontFamily: "RubikSemiBold" }}
                >
                  Get AI Analysis
                </Text>
              </TouchableOpacity>
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
                Watchlist ({stocks.length})
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 200 }}
              >
                {/* AI Portfolio Analysis Card */}
                <View className="mb-4 bg-white/10 rounded-xl p-4 border border-white/20">
                  <Text
                    className="text-white/80 text-sm mb-4"
                    style={{ fontFamily: "RubikRegular" }}
                  >
                    Get comprehensive AI analysis of your entire watchlist
                    including diversification, risk assessment, and market
                    outlook.
                  </Text>

                  <TouchableOpacity
                    onPress={handleAnalyzePortfolio}
                    className="bg-purple-600 rounded-lg px-4 py-3 flex-row items-center justify-center"
                  >
                    <Ionicons name="sparkles" size={18} color="white" />
                    <Text
                      className="text-white text-sm ml-2"
                      style={{ fontFamily: "RubikSemiBold" }}
                    >
                      Analyze My Portfolio
                    </Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  scrollEnabled={false}
                  data={stocks}
                  renderItem={renderItem}
                  keyExtractor={(item) => item}
                />
              </ScrollView>
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
