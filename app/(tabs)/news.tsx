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
import { LinearGradient } from "expo-linear-gradient";

const NewsScreen = () => {
  const [filter, setFilter] = useState<"all" | "market" | "stocks">("all");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const { data: news, isPending: isLoading } = useQuery({
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
        className={` ${filter === value ? "text-white" : "text-gray-600"}`}
        style={{
          fontFamily: `${filter === value ? "RubikBold" : "RubikMediu"}`,
        }}
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
        <TouchableOpacity className="flex-row mb-4 bg-white rounded-lg overflow-hidden">
          <Image
            source={{ uri: item.img }}
            className="w-24 h-24"
            resizeMode="cover"
          />
          <View className="flex-1 p-3">
            <Text
              className="text-base text-black mb-1"
              style={{
                fontFamily: "RubikBold",
              }}
            >
              {item.title.length > 25 ? item.title.slice(0, 25) : item.title}
            </Text>
            <Text
              className="text-sm text-gray-600 mb-2"
              numberOfLines={2}
              style={{
                fontFamily: "RubikSemiBold",
              }}
            >
              {item.text.length > 25 ? item.text.slice(0, 25) : item.text}
            </Text>
            <View className="flex-row justify-between items-center">
              <Text
                className="text-xs text-gray-500"
                style={{
                  fontFamily: "RubikSemiBold",
                }}
              >
                {item.source}
              </Text>
              <Text
                className="text-xs text-gray-500"
                style={{
                  fontFamily: "RubikSemiBold",
                }}
              >
                {timeAgo}
              </Text>
            </View>
            {/* {item.tickers.length > 0 && (
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
            )} */}
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <View className="h-full px-4 pt-16">
          <View className="flex-row pb-4 border-b border-gray-200">
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
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : (
            <FlatList
              data={filteredNews}
              renderItem={renderItem}
              keyExtractor={(item) => item.url}
              className="pt-4"
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default NewsScreen;
