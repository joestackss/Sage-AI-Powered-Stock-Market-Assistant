import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { fetchStockHistory, fetchStockModule } from "../api/marketApi";
import { useWatchlistStore } from "../store/watchlistStore";

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
  const scrollX = useRef(new Animated.Value(0)).current;
  const { addStock, removeStock, isInWatchlist } = useWatchlistStore();
  const isWatched = isInWatchlist(symbol);

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
              className={`font-medium ${
                activeTab === index ? "text-blue-600" : "text-gray-600"
              }`}
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
          <ActivityIndicator size="large" color="#0284c7" />
          <Text className="mt-2 text-gray-500">Loading company data...</Text>
        </View>
      );
    }

    const profile = profileData?.body;

    return (
      <View className="p-4">
        {/* Company Description */}
        {profile?.longBusinessSummary && (
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2">About</Text>
            <Text className="text-gray-700">{profile.longBusinessSummary}</Text>
          </View>
        )}

        {/* Company Info */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Company Info</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            {profile?.sector && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">Sector</Text>
                <Text className="font-medium">{profile.sector}</Text>
              </View>
            )}
            {profile?.industry && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">Industry</Text>
                <Text className="font-medium">{profile.industry}</Text>
              </View>
            )}
            {profile?.fullTimeEmployees && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-500">Employees</Text>
                <Text className="font-medium">
                  {profile.fullTimeEmployees.toLocaleString()}
                </Text>
              </View>
            )}
            {profile?.website && (
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-500">Website</Text>
                <Text className="font-medium text-blue-600">
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
            <Text className="text-lg font-semibold mb-2">Key Executives</Text>
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
                  <Text className="font-medium">{officer.name}</Text>
                  <Text className="text-gray-500">{officer.title}</Text>
                  {officer.totalPay && (
                    <Text className="text-gray-600">
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
        <Text className="text-gray-500">Financial data would go here...</Text>
        <Text className="text-gray-500 mt-2">
          Consider using the earnings and financial data endpoints
        </Text>
      </View>
    );
  };

  // Main loading state
  if (isHistoryLoading && isProfileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Loading stock data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          headerTitle: historyData?.meta?.shortName || symbol,
          headerRight: () => (
            <View className="flex-row">
              <Pressable className="mx-2" onPress={handleWatchlistPress}>
                <Ionicons
                  name={isWatched ? "star" : "star-outline"}
                  size={24}
                  color={isWatched ? "#fbbf24" : "#0284c7"}
                />
              </Pressable>
              <Pressable className="mx-2">
                <Ionicons name="share-outline" size={24} color="#0284c7" />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView>
        {/* Stock Price Header */}
        <View className="bg-white p-4 mb-4">
          <Text className="text-3xl font-bold">
            $
            {processedChartData.length > 0
              ? processedChartData[processedChartData.length - 1].value.toFixed(
                  2
                )
              : "--"}
          </Text>

          <View className="flex-row items-center mt-1">
            <Text
              className={`text-lg ${
                priceChangeData.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {priceChangeData.isPositive ? "+" : ""}
              {priceChangeData.change.toFixed(2)}(
              {priceChangeData.isPositive ? "+" : ""}
              {priceChangeData.percentChange.toFixed(2)}%)
            </Text>
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
  );
}
