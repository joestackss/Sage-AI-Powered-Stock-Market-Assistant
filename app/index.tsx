import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function WelcomeScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/welcome-bg.png")}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/70 " />
        <View className="px-8 items-center justify-end  h-full pb-24">
          <Text
            className="text-4xl text-white mb-4 text-center"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            StockSense
          </Text>
          <Text
            className="text-lg text-white mb-8 text-center"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            Your personal stock market companion
          </Text>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity className="bg-blue-600 px-8 py-4 rounded-full">
              <Text
                className="text-white text-lg"
                style={{
                  fontFamily: "RubikSemiBold",
                }}
              >
                Get Started
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ImageBackground>
    </View>
  );
}
