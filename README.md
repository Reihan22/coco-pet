# 🤖 CodeBot — AI-Powered Mech Builder

> Your virtual mech bot evolves with your coding activity. Build, code, battle — powered by **Xiaomi MiMo V2.5 Pro**.

**Live:** [codebot-mimo.vercel.app](https://codebot-mimo.vercel.app)

---

## ✨ Features

### 🐣 Mech Evolution System
- **5 evolution stages:** Frame → Chassis → Armor → Full Mech → Legend
- Level up by completing challenges, coding, and battling
- Each stage unlocks new visual appearance and combat stats

### ⚔️ Battle Arena
- **PvE AI Battles** — fight MiMo Bot, the AI-controlled opponent
- **PvP Duels** — challenge other players in real-time turn-based combat
- Personality & skill modifiers affect combat stats
- AI-powered battle commentary for dramatic fight narratives

### 🎯 Daily AI Challenges
- Fresh AI-generated coding challenges every day
- Difficulty scales with your mech's level
- Earn XP and tokens on completion

### 🧬 MiMo Fusion Lab
- Mine tokens through coding activity
- Train skills (Overclock, Firewall, Turbo, Self-Repair)
- Unlock and assign personality (Aggressive, Defensive, Balanced, Chaotic)
- Fuse bots for power upgrades

### 📜 Bot Lore Generator
- AI-generated backstory for your mech
- Discover origin, defining battles, and destiny
- Dramatic sci-fi narratives powered by Xiaomi MiMo

### 🎨 Paint Shop
- Unlock skins and accessories
- Customize your mech's appearance
- Equip palette swaps, animations, and visual effects

### 🏰 Guilds & Wars
- Create or join squads
- Squad Wars competition between guilds
- Leaderboard rankings

### 👥 Social Features
- Friend system
- Activity feed
- Leaderboard

### 📊 MiMo Token Usage (Public)
- Real-time display of daily/monthly AI token consumption
- Transparent AI usage metrics on landing page

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 6
- **AI:** Xiaomi MiMo V2.5 Pro (via OpenAI-compatible API)
- **Auth:** Session cookies with bcrypt
- **Styling:** CSS custom properties, pixel art aesthetic
- **Fonts:** Press Start 2P + JetBrains Mono (self-hosted via next/font)
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon)

### Setup

```bash
# Clone
git clone https://github.com/Reihan22/codebot.git
cd codebot

# Install
npm install

# Environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, JWT_SECRET, AI_ENDPOINT

# Database
npx prisma db push
npx prisma generate

# Run
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Session signing secret | — |
| `AI_ENDPOINT` | OpenAI-compatible API endpoint | `http://127.0.0.1:20128/v1` |
| `AI_API_KEY` | API key for AI endpoint | — |
| `AI_MODEL` | Model name | `GG` |
| `NEXT_PUBLIC_AI_LABEL` | AI brand label in UI | `Xiaomi MiMo V2.5 Pro` |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, register, logout, me
│   │   ├── battles/       # Battle queue, AI battles, actions
│   │   ├── challenges/    # Daily AI challenges, completion
│   │   ├── guild/         # Guild CRUD, wars
│   │   ├── pet/           # Feed, pet, rename, lore, evolution
│   │   ├── skins/         # Skin shop, equip/unequip
│   │   ├── stats/         # Public stats + token usage
│   │   └── ai-briefing/   # AI daily briefing
│   ├── dashboard/         # Main dashboard with tabs
│   ├── login/             # Auth pages
│   ├── skins/             # Paint shop
│   ├── guild/             # Guild pages
│   ├── leaderboard/       # Rankings
│   └── page.tsx           # Landing page
├── components/
│   ├── PixelPet.tsx       # Mech sprite rendering (5 stages)
│   ├── BattleArena.tsx    # Battle UI
│   ├── BotLore.tsx        # Lore generator
│   ├── DailyChallenge.tsx # Daily challenge widget
│   ├── MiMoLab.tsx        # Fusion lab
│   └── ...
└── lib/
    ├── ai.ts              # AI helper (chat, streaming)
    ├── auth.ts            # Session management
    ├── battle.ts          # Battle resolution engine
    └── pet.ts             # Pet stats, mood, XP calculations
```

---

## 🎮 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user + pet |
| POST | `/api/pet/feed` | Charge bot (+XP) |
| POST | `/api/pet/pet` | Boost bot (+happiness) |
| POST | `/api/pet/lore` | Generate AI backstory |
| GET | `/api/challenges/daily` | Get/generate daily challenge |
| POST | `/api/challenges/complete` | Complete a challenge |
| POST | `/api/battles/ai` | Start AI battle |
| POST | `/api/battles/[id]/action` | Submit battle action |
| GET | `/api/stats` | Public stats + token usage |
| GET | `/api/ai-briefing` | AI daily status briefing |

---

## ⚡ Performance Optimizations

- Self-hosted fonts via `next/font/google` (zero render-blocking CSS imports)
- Parallel data fetching with `Promise.all`
- Lazy-loaded tab components via `next/dynamic`
- Optimized image loading with `display: swap`

---

## 📄 License

MIT

---

*Powered by Xiaomi MiMo V2.5 Pro • Build. Code. Battle.*
