import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Dimensions,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  fetchStockHistory,
  fetchStockModule,
  fetchStockQuotes,
} from "../api/marketApi";
import { useWatchlistStore } from "../store/watchlistStore";
import { useChatStore } from "../store/chatStore";
import { formatStockForAI } from "../../utils/aiService";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Chart time frame options
const timeFrames = [
  { label: "1D", interval: "5m", days: 1 },
  { label: "1W", interval: "15m", days: 7 },
  { label: "1M", interval: "1d", days: 30 },
  { label: "3M", interval: "1d", days: 90 },
  { label: "1Y", interval: "1wk", days: 365 },
  { label: "All", interval: "1mo", days: 0 },
];

// Tabs for the detail view
const TABS = ["Overview", "Financials"];

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const { addStock, removeStock, isInWatchlist } = useWatchlistStore();
  const { setContext } = useChatStore();
  const isWatched = isInWatchlist(symbol);

  // Fetch stock quote data
  const { data: quoteData, isPending: isQuoteLoading } = useQuery({
    queryKey: ["stockQuote", symbol],
    queryFn: () => fetchStockQuotes([symbol as string]),
    enabled: !!symbol,
  });

  const handleWatchlistPress = () => {
    if (isWatched) {
      removeStock(symbol);
    } else {
      addStock(symbol);
    }
  };

  const handleAskAI = () => {
    // Format current stock data for AI context
    if (quoteData?.body?.[0] && processedChartData.length > 0) {
      const stockContext = formatStockForAI(
        {
          symbol,
          lastsale:
            processedChartData[processedChartData.length - 1]?.value.toString(),
          netchange: priceChangeData.change.toString(),
          pctchange: priceChangeData.percentChange.toFixed(2) + "%",
          name: quoteData.body[0].longName,
        },
        profileData?.body
      );

      setContext(stockContext);
    }

    // Navigate to AI chat tab
    router.push("/(tabs)/ai-chat");
  };

  // Fetch stock history data
  const { data: historyData, isPending: isHistoryLoading } = useQuery({
    queryKey: ["stockHistory", symbol, timeFrames[selectedTimeFrame].interval],
    queryFn: () =>
      fetchStockHistory(
        symbol as string,
        timeFrames[selectedTimeFrame].interval as any
      ),
    enabled: !!symbol,
  });

  // console.log("Stock History Data", historyData);

  // Fetch stock profile data
  const { data: profileData, isPending: isProfileLoading } = useQuery({
    queryKey: ["stockModule", symbol, "all"],
    queryFn: () => fetchStockModule(symbol as string, "asset-profile"),
    enabled: !!symbol,
  });

  // console.log("Stock Profile Data", profileData);

  // Process chart data
  const processedChartData = React.useMemo(() => {
    if (!historyData?.body) return [];

    return Object.entries(historyData.body).map(([timestamp, data]) => ({
      timestamp: parseInt(timestamp),
      date: new Date(parseInt(timestamp) * 1000),
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      value: data.close,
      volume: data.volume,
    }));
  }, [historyData]);

  // console.log("Processed Chart Data", processedChartData);

  // Calculate price change data
  const priceChangeData = React.useMemo(() => {
    if (processedChartData.length === 0)
      return { change: 0, percentChange: 0, isPositive: false };

    const firstPrice = processedChartData[0]?.value || 0;
    const lastPrice =
      processedChartData[processedChartData.length - 1]?.value || 0;
    const change = lastPrice - firstPrice;
    const percentChange = (change / firstPrice) * 100;

    return {
      change,
      percentChange,
      isPositive: change >= 0,
    };
  }, [processedChartData]);

  const renderTabBar = () => {
    return (
      <View className="flex-row bg-white border-b border-gray-200">
        {TABS.map((tab, index) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(index)}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === index ? "border-blue-600" : "border-transparent"
            }`}
          >
            <Text
              className={` ${
                activeTab === index ? "text-blue-600" : "text-gray-600"
              }`}
              style={{
                fontFamily: "RubikMedium",
              }}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderOverviewTab = () => {
    if (isProfileLoading) {
      return (
        <View className="p-4 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
          <Text
            className="mt-2 text-white"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            Loading company data...
          </Text>
        </View>
      );
    }

    const profile = profileData?.body;

    return (
      <View className="p-4">
        {/* Company Description */}
        {profile?.longBusinessSummary && (
          <View className="mb-4">
            <Text
              className="text-lg mb-2 text-white"
              style={{
                fontFamily: "RubikSemiBold",
              }}
            >
              About
            </Text>
            <Text
              className="text-white mb-2"
              style={{
                fontFamily: "RubikRegular",
              }}
            >
              {showFullSummary || profile.longBusinessSummary.length <= 250
                ? profile.longBusinessSummary
                : `${profile.longBusinessSummary.slice(0, 250)}...`}
            </Text>
            {profile.longBusinessSummary.length > 250 && (
              <Pressable
                onPress={() => setShowFullSummary(!showFullSummary)}
                className="mt-1"
              >
                <Text
                  className="text-blue-400 text-sm"
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {showFullSummary ? "Show less" : "Show more"}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Company Info */}
        <View className="mb-4">
          <Text
            className="text-lg text-white mb-2"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            Company Info
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            {profile?.sector && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text
                  className="text-gray-500"
                  style={{
                    fontFamily: "RubikBold",
                  }}
                >
                  Sector
                </Text>
                <Text
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {profile.sector}
                </Text>
              </View>
            )}
            {profile?.industry && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text
                  className="text-gray-500"
                  style={{
                    fontFamily: "RubikBold",
                  }}
                >
                  Industry
                </Text>
                <Text
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {profile.industry}
                </Text>
              </View>
            )}
            {profile?.fullTimeEmployees && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text
                  className="text-gray-500"
                  style={{
                    fontFamily: "RubikBold",
                  }}
                >
                  Employees
                </Text>
                <Text
                  className="font-medium"
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {profile.fullTimeEmployees.toLocaleString()}
                </Text>
              </View>
            )}
            {profile?.website && (
              <View className="flex-row justify-between py-2">
                <Text
                  className="text-gray-500"
                  style={{
                    fontFamily: "RubikBold",
                  }}
                >
                  Website
                </Text>
                <Text
                  className="font-medium text-blue-600"
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {profile.website
                    .replace("http://", "")
                    .replace("https://", "")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Company Officers */}
        {profile?.companyOfficers && profile.companyOfficers.length > 0 && (
          <View className="mb-4">
            <Text
              className="text-lg text-white mb-2"
              style={{
                fontFamily: "RubikBold",
              }}
            >
              Key Executives
            </Text>
            <View className="bg-white rounded-lg p-4 shadow-sm">
              {profile.companyOfficers.map((officer, index) => (
                <View
                  key={index}
                  className={`py-2 ${
                    index < profile.companyOfficers.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <Text
                    style={{
                      fontFamily: "RubikSemiBold",
                    }}
                    className="text-lg"
                  >
                    {officer.name}
                  </Text>
                  <Text
                    className="text-gray-500"
                    style={{
                      fontFamily: "RubikMedium",
                    }}
                  >
                    {officer.title}
                  </Text>
                  {officer.totalPay && (
                    <Text
                      className="text-gray-600"
                      style={{
                        fontFamily: "RubikSemiBold",
                      }}
                    >
                      Total Pay: {officer.totalPay.fmt}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderFinancialsTab = () => {
    return (
      <View className="p-4 items-center justify-center h-64">
        <Text
          className="text-white"
          style={{
            fontFamily: "RubikSemiBold",
          }}
        >
          Financial data would go here...
        </Text>
        <Text
          className="text-white mt-2 text-center"
          style={{
            fontFamily: "RubikSemiBold",
          }}
        >
          Consider using the earnings and financial data endpoints
        </Text>
      </View>
    );
  };

  // Main loading state
  if (isHistoryLoading && isProfileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-900">
        <ActivityIndicator size="large" color="white" />
        <Text
          className="mt-4 text-white"
          style={{
            fontFamily: "RubikBold",
          }}
        >
          Loading stock data...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1  items-center ">
      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <StatusBar barStyle="light-content" />

        <View className="pt-16 px-4 flex-row justify-between items-center">
          <Pressable
            className="mx-2 bg-white rounded-full p-1"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0284c7" />
          </Pressable>

          <Pressable
            className="mx-2 bg-white rounded-full p-1"
            onPress={handleWatchlistPress}
          >
            <Ionicons
              name={isWatched ? "star" : "star-outline"}
              size={24}
              color={isWatched ? "#fbbf24" : "#0284c7"}
            />
          </Pressable>
        </View>

        <View className="h-full px-4 ">
          {/* Stock Price Header */}
          <View className="flex-row items-center justify-between py-4">
            <View className="">
              <Text
                className="text-2xl text-white"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                {symbol}
              </Text>
              {quoteData?.body?.[0]?.longName && (
                <Text
                  className="text-lg text-white/80"
                  style={{
                    fontFamily: "RubikMedium",
                  }}
                >
                  {quoteData.body[0].longName}
                </Text>
              )}
            </View>

            <View className="">
              <Text
                className="text-2xl font-bold text-white"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                $
                {processedChartData.length > 0
                  ? processedChartData[
                      processedChartData.length - 1
                    ].value.toFixed(2)
                  : "--"}
              </Text>

              <View className="flex-row items-center mt-1">
                <Text
                  className={`text-lg ${
                    priceChangeData.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  style={{
                    fontFamily: "RubikSemiBold",
                  }}
                >
                  {priceChangeData.isPositive ? "+" : ""}
                  {priceChangeData.change.toFixed(2)}(
                  {priceChangeData.isPositive ? "+" : ""}
                  {priceChangeData.percentChange.toFixed(2)}%)
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 400 }}
          >
            {/* Tab Bar */}
            {renderTabBar()}

            {/* Tab Content */}
            {activeTab === 0 && renderOverviewTab()}
            {activeTab === 1 && renderFinancialsTab()}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Floating Action Button - Ask AI About This Stock */}
      <Pressable
        onPress={handleAskAI}
        className="absolute z-[99] bottom-6  w-[90%] h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg flex-row px-4"
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
        <Ionicons name="sparkles" size={24} color="white" />
        <Text
          className="text-white ml-2"
          style={{
            fontFamily: "RubikMedium",
          }}
        >
          Ask Nudug AI About ${symbol}
        </Text>
      </Pressable>
    </View>
  );
}
