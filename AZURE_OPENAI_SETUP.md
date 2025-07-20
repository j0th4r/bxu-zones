# Azure OpenAI Setup Guide

## ✅ Current Status
Your Azure OpenAI integration is now working! The AI search functionality has been successfully implemented.

## 🔧 Configuration

### Development (Current Setup)
The AI search is currently configured for development with:
- `dangerouslyAllowBrowser: true` - Allows direct API calls from the browser
- `useBackendProxy: false` - Uses direct Azure OpenAI calls (no backend required)

This is the simplest setup for development and testing.

### Production Security (Recommended)

For production deployment, you should:

1. **Create a `.env` file** with these variables:
```env
# Azure OpenAI Service Configuration
VITE_AZURE_OPENAI_ENDPOINT=https://castrodesjohnpaul-9316-resource.cognitiveservices.azure.com/
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_API_VERSION=2024-04-01-preview
VITE_AZURE_OPENAI_DEPLOYMENT=o4-mini
VITE_AZURE_OPENAI_MODEL=o4-mini

# AI Search Parameters
VITE_AZURE_OPENAI_MAX_TOKENS=4096
VITE_AZURE_OPENAI_TEMPERATURE=0.7

# Production Security (recommended)
VITE_USE_BACKEND_PROXY=true
VITE_BACKEND_API_URL=https://your-backend.com/api/ai-search
```

2. **Create a backend API** to proxy OpenAI calls (keeps API key secure)
3. **Set `VITE_USE_BACKEND_PROXY=true`** to use the secure backend approach

## 🚀 Testing the AI Search

1. Open your app at http://localhost:5174/
2. Use the search bar at the top of the map
3. Try queries like:
   - "Find me a spot to build my Coffee Shop? Give me a specific parcel"
   - "Where can I build apartments in Butuan City?"
   - "Show me commercial zones near J.C. Aquino Avenue"
   - "What are the height restrictions in commercial areas?"
   - "Where can I build a small business in Butuan City?"

4. **New Features:**
   - 🗺️ **Map Markers**: Red pins will appear on suggested locations
   - 📍 **Coordinates**: Exact coordinates are shown in search results
   - 🎯 **Auto Zoom**: Map automatically centers on AI suggestions
   - 📋 **Parcel Details**: Click red pins to see detailed parcel information

## 🛡️ Security Notes

- **Development**: Uses `dangerouslyAllowBrowser: true` for testing
- **Production**: Should use backend proxy to protect API keys
- **API Key**: Never commit real API keys to version control

## 📁 Files Modified

- `src/config/azure-openai.ts` - Configuration settings
- `src/services/azure-openai.ts` - Azure OpenAI service implementation
- `src/utils/api.ts` - Updated to use real AI service
- `src/components/AISettings.tsx` - Connected to real configuration

## 🔍 AI Features

Your AI assistant is specialized for:
- Butuan City zoning regulations
- Philippine urban planning laws
- Development possibilities and restrictions
- Zoning code interpretations (R-1, C-1, MU, I-1, OS)
- Practical building and development advice
- **Location mapping with coordinates** - AI provides specific coordinates for suggested locations
- **Interactive map markers** - Click on red pins to see parcel details
- **Automatic map zoom** - Map centers on AI-suggested locations

## 🔧 Troubleshooting

### "Failed to fetch" Error
If you see a backend API error:
1. Check that `useBackendProxy: false` in `src/config/azure-openai.ts`
2. Verify your Azure OpenAI credentials are correct
3. Look for console logs showing "Using direct Azure OpenAI connection"

### "400 Unsupported parameter" Error
If you see parameter errors like `max_completion_tokens`:
1. Updated API version to `2024-04-01-preview` (more stable)
2. Reduced `maxTokens` to `4096` (compatible with o4-mini)
3. Using deployment name instead of model name in API calls
4. Verify your Azure OpenAI deployment is using the correct model version

### Connection Test Fails
1. Go to Admin Portal → AI Settings
2. Click "Test Connection"
3. Check if your endpoint and API key are correct
4. Verify your Azure OpenAI deployment is active

### No AI Response
1. Check browser console for errors
2. Verify the Azure OpenAI model deployment is running
3. Ensure API key has proper permissions 