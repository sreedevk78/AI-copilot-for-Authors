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

## 🛠️ Comprehensive Architecture

The CodeXcape codebase is organized into a modular, high-performance architecture designed for scalability and creative precision.

### 🧩 Core System Modules

#### 1. Multimodal AI Engine (`src/lib/`)
- **`geminiService.ts` & `openai.ts`**: Dual-engine integration for high-reliability generation.
- **`aiPersonalization.ts`**: The "Voice Engine" that learns and adapts to your unique authorial style.
- **`vectorService.ts`**: Manages the persistent memory (RAG) using advanced text embeddings.
- **`assistantBridge.ts`**: Orchestrates communication between different AI sub-systems.

#### 2. Persistence & Content API (`src/app/api/`)
- **`api/content/`**: Specialized endpoints for persisting structured creative data:
  - `worlds/`, `characters/`, `plots/`, `dialogues/`, `story-ideas/`
- **`api/user/`**: Manages the user journey, including `onboarding-status`, `writing-style`, and `active-voice` profiles.
- **`api/stories/`**: Full CRUD operations for story management and archival.

#### 3. Professional Authoring Toolset (`src/components/`)
- **`UnifiedAssistant.tsx`**: The central command hub for all creative AI interventions.
- **`RAGWorldDevelopment.tsx`**: The "Living Bible" interface for lore development.
- ** Specialized Builders**: 
  - `CharacterBuilder`, `DialogueCreator`, `PlotBuilder`, `VoiceAnalyzer`.
- **Engagement Suite**: `WritingDashboard`, `WritingStats`, and the premium `LandingPage`.

#### 4. The Design System (`src/styles/` & `src/components/ui/`)
- **`author-os.tsx`**: The foundational component library for the Walnut & Cream aesthetic.
- **`design-system.css`**: Centralized tokens for typography, spacing, and editorial glassmorphism.
- **`CustomCursor.tsx`**: Immersive interactive layer for a premium desktop feel.

## 🚀 Technical Features

- **Advanced RAG**: Context-aware generation that pulls from your custom lore database.
- **Streaming Responses**: Real-time generation with optimized hydration for a smooth UI.
- **Secure Authentication**: Robust session management via NextAuth.js.
- **Multi-Format Export**: Production-ready exports to PDF, Markdown, HTML, and TXT.
- **Automated Verification**: Integrated backend health checks and comprehensive Jest testing.

## 🚀 Quick Start

## 🔒 Security & Privacy
- **Local Context**: Your creative work stays in your controlled database environment.
- **Secure Auth**: Built-in authentication via NextAuth.
- **Server-Side AI**: API keys are never exposed to the client-side.

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ for authors who demand more from AI.*