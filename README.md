# ABCSteps Vivek - AI-Powered Educational Companion

<div align="center">

![ABCSteps Vivek](https://img.shields.io/badge/ABCSteps-Vivek-orange?style=for-the-badge&logo=education&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**🔗 Live Demo: [abcsteps.com](https://abcsteps.com)**

An AI-powered educational companion that guides students through Socratic questioning, personalized memory tracking, and multilingual support for Indian languages.

</div>

---

## 🌟 Features

### 🧘 **Guru Protocol** - Socratic Learning Method
- Never gives direct answers, guides discovery through questions
- Adapts to student's learning pace and style
- Encourages critical thinking and self-discovery

### 🗣️ **Multilingual Support**
- Available in 10 Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Odia
- Automatic language detection and response
- Culturally relevant examples and metaphors

### 🧠 **Smriti Protocol** - Three-Layer Memory System
- **Gyan (ज्ञान)**: Tracks declarative knowledge and facts
- **Bhava (भाव)**: Records learning experiences and emotions
- **Kriya (क्रिया)**: Monitors procedural skills and techniques

### 🔱 **Trimurti AI Routing**
- **Brahma Tier**: Fast responses for simple queries
- **Vishnu Tier**: Balanced approach for Socratic dialogue
- **Shiva Tier**: Deep analysis for complex problems

### 📚 **Educational Tools**
- Interactive code interpreter for programming education
- Mathematical visualization and graphing
- Weather patterns for geography lessons
- Translation tools for language learning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Redis instance
- Required API keys (see Environment Setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/div197/abcsteps.git
cd abcsteps

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# AI Model APIs
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_GENERATIVE_AI_API_KEY=your_key
OPENROUTER_API_KEY=your_key

# Memory System
MEM0_API_KEY=your_key
MEM0_ORG_ID=your_org_id
MEM0_PROJECT_ID=your_project_id

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Authentication
BETTER_AUTH_SECRET=your_secret
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

# Educational Tools
DAYTONA_API_KEY=your_key  # Code execution
OPENWEATHER_API_KEY=your_key  # Weather education
GOOGLE_MAPS_API_KEY=your_key  # Geography
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis
- **Authentication**: Better Auth
- **AI Integration**: Vercel AI SDK
- **Memory**: Mem0 AI

### Project Structure
```
abcsteps/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             
│   ├── tools/       # Educational tool implementations
│   ├── db/          # Database schema and queries
│   └── ...          # Utilities and helpers
├── ai/              # AI provider configurations
└── hooks/           # Custom React hooks
```

## 🌐 Deployment

### One-Command Deployment

ABCSteps Vivek supports instant deployment on multiple platforms:

```bash
# Vercel (Recommended)
pnpm deploy:vercel

# Railway
pnpm deploy:railway

# Render
pnpm deploy:render

# Netlify
pnpm deploy:netlify

# Fly.io
pnpm deploy:fly
```

### Manual Deployment

The platform uses standalone Next.js builds for optimal performance:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Orange Network Foundation** ([www.orangenetwork.foundation](https://www.orangenetwork.foundation)) - For concept and resource support
- **Vercel** - For hosting and development tools
- **Anthropic, OpenAI, Google** - For AI model access
- **Open Source Community** - For the amazing tools and libraries

## 📧 Contact

- **Website**: [abcsteps.com](https://abcsteps.com)
- **Email**: divyanshu@abcsteps.com
- **GitHub**: [@div197](https://github.com/div197)

---

<div align="center">

**Built with ❤️ for Indian Students**

*Empowering education through AI-guided learning*

</div>