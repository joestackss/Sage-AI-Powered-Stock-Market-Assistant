import { GoogleGenAI } from "@google/genai";
import { StockContext, AIResponse, FINANCIAL_DISCLAIMER } from "../types/chat";
import Constants from "expo-constants";

// Initialize Google GenAI client
// Get your free API key from: https://makersuite.google.com/app/apikey
const getApiKey = () => {
  // For development (Expo Go), use environment variable
  if (__DEV__ && process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }

  // For production builds (EAS), use config.extra
  return Constants.expoConfig?.extra?.GEMINI_API_KEY;
};

const ai = new GoogleGenAI({
  apiKey: getApiKey(),
});

export const AI_SYSTEM_PROMPT = `You are an AI stock market assistant that provides educational analysis and insights about stocks and financial markets. 

Your role is to:
1. Analyze stock data and provide educational insights
2. Explain market trends and movements in simple terms
3. Help users understand financial concepts
4. Provide balanced analysis including both opportunities and risks
5. Always include appropriate disclaimers about financial advice

Key guidelines:
- Always be educational and informative, never give direct buy/sell advice
- Include both positive and negative aspects in your analysis
- Reference specific data points when available (price, volume, market cap, etc.)
- Explain financial terms for beginners
- Be conversational but professional
- Always end responses with a disclaimer about not being financial advice
- Keep responses concise and actionable
- Focus on data-driven insights rather than speculation

When analyzing stocks, consider:
- Current price and recent performance
- Company fundamentals (sector, industry, market cap)
- Technical indicators and trends
- Market context and broader economic factors
- Risk factors and potential concerns

Remember: You're an educational tool, not a financial advisor.`;

interface GeminiRequestOptions {
  userMessage: string;
  stockContext?: StockContext;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function sendAIRequest({
  userMessage,
  stockContext,
  conversationHistory = [],
}: GeminiRequestOptions): Promise<AIResponse> {
  try {
    // Build context string from stock data
    let contextString = "";
    if (stockContext) {
      contextString = `
Current Stock Context:
- Symbol: ${stockContext.symbol}
- Current Price: $${stockContext.currentPrice}
- Change: ${stockContext.change > 0 ? "+" : ""}${stockContext.change.toFixed(
        2
      )} (${
        stockContext.percentChange > 0 ? "+" : ""
      }${stockContext.percentChange.toFixed(2)}%)
- Company: ${stockContext.companyName || "N/A"}
- Sector: ${stockContext.sector || "N/A"}
- Industry: ${stockContext.industry || "N/A"}
- Market Cap: ${stockContext.marketCap || "N/A"}
- Volume: ${stockContext.volume || "N/A"}
${stockContext.summary ? `- Summary: ${stockContext.summary}` : ""}

Please analyze this stock data and answer the user's question.
`;
    }

    // Build the conversation prompt for Gemini
    let fullPrompt = AI_SYSTEM_PROMPT + "\n\n";

    // Add conversation history
    conversationHistory.forEach((msg) => {
      fullPrompt += `${msg.role === "user" ? "User" : "Assistant"}: ${
        msg.content
      }\n\n`;
    });

    // Add current user message with context
    fullPrompt += `${contextString}\n\nUser: ${userMessage}\n\nAssistant:`;

    // Make Gemini API call using new @google/genai format
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: fullPrompt,
    });

    const aiMessage =
      response.text || "Sorry, I could not generate a response.";

    // Extract suggestions from the response (simple keyword matching)
    const suggestions = extractSuggestions(aiMessage, stockContext);

    return {
      message: `${aiMessage}\n\n${FINANCIAL_DISCLAIMER}`,
      suggestions,
      relatedStocks: stockContext ? [stockContext.symbol] : undefined,
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Handle specific error types
    let errorMessage =
      "I'm having trouble connecting to the AI service right now.";

    if (error?.status === 429 || error?.message?.includes("quota")) {
      errorMessage =
        "I've reached my usage limit for today. Please try again later.";
    } else if (error?.status === 401 || error?.message?.includes("API_KEY")) {
      errorMessage =
        "There's an authentication issue with the AI service. Please check your API key.";
    } else if (error?.status === 403) {
      errorMessage = "Access denied. Please check your Gemini API permissions.";
    } else if (!navigator.onLine) {
      errorMessage =
        "No internet connection. Please check your network and try again.";
    }

    // Return a helpful fallback response
    return {
      message: `${errorMessage}\n\nIn the meantime, you can:\n• Browse stock details and charts\n• Add stocks to your watchlist\n• View market data and trends\n\n${FINANCIAL_DISCLAIMER}`,
      suggestions: [
        "Check stock prices manually",
        "Review your watchlist",
        "Try again in a few minutes",
      ],
    };
  }
}

