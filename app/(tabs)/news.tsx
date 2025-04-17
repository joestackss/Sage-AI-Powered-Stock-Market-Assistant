import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketNews } from "../api/marketApi";
import { NewsItem } from "../api/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { formatDistanceToNow } from "date-fns";

const NewsScreen = () => {
  const [filter, setFilter] = useState<"all" | "market" | "stocks">("all");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const { data: news, isLoading } = useQuery({
    queryKey: ["market-news", selectedTicker],
    queryFn: () => fetchMarketNews(selectedTicker || undefined),
  });

  const filteredNews = news?.body.filter((item) => {
    if (filter === "market") {
      return item.tickers.length === 0;
    } else if (filter === "stocks") {
      return item.tickers.length > 0;
    }
    return true;
  });

  const renderFilterButton = (
    label: string,
    value: "all" | "market" | "stocks"
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }: { item: NewsItem; index: number }) => {
    let timeAgo = "Just now";
    try {
      const date = new Date(item.time);
      if (!isNaN(date.getTime())) {
        timeAgo = formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (error) {
      console.warn("Error parsing date:", error);
    }

    return (
      <Link href={`/news/${encodeURIComponent(item.url)}`} asChild>
        <TouchableOpacity style={styles.newsItem}>
          <Image
            source={{ uri: item.img }}
            style={styles.newsImage}
            resizeMode="cover"
          />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsText} numberOfLines={2}>
              {item.text}
            </Text>
            <View style={styles.newsFooter}>
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsTime}>{timeAgo}</Text>
            </View>
            {item.tickers.length > 0 && (
              <View style={styles.tickersContainer}>
                {item.tickers.map((ticker: string, tickerIndex: number) => (
                  <TouchableOpacity
                    key={`${index}-${tickerIndex}-${ticker}`}
                    style={styles.tickerButton}
                    onPress={() => setSelectedTicker(ticker.replace("$", ""))}
                  >
                    <Text style={styles.tickerText}>{ticker}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {renderFilterButton("All", "all")}
        {renderFilterButton("Market", "market")}
        {renderFilterButton("Stocks", "stocks")}
      </View>

      {selectedTicker && (
        <View style={styles.selectedTickerContainer}>
          <Text style={styles.selectedTickerText}>
            Showing news for: {selectedTicker}
          </Text>
          <TouchableOpacity onPress={() => setSelectedTicker(null)}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderItem}
          keyExtractor={(item) => item.url}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  filterButtonActive: {
    backgroundColor: "#000",
  },
  filterButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  selectedTickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#f5f5f5",
  },
  selectedTickerText: {
    color: "#666",
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  newsItem: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: 100,
    height: 100,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  newsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsSource: {
    fontSize: 12,
    color: "#999",
  },
  newsTime: {
    fontSize: 12,
    color: "#999",
  },
  tickersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tickerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tickerText: {
    fontSize: 12,
    color: "#666",
  },
});

export default NewsScreen;
