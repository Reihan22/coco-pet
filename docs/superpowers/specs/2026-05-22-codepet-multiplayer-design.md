# CodePet Multiplayer — Design Spec

> **Date:** 2026-05-22
> **Status:** Approved
> **Based on:** XinnBlueBird/codepet (reference clone at `/tmp/codepet-study/`)

## Goal

Replicate codepet virtual developer pet and extend with multiplayer/social features: turn-based battles, friend list, guild system with wars, real leaderboard, and shared challenges.

## Architecture

Next.js 16 full-stack monolith (App Router). PostgreSQL 16 via Prisma ORM. JWT auth (httpOnly cookies). SSE for real-time battle/chat updates. Single deploy target: VPS with nginx + systemd + cloudflared.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
- **Backend:** Next.js API routes + Server Actions
- **Database:** PostgreSQL 16 (local VPS), Prisma ORM
- **Auth:** bcrypt (password hashing), jose (JWT), httpOnly cookies
- **AI:** Xiaomi MiMo V2.5 Pro (text-only, OpenAI-compatible API) — for pet chat + challenge generation. Configurable endpoint: defaults to public MiMo API, can swap to self-hosted 9router gateway via `.env`
- **Real-time:** SSE polling (2s interval) for battles + guild chat
- **Deploy:** systemd service, nginx reverse proxy, cloudflared tunnel

## Visual Design

Preserve original codepet aesthetic:
- Dark theme: `#0a0a0f` background, `#12121a` surface
- Neon accents: cyan `#00ffd5`, pink `#ff2d78`, gold `#ffd700`, lime `#39ff14`, purple `#b44dff`
- Font: "Press Start 2P" (headings/labels), "JetBrains Mono" (body)
- Pixel art pets with CSS (not images) — 5 evolution stages with animations
- Retro glass-morphism cards with subtle borders

## Database Schema

### users
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
username      VARCHAR(30) UNIQUE NOT NULL
email         VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
github_username VARCHAR(39)  -- optional
github_connected_at TIMESTAMPTZ
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

### pets
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
name          VARCHAR(30) DEFAULT 'CodeBuddy'
level         INT DEFAULT 1
xp            INT DEFAULT 0
hunger        INT DEFAULT 80        -- 0-100
happiness     INT DEFAULT 80        -- 0-100
stage         VARCHAR(10) DEFAULT 'egg'  -- egg|baby|junior|senior|legend
total_commits INT DEFAULT 0
streak_days   INT DEFAULT 0
challenges_completed INT DEFAULT 0
hp            INT DEFAULT 60        -- 50 + level*10
atk           INT DEFAULT 7         -- 5 + level*2 + stage_bonus
def           INT DEFAULT 4         -- 3 + level*1.5 + stage_bonus
spd           INT DEFAULT 6         -- 5 + level
last_fed      TIMESTAMPTZ DEFAULT now()
last_petted   TIMESTAMPTZ DEFAULT now()
created_at    TIMESTAMPTZ DEFAULT now()
```

### battles
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
challenger_id UUID REFERENCES users(id)
opponent_id   UUID REFERENCES users(id)
status        VARCHAR(15) DEFAULT 'waiting'  -- waiting|active|finished|cancelled
winner_id     UUID REFERENCES users(id)
turns         JSONB DEFAULT '[]'  -- [{player, action, damage, hp_after, timestamp}]
xp_awarded    INT DEFAULT 0
created_at    TIMESTAMPTZ DEFAULT now()
finished_at   TIMESTAMPTZ
```

### friendships
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
requester_id  UUID REFERENCES users(id)
addressee_id  UUID REFERENCES users(id)
status        VARCHAR(10) DEFAULT 'pending'  -- pending|accepted|blocked
created_at    TIMESTAMPTZ DEFAULT now()
UNIQUE(requester_id, addressee_id)
```

### guilds
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          VARCHAR(50) UNIQUE NOT NULL
description   VARCHAR(500)
leader_id     UUID REFERENCES users(id)
level         INT DEFAULT 1
xp            INT DEFAULT 0
member_count  INT DEFAULT 1
created_at    TIMESTAMPTZ DEFAULT now()
```

