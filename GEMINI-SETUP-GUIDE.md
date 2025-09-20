# 🚀 Quick Gemini API Setup (5 minutes!)

## Step 1: Get Your FREE Gemini API Key

1. **Visit**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the key** (starts with "AI...")

## Step 2: Add to Your App

Update your `.env` file:

```
EXPO_PUBLIC_GEMINI_API_KEY=AIza...your-actual-key-here
```

## Step 3: Start Development

```bash
npx expo start --clear
```

## 🎉 You're Done!

Your AI stock assistant now uses:

- ✅ **Google Gemini 2.0 Flash** (latest model)
- ✅ **Completely FREE** (15 requests/min, 1500/day)
- ✅ **No billing required**
- ✅ **1-month Gemini Pro trial** (even better limits)

## Benefits vs OpenAI

| Feature         | OpenAI               | Gemini                 |
| --------------- | -------------------- | ---------------------- |
| **Cost**        | $20/month minimum    | **FREE**               |
| **Model**       | GPT-3.5              | **Gemini 2.0 (newer)** |
| **Setup**       | Credit card required | **Just Google login**  |
| **Daily Limit** | Depends on billing   | **1500 requests/day**  |
| **Speed**       | Good                 | **Optimized**          |

## Troubleshooting

**API key not working?**

- Make sure it starts with "AIza"
- Check the key is copied completely
- Restart Expo dev server

**Getting 403 errors?**

- Wait a few seconds between requests
- Free tier has rate limits (15/minute)
- Your app handles this gracefully!

**Want higher limits?**

- Your 1-month Gemini Pro trial gives more capacity
- Still completely free during trial period

## 💡 Pro Tip

The app works perfectly even when you hit rate limits - it shows helpful messages and all stock tracking features remain functional!
