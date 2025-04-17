import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { searchStocks } from "../api/marketApi";
import { SearchResult } from "../api/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useWatchlistStore } from "../store/watchlistStore";
import { StockTicker } from "../api/marketApi";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const { addToWatchlist, isInWatchlist } = useWatchlistStore();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["stock-search", searchQuery],
    queryFn: () => searchStocks(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const sectors = Array.from(
    new Set(
      searchResults?.body
        .filter((item) => item.sector)
        .map((item) => item.sector as string) || []
    )
  );

  const filteredResults = searchResults?.body.filter((item) => {
    if (selectedSector) {
      return item.sector === selectedSector;
    }
    return true;
  });

  const renderSectorButton = (sector: string) => (
    <TouchableOpacity
      key={sector}
      style={[
        styles.sectorButton,
        selectedSector === sector && styles.sectorButtonActive,
      ]}
      onPress={() =>
        setSelectedSector(selectedSector === sector ? null : sector)
      }
    >
      <Text
        style={[
          styles.sectorButtonText,
          selectedSector === sector && styles.sectorButtonTextActive,
        ]}
      >
        {sector}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SearchResult }) => {
    const isWatched = isInWatchlist(item.symbol);

    const handleAddToWatchlist = () => {
      const stock: StockTicker = {
        symbol: item.symbol,
        name: item.longname,
        lastsale: "0",
        netchange: "0",
        pctchange: "0",
        marketCap: "0",
      };
      addToWatchlist(stock);
    };

    return (
      <View style={styles.resultItem}>
        <View style={styles.resultContent}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.longname}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={styles.exchange}>{item.exchDisp}</Text>
            {item.sector && <Text style={styles.sector}>{item.sector}</Text>}
          </View>
        </View>
        <TouchableOpacity
          style={styles.watchlistButton}
          onPress={handleAddToWatchlist}
          disabled={isWatched}
        >
          <Ionicons
            name={isWatched ? "star" : "star-outline"}
            size={24}
            color={isWatched ? "#FFD700" : "#666"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {sectors.length > 0 && (
        <View style={styles.sectorsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorsScroll}
          >
            {sectors.map(renderSectorButton)}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? "No results found"
                  : "Search for stocks to get started"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  sectorsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectorsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  sectorButtonActive: {
    backgroundColor: "#000",
  },
  sectorButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  sectorButtonTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultContent: {
    flex: 1,
    marginRight: 16,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  name: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  metaContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  exchange: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
  sector: {
    fontSize: 12,
    color: "#999",
  },
  watchlistButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});

export default SearchScreen;
