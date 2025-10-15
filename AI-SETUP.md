# AI Stock Assistant Setup Guide

## 🆓 Google Gemini AI Configuration (FREE!)

Your app now uses Google's **Gemini 2.0 Flash** - completely free and very powerful!

### 1. Get FREE Gemini API Key

- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Generate a new API key (completely free!)

### 2. Configure Environment Variable

Create a `.env` file in your project root with:

```
EXPO_PUBLIC_GEMINI_API_KEY=your-actual-gemini-key-here
```

**Important**: Replace `your-actual-gemini-key-here` with your real Gemini API key.

### 3. Restart Development Server

After adding the API key:

```bash
npm start
```

## AI Features Implemented

✅ **AI Chat Assistant**

- Full conversational interface
- Stock context awareness
- Educational analysis with disclaimers

✅ **Stock Detail AI Integration**

- "Ask AI About This Stock" floating button
- Quick insight cards with suggestion chips
- Contextual stock data passed to AI

✅ **Home Screen AI Insights**

- Daily market insight cards
- AI-powered market sentiment analysis
- Quick action buttons for AI chat

✅ **Watchlist AI Analysis**

- Individual stock analysis buttons
- Portfolio-wide AI analysis
- Contextual navigation to AI chat

## AI System Prompts

The AI is configured with financial education prompts that:

- Provide balanced analysis (pros and cons)
- Include risk disclaimers
- Reference actual stock data
- Avoid direct buy/sell advice
- Focus on educational insights

## Security Notes

- API key is exposed client-side (required for Expo)
- For production, consider backend proxy
- Monitor API usage and costs
- Set usage limits in OpenAI dashboard

## Troubleshooting

**AI not responding?**

- Check API key is correctly set
- Verify internet connection
- Check OpenAI API status
- Review console for error messages

**429 Error (Quota Exceeded)?**

- Check your usage at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Free tier: 15 requests/minute, 1500 requests/day
- Wait a few minutes if you hit rate limits
- App provides helpful fallback messages during quota issues
- Consider your Gemini Pro 1-month trial for even higher limits!

**Features not working?**

- Restart Expo dev server
- Clear Metro cache: `npx expo start --clear`
- Check all imports are resolved

## Technology Stack

- **Google Gemini 2.0 Flash**: Latest AI model (completely FREE!)
- **Zustand**: State management
- **TypeScript**: Type safety
- **React Native**: Mobile framework
- **Expo**: Development platform

## 🆓 FREE API Usage & Benefits

**Why Gemini is Better:**

- ✅ **Completely FREE**: 15 requests/minute, 1500/day
- ✅ **Latest Model**: Gemini 2.0 Flash (newest release)
- ✅ **Fast Performance**: Optimized for speed
- ✅ **No Billing Required**: No credit card needed
- ✅ **Generous Limits**: Perfect for development

**Your 1-Month Gemini Pro Trial:**

- Even higher rate limits
- Access to advanced features
- Still completely free for the trial period

**Fallback Features:**

- App remains functional when API quota exceeded
- Enhanced error messages guide users
- All core stock tracking features work offline
- Graceful degradation ensures good user experience
