# AI Writing Assistant

A modern, full-featured AI writing assistant built with Next.js, TypeScript, and Tailwind CSS. Features streaming AI generation, multiple export formats, and a beautiful, responsive interface.

## ✨ Features

- **🤖 AI-Powered Generation**: Uses Google Gemini AI for high-quality content generation
- **📝 Multiple Templates**: Story ideas, plot outlines, and dialogue generation
- **🌊 Streaming Responses**: Real-time text generation with cancellation support
- **💾 Export Options**: TXT, HTML, Markdown, and PDF export
- **📚 History Management**: Save and revisit previous generations
- **🎨 Modern UI**: Responsive design with smooth animations
- **⚙️ Customizable Settings**: Adjust tone, creativity, and length
- **🔄 Retry Logic**: Automatic retry with exponential backoff
- **♿ Accessible**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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
   
   Edit `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   └── generate/      # AI generation endpoint
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Main page
├── components/            # React components
│   └── WriterAssistant.tsx # Main writing interface
├── lib/                   # Utilities and services
│   ├── exportUtils.ts     # Export functionality
│   ├── geminiService.ts   # Gemini AI integration
│   └── writingUtils.ts    # Writing utilities
└── __tests__/            # Test files
```

## 🎯 Usage

### Basic Usage

1. **Select a Template**: Choose from Story Idea, Plot Outline, or Dialogue
2. **Enter Your Prompt**: Describe what you want to generate
3. **Adjust Settings**: Set tone, creativity level, and length
4. **Generate**: Click the Generate button and watch the AI create content
5. **Export**: Save your content in multiple formats

### Advanced Features

#### Templates
- **Story Idea**: Generates creative story concepts with characters and conflicts
- **Plot Outline**: Creates detailed story structures with key plot points
- **Dialogue**: Writes natural conversations between characters

#### Settings
- **Tone**: Professional, Creative, Casual, Formal, Conversational, Poetic
- **Creativity**: Adjust from focused (0.0) to highly creative (1.0)
- **Length**: Short, Medium, Long, or Very Long outputs

#### Export Options
- **TXT**: Plain text file
- **HTML**: Formatted web page
- **Markdown**: Markdown formatted text
- **PDF**: Print-ready document (opens print dialog)

## 🧪 Testing

The project includes comprehensive tests for all major functionality:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test WriterAssistant.test.tsx
```

### Test Coverage

- ✅ Component rendering
- ✅ User interactions
- ✅ API integration
- ✅ Export functionality
- ✅ Error handling
- ✅ Loading states

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `DATABASE_URL` | Database connection string | No |
| `NEXTAUTH_URL` | Authentication callback URL | No |
| `NEXTAUTH_SECRET` | NextAuth secret key | No |
| `OPENAI_API_KEY` | OpenAI API key (fallback) | No |

### API Configuration

The AI generation endpoint (`/api/generate`) supports:

- **Streaming responses** for real-time text generation
- **Error handling** with automatic retry logic
- **Rate limiting** protection
- **Security** with server-side API key handling

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
3. **Deploy**: Vercel will automatically deploy on push

### Other Platforms

The app can be deployed to any platform that supports Next.js:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🔒 Security

- ✅ API keys are kept server-side only
- ✅ Input validation on all endpoints
- ✅ Rate limiting protection
- ✅ Error handling without sensitive data exposure
- ✅ HTTPS enforcement in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**"API key not found" error**
- Ensure your `.env.local` file exists and contains `GEMINI_API_KEY`
- Verify the API key is valid and has proper permissions

**"Failed to generate content" error**
- Check your internet connection
- Verify the Gemini API key is active
- Check the browser console for detailed error messages

**Build errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

**Tests failing**
- Ensure all dependencies are installed: `npm install`
- Check that the test environment is properly configured

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [API documentation](https://ai.google.dev/docs)
- Contact support with detailed error messages

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animations with [Framer Motion](https://www.framer.com/motion/)
- Icons from [Lucide React](https://lucide.dev/)
- AI powered by [Google Gemini](https://ai.google.dev/)