import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import TypingMarkdown from "./TypingMarkdown";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionPress?: (suggestion: string) => void;
  onTypingComplete?: (messageId: string) => void;
}

export default function ChatMessage({
  message,
  onSuggestionPress,
  onTypingComplete,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <View className={`mb-4 ${isUser ? "items-end" : "items-start"}`}>
      <View className="flex-row items-start max-w-[85%]">
        {/* AI Avatar */}
        {isAssistant && (
          <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-2 mt-1">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
        )}

        {/* Message Bubble */}
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 rounded-br-md"
              : "bg-white border border-gray-200 rounded-bl-md"
          }`}
        >
          {/* Stock Context Badge */}
          {message.stockContext && (
            <View className="mb-2 flex-row items-center">
              <Ionicons
                name="trending-up"
                size={12}
                color={isUser ? "white" : "#6b7280"}
              />
              <Text
                className={`ml-1 text-xs ${
                  isUser ? "text-blue-100" : "text-gray-500"
                }`}
                style={{ fontFamily: "RubikMedium" }}
              >
                {message.stockContext.symbol} - $
                {message.stockContext.currentPrice}
              </Text>
            </View>
          )}

          {/* Message Content */}
          {isAssistant ? (
            <TypingMarkdown
              text={message.content}
              isUser={isUser}
              speed={250}
              onComplete={() => onTypingComplete?.(message.id)}
              isAlreadyCompleted={message.typingCompleted}
            />
          ) : (
            <Markdown
              style={{
                body: {
                  color: isUser ? "white" : "#1f2937",
                  fontFamily: "RubikRegular",
                  fontSize: 14,
                  lineHeight: 20,
                  marginTop: 0,
                  marginBottom: 0,
                },
                paragraph: {
                  marginTop: 0,
                  marginBottom: 8,
                },
                strong: {
                  fontFamily: "RubikSemiBold",
                  color: isUser ? "white" : "#1f2937",
                },
                em: {
                  fontFamily: "RubikMedium",
                  fontStyle: "italic",
                },
                code_inline: {
                  backgroundColor: isUser
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.1)",
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 4,
                  fontFamily: "SpaceMono",
                  fontSize: 13,
                },
                code_block: {
                  backgroundColor: isUser
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                  padding: 8,
                  borderRadius: 8,
                  marginVertical: 4,
                },
              }}
            >
              {message.content}
            </Markdown>
          )}

          {/* Timestamp */}
          <Text
            className={`text-xs mt-2 ${
              isUser ? "text-blue-100" : "text-gray-400"
            }`}
            style={{ fontFamily: "RubikRegular" }}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>

        {/* User Avatar */}
        {isUser && (
          <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center ml-2 mt-1">
            <Ionicons name="person" size={16} color="#6b7280" />
          </View>
        )}
      </View>
    </View>
  );
}
