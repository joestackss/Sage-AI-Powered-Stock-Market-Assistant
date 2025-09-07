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
const TABS = ["Overview", "Chart", "Financials"];

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0);
  const [chartType, setChartType] = useState<"line" | "candle">("line");
  const { addStock, removeStock, isInWatchlist } = useWatchlistStore();
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

  // Fetch stock profile data
  const { data: profileData, isPending: isProfileLoading } = useQuery({
    queryKey: ["stockModule", symbol, "all"],
    queryFn: () => fetchStockModule(symbol as string, "asset-profile"),
    enabled: !!symbol,
  });

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

  const renderTimeFrameSelector = () => {
    return (
      <View className="flex-row justify-around bg-white py-2 mb-4">
        {timeFrames.map((tf, index) => (
          <Pressable
            key={tf.label}
            onPress={() => setSelectedTimeFrame(index)}
            className={`px-3 py-1 rounded-full ${
              selectedTimeFrame === index ? "bg-blue-100" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-medium ${
                selectedTimeFrame === index ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {tf.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderChartTypeSelector = () => {
    return (
      <View className="flex-row justify-end bg-white px-4 pb-2">
        <Pressable
          onPress={() => setChartType("line")}
          className={`px-3 py-1 rounded-l-full ${
            chartType === "line" ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              chartType === "line" ? "text-white" : "text-gray-700"
            }`}
          >
            Line
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setChartType("candle")}
          className={`px-3 py-1 rounded-r-full ${
            chartType === "candle" ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              chartType === "candle" ? "text-white" : "text-gray-700"
            }`}
          >
            Candle
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderChart = () => {
    if (isHistoryLoading || processedChartData.length === 0) {
      return (
        <View className="h-64 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="mt-2 text-gray-500">Loading chart data...</Text>
        </View>
      );
    }

    const chartColor = priceChangeData.isPositive ? "#22c55e" : "#ef4444";

    if (chartType === "line") {
      return (
        <GestureHandlerRootView>
          <LineChart.Provider data={processedChartData}>
            <LineChart height={260} width={SCREEN_WIDTH}>
              <LineChart.Path color={chartColor} width={2}>
                <LineChart.Gradient />
              </LineChart.Path>
              <LineChart.CursorCrosshair color={chartColor} />
            </LineChart>
          </LineChart.Provider>
        </GestureHandlerRootView>
      );
    } else {
      return (
        <GestureHandlerRootView>
          <CandlestickChart.Provider data={processedChartData}>
            <CandlestickChart height={260} width={SCREEN_WIDTH}>
              <CandlestickChart.Candles
                positiveColor="#22c55e"
                negativeColor="#ef4444"
              />
              <CandlestickChart.Crosshair />
            </CandlestickChart>
          </CandlestickChart.Provider>
        </GestureHandlerRootView>
      );
    }
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
              className="text-white"
              style={{
                fontFamily: "RubikRegular",
              }}
            >
              {profile.longBusinessSummary}
            </Text>
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

  const renderChartTab = () => {
    return (
      <View>
        {renderTimeFrameSelector()}
        {renderChartTypeSelector()}
        {renderChart()}
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
    <View className="flex-1 ">
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
          <ScrollView>
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

            {/* Tab Bar */}
            {renderTabBar()}

            {/* Tab Content */}
            {activeTab === 0 && renderOverviewTab()}
            {activeTab === 1 && renderChartTab()}
            {activeTab === 2 && renderFinancialsTab()}
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}
