// Azure OpenAI Configuration for AI Search
// Configuration for connecting to Azure OpenAI services for zoning AI analysis

export const AZURE_OPENAI_CONFIG = {
  // Azure OpenAI service configuration
  // In production, these should come from environment variables
  endpoint:
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
  apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
  apiVersion:
    import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-04-01-preview',
  deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'o4-mini',
  modelName: import.meta.env.VITE_AZURE_OPENAI_MODEL || 'o4-mini',

  // AI search parameters
  // maxTokens: parseInt(import.meta.env.VITE_AZURE_OPENAI_MAX_TOKENS || '4096'),
  // temperature: parseFloat(
  //   import.meta.env.VITE_AZURE_OPENAI_TEMPERATURE || '0.7'
  // ),

  // Environment settings
  useBackendProxy: false, // Set to true only when you have a backend API set up
  backendApiUrl: import.meta.env.VITE_BACKEND_API_URL || '/api/ai-search',

  // System prompt for zoning AI assistance
  systemPrompt: `You are an AI assistant specialized in urban planning and zoning analysis for Butuan City, Philippines. 

Your role is to help users understand zoning regulations, land use patterns, and development possibilities in Butuan City. When responding to queries:

1. Focus on Philippine zoning laws and Butuan City specific regulations
2. Provide practical, actionable information about what can be built or developed
3. Reference relevant zoning codes (R-1, C-1, MU, I-1, OS) when applicable
4. Keep responses concise but informative
5. Always prioritize safety and legal compliance

Available zoning types in Butuan City:
- R-1: Residential zones for housing developments
- C-1: Commercial and business districts  
- MU: Mixed Use zones combining residential/commercial
- I-1: Light industrial and manufacturing zones
- OS: Open Space for parks and environmental protection

When analyzing queries, provide:
- Direct answers to the user's question
- Relevant zoning information
- Development possibilities or restrictions
- Key highlights or important considerations`,
};

export type AzureOpenAIConfig = typeof AZURE_OPENAI_CONFIG;
