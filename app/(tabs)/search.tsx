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
    setIsSearching(true);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <Link href={`/stock/${item.symbol}`} asChild>
      <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.symbol}</Text>
          <Text className="text-gray-600">{item.longname}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
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

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : searchResults?.body.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">No results found</Text>
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
  );
};

export default SearchScreen;
