import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { StockCard } from "../../components/StockCard";
import { fetchMarketTickers } from "../api/marketApi";

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["marketTickers", 1, "STOCKS"],
    queryFn: () => fetchMarketTickers(1, "STOCKS"),
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Loading market data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-500 text-lg font-medium">
          An error occurred
        </Text>
        <Text className="text-gray-600 mt-2">
          Could not fetch market data. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerTitle: "Market Overview",
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: "Search stocks...",
            onChangeText: (event) => {
              // Handle search
              console.log(event.nativeEvent.text);
            },
          },
        }}
      />

      <View className="px-4 py-2">
        <Text className="text-sm text-gray-500">
          Showing {data?.body.length} of {data?.meta.totalrecords} stocks
        </Text>
      </View>

      <FlatList
        data={data?.body}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/stock/${item.symbol}`)}
            className="mb-2"
          >
            <StockCard stockData={item} />
          </TouchableOpacity>
        )}
        contentContainerClassName="px-4 pb-8"
      />
    </View>
  );
}
