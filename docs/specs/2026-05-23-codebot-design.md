# CodeBot — Design Spec

## Overview
CodeBot is a coding education platform where users build and upgrade robots through coding challenges. Powered by Xiaomi MiMo V2.5 Pro AI.

**Tagline:** *"Build. Code. Battle."*

## Core Concept
- Users build robots (not pets) through coding challenges
- Robots evolve through build phases: Frame → Chassis → Armor → Full Mech
- Turn-based mech combat (duels)
- Squad (guild) system for team battles
- AI-powered features via MiMo Engineer

## Concept Mapping (from codepet)

| codepet | CodeBot | Notes |
|---------|---------|-------|
| Pet | Bot | Robot that user builds |
| Level | Mark (Mk.I-V) | Robot tier |
| XP | Parts | Upgrade material |
| Stage | Build Phase | frame→chassis→armor→full |
| Streak | Uptime | Online hours |
| Feed | Charge | Power up bot |
| Battle | Duel | Mech combat |
| Guild | Squad | Robot team |
| Skins | Paint/Decal | Visual customization |
| Achievement | Badge | Medals |
| AI Chat | MiMo Engineer | AI assistant |

## NEW: AI/Token System

### Token Economy
- **Earn:** Mining (passive) + Challenge completion + Battle wins + Streak bonus
- **Spend:** AI Training, Personality, Fusion, Blueprint (future)
- **Balance:** Free users can mine + basic training. Premium = more tokens

### 4 AI Features

#### 1. Token Mining
- Bot mines tokens automatically based on coding activity
- More coding = more tokens/hour
- Mining rate increases with bot Mark level
- FREE (passive income)

#### 2. AI Training
- Spend tokens to train bot skills
- Each training session = new skill (defense boost, attack pattern, special move)
- Training history affects battle behavior
- Cost: 50-200 tokens per session

#### 3. Bot Personality AI
- Unlock AI personality module with tokens
- Personality types: Aggressive, Defensive, Balanced, Chaotic
- Personality affects battle AI behavior
- Can train/change personality with tokens
- Cost: 300 tokens to unlock

#### 4. MiMo Fusion Lab
- Spend tokens to fuse 2 bots into 1 stronger bot
- Combines stats, visual, and skills
- Rare fusion = rare parts/bot
- Endgame content for collectors
- Cost: 500-1000 tokens per fusion

## Visual Design
- Pixel art robots (not pets)
- Color palette: metallic blue + orange accent (Xiaomi brand)
- Bot has customizable parts: head, body, arms, legs
- Battle animation: robot duel mechanics
- Font: Press Start 2P (pixel art)

## Branding
- **App Name:** CodeBot
- **AI Assistant:** MiMo Engineer (powered by Xiaomi MiMo V2.5 Pro)
- **Tagline:** "Build. Code. Battle."
- **URL:** codebot.reihan.site (or coco-pet.vercel.app → codebot.vercel.app)

## Technical Stack
- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS 4 + Pixel art aesthetic
- Prisma 6 + PostgreSQL 16 (Neon)
- Auth: JWT (jose) + bcrypt
- AI: MiMo V2.5 Pro via configurable endpoint
- Deploy: Vercel (frontend) + VPS (optional)

## Features (Preserved from codepet)
- User registration/login
- Bot creation and customization
- Turn-based duel system
- Squad (guild) system with chat
- Friend list and challenges
- Leaderboard (DB-backed)
- AI-powered coding challenges
- Achievement/badge system

## Features (New)
- Token mining system
- AI training for bot skills
- Bot personality AI module
- MiMo Fusion Lab
- Robot visual customization (parts)

## Database Schema Changes
- Rename tables: Pet → Bot, PetSkin → BotPaint
- Add fields: Bot.personality, Bot.markLevel, Bot.miningRate
- New table: TokenTransaction (earn/spend history)
- New table: BotSkill (learned skills from training)
- New table: FusionRecipe (bot combinations)

## API Changes
- Rename endpoints: /api/pet → /api/bot
- New endpoints: /api/tokens/mine, /api/tokens/spend, /api/bot/train, /api/bot/fusion
- AI endpoints: /api/ai/chat (MiMo Engineer), /api/ai/challenge, /api/ai/blueprint

## UI Changes
- Dashboard: Bot overview (not pet)
- Battle Arena: Mech duel interface
- Training Center: AI training interface
- Fusion Lab: Bot combination interface
- Squad HQ: Guild management
- Token Wallet: Balance and transaction history

## Migration Plan
1. Rebrand all UI text and labels
2. Update database schema (rename tables)
3. Migrate existing data
4. Deploy new version
5. Update DNS/URLs

## Success Metrics
- User engagement: daily active users
- Token economy: earn/spend ratio
- Battle participation: duels per day
- AI feature usage: training/fusion per user
- Retention: 7-day return rate

## Out of Scope (YAGNI)
- Real money transactions
- NFT/blockchain integration
- Mobile app (web only for now)
- Multi-language support (Indonesian + English only)
- Advanced AI features (beyond current scope)

---

**Spec written by Rahel — Ready for implementation**
