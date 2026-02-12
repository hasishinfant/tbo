# 🤖 Codex/OpenAI Integration Setup Guide

## Overview

Your TravelSphere application now supports integration with OpenAI's API (Codex) for AI-powered features:
- ✅ Intelligent itinerary generation
- ✅ Natural language travel assistant
- ✅ Personalized destination recommendations

The app works in **two modes**:
1. **With Codex** - Uses real AI for dynamic, personalized responses
2. **Without Codex** - Uses mock data (current mode)

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### Step 2: Create Environment File

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

### Step 3: Add Your API Key

Edit the `.env` file and add your key:

```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 4: Restart the Dev Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

That's it! The app will now use Codex for AI features.

## 📊 How It Works

### Automatic Fallback System

The app intelligently switches between Codex and mock data:

```
User Request
    ↓
Is Codex configured?
    ├─ YES → Use OpenAI API
    │         ├─ Success → Return AI response
    │         └─ Error → Fall back to mock data
    └─ NO → Use mock data
```

### Features Using Codex

1. **Itinerary Generation** (`src/services/itineraryService.ts`)
   - Generates personalized day-by-day plans
   - Considers budget, interests, and dates
   - Provides restaurant recommendations
   - Includes travel tips

2. **Travel Assistant** (`src/confidence-engine/services/assistantService.ts`)
   - Natural language conversations
   - Context-aware responses
   - Emergency assistance
   - Translation help

3. **Destination Recommendations** (`src/services/codexService.ts`)
   - Personalized suggestions
   - Based on preferences
   - Diverse options

## 🔧 Configuration Options

### Model Selection

Edit `src/services/codexService.ts`:

```typescript
const MODEL = 'gpt-4'; // High quality, slower, more expensive
// OR
const MODEL = 'gpt-3.5-turbo'; // Faster, cheaper, good quality
```

### Temperature (Creativity)

```typescript
temperature: 0.7  // Balanced (default)
temperature: 0.3  // More focused and deterministic
temperature: 0.9  // More creative and varied
```

### Max Tokens (Response Length)

```typescript
maxTokens: 2000  // Standard responses
maxTokens: 3000  // Longer, detailed responses
maxTokens: 1000  // Shorter, concise responses
```

## 💰 Cost Estimation

### GPT-4 Pricing (as of 2024)
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens

### GPT-3.5-Turbo Pricing
- Input: $0.0015 per 1K tokens
- Output: $0.002 per 1K tokens

### Typical Usage
- Itinerary generation: ~2,000-3,000 tokens (~$0.15-0.30 with GPT-4)
- Assistant message: ~500-1,000 tokens (~$0.03-0.06 with GPT-4)
- Recommendations: ~300-500 tokens (~$0.02-0.03 with GPT-4)

**Recommendation**: Start with GPT-3.5-Turbo for development, upgrade to GPT-4 for production.

## 🧪 Testing Codex Integration

### 1. Check Configuration Status

Open browser console (F12) and look for:
```
✅ "Generating itinerary with Codex AI"
✅ "Using Codex AI for assistant response"
```

OR

```
ℹ️ "Generating itinerary with mock data (Codex not configured)"
ℹ️ "Using mock assistant response (Codex not configured)"
```

### 2. Test Itinerary Generation

1. Go to http://localhost:3000/
2. Click "Plan My Trip"
3. Fill out the form
4. Submit
5. Check console for Codex messages

### 3. Test Travel Assistant

1. Plan a trip and go to itinerary
2. Activate trip mode
3. Open AI Assistant
4. Send a message
5. Check console for Codex messages

### 4. Verify API Calls

Open DevTools → Network tab:
- Look for calls to `api.openai.com`
- Check request/response payloads
- Monitor token usage

## 🐛 Troubleshooting

### Issue: "Codex is not configured"

**Solution**:
1. Check `.env` file exists in project root
2. Verify `VITE_OPENAI_API_KEY` is set
3. Restart dev server
4. Clear browser cache

### Issue: "Failed to call Codex API"

**Possible causes**:
1. **Invalid API key** - Check key is correct
2. **No credits** - Add payment method to OpenAI account
3. **Rate limit** - Wait a few minutes
4. **Network issue** - Check internet connection

**Check in console**:
```javascript
// Run in browser console
console.log(import.meta.env.VITE_OPENAI_API_KEY);
// Should show your key (or undefined if not set)
```

### Issue: Responses are slow

**Solutions**:
1. Switch to GPT-3.5-Turbo (faster)
2. Reduce `maxTokens`
3. Lower `temperature`
4. Check OpenAI status page

### Issue: Responses are generic

**Solutions**:
1. Increase `temperature` (0.8-0.9)
2. Improve prompts in `codexService.ts`
3. Add more context to queries
4. Use GPT-4 instead of GPT-3.5

## 📝 Environment Variables

### Required
```env
VITE_OPENAI_API_KEY=sk-...  # Your OpenAI API key
```

### Optional
```env
VITE_OPENAI_MODEL=gpt-4     # Model to use
VITE_API_TIMEOUT=30000      # API timeout in ms
```

## 🔒 Security Best Practices

### ⚠️ IMPORTANT: Never commit `.env` file!

The `.env` file is already in `.gitignore`, but double-check:

```bash
# Verify .env is ignored
git status
# Should NOT show .env file
```

### For Production

**DO NOT** expose API keys in frontend code. Instead:

1. **Use a backend proxy**:
   ```
   Frontend → Your Backend → OpenAI API
   ```

2. **Implement rate limiting**
3. **Add authentication**
4. **Monitor usage**
5. **Set spending limits** in OpenAI dashboard

### Current Setup

⚠️ The current implementation puts the API key in the frontend (via environment variables). This is:
- ✅ OK for development/testing
- ❌ NOT OK for production

For production, create a backend API that:
- Authenticates users
- Proxies requests to OpenAI
- Implements rate limiting
- Monitors costs

## 📈 Monitoring Usage

### OpenAI Dashboard

1. Go to [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. View:
   - Daily token usage
   - Cost breakdown
   - Request counts
   - Error rates

### In-App Monitoring

The `CodexResponse` includes usage data:

```typescript
{
  content: "...",
  usage: {
    promptTokens: 150,
    completionTokens: 500,
    totalTokens: 650
  }
}
```

You can log this to track costs.

## 🎯 Next Steps

### 1. Development
- [x] Set up API key
- [ ] Test all features
- [ ] Adjust prompts for better responses
- [ ] Monitor token usage

### 2. Production Preparation
- [ ] Create backend proxy
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Configure spending alerts

### 3. Optimization
- [ ] Fine-tune prompts
- [ ] Optimize token usage
- [ ] Cache common responses
- [ ] Implement request batching

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

## 🆘 Support

### Check Configuration
```bash
# In project root
cat .env | grep VITE_OPENAI_API_KEY
```

### Test API Key
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### View Logs
Open browser console (F12) and filter by:
- "Codex"
- "OpenAI"
- "assistant"
- "itinerary"

---

**Status**: Ready to integrate! Just add your API key and restart the server.

**Current Mode**: Mock data (Codex not configured)

**To Enable**: Add `VITE_OPENAI_API_KEY` to `.env` file
