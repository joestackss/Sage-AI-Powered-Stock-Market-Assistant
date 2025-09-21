import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Pressable,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { fetchMarketTickers } from "../api/marketApi";
import { generateMarketInsight } from "../../utils/aiService";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { blurhash } from "../../app/index";

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

  const marketTypes: MarketType[] = ["STOCKS", "ETF", "MUTUALFUNDS", "FUTURES"];

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <View className="h-full p-4 pt-16">
          {/* Market Type Segments */}
          <View className="flex-row justify-between items-center">
            <View className="w-1/2">
              <Text
                className="text-white text-lg"
                style={{
                  fontFamily: "RubikMedium",
                }}
              >
                Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}
              </Text>
              <Text
                className="text-white text-2xl font-bold"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Joe Stacks
              </Text>
            </View>
            <View className="w-1/2 items-end">
              <Pressable
                onPress={() => router.push("/(tabs)/ai-chat")}
                className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg flex-row px-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <View className="w-10 h-10 ">
                  <Image
                    style={{
                      flex: 1,
                      width: "100%",
                      height: "100%",
                      borderRadius: 40,
                      backgroundColor: "white",
                    }}
                    source={require("../../assets/images/logo.png")}
                    placeholder={{ blurhash }}
                    contentFit="contain"
                    transition={1000}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            {/* Recent Stocks Section */}
            <View className="mt-4 p-4 rounded-2xl bg-blue-900/10 border border-white overflow-hidden">
              <Text
                className="text-white text-lg mb-2"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Stocks
              </Text>

              {isLoadingRecentStocks ? (
                <View className="h-24 justify-center items-center">
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : (
                <Carousel
                  loop={false}
                  width={width - 32}
                  height={100}
                  data={chunkArray(recentStocksData?.body || [], 6)}
                  scrollAnimationDuration={1000}
                  renderItem={({ item: chunk }) => (
                    <View className="flex-row flex-wrap">
                      {chunk.map((stock: any) => {
                        const isPositive = !stock.netchange.startsWith("-");
                        return (
                          <View
                            key={stock.symbol}
                            style={{ width: (width - 32) / 3 }}
                            className="mb-2"
                          >
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/stock/${stock.symbol}`)
                              }
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
                                      isPositive
                                        ? "text-green-600"
                                        : "text-red-600"
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
              )}
            </View>

            {/* Quick AI Actions */}
            <View className="my-8">
              <Text
                className="text-white text-lg mb-4"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Quick AI Actions
              </Text>

              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/ai-chat")}
                  className="flex-1 bg-white/10 rounded-lg p-4 mr-2"
                >
                  <Ionicons
                    name="analytics"
                    size={24}
                    color="#60a5fa"
                    className="mb-2"
                  />
                  <Text
                    className="text-white text-sm"
                    style={{ fontFamily: "RubikSemiBold" }}
                  >
                    Ask AI About These Stocks
                  </Text>
                  <Text
                    className="text-white/70 text-xs mt-1"
                    style={{ fontFamily: "RubikRegular" }}
                  >
                    Get insights on current market leaders
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/watchlist")}
                  className="flex-1 bg-white/10 rounded-lg p-4 ml-2"
                >
                  <Ionicons
                    name="star"
                    size={24}
                    color="#fbbf24"
                    className="mb-2"
                  />
                  <Text
                    className="text-white text-sm"
                    style={{ fontFamily: "RubikSemiBold" }}
                  >
                    Analyze Watchlist
                  </Text>
                  <Text
                    className="text-white/70 text-xs mt-1"
                    style={{ fontFamily: "RubikRegular" }}
                  >
                    AI portfolio analysis
                  </Text>
                </TouchableOpacity>
              </View>
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
              {isLoadingMarket ? (
                <View className="h-32 justify-center items-center bg-white/10 rounded-lg">
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : (
                <Carousel
                  loop={false}
                  width={width - 32}
                  height={160}
                  data={chunkArray(marketData?.body || [], 2)}
                  scrollAnimationDuration={1000}
                  renderItem={({ item: chunk }) => (
                    <View className="gap-2 w-[98%]">
                      {chunk.map((item: any) => {
                        const isPositive = !item.netchange.startsWith("-");
                        return (
                          <TouchableOpacity
                            key={item.symbol}
                            onPress={() => router.push(`/stock/${item.symbol}`)}
                            className="bg-white/10 rounded-lg p-4"
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center w-full">
                                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-2">
                                  <Text
                                    className="text-white text-lg"
                                    style={{
                                      fontFamily: "RubikBold",
                                    }}
                                  >
                                    {item.symbol.charAt(0)}
                                  </Text>
                                </View>
                                <View className="flex-row w-[90%] justify-between">
                                  <View className=" w-[70%]">
                                    <Text
                                      className="text-white text-lg"
                                      style={{
                                        fontFamily: "RubikBold",
                                      }}
                                    >
                                      {item.symbol}
                                    </Text>
                                    <Text
                                      className={`text-sm text-white`}
                                      style={{
                                        fontFamily: "RubikMedium",
                                      }}
                                    >
                                      {item.name.length > 25
                                        ? item.name.slice(0, 25)
                                        : item.name}
                                    </Text>
                                  </View>

                                  <View className=" w-[30%] items-end">
                                    <Text
                                      style={{
                                        fontFamily: "RubikSemiBold",
                                      }}
                                      className="text-white text-lg"
                                    >
                                      {item.lastsale}
                                    </Text>
                                    <Text
                                      className={`text-lg ${
                                        isPositive
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                      style={{
                                        fontFamily: "RubikSemiBold",
                                      }}
                                    >
                                      {item.pctchange}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}
