# GlowUp - AI-Powered Startup Growth Platform

A comprehensive React application that helps startups generate pitch decks, market research, investor connections, and content strategies using AI.

## 🚀 Features

- **Startup Profile Management**: Comprehensive startup information collection
- **AI-Generated Pitch Decks**: Professional pitch deck creation with Claude AI
- **Market Research Reports**: Detailed market analysis and competitive intelligence
- **Investor Matching**: Curated investor recommendations based on startup profile
- **Content Calendar**: Strategic social media content planning
- **Branding Tools**: Name generation and brand development

## 🛠️ Tech Stack

- **Runtime/UI**: React 19 (`react`, `react-dom`) with `StrictMode`
- **Routing**: React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Build tool**: Vite 7 with `@vitejs/plugin-react` (fast dev server, ESM, HMR)
- **Styling**: Tailwind CSS v4 (utility-first) + PostCSS; custom design tokens in `src/index.css`
- **Animation**: Framer Motion for smooth UI interactions
- **AI Integration**: Anthropic Claude API for content generation

## 🔑 Environment Setup

This project requires an Anthropic API key to function. Follow these steps to set up your environment:

1. **Get an API Key**: Visit [Anthropic Console](https://console.anthropic.com/) to obtain your API key

2. **Create Environment File**: Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. **Add Your API Key**: Edit `.env` and replace the placeholder with your actual API key:
   ```bash
   VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

**⚠️ Security Note**: The `.env` file is already in `.gitignore` to prevent accidentally committing API keys. Never commit your actual API keys to version control.

## 🏗️ Project Structure

### Application Architecture
- **Entry Point**: `index.html` mounts `#root`; `src/main.jsx` renders `<App />` inside `StrictMode`
- **Routing**: `src/App.jsx` defines the application routes:
  - `/` → `Landing` (Welcome page)
  - `/start` → `Onboarding` (Startup profile setup)
  - `/creating` → `Loading` (Profile processing)
  - `/app/*` → `Dashboard` (Main application interface)
  - Fallback → redirect to `/start`
- **Layout System**: `src/components/AppShell.jsx` provides consistent header/nav/footer and backdrop effects
- **Styling System**: Tailwind CSS v4 with custom design tokens and utility classes
- **Project Type**: Single Page Application (SPA), suitable for static hosting platforms

## 🚀 Development

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key (see Environment Setup above)

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/EtienneLefranc/YCagenthackaton.git
   cd YCagenthackaton
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see Environment Setup above)

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Available Scripts
- **Development**: `npm run dev` - Start development server with hot reload
- **Build**: `npm run build` - Create production build
- **Preview**: `npm run preview` - Preview production build locally
- **Lint**: `npm run lint` - Run ESLint for code quality

## 🔧 Customization & Extension

### Adding New Features
- **Animations**: Use `framer-motion` (`motion.div`, variants) for interactive UI components
- **State Management**: Currently uses React hooks; add global state management (Redux, Zustand) if needed
- **Styling**: Extend utilities in `src/index.css`; update `tailwind.config.js` for new content paths
- **AI Integration**: Add new AI services by extending the `src/lib/` directory

### Component Architecture
- **Pages**: Add new routes in `src/pages/` and update routing in `App.jsx`
- **Components**: Reusable UI components in `src/components/`
- **Utilities**: Business logic and API calls in `src/lib/`

## 📚 API Integration

This project integrates with the Anthropic Claude API for AI-powered content generation. The integration is handled through:

- **API Client**: `src/lib/anthropic.js` - Handles all Anthropic API calls
- **Environment Variables**: Secure API key management via `.env` files
- **Development Proxy**: Vite dev server proxies API calls to avoid CORS issues

## 🚀 Deployment

This SPA can be deployed to any static hosting platform:

- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Drag-and-drop deployment with form handling
- **GitHub Pages**: Free hosting for open source projects
- **AWS S3 + CloudFront**: Enterprise-grade static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React 19 and Vite 7
- AI-powered by Anthropic Claude
- Styled with Tailwind CSS
- Animations powered by Framer Motion

---

**Repository**: [https://github.com/EtienneLefranc/YCagenthackaton](https://github.com/EtienneLefranc/YCagenthackaton)