### guild_members
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
guild_id      UUID REFERENCES guilds(id) ON DELETE CASCADE
user_id       UUID UNIQUE REFERENCES users(id)
role          VARCHAR(10) DEFAULT 'member'  -- leader|officer|member
joined_at     TIMESTAMPTZ DEFAULT now()
```

### guild_wars
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
guild1_id     UUID REFERENCES guilds(id)
guild2_id     UUID REFERENCES guilds(id)
status        VARCHAR(15) DEFAULT 'scheduled'  -- scheduled|active|finished
champions1    JSONB DEFAULT '[]'  -- [{user_id, pet_id}]
champions2    JSONB DEFAULT '[]'
battles       JSONB DEFAULT '[]'  -- [{battle_id, winner_guild}]
score1        INT DEFAULT 0
score2        INT DEFAULT 0
winner_guild_id UUID REFERENCES guilds(id)
best_of       INT DEFAULT 3
scheduled_at  TIMESTAMPTZ NOT NULL
started_at    TIMESTAMPTZ
finished_at   TIMESTAMPTZ
created_at    TIMESTAMPTZ DEFAULT now()
```

### guild_messages
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
guild_id      UUID REFERENCES guilds(id) ON DELETE CASCADE
user_id       UUID REFERENCES users(id)
content       VARCHAR(1000) NOT NULL
created_at    TIMESTAMPTZ DEFAULT now()
```

### activities
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID REFERENCES users(id)
type          VARCHAR(20) NOT NULL  -- commit|challenge|evolution|login|feed|battle|guild_war
description   VARCHAR(255)
xp_earned     INT DEFAULT 0
created_at    TIMESTAMPTZ DEFAULT now()
```

## Pet Skins System

### skins (definition table)
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          VARCHAR(50) UNIQUE NOT NULL
description   VARCHAR(200)
category      VARCHAR(10) NOT NULL       -- palette|accessory|both
rarity        VARCHAR(10) NOT NULL       -- common|uncommon|rare|epic|legendary
palette       JSONB DEFAULT '{}'         -- {body, eye, accent, glow} hex colors
accessory     VARCHAR(20)                -- crown|halo|cape|scarf|glasses|hat|wings|aura|null
animation     VARCHAR(20)                -- sparkle|flame|shadow|glitch|rainbow|null
unlock_type   VARCHAR(20) NOT NULL       -- level|streak|achievement|battle|guild_war|special
unlock_value  INT NOT NULL               -- e.g. level 10, 50 battle wins, etc.
created_at    TIMESTAMPTZ DEFAULT now()
```

### user_skins (ownership junction)
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID REFERENCES users(id) ON DELETE CASCADE
skin_id       UUID REFERENCES skins(id)
unlocked_at   TIMESTAMPTZ DEFAULT now()
UNIQUE(user_id, skin_id)
```

### pets (addition to pets table)
```sql
equipped_skin_id       UUID REFERENCES skins(id)  -- active palette skin (nullable = default)
equipped_accessory_id  UUID REFERENCES skins(id)  -- accessory overlay (nullable = none)
```

### Rarity Tiers
- **Common** (gray): level milestones (5, 10, 20, 30, 50)
- **Uncommon** (green): streak milestones (7-day, 30-day, 100-day)
- **Rare** (blue): achievement unlocks (10/50/100 battle wins, 10/50 challenges)
- **Epic** (purple): guild war participation (1/5/10 wars)
- **Legendary** (gold): special milestones (legend stage, 500 battles, guild leader 50+ members)

### Implementation
- `PixelPet.tsx` accepts optional `skin` prop with palette + accessory + animation overrides
- Palette: `{body, eye, accent, glow}` replaces default CSS color variables per stage
- Accessory: additional CSS pixel layer rendered above pet (crown, halo, wings, etc.)
- Animation: CSS keyframe overlay (sparkle particles, flame, glitch, rainbow cycle)
- Users equip 1 palette skin + 1 accessory simultaneously (two slots)
- Skin selector UI on dashboard with live preview

## Battle System

### Stats Calculation
```
HP  = 50 + (level × 10)
ATK = 5 + (level × 2) + stage_bonus
DEF = 3 + (level × 1.5) + stage_bonus
SPD = 5 + level

Stage bonus: egg=0, baby=2, junior=5, senior=10, legend=20
```

