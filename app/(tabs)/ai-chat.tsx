import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useChatStore } from "../store/chatStore";
import ChatMessage from "../../components/ChatMessage";
import ChatInput from "../../components/ChatInput";
import TypingBubble from "../../components/TypingBubble";

export default function AIChatScreen() {
  const {
    messages,
    isLoading,
    currentContext,
    sendMessage,
    clearChat,
    markTypingCompleted,
  } = useChatStore();

  // console.log("Messages", messages);
  // console.log("Current Context", currentContext);
  // console.log("Is Loading", isLoading);
  // console.log("Send Message", sendMessage);
  // console.log("Clear Chat", clearChat);

  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleClearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearChat },
    ]);
  };

  const handleTypingComplete = (messageId: string) => {
    // Mark message as typing completed to prevent re-animation
    markTypingCompleted(messageId);
    console.log("Typing completed for message:", messageId);
  };

  const renderMessage = ({ item }: { item: any }) => (
    <ChatMessage message={item} onTypingComplete={handleTypingComplete} />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-20 h-20 rounded-full bg-blue-600/20 items-center justify-center mb-6">
        <Ionicons name="sparkles" size={40} color="#2563eb" />
      </View>

      <Text
        className="text-white text-2xl mb-4 text-center"
        style={{ fontFamily: "RubikBold" }}
      >
        Sage Ai Assistant
      </Text>

      <Text
        className="text-white/70 text-center text-base mb-8 leading-6"
        style={{ fontFamily: "RubikRegular" }}
      >
        Ask me anything about stocks, market trends, or your investment
        portfolio. I'll provide educational insights to help you make informed
        decisions.
      </Text>

      <View className="bg-white/10 rounded-xl p-4 mb-6">
        <Text
          className="text-white text-sm mb-3"
          style={{ fontFamily: "RubikSemiBold" }}
        >
          Try asking:
        </Text>

        <View className="space-y-2">
          <Text
            className="text-white/80 text-sm"
            style={{ fontFamily: "RubikRegular" }}
          >
            • "Should I buy Apple stock?"
          </Text>
          <Text
            className="text-white/80 text-sm"
            style={{ fontFamily: "RubikRegular" }}
          >
            • "What's happening with tech stocks?"
          </Text>
          <Text
            className="text-white/80 text-sm"
            style={{ fontFamily: "RubikRegular" }}
          >
            • "Analyze my watchlist"
          </Text>
          <Text
            className="text-white/80 text-sm"
            style={{ fontFamily: "RubikRegular" }}
          >
            • "Explain the recent market movement"
          </Text>
        </View>
      </View>

      <View className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-400/30">
        <Text
          className="text-yellow-200 text-xs text-center"
          style={{ fontFamily: "RubikMedium" }}
        >
          ⚠️ Educational purposes only. Not financial advice.
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={["#00194b", "#0C0C0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        <View className="h-full">
          {/* Header */}
          <View className="pt-16 pb-4 px-4 ">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center mr-3">
                  <Ionicons name="sparkles" size={20} color="white" />
                </View>
                <View>
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: "RubikBold" }}
                  >
                    AI Assistant
                  </Text>
                  {currentContext && (
                    <Text
                      className="text-white/70 text-sm"
                      style={{ fontFamily: "RubikMedium" }}
                    >
                      Analyzing: {currentContext.symbol}
                    </Text>
                  )}
                </View>
              </View>

              {messages.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearChat}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Messages */}
          <View className="flex-1">
            {messages.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                className="flex-1 px-4 py-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>

          {/* Loading Indicator - Typing Bubble */}
          {isLoading && (
            <View className="px-4">
              <TypingBubble />
            </View>
          )}

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            currentStock={currentContext?.symbol}
          />
        </View>
      </LinearGradient>
    </View>
  );
}
