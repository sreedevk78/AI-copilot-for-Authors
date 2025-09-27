# AI Writing Studio 🚀

A comprehensive AI-powered writing platform that helps writers generate story ideas, develop plots, create dialogue, and analyze their unique writing voice.

## 🚀 Features

### Core Writing Tools
- **Story Idea Generator** - AI-powered story concepts with genre and theme filtering
- **Plot Builder** - Interactive plot development with multiple story structures
- **Dialogue Creator** - Character-driven dialogue generation and analysis
- **Character Builder** - Comprehensive character development with AI assistance
- **Voice Analyzer** - Writing style analysis and voice preservation

### Advanced Features
- **AI Integration** - OpenAI GPT-4 powered content generation
- **Voice Preservation** - Maintains your unique writing style across AI generations
- **Writing Analytics** - Track writing progress, goals, and achievements
- **Collaboration Tools** - Real-time collaboration and sharing features
- **Professional UI** - Beautiful, responsive interface with smooth animations

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 Turbo
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sreedevkrishna2024/CodeXcape-app.git
cd CodeXcape-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example config
cp config.example.ts config.ts

# Edit config.ts with your actual values:
# - DATABASE_URL: Your PostgreSQL connection string
# - OPENAI_API_KEY: Your OpenAI API key
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (when database is set up)
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI generation endpoints
│   │   └── stories/      # Story management endpoints
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── WritingDashboard.tsx
│   ├── StoryIdeaGenerator.tsx
│   ├── PlotBuilder.tsx
│   ├── DialogueCreator.tsx
│   ├── CharacterBuilder.tsx
│   ├── VoiceAnalyzer.tsx
│   └── WritingStats.tsx
└── lib/                  # Utility libraries
    ├── openai.ts         # OpenAI integration
    ├── writingUtils.ts   # Writing analysis utilities
    └── prisma.ts         # Database client
```

## 🎯 Key Features Explained

### Story Idea Generator
- Generate creative story concepts with AI
- Filter by genre and themes
- Save and organize favorite ideas
- Export ideas for further development

### Plot Builder
- Multiple story structure templates (Three-Act, Hero's Journey, Five-Act)
- Interactive plot point development
- AI-assisted plot expansion
- Visual progress tracking

### Dialogue Creator
- Character voice development
- Scene-based dialogue creation
- Authenticity and quality analysis
- Practice and playback features

### Character Builder
- Comprehensive character profiles
- AI-generated character details
- Relationship mapping
- Character arc development

### Voice Analyzer
- Writing style analysis using AI
- Voice profile creation and comparison
- Metrics tracking (complexity, tone, pacing)
- Improvement suggestions

## 🔧 Configuration

Edit `config.ts` to customize:
- AI model settings
- Rate limiting
- Feature flags
- App branding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first styling
- All the open-source contributors who made this possible

---

**Built with ❤️ for hackathons**