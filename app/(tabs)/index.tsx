import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter, Link } from "expo-router";
import { StockCard } from "../../components/StockCard";
import { fetchMarketTickers, fetchMarketNews } from "../api/marketApi";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type MarketType = "STOCKS" | "ETF" | "MUTUALFUNDS" | "FUTURES";

const transformETFData = (data: any) => {
  return {
    ...data,
    body: data.body.map((item: any) => ({
      symbol: item.symbol,
      name: item.companyName,
      lastsale: item.lastSalePrice,
      netchange: item.netChange,
      pctchange: item.percentageChange,
    })),
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState<MarketType>("STOCKS");

  const { data: marketData, isLoading: isLoadingMarket } = useQuery({
    queryKey: ["marketTickers", selectedMarket],
    queryFn: () => fetchMarketTickers(1, selectedMarket),
    select: (data) => {
      if (selectedMarket === "ETF") {
        return transformETFData(data);
      }
      return data;
    },
  });

  const { data: newsData, isLoading: isLoadingNews } = useQuery({
    queryKey: ["market-news"],
    queryFn: () => fetchMarketNews(),
  });

  const marketTypes: MarketType[] = ["STOCKS", "ETF", "MUTUALFUNDS", "FUTURES"];

  if (isLoadingMarket || isLoadingNews) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Loading data...</Text>
      </View>
    );
  }

  const formatNewsTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (error) {
      console.warn("Error parsing date:", error);
    }
    return "Just now";
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerTitle: "Market Overview",
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: "Search stocks...",
            onChangeText: (event) => {
              console.log(event.nativeEvent.text);
            },
          },
        }}
      />

      <LinearGradient
        colors={["#87CEEB", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className=" h-full"
      >
        <View className="  h-full p-4 pt-16">
          {/* Market Type Segments */}

          <View className="flex-row justify-between items-center">
            <View className="w-1/2">
              <Text>Good Morning</Text>
              <Text>Derek</Text>
            </View>
            <View className="w-1/2"></View>
          </View>

          {/* Market Data Grid */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {marketData?.body.slice(0, 6).map((stock) => (
              <View
                key={stock.symbol}
                style={{ width: width - 32 }}
                className="mr-4"
              >
                <TouchableOpacity
                  onPress={() => router.push(`/stock/${stock.symbol}`)}
                >
                  <StockCard stockData={stock} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* News Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-lg font-bold">Latest News</Text>
              <Link href="/news" asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-white mr-1">View All</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </Link>
            </View>
            {newsData?.body[0] && (
              <View className="bg-white/10 rounded-lg p-4">
                <Text className="text-white text-lg font-semibold mb-2">
                  {newsData.body[0].title}
                </Text>
                <Text className="text-white/80 mb-2" numberOfLines={2}>
                  {newsData.body[0].text}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-white/60 text-sm">
                    {newsData.body[0].source}
                  </Text>
                  <Text className="text-white/60 text-sm">
                    {formatNewsTime(newsData.body[0].time)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {marketTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedMarket(type)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedMarket === type ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  <Text className="text-white">{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Selected Market Type Data */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {marketData?.body.slice(6).map((item) => (
              <View
                key={item.symbol}
                style={{ width: width - 32 }}
                className="mr-4"
              >
                <TouchableOpacity
                  onPress={() => router.push(`/stock/${item.symbol}`)}
                >
                  <View className="bg-white/10 rounded-lg p-4">
                    <Text className="text-white text-lg font-bold">
                      {item.symbol}
                    </Text>
                    <Text className="text-white text-sm mb-2">{item.name}</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-white">
                        {item.netchange} ({item.pctchange})
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}
