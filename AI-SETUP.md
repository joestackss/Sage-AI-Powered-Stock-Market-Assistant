# AI Stock Assistant Setup Guide

## OpenAI API Configuration

To enable AI features in your stock app, you need to configure the OpenAI API:

### 1. Get OpenAI API Key

- Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
- Create an account or log in
- Generate a new API key

### 2. Configure Environment Variable

Create a `.env` file in your project root with:

```
EXPO_PUBLIC_OPENAI_API_KEY=your-actual-api-key-here
```

**Important**: Replace `your-actual-api-key-here` with your real OpenAI API key.

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

- Visit [OpenAI Billing](https://platform.openai.com/account/billing)
- Check usage limits and available credits
- Add payment method or purchase credits
- Upgrade to paid plan if on free tier
- Set usage alerts to monitor consumption
- App provides helpful fallback messages during quota issues

**Features not working?**

- Restart Expo dev server
- Clear Metro cache: `npx expo start --clear`
- Check all imports are resolved

## Technology Stack

- **OpenAI GPT-3.5-Turbo**: Conversational AI (faster, cost-effective)
- **Zustand**: State management
- **TypeScript**: Type safety
- **React Native**: Mobile framework
- **Expo**: Development platform

## API Usage & Costs

**Managing OpenAI Costs:**

- GPT-3.5-Turbo: ~$0.002 per 1K tokens (very affordable)
- Set usage limits in OpenAI dashboard
- Monitor conversations and token usage
- Consider implementing daily/monthly limits

**Fallback Features:**

- App remains functional when API quota exceeded
- Enhanced error messages guide users
- All core stock tracking features work offline
- Graceful degradation ensures good user experience