function extractSuggestions(message: string, context?: StockContext): string[] {
  const suggestions: string[] = [];

  if (context) {
    suggestions.push(`Tell me more about ${context.symbol}`);
    suggestions.push(`What are the risks for ${context.symbol}?`);
    suggestions.push(`Compare ${context.symbol} to competitors`);
  }

  // Add some general suggestions based on content
  if (message.toLowerCase().includes("risk")) {
    suggestions.push("What are the key risk factors?");
  }

  if (message.toLowerCase().includes("growth")) {
    suggestions.push("What drives the growth potential?");
  }

  if (message.toLowerCase().includes("market")) {
    suggestions.push("How does the broader market affect this?");
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Helper function to analyze market data for insights
export function generateMarketInsight(marketData: any[]): string {
  if (!marketData || marketData.length === 0) return "";

  const gainers = marketData.filter(
    (stock) => !stock.netchange.startsWith("-")
  ).length;
  const losers = marketData.length - gainers;
  const gainersPercentage = ((gainers / marketData.length) * 100).toFixed(1);

  if (gainers > losers) {
    return `Market showing positive momentum with ${gainersPercentage}% of tracked stocks advancing. This suggests bullish sentiment in the current session.`;
  } else if (losers > gainers) {
    return `Market experiencing some selling pressure with ${(
      100 - parseFloat(gainersPercentage)
    ).toFixed(
      1
    )}% of tracked stocks declining. Investors may be taking a cautious approach.`;
  } else {
    return `Market is showing mixed signals with roughly equal numbers of advancing and declining stocks. This suggests uncertainty in current market conditions.`;
  }
}

// Offline fallback analysis when AI API is unavailable
export function generateOfflineStockAnalysis(
  stockContext: StockContext
): AIResponse {
  const { symbol, currentPrice, change, percentChange, sector, marketCap } =
    stockContext;
  const isPositive = change >= 0;
  const volatility =
    Math.abs(percentChange) > 5
      ? "high"
      : Math.abs(percentChange) > 2
      ? "moderate"
      : "low";

  let analysis = `Here's a basic analysis of ${symbol}:\n\n`;

  // Price movement analysis
  if (isPositive) {
    analysis += `📈 ${symbol} is currently trending upward with a ${percentChange.toFixed(
      2
    )}% gain. `;
  } else {
    analysis += `📉 ${symbol} is currently down ${Math.abs(
      percentChange
    ).toFixed(2)}%. `;
  }

  // Volatility assessment
  analysis += `The stock is showing ${volatility} volatility today.\n\n`;

  // Sector information
  if (sector) {
    analysis += `🏭 Sector: ${sector}\n`;
  }

  // Market cap info
  if (marketCap) {
    analysis += `💰 Market Cap: ${marketCap}\n`;
  }

  analysis += `💡 Current Price: $${currentPrice}\n\n`;

  // Basic recommendations
  analysis += `Key Considerations:\n`;
  analysis += `• Monitor ${
    volatility === "high"
      ? "high volatility - consider your risk tolerance"
      : "price movements and volume"
  }\n`;
  analysis += `• Research company fundamentals and recent news\n`;
  analysis += `• Consider your investment timeline and goals\n`;
  analysis += `• Diversify your portfolio across different sectors\n\n`;

  return {
    message: analysis + FINANCIAL_DISCLAIMER,
    suggestions: [
      `Research ${symbol} fundamentals`,
      "Check recent company news",
      "Compare with sector peers",
    ],
    relatedStocks: [symbol],
  };
}

// Helper to format stock data for AI context
export function formatStockForAI(
  stockData: any,
  profileData?: any
): StockContext {
  return {
    symbol: stockData.symbol,
    currentPrice: parseFloat(stockData.lastsale?.replace("$", "") || "0"),
    change: parseFloat(stockData.netchange || "0"),
    percentChange: parseFloat(stockData.pctchange?.replace("%", "") || "0"),
    companyName: stockData.name || profileData?.longName,
    sector: profileData?.sector,
    industry: profileData?.industry,
    marketCap: stockData.marketCap,
    summary: profileData?.longBusinessSummary?.slice(0, 300) + "...", // Truncate for context
  };
}
