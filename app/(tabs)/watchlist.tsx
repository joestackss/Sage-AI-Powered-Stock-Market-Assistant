import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useWatchlistStore } from "../store/watchlistStore";
import { useQuery } from "@tanstack/react-query";
import { fetchStockQuotes } from "../api/marketApi";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const WatchlistScreen = () => {
  const { stocks, removeStock } = useWatchlistStore();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["watchlist-quotes", stocks],
    queryFn: () => fetchStockQuotes(stocks),
    enabled: stocks.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  console.log({ quotes });

  const renderRightActions = (symbol: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
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
        style={styles.stockItem}
      >
        <Swipeable renderRightActions={() => renderRightActions(symbol)}>
          <View style={styles.stockContent}>
            <View>
              <Text style={styles.symbol}>{symbol}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {quote?.shortName || quote?.longName || symbol}
              </Text>
              <Text style={styles.exchange}>{quote?.fullExchangeName}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                ${currentPrice?.toFixed(2) || "0.00"}
              </Text>
              <Text
                style={[
                  styles.change,
                  isPositive ? styles.positiveChange : styles.negativeChange,
                ]}
              >
                {isPositive ? "+" : ""}
                {currentChange?.toFixed(2) || "0.00"} (
                {currentChangePercent?.toFixed(2) || "0.00"}%)
                {(isPreMarket || isPostMarket) && (
                  <Text style={styles.marketState}>
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading watchlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your watchlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Add stocks to your watchlist to track them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={stocks}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  stockItem: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  stockContent: {
    backgroundColor: "white",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  symbol: {
    fontSize: 16,
    fontWeight: "bold",
  },
  name: {
    fontSize: 14,
    color: "#666",
  },
  exchange: {
    fontSize: 12,
    color: "#999",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  change: {
    fontSize: 14,
  },
  positiveChange: {
    color: "#4CAF50",
  },
  negativeChange: {
    color: "#F44336",
  },
  marketState: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default WatchlistScreen;
