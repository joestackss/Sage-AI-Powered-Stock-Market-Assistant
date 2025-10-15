import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";

export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

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
          <View className="w-36 h-36 mb-12 ">
            <Image
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                borderRadius: 40,
                backgroundColor: "white",
              }}
              source={require("../assets/images/logo.png")}
              placeholder={{ blurhash }}
              contentFit="contain"
              transition={1000}
            />
          </View>

          <Text
            className="text-4xl text-white mb-4 text-center"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            Sage Ai
          </Text>

          <Text
            className="text-lg text-white mb-8 text-center"
            style={{
              fontFamily: "RubikBold",
            }}
          >
            Your intelligent stock analysis companion to help you make informed
            decisions.
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
