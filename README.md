# 🚀 GlowUp — Your Pocket MBA for Tech Founders

<img width="2855" height="1313" alt="67572A90-5FCB-4930-801C-3DD2083631BA" src="https://github.com/user-attachments/assets/56534dce-83f5-4b14-9e29-e18fbc4fec3c" />

> **Launch faster with an AI operator that automates your startup launch workflow**

GlowUp is the ultimate companion for technical founders who want to ship faster and smarter. Think of it as having a pocket MBA that handles everything from landing page generation to investor connections, market analysis, and pitch deck creation.

## ✨ What GlowUp Does

### 🎯 **Complete Launch Automation**
- **Landing Page Generation & Deployment** — One-click generation with your brand tone, deployed to edge hosting with conversion tracking
- **Investor Connection Engine** — Find warm intros to relevant investors through your LinkedIn graph and our network
- **Market Intelligence** — Get crisp market maps, ICP analysis, competitive breakdown, and pricing guidance
- **Pitch Deck Creation** — Auto-draft investor-ready slides from your problem, solution, and traction data
- **Content & Branding** — Generate brand kits and content calendars for X, LinkedIn, and email campaigns
- **Naming & Product Generation** — Explore memorable names and product concepts with instant domain/social handle checking

### 🧠 **AI-Powered Intelligence**
- **Personalized Recommendations** — Tailored to your startup's stage, sector, and launch timeline
- **Brand Tone Consistency** — Maintains your chosen voice across all generated content
- **Market-Aware Insights** — Leverages current market data for competitive positioning
- **Investor Matching** — Curated investor lists based on your specific problem/solution fit

## 🛠️ Tech Stack

### **Frontend**
- **React 19** with StrictMode for optimal performance
- **Vite 7** for lightning-fast development and builds
- **Tailwind CSS v4** for utility-first styling with custom design tokens
- **Framer Motion** for smooth animations and micro-interactions
- **React Router v7** for seamless navigation
- **LinkedIn scraping**

### **AI Integration**
- **Anthropic Claude 3.5 Sonnet** for intelligent content generation
- **Real-time API integration** with fallback error handling
- **Context-aware prompting** for personalized outputs

### **Design System**
- **Glass morphism UI** with backdrop blur effects
- **Gradient accents** (purple to cyan) for modern aesthetics
- **Space Grotesk & Inter fonts** for professional typography
- **Responsive design** optimized for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Anthropic API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/glowup.git
cd glowup

# Install dependencies
npm install

# Set up your API key
# Add your Anthropic API key to the script tag in index.html
# or create a .env file with VITE_ANTHROPIC_API_KEY=your_key_here

# Start development server
npm run dev
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📱 Usage Flow

### 1. **Onboarding** (`/start`)
- Define your startup's problem and solution
- Set your brand tone (Professional, Playful, Bold, Minimal)
- Specify launch timeline and milestones
- Connect your LinkedIn for network analysis

### 2. **AI Workspace** (`/app`)
- **Profile Management** — View and edit your startup details
- **Landing Page Generation** — Create and deploy conversion-optimized pages
- **Pitch Deck Creation** — Generate 12-slide investor presentations
- **Investor Connections** — Discover relevant investors with warm intro paths
- **Market Analysis** — Get competitive intelligence and pricing guidance
- **Content Creation** — Generate brand assets and content calendars
- **Naming & Branding** — Explore product names and check availability

### 3. **Real-time Generation**
- Click "Generate" on any section to create AI-powered content
- Edit and refine outputs to match your vision
- Export and share results directly

## 🎨 Design Philosophy

GlowUp combines **functionality with beauty**:

- **Minimalist Interface** — Focus on what matters most
- **Glass Morphism** — Modern, translucent UI elements
- **Gradient Accents** — Purple to cyan gradients for visual appeal
- **Smooth Animations** — Framer Motion for delightful interactions
- **Responsive Design** — Works perfectly on desktop, tablet, and mobile

## 🔧 Architecture

```
src/
├── components/          # Reusable UI components
│   ├── AppShell.jsx    # Main layout wrapper
│   ├── BackgroundOrbs.jsx # Animated background
│   └── Logo.jsx        # Brand logo component
├── pages/              # Route components
│   ├── Landing.jsx     # Homepage
│   ├── Onboarding.jsx  # User setup flow
│   ├── Loading.jsx     # Transition screen
│   └── Dashboard.jsx   # Main workspace
├── lib/                # Utilities and services
│   └── anthropic.js    # AI integration
└── index.css           # Global styles and design tokens
```

## 🌟 Key Features

### **Smart Investor Matching**
- Analyzes your startup profile to find relevant investors
- Provides fit scores and connection reasoning
- Includes contact information and social links
- Filters by stage, sector, and geography

### **Intelligent Pitch Deck Generation**
- Creates 12-slide investor presentations
- Maintains your brand tone throughout
- Includes market analysis and competitive positioning
- Generates realistic financial projections

### **Brand-Consistent Content**
- Maintains your chosen tone across all outputs
- Generates cohesive messaging for different channels
- Creates professional brand assets
- Ensures consistency in all communications

## 🚀 Deployment

GlowUp is designed for easy deployment on modern platforms:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy to GitHub Pages
npm run build && gh-pages -d dist
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the startup community
- Powered by Anthropic's Claude AI
- Inspired by the need for faster, smarter startup launches

---

**Ready to give your startup a GlowUp?** [Get started now](https://glowup-nhvac2mwr-marianas-projects-19ba8abd.vercel.app/)

---

*GlowUp — Launch faster with your AI operator* 🚀

