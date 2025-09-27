// Copy this file to config.ts and fill in your actual values

export const config = {
  // Database
  DATABASE_URL: "postgresql://username:password@localhost:5432/writing_platform",
  
  // OpenAI API Key
  OPENAI_API_KEY: "your_openai_api_key_here",
  
  // Next.js
  NEXTAUTH_SECRET: "your_nextauth_secret_here",
  NEXTAUTH_URL: "http://localhost:3000",
  
  // App Settings
  APP_NAME: "AI Writing Studio",
  APP_DESCRIPTION: "Unleash your creativity with AI-powered writing tools",
  
  // Feature Flags
  ENABLE_AI_GENERATION: true,
  ENABLE_VOICE_ANALYSIS: true,
  ENABLE_COLLABORATION: true,
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 3600000, // 1 hour
  
  // AI Settings
  DEFAULT_AI_MODEL: "gpt-4-turbo-preview",
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.8
}
