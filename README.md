<div align="center">
  <h1>🤖 Discord Bot Platform</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Discord.js-v14-blue" alt="Discord.js v14">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.3+-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-7-red" alt="Redis">
</div>

<div align="center">
  <strong>A production-ready Discord bot platform with 235+ commands, secure web dashboard, and comprehensive moderation tools</strong>
</div>

---

<div align="center">
  <h2>📋 Table of Contents</h2>
</div>

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📦 Installation](#-installation)
- [🎮 Commands](#-commands)
- [🌐 Dashboard](#-dashboard)
- [🔧 Development](#-development)
- [🐳 Docker Deployment](#-docker-deployment)
- [📊 API Documentation](#-api-documentation)
- [🛠️ Contributing](#️-contributing)
- [📄 License](#-license)

---

<div align="center">
  <h2>✨ Features</h2>
</div>

### 🛡️ **Moderation & Safety**
- **25+ moderation commands** including kick, ban, timeout, warn, and more
- **Auto-moderation** with customizable filters and anti-spam
- **Anti-raid and anti-nuke protection** for server security
- **Advanced logging** and moderation case tracking

### 🎮 **Entertainment & Games**
- **30+ fun commands** including memes, jokes, trivia, and games
- **Music player** with playlists, queues, and audio filters
- **Interactive games** like Tic-Tac-Toe, Connect 4, Chess, and more
- **AI-powered features** including chat, image generation, and translation

### 💬 **Community & Engagement**
- **Leveling system** with XP, ranks, and prestige
- **Economy system** with currency, shops, and gambling
- **Welcome/goodbye messages** and reaction roles
- **Giveaways, polls, and suggestions** systems

### 🎛️ **Server Management**
- **Comprehensive setup wizards** for easy server configuration
- **Role management** with auto-roles and button roles
- **Server backup and restore** functionality
- **Analytics and engagement tracking**

### 🌐 **Web Dashboard**
- **Modern Next.js dashboard** for server management
- **Secure authentication** with NextAuth.js
- **Real-time analytics** and server statistics
- **User-friendly interface** for all bot settings

---

<div align="center">
  <h2>🏗️ Architecture</h2>
</div>

```
discord-bot-platform/
├── apps/
│   ├── bot/          # Discord bot core (Discord.js v14)
│   ├── api/          # REST API (Express.js)
│   └── dashboard/    # Web dashboard (Next.js 14)
├── packages/
│   ├── database/     # Prisma ORM & PostgreSQL
│   ├── shared/       # Shared utilities & types
│   └── config/       # Configuration management
├── scripts/          # Build & deployment scripts
└── docker-compose.yml # Multi-service deployment
```

### 🔄 **Technology Stack**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Bot**: Discord.js v14, TypeScript
- **Database**: PostgreSQL 16 with Prisma
- **Cache**: Redis 7 for session management
- **Authentication**: NextAuth.js with Discord OAuth
- **Deployment**: Docker & Docker Compose

---

<div align="center">
  <h2>🚀 Quick Start</h2>
</div>

### Prerequisites
- Node.js 18+ and pnpm 8+
- PostgreSQL 16 and Redis 7
- Discord Bot Token and Application ID

### 1. **Clone & Install**
```bash
git clone https://github.com/phoenixdev100/skycodehub-discord-bot
cd skycodehub-discord-bot
pnpm install
```

### 2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. **Database Setup**
```bash
pnpm docker:up  # Start PostgreSQL & Redis
pnpm db:migrate # Run database migrations
```

### 4. **Start Development**
```bash
pnpm dev  # Starts all services in development mode
```

### 5. **Invite Bot to Server**
1. Go to Discord Developer Portal
2. Create application and bot
3. Add your bot token to `.env`
4. Invite bot using OAuth2 URL generator

---

<div align="center">
  <h2>⚙️ Configuration</h2>
</div>

### 📝 **Environment Variables**

#### Discord Configuration
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
SUPER_ADMIN_ID=your_discord_user_id_here
```

#### Database Configuration
```env
DATABASE_URL=postgresql://discord_bot:password@localhost:5432/discord_bot_db
REDIS_URL=redis://localhost:6379
```

#### API Configuration
```env
API_PORT=4000
API_HOST=localhost
API_URL=http://localhost:4000
```

#### Dashboard Configuration
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
JWT_SECRET=your_jwt_secret_here
```

### 🔐 **Security Setup**
1. Generate secure secrets:
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For NEXTAUTH_SECRET
   ```

2. Configure Discord Bot Permissions:
   - Administrator (recommended)
   - Send Messages
   - Embed Links
   - Read Message History
   - Connect to Voice
   - Speak

---

<div align="center">
  <h2>📦 Installation</h2>
</div>

### 🖥️ **Local Development**

```bash
# 1. Clone repository
git clone https://github.com/phoenixdev100/skycodehub-discord-bot
cd skycodehub-discord-bot

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 4. Start services
pnpm docker:up
pnpm db:migrate

# 5. Start development
pnpm dev
```

### 🐳 **Docker Deployment**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 🌐 **Production Deployment**

```bash
# Build for production
pnpm build

# Start production services
pnpm docker:up -d
```

---

<div align="center">
  <h2>🎮 Commands</h2>
</div>

### 📊 **Command Categories**

| Category | Commands | Description |
|----------|----------|-------------|
| 🛡️ Moderation | 25+ | Kick, ban, warn, timeout, auto-mod |
| ⚙️ Server Setup | 30+ | Roles, verification, backup, configuration |
| 🔧 Utility | 25+ | Polls, reminders, productivity tools |
| 👥 Community | 20+ | Welcome, reputation, profiles, engagement |
| 📈 Leveling | 20+ | XP system, ranks, economy, shop |
| 🎮 Fun & Games | 30+ | Memes, trivia, games, music |
| 🤖 AI Features | 15+ | Chat, image generation, translation |
| 📅 Events | 10+ | Event scheduling, reminders, attendance |
| 📊 Analytics | 15+ | Server stats, user analytics, logging |
| 🎵 Music | 20+ | Playback, queues, playlists, filters |

### 🎯 **Popular Commands**

```bash
# Moderation
/kick @user [reason]          # Kick a user
/ban @user [reason]           # Ban a user
/warn @user [reason]          # Warn a user
/automod enable               # Enable auto-moderation

# Fun & Games
/play [song]                  # Play music
/meme                         # Random meme
/trivia start                 # Start trivia game
/tictactoe @opponent          # Play tic-tac-toe

# Utility
/help                         # View all commands
/serverinfo                   # Server information
/poll create "Question"       # Create a poll
/remind "Task" in 1h          # Set reminder

# Economy
/balance                      # Check balance
/daily                        # Claim daily reward
/shop                         # View shop
/work                         # Work for money
```

### 🔧 **Setup Commands**

```bash
/setup                        # Run setup wizard
/setup moderation             # Setup moderation system
/setup welcome                # Setup welcome messages
/setup leveling               # Setup leveling system
/setup economy                # Setup economy system
```

---

<div align="center">
  <h2>🌐 Dashboard</h2>
</div>

### 🎨 **Dashboard Features**
- **Server Management**: Configure all bot settings
- **User Analytics**: View server statistics and growth
- **Moderation Panel**: Manage warnings, bans, and cases
- **Economy Dashboard**: Monitor economy and shop settings
- **Real-time Updates**: Live server activity monitoring

### 🔐 **Authentication**
- Discord OAuth2 integration
- Secure session management
- Role-based access control
- Super admin permissions

### 📱 **Responsive Design**
- Mobile-friendly interface
- Dark/light theme support
- Modern UI with Tailwind CSS
- Real-time notifications

---

<div align="center">
  <h2>🔧 Development</h2>
</div>

### 📁 **Project Structure**
```
apps/
├── bot/                 # Discord bot application
│   ├── src/
│   │   ├── commands/    # Slash command handlers
│   │   ├── events/      # Discord event listeners
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   └── package.json
├── api/                 # REST API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
│   └── package.json
└── dashboard/           # Next.js web application
    ├── src/
    │   ├── app/         # App router pages
    │   ├── components/  # React components
    │   ├── lib/         # Utility functions
    │   └── types/       # TypeScript types
    └── package.json
```

### 🛠️ **Development Scripts**

```bash
# Development
pnpm dev                 # Start all services
pnpm dev:bot            # Start bot only
pnpm dev:api            # Start API only
pnpm dev:dashboard      # Start dashboard only

# Building
pnpm build              # Build all applications
pnpm build:bot         # Build bot only
pnpm build:api         # Build API only
pnpm build:dashboard   # Build dashboard only

# Database
pnpm db:generate        # Generate Prisma client
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Prisma Studio
pnpm db:seed            # Seed database

# Utilities
pnpm lint               # Lint all packages
pnpm clean              # Clean build artifacts
pnpm type-check         # TypeScript type checking
```

### 🧪 **Testing**

```bash
# Run tests
pnpm test               # Run all tests
pnpm test:unit         # Unit tests
pnpm test:integration  # Integration tests
pnpm test:e2e          # End-to-end tests

# Coverage
pnpm test:coverage     # Generate coverage report
```

---

<div align="center">
  <h2>🐳 Docker Deployment</h2>
</div>

### 📋 **Services Overview**

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| api | 4000 | REST API server |
| bot | - | Discord bot (no external port) |
| dashboard | 3000 | Web dashboard |

### 🚀 **Deployment Commands**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Scale services
docker-compose up -d --scale bot=2
```

### 📊 **Health Checks**
All services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- API: HTTP health endpoint
- Bot: Discord connection status

<div align="center">
  <h2>🛠️ Contributing</h2>
</div>

### 🤝 **How to Contribute**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### 📝 **Development Guidelines**

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation
- Ensure code passes linting

### 🐛 **Bug Reports**

- Use GitHub Issues for bug reports
- Include reproduction steps
- Add error logs and screenshots
- Specify environment details

---

<div align="center">
  <h2>📄 License</h2>
</div>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h2>🤝 Support</h2>
</div>

<!-- ### 📞 **Get Help**
- 📧 Email: support@phoenixdev100.me
- 💬 Discord: [Join our community](https://discord.gg/your-server)
- 📖 Documentation: [docs.discord-bot-platform.com](https://docs.discord-bot-platform.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/discord-bot/issues) -->

### ⭐ **Show Your Support**
- Give this repository a ⭐ star
- Share with your community
- Contribute to the project
- Report bugs and suggest features

---

<div align="center">
  <strong>Made with ❤️ by Deepak</strong>
</div>

<div align="center">
  <a href="#top">Back to top ↑</a>
</div>
