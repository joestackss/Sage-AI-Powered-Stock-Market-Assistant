import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function WelcomeScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/welcome-bg.jpg")}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/50" />
        <View className="px-8 items-center">
          <Text className="text-4xl font-bold text-white mb-4 text-center">
            Welcome to StockSense
          </Text>
          <Text className="text-lg text-white mb-8 text-center">
            Your personal stock market companion
          </Text>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-full">
              <Text className="text-white text-lg font-semibold">
                Get Started
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ImageBackground>
    </View>
  );
}
