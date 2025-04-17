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
import { StockTicker } from "../api/marketApi";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const WatchlistScreen = () => {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();
  const symbols = watchlist.map((item) => item.symbol);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["watchlist-quotes", symbols],
    queryFn: () => fetchStockQuotes(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const renderRightActions = (symbol: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFromWatchlist(symbol)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: StockTicker;
    index: number;
  }) => {
    const quote = quotes?.body.find((q) => q.symbol === item.symbol);
    const changeColor = quote?.regularMarketChangePercent
      ? quote.regularMarketChangePercent >= 0
        ? "#4CAF50"
        : "#F44336"
      : "#000";

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 100)}
        exiting={FadeOutLeft}
      >
        <Swipeable renderRightActions={() => renderRightActions(item.symbol)}>
          <View style={styles.itemContainer}>
            <View style={styles.symbolContainer}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              {quote && (
                <>
                  <Text style={styles.price}>
                    ${quote.regularMarketPrice.toFixed(2)}
                  </Text>
                  <Text style={[styles.change, { color: changeColor }]}>
                    {quote.regularMarketChangePercent.toFixed(2)}%
                  </Text>
                </>
              )}
            </View>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  if (watchlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={64} color="#666" />
        <Text style={styles.emptyText}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtext}>
          Add stocks to your watchlist to track them here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={watchlist}
        renderItem={renderItem}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  name: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  change: {
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});

export default WatchlistScreen;
