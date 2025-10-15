import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const NewsDetailScreen = () => {
  const { url } = useLocalSearchParams<{ url: string }>();
  const decodedUrl = decodeURIComponent(url);

  const renderLoading = () => (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#000" />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="h-full"
      >
        <View className="h-full ">
          <View className="pt-12 p-4 flex-row">
            <Pressable className="" onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
          </View>
          <WebView
            source={{ uri: decodedUrl }}
            className="flex-1"
            renderLoading={renderLoading}
            startInLoadingState={true}
            allowsBackForwardNavigationGestures={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView error: ", nativeEvent);
            }}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

export default NewsDetailScreen;
