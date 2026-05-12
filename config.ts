// Configuration for the AI Writing Studio
export const config = {
  // Database - Using SQLite for demo (no setup required)
  DATABASE_URL: "file:./dev.db",
  
  // OpenAI API Key (you'll need to add your own)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "demo-key",
  
  // Google Gemini API Key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  
  // NextAuth
  NEXTAUTH_SECRET: "your-secret-key-here",
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
  DEFAULT_AI_MODEL: "gpt-3.5-turbo",
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.8
}
