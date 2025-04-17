import React, { useState } from "react";
import {
  View,
  Text,
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
      className={`px-4 py-2 rounded-full mr-2 ${
        filter === value ? "bg-black" : "bg-gray-100"
      }`}
      onPress={() => setFilter(value)}
    >
      <Text
        className={`font-medium ${
          filter === value ? "text-white" : "text-gray-600"
        }`}
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
        <TouchableOpacity className="flex-row mb-4 bg-white rounded-lg overflow-hidden shadow-sm">
          <Image
            source={{ uri: item.img }}
            className="w-24 h-24"
            resizeMode="cover"
          />
          <View className="flex-1 p-3">
            <Text className="text-base font-bold text-black mb-1">
              {item.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {item.text}
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500">{item.source}</Text>
              <Text className="text-xs text-gray-500">{timeAgo}</Text>
            </View>
            {item.tickers.length > 0 && (
              <View className="flex-row flex-wrap mt-2">
                {item.tickers.map((ticker: string, tickerIndex: number) => (
                  <TouchableOpacity
                    key={`${index}-${tickerIndex}-${ticker}`}
                    className="px-2 py-1 bg-gray-100 rounded mr-2 mb-2"
                    onPress={() => setSelectedTicker(ticker.replace("$", ""))}
                  >
                    <Text className="text-xs text-gray-600">{ticker}</Text>
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
    <View className="flex-1 bg-white">
      <View className="flex-row p-4 border-b border-gray-200">
        {renderFilterButton("All", "all")}
        {renderFilterButton("Market", "market")}
        {renderFilterButton("Stocks", "stocks")}
      </View>

      {selectedTicker && (
        <View className="flex-row items-center justify-center p-2 bg-gray-100">
          <Text className="text-gray-600 mr-2">
            Showing news for: {selectedTicker}
          </Text>
          <TouchableOpacity onPress={() => setSelectedTicker(null)}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderItem}
          keyExtractor={(item) => item.url}
          className="p-4"
        />
      )}
    </View>
  );
};

export default NewsScreen;
