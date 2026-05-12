# CodeXcape — The AI Co-Assistant for Authors

CodeXcape is a premium, professional-grade "Author OS" designed for serious writers. It moves beyond generic AI interactions by providing a persistent, lore-aware creative environment powered by Advanced RAG (Retrieval-Augmented Generation).

![Author OS Dashboard](/public/images/library-bg.png)

## ✨ Premium Features

### 🧠 Living World Bible (Advanced RAG)
Unlike standard chatbots, CodeXcape features a **persistent creative memory**. 
- **Vector-Based Retrieval**: Every character, location, and lore piece is embedded into a vector database.
- **Creative Continuity**: The AI "remembers" your world's rules and history across every generation.
- **Lore Context Injection**: Automatically injects relevant world details into your writing prompts to prevent hallucinations.

### 🎭 Author-Centric UI/UX
A complete redesign focused on the editorial experience.
- **Walnut & Cream Aesthetic**: A professional, book-themed design language that reduces digital fatigue.
- **Distraction-Free Environment**: Focused writing zones and prioritized typography.
- **Custom Cursor & Motion**: Fluid, premium interactions that feel like a high-end desktop application.

### 🛠️ Unified Creative Suite
- **Unified Assistant**: A centralized command center for all AI-powered tasks.
- **Persona-Driven Generation**: AI that adapts to your specific authorial voice.
- **Smart Dialogue & Plot Builders**: Specialized tools that understand narrative structure.
- **Onboarding Flow**: A tailored setup process that learns your writing style from the start.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL or SQLite (Prisma)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sreedevk78/AI-copilot-for-Authors.git
   cd CodeXcape-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your `GEMINI_API_KEY` and `DATABASE_URL`.

4. **Initialize the Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Architecture

```
src/
├── components/
│   ├── UnifiedAssistant.tsx      # Central AI control center
│   ├── RAGWorldDevelopment.tsx   # Lore & Vector management
│   ├── UserOnboarding.tsx        # Persona learning flow
│   └── ui/author-os.tsx          # Design system primitives
├── lib/
│   ├── vectorService.ts          # RAG & Embedding logic
│   ├── geminiService.ts          # Primary AI integration
│   └── aiPersonalization.ts      # Voice/Style learning
└── app/api/
    └── worlds/                   # RAG context endpoints
```

## 🔒 Security & Privacy
- **Local Context**: Your creative work stays in your controlled database environment.
- **Secure Auth**: Built-in authentication via NextAuth.
- **Server-Side AI**: API keys are never exposed to the client-side.

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ for authors who demand more from AI.*