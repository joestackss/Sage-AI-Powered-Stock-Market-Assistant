import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AI_SUGGESTIONS } from "../types/chat";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  currentStock?: string;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  currentStock,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    const formattedSuggestion = currentStock
      ? suggestion
          .replace("this stock", currentStock)
          .replace("This Stock", currentStock)
      : suggestion;

    setMessage(formattedSuggestion);
    setShowSuggestions(false);
  };

  const getContextualSuggestions = () => {
    if (currentStock) {
      return [
        `Analyze ${currentStock} for me`,
        `What are the risks for ${currentStock}?`,
        `Should I buy ${currentStock}?`,
        ...AI_SUGGESTIONS.slice(3, 6),
      ];
    }
    return AI_SUGGESTIONS;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white border-t border-gray-200"
    >
      {/* Suggestion Chips */}
      {showSuggestions && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3 border-b border-gray-100"
        >
          {getContextualSuggestions()
            .slice(0, 5)
            .map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSuggestionPress(suggestion)}
                className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mr-2"
                disabled={isLoading}
              >
                <Text
                  className="text-blue-700 text-sm"
                  style={{ fontFamily: "RubikMedium" }}
                >
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <View className="flex-row items-end px-4 py-3">
        <View className="flex-1 bg-gray-100 rounded-2xl min-h-[40px] max-h-[100px] px-4 py-2 mr-3">
          <TextInput
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              if (text.length === 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={
              currentStock
                ? `Ask about ${currentStock} or market insights...`
                : "Ask me about stocks, market trends, or your portfolio..."
            }
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="center"
            className="text-gray-800 text-base"
            style={{ fontFamily: "RubikRegular" }}
            editable={!isLoading}
            onFocus={() => setShowSuggestions(false)}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isLoading}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            message.trim() && !isLoading ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons
              name="send"
              size={18}
              color={message.trim() ? "white" : "#6b7280"}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
