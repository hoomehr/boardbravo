# 🔧 BoardBravo Troubleshooting Guide

## Common Issues and Solutions

### "Failed to process chat request" Error

**Problem**: The chat API returns an error: `"Failed to generate response with Gemini: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: [404 Not Found] models/gemini-pro is not found for API version v1beta"`

**Root Cause**: Google has deprecated the `gemini-pro` model name. The API was using an outdated model identifier.

**Solution**: Updated the model name in `lib/ai-service.ts` from `gemini-pro` to `gemini-2.0-flash-lite`

**Steps to Fix**:
1. Open `lib/ai-service.ts`
2. Change the model name from `'gemini-pro'` to `'gemini-2.0-flash-lite'`
3. Restart the development server

**Current Valid Gemini Model Names** (as of 2025):
- `gemini-2.0-flash` - Latest with next-gen features
- `gemini-2.0-flash-lite` - Cost efficient and low latency ✅ (recommended for BoardBravo)
- `gemini-1.5-flash` - Fast and versatile (legacy)
- `gemini-1.5-pro` - Complex reasoning tasks (legacy)

### API Key Issues

**Problem**: "AI provider not configured" or "API key not configured"

**Solution**: 
1. Ensure you have a `.env.local` file in the project root
2. Add your Google AI API key: `GOOGLE_AI_API_KEY=your_actual_api_key_here`
3. Get a free API key from: https://makersuite.google.com/app/apikey

### Environment Setup

**Quick Setup Script**: Run `node setup-env.js` to automatically create your `.env.local` file from the template.

### Model Provider Status

You can check the current AI provider status by visiting: `http://localhost:3001/api/chat` (GET request)

This will return:
```json
{
  "currentProvider": "gemini",
  "availableProviders": ["gemini"],
  "status": "configured" | "not_configured"
}
```

### Recent Model Updates (January 2025)

Google has updated their Gemini API with new model names:
- ❌ `gemini-pro` (deprecated - will cause 404 errors)
- ✅ `gemini-2.0-flash-lite` (current default for BoardBravo)
- ✅ `gemini-2.0-flash` (available for more complex tasks)

If you encounter model-related errors, check the [official Gemini models documentation](https://ai.google.dev/gemini-api/docs/models/gemini) for the latest available models. 