### Turn Flow
1. Challenger initiates battle → opponent gets notification (SSE)
2. Opponent accepts → battle status = "active"
3. Each turn: both players pick action simultaneously (10s timer per turn)
4. Actions resolved in SPD order (higher speed acts first)
5. Result pushed to turns JSON array
6. Battle ends when one pet's HP ≤ 0 or 20 turn limit (higher HP wins)
7. Winner gets +50 XP, loser gets +20 XP

### Actions
| Action | Effect |
|--------|--------|
| Attack | Damage = max(1, ATK - opponent.DEF × 0.5) × random(0.8, 1.2) |
| Defend | This turn: incoming damage halved, DEF × 2 for damage calc |
| Special | Costs 20% of max HP, damage = ATK × 1.5 (ignores 50% DEF) |
| Flee | 50% base + (SPD_diff × 5)% success. If fail, lose turn. |

### Matchmaking
- Direct challenge: challenge a friend by user_id
- Random: find another player in queue (status=waiting, similar level ±5)
- Battle queue stored in DB (no Redis needed at this scale)

## Guild System

### Structure
- Create guild: costs 500 XP from pet
- Join guild: request → officer/leader approves
- Roles: leader (1), officers (max 3), members (max 50)
- Guild XP = sum of all member XP earned while in guild
- Guild level = floor(guild_xp / 5000)

### Guild Chat
- Simple message table, SSE long-polling (fetch last 50 messages, poll every 3s)
- Max 1000 chars per message
- Auto-scroll on new message

### Guild Wars
- Leader/officer schedules war with another guild (requires opponent acceptance)
- Each side selects 3-5 champions
- Best-of-N: each champion battles corresponding opponent champion
- Score: most battle wins = guild wins
- Winning guild gets +1000 guild XP, each participating champion gets +100 XP

## Friend System
- Send friend request by username
- Accept/reject requests
- Friends list shows online status (based on last activity within 5 min)
- Direct battle challenge from friends list

## API Routes

### Auth
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — get JWT cookie
- `POST /api/auth/logout` — clear cookie
- `GET /api/auth/me` — current user + pet data

### Pet
- `GET /api/pet` — get current pet state
- `PATCH /api/pet` — update pet name
- `POST /api/pet/feed` — feed pet (+hunger, +xp)
- `POST /api/pet/pet` — pet the pet (+happiness, +xp)

### GitHub
- `POST /api/github/connect` — connect GitHub username, fetch stats
- `GET /api/github/stats` — refresh GitHub stats

### Battle
- `POST /api/battles/challenge` — challenge a user
- `POST /api/battles/[id]/accept` — accept challenge
- `POST /api/battles/[id]/action` — submit turn action
- `GET /api/battles/[id]` — get battle state (SSE endpoint)
- `GET /api/battles/queue` — matchmaking queue

### Friends
- `GET /api/friends` — list friends + pending requests
- `POST /api/friends/request` — send request by username
- `POST /api/friends/[id]/accept` — accept request
- `DELETE /api/friends/[id]` — remove friend

### Guild
- `POST /api/guilds` — create guild
- `GET /api/guilds` — list guilds
- `GET /api/guilds/[id]` — guild detail
- `POST /api/guilds/[id]/join` — request to join
- `POST /api/guilds/[id]/approve` — approve member (officer/leader)
- `DELETE /api/guilds/[id]/members/[uid]` — kick member
- `PATCH /api/guilds/[id]/members/[uid]` — change role
- `GET /api/guilds/[id]/messages` — guild chat (SSE)
- `POST /api/guilds/[id]/messages` — send message

### Guild Wars
- `POST /api/guilds/[id]/wars` — schedule war
- `POST /api/guilds/[id]/wars/[wid]/accept` — accept war
- `POST /api/guilds/[id]/wars/[wid]/champions` — select champions
- `GET /api/guilds/[id]/wars/[wid]` — war status (SSE)

### Leaderboard
- `GET /api/leaderboard/global` — top 100 by level/XP
- `GET /api/leaderboard/guilds` — top guilds by XP
- `GET /api/leaderboard/battles` — top battle winners

### AI (MiMo)
- `POST /api/chat` — pet chat (SSE, proxy to MiMo V2.5 Pro)
- `POST /api/challenges/generate` — generate AI coding challenge (MiMo V2.5 Pro)

### Skins
- `GET /api/skins` — list all available skins
- `GET /api/skins/my` — list user's unlocked skins
- `POST /api/skins/equip` — equip skin `{skinId, slot: "palette"|"accessory"}`
- `POST /api/skins/unequip` — unequip skin from slot `{slot}`
- `POST /api/skins/check-unlocks` — check and grant newly earned skins

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page — hero pet, features, CTA to register | No |
| `/login` | Login form | No |
| `/register` | Registration form | No |
| `/dashboard` | Main pet dashboard — stats, feed, pet, evolution | Yes |
| `/dashboard/battles` | Battle history + challenge friends | Yes |
| `/dashboard/friends` | Friend list + requests | Yes |
| `/battle/[id]` | Battle arena — real-time turn-based combat | Yes |
| `/guild` | Browse guilds + create | Yes |
| `/guild/[id]` | Guild page — members, chat, wars | Yes |
| `/skins` | Skin gallery — browse + equip skins | Yes |
| `/leaderboard` | Global + guild leaderboards | No |

## Components (New + Modified)

### New Components
- `BattleArena.tsx` — turn-based battle UI (action buttons, HP bars, battle log)
- `BattleQueue.tsx` — matchmaking status display
- `FriendList.tsx` — friends + pending requests
- `GuildList.tsx` — browse/search guilds
- `GuildDetail.tsx` — guild page (members, chat, wars)
- `GuildChat.tsx` — real-time guild chat
- `GuildWarScheduler.tsx` — schedule/manage guild wars
- `GuildWarView.tsx` — watch guild war progress
- `Leaderboard.tsx` — rewrite with real DB data (replace mock)
- `AuthForm.tsx` — login/register form
- `SkinSelector.tsx` — skin picker grid with rarity badges + equip buttons
- `SkinPreview.tsx` — miniature live pet preview with skin applied

### Modified Components
- `PetChat.tsx` — MiMo AI pet chat with project showcase labels
- `Challenge.tsx` — MiMo AI challenges + guild challenge mode
- `dashboard/page.tsx` — add tabs for battles, friends, guild, skins

### Preserved Components (minimal changes)
- `PixelPet.tsx` — extend with skin prop (palette/accessory/animation overrides)
- `XPBar.tsx` — keep as-is
- `MoodBadge.tsx` — keep as-is
- `StatCard.tsx` — keep as-is
- `ActivityFeed.tsx` — add new activity types
- `Achievements.tsx` — add battle/guild achievements
- `EvolutionTimeline.tsx` — keep as-is

## Project Structure

