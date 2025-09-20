import { create } from "zustand";
import { ChatMessage, ChatStore } from "../../types/chat";
import {
  sendAIRequest,
  generateOfflineStockAnalysis,
} from "../../utils/aiService";

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  currentContext: undefined,

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setContext: (context) => set({ currentContext: context }),

  clearChat: () => set({ messages: [], currentContext: undefined }),

  sendMessage: async (content, context) => {
    const { addMessage, setLoading, currentContext, messages } = get();

    // Add user message immediately
    addMessage({
      role: "user",
      content,
      stockContext: context || currentContext,
    });

    // Set loading state
    setLoading(true);

    try {
      // Get updated state after adding user message
      const updatedState = get();

      // Prepare conversation history for context
      const conversationHistory = updatedState.messages
        .slice(-6) // Last 3 exchanges (6 messages)
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Send request to AI service
      const aiResponse = await sendAIRequest({
        userMessage: content,
        stockContext: context || currentContext,
        conversationHistory,
      });

      // Add AI response
      addMessage({
        role: "assistant",
        content: aiResponse.message,
        stockContext: context || currentContext,
      });
    } catch (error) {
      console.error("Error sending AI message:", error);

      // Add error message
      addMessage({
        role: "assistant",
        content:
          "I'm sorry, I encountered an error processing your request. Please try again later.\n\nThis analysis is for educational purposes only and should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.",
      });
    } finally {
      setLoading(false);
    }
  },
}));
