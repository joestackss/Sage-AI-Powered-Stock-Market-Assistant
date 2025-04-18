import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
// import { fetchStockSearch } from "../api/marketApi";
// import { StockSearchResult } from "../api/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { SearchResult, searchStocks } from "../api/marketApi";
import { LinearGradient } from "expo-linear-gradient";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, isPending: isLoading } = useQuery({
    queryKey: ["stock-search", searchQuery],
    queryFn: () => searchStocks(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <Link href={`/stock/${item.symbol}`} asChild>
      <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-200 bg-white mb-2 rounded-2xl">
        <View className="flex-1">
          <Text
            className="text-lg font-semibold"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            {item.symbol}
          </Text>
          <Text
            className="text-gray-600"
            style={{
              fontFamily: "RubikSemiBold",
            }}
          >
            {item.longname}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className="flex-1 ">
      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <View className="h-full px-4 pt-16">
          <View className="mb-2">
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-4">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-2 text-base placeholder:text-neutral-500"
                placeholder="Search stocks..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {searchQuery.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="search" size={50} color="white" />
              <Text
                className="text-white text-lg mt-4"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                Search for stocks...
              </Text>
            </View>
          ) : isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : searchResults?.body.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text
                className="text-gray-500 text-lg"
                style={{
                  fontFamily: "RubikBold",
                }}
              >
                No results found
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults?.body}
              renderItem={renderItem}
              keyExtractor={(item) => item.symbol}
              className="flex-1"
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default SearchScreen;