```
/var/www/codepet/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                    # Landing
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard
│   │   ├── battles/page.tsx
│   │   └── friends/page.tsx
│   ├── battle/[id]/page.tsx        # Battle arena
│   ├── guild/
│   │   ├── page.tsx                # Guild list
│   │   └── [id]/page.tsx           # Guild detail
│   ├── leaderboard/page.tsx
│   ├── skins/page.tsx             # Skin gallery + equip
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── pet/route.ts
│       ├── github/
│       │   ├── connect/route.ts
│       │   └── stats/route.ts
│       ├── battles/
│       │   ├── challenge/route.ts
│       │   ├── queue/route.ts
│       │   └── [id]/
│       │       ├── route.ts        # GET (SSE)
│       │       ├── accept/route.ts
│       │       └── action/route.ts
│       ├── friends/
│       │   ├── route.ts            # GET list, POST request
│       │   └── [id]/
│       │       ├── accept/route.ts
│       │       └── route.ts        # DELETE
│       ├── guilds/
│       │   ├── route.ts            # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts        # GET detail
│       │       ├── join/route.ts
│       │       ├── approve/route.ts
│       │       ├── messages/route.ts
│       │       ├── members/[uid]/route.ts
│       │       └── wars/
│       │           ├── route.ts    # POST schedule
│       │           └── [wid]/
│       │               ├── route.ts
│       │               ├── accept/route.ts
│       │               └── champions/route.ts
│       ├── leaderboard/
│       │   ├── global/route.ts
│       │   ├── guilds/route.ts
│       │   └── battles/route.ts
│       ├── chat/route.ts           # Pet chat (SSE → MiMo V2.5 Pro)
│       ├── challenges/
│       │   └── generate/route.ts
│       └── skins/
│           ├── route.ts            # GET all skins, GET my skins
│           ├── equip/route.ts
│           ├── unequip/route.ts
│           └── check-unlocks/route.ts
├── components/
│   ├── PixelPet.tsx
│   ├── XPBar.tsx
│   ├── MoodBadge.tsx
│   ├── StatCard.tsx
│   ├── ActivityFeed.tsx
│   ├── Achievements.tsx
│   ├── EvolutionTimeline.tsx
│   ├── PetChat.tsx
│   ├── Challenge.tsx
│   ├── BattleArena.tsx
│   ├── BattleQueue.tsx
│   ├── FriendList.tsx
│   ├── GuildList.tsx
│   ├── GuildDetail.tsx
│   ├── GuildChat.tsx
│   ├── GuildWarScheduler.tsx
│   ├── GuildWarView.tsx
│   ├── Leaderboard.tsx
│   ├── AuthForm.tsx
│   ├── SkinSelector.tsx
│   └── SkinPreview.tsx
├── lib/
│   ├── pet.ts                      # Pet state management (adapted from original)
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # JWT sign/verify, middleware
│   ├── ai.ts                       # MiMo AI client (pet chat + challenges, OpenAI-compatible)
│   └── github.ts                   # GitHub API client
├── prisma/
│   └── schema.prisma               # Full database schema
├── docs/
│   └── superpowers/specs/
│       └── 2026-05-22-codepet-multiplayer-design.md  # This file
├── public/
│   └── fonts/                      # Press Start 2P, JetBrains Mono (self-hosted)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── .env.example
```

## Environment Variables

```env
DATABASE_URL=postgresql://codepet:***@localhost:5432/codepet
JWT_SECRET=<random-32-chars>
# MiMo AI — OpenAI-compatible endpoint (public or self-hosted)
AI_ENDPOINT=https://api.mimo.ai/v1    # or http://127.0.0.1:20128/v1 for 9router gateway
AI_API_KEY=<mimo-or-9router-key>
AI_MODEL=MiMo-V2.5-Pro
GITHUB_TOKEN=<optional, for higher rate limits>
```

## Deployment

1. PostgreSQL: create `codepet` database + user
2. Prisma: `npx prisma db push` (or migrate)
3. Build: `npm run build`
4. Systemd: `codepet.service` on port 3000
5. Nginx: reverse proxy for `codepet.reihan.site`
6. Cloudflared: add ingress for `codepet.reihan.site`

## Migration from Original

| Original Feature | Status | Notes |
|-----------------|--------|-------|
| Pixel pet CSS art | ✅ Keep | Copy PixelPet.tsx + globals.css as-is |
| 5 evolution stages | ✅ Keep | Add HP/ATK/DEF/SPD stats |
| Feed/Pet actions | ✅ Keep | Move to DB-backed API |
| AI challenges | ✅ Keep | Branded as MiMo V2.5 Pro (OpenAI-compatible API) |
| Pet chat | ✅ Keep | Branded as MiMo V2.5 Pro (OpenAI-compatible API) |
| Leaderboard | ❌ Replace | DB-backed real data |
| GitHub connect | ✅ Keep | Add bonus XP system |
| localStorage | ❌ Replace | All state in PostgreSQL |
| Landing page | ✅ Adapt | Add register/login CTAs |
| Achievements | ✅ Extend | Add battle/guild achievements |

### New in This Version
- Battle system (1v1 turn-based PvP)
- Friend list + direct challenges
- Guild system (create, join, chat, wars)
- Pet skins (CSS palette swap + accessories, 5 rarity tiers)
- MiMo V2.5 Pro AI integration (pet chat + coding challenges)
- Real DB-backed leaderboard
- JWT auth system

## Out of Scope (YAGNI)

- Real-time WebSocket (SSE polling sufficient at this scale)
- Redis (PostgreSQL + polling sufficient for <1000 concurrent users)
- Mobile app (responsive web is enough)
- Payment/monetization
- Email verification (add later if spam is a problem)
- Password reset (add later)
