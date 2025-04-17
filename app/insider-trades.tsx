import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchInsiderTrades } from "./api/marketApi";

export default function InsiderTradesScreen() {
  const { data: insiderData, isPending: isInsiderLoading } = useQuery({
    queryKey: ["insiderTrades"],
    queryFn: () => fetchInsiderTrades(),
  });

  if (isInsiderLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading insider trades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Insider Trades",
        }}
      />
      <ScrollView style={styles.scrollView}>
        {insiderData?.body.map((trade, index) => (
          <View key={index} style={styles.tradeCard}>
            <View style={styles.tradeHeader}>
              <Text style={styles.symbol}>{trade.symbol}</Text>
              <Text style={styles.companyName}>{trade.symbolName}</Text>
            </View>

            <View style={styles.tradeDetails}>
              <Text style={styles.executive}>
                {trade.fullName} ({trade.shortJobTitle})
              </Text>
              <View style={styles.transactionInfo}>
                <Text
                  style={[
                    styles.transactionType,
                    trade.transactionType === "Buy" ? styles.buy : styles.sell,
                  ]}
                >
                  {trade.transactionType}
                </Text>
                <Text style={styles.amount}>{trade.amount} shares</Text>
              </View>
              <Text style={styles.price}>Price: ${trade.reportedPrice}</Text>
              <Text style={styles.value}>Value: ${trade.usdValue}</Text>
              <Text style={styles.date}>Date: {trade.transactionDate}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    padding: 16,
  },
  tradeCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tradeHeader: {
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    color: "#666",
  },
  tradeDetails: {
    gap: 8,
  },
  executive: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionType: {
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buy: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  sell: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  amount: {
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
});
