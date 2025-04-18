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
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const chunkArray = (array: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

type MarketType = "STOCKS" | "ETF" | "MUTUALFUNDS" | "FUTURES";

const topStocks = ["AAPL", "META", "NVDA", "MSFT", "GOOGL", "AMZN"];

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

const sortStocks = (stocks: any[]) => {
  if (!stocks || !stocks.length) return [];

  // First, find all top stocks in the data
  const topStockItems = stocks.filter((stock) =>
    topStocks.includes(stock.symbol.toUpperCase())
  );

  // Sort the top stocks according to our priority order
  const sortedTopStocks = topStocks
    .map((symbol) =>
      topStockItems.find((stock) => stock.symbol.toUpperCase() === symbol)
    )
    .filter(Boolean);

  // Get all other stocks
  const otherStocks = stocks.filter(
    (stock) => !topStocks.includes(stock.symbol.toUpperCase())
  );

  // Combine sorted top stocks with other stocks
  return [...sortedTopStocks, ...otherStocks];
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState<MarketType>("STOCKS");

  // Query for recent stocks (always STOCKS)
  const { data: recentStocksData, isPending: isLoadingRecentStocks } = useQuery(
    {
      queryKey: ["recentStocks"],
      queryFn: () => fetchMarketTickers(1, "STOCKS"),
      select: (data) => {
        if (!data || !data.body) return data;
        return {
          ...data,
          body: sortStocks(data.body),
        };
      },
    }
  );

  // Query for selected market type
  const { data: marketData, isPending: isLoadingMarket } = useQuery({
    queryKey: ["marketTickers", selectedMarket],
    queryFn: () => fetchMarketTickers(1, selectedMarket),
    select: (data) => {
      if (selectedMarket === "ETF") {
        return transformETFData(data);
      }
      return data;
    },
  });

  const { data: newsData, isPending: isLoadingNews } = useQuery({
    queryKey: ["market-news"],
    queryFn: () => fetchMarketNews(),
  });

  const marketTypes: MarketType[] = ["STOCKS", "ETF", "MUTUALFUNDS", "FUTURES"];

  if (isLoadingRecentStocks || isLoadingMarket || isLoadingNews) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-900">
        <ActivityIndicator size="large" color="white" />
        <Text
          className="mt-4 text-white"
          style={{
            fontFamily: "RubikBold",
          }}
        >
          Loading
        </Text>
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
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <View className="h-full p-4 pt-16">
          {/* Market Type Segments */}
          <View className="flex-row justify-between items-center ">
            <View className="w-1/2">
              <Text
                className="text-white text-lg"
                style={{
                  fontFamily: "RubikMedium",
                }}
              >
                Good Morning
              </Text>
              <Text
                className="text-white text-2xl font-bold"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Derek Shawn
              </Text>
            </View>
            <View className="w-1/2"></View>
          </View>

          {/* Recent Stocks Section */}
          <View className="mt-4 p-4 rounded-2xl bg-blue-900/10 border border-white">
            <Text
              className="text-white text-lg mb-2"
              style={{
                fontFamily: "RubikBold",
              }}
            >
              Recent Stocks
            </Text>

            <Carousel
              loop={false}
              width={width - 32}
              height={100}
              data={chunkArray(recentStocksData?.body || [], 6)}
              scrollAnimationDuration={1000}
              renderItem={({ item: chunk }) => (
                <View className="flex-row flex-wrap ">
                  {chunk.map((stock: any) => {
                    const isPositive = !stock.netchange.startsWith("-");
                    return (
                      <View
                        key={stock.symbol}
                        style={{ width: (width - 32) / 3 }}
                        className="mb-2"
                      >
                        <TouchableOpacity
                          onPress={() => router.push(`/stock/${stock.symbol}`)}
                        >
                          <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-2">
                              <Text
                                className="text-white text-lg"
                                style={{
                                  fontFamily: "RubikBold",
                                }}
                              >
                                {stock.symbol.charAt(0)}
                              </Text>
                            </View>
                            <View>
                              <Text
                                className="text-white text-lg"
                                style={{
                                  fontFamily: "RubikBold",
                                }}
                              >
                                {stock.symbol}
                              </Text>
                              <Text
                                className={`text-sm ${
                                  isPositive ? "text-green-600" : "text-red-600"
                                }`}
                                style={{
                                  fontFamily: "RubikSemiBold",
                                }}
                              >
                                {stock.pctchange}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            />
          </View>

          {/* News Section */}
          <View className="my-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-white text-lg"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Latest News
              </Text>
              <Link href="/news" asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Text
                    className="text-white mr-1"
                    style={{
                      fontFamily: "RubikMedium",
                    }}
                  >
                    View All
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </Link>
            </View>
            {newsData?.body[0] && (
              <View className="bg-white/10 rounded-lg p-4">
                <Text
                  className="text-white text-lg mb-2"
                  style={{
                    fontFamily: "RubikSemiBold",
                  }}
                >
                  {newsData.body[0].title}
                </Text>
                <Text
                  className="text-white/80 mb-2"
                  numberOfLines={2}
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {newsData.body[0].text}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-white/60 text-sm"
                    style={{
                      fontFamily: "RubikBold",
                    }}
                  >
                    {newsData.body[0].source}
                  </Text>
                  <Text
                    className="text-white/60 text-sm"
                    style={{
                      fontFamily: "RubikBold",
                    }}
                  >
                    {formatNewsTime(newsData.body[0].time)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Market Type Segments */}
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
                  <Text
                    className="text-white"
                    style={{
                      fontFamily: `${
                        selectedMarket === type ? "RubikBold" : "RubikMedium"
                      }`,
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Indices Section */}
          <View>
            <Text
              className="text-white text-lg mb-2"
              style={{
                fontFamily: "RubikBold",
              }}
            >
              Indices
            </Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {marketData?.body.slice(0, 2).map((item: any) => {
                const isPositive = !item.netchange.startsWith("-");
                return (
                  <View
                    key={item.symbol}
                    style={{ width: width - 32 }}
                    className="mr-4"
                  >
                    <TouchableOpacity
                      onPress={() => router.push(`/stock/${item.symbol}`)}
                    >
                      <View className="bg-white/10 rounded-lg p-4 mb-2">
                        <Text
                          className="text-white text-lg"
                          style={{
                            fontFamily: "RubikBold",
                          }}
                        >
                          {item.symbol}
                        </Text>

                        <View className="flex-row justify-between">
                          <Text
                            className={`text-sm ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                            style={{
                              fontFamily: "RubikSemiBold",
                            }}
                          >
                            {item.netchange} ({item.pctchange})
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
