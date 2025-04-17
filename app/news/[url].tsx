import React from "react";
import { View, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TouchableOpacity } from "react-native-gesture-handler";

const NewsDetailScreen = () => {
  const { url } = useLocalSearchParams<{ url: string }>();
  const decodedUrl = decodeURIComponent(url);

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              style={styles.browserButton}
              onPress={() => Linking.openURL(decodedUrl)}
            >
              <Ionicons name="open-outline" size={24} color="#000" />
            </Pressable>
          ),
        }}
      />
      <WebView
        source={{ uri: decodedUrl }}
        style={styles.webview}
        renderLoading={renderLoading}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  browserButton: {
    marginRight: 16,
  },
});

export default NewsDetailScreen;
