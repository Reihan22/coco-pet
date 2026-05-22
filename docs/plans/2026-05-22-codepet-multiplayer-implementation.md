# CodePet Multiplayer Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build CodePet as a Next.js 16 full-stack multiplayer pet game with PostgreSQL persistence, MiMo-branded AI, turn-based battles, guilds, friends, skins, and leaderboard.

**Architecture:** Single Next.js App Router monolith deployed on VPS via systemd + nginx. PostgreSQL 16 stores all game/auth/social state through Prisma. Reuse original CodePet UI/pixel components from `/tmp/codepet-study`, but replace `localStorage` with DB-backed APIs.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Prisma, PostgreSQL 16, bcryptjs, jose, Zod, MiMo/OpenAI-compatible AI endpoint via configurable `.env`.

**Design Spec:** `/var/www/codepet/docs/superpowers/specs/2026-05-22-codepet-multiplayer-design.md`

---

## Phase 0 — Scaffold + Baseline

### Task 0.1: Create Next.js 16 project scaffold

**Objective:** Create clean app skeleton at `/var/www/codepet` without overwriting docs.

**Files:**
- Create/verify: `/var/www/codepet/package.json`
- Create/verify: `/var/www/codepet/app/layout.tsx`
- Create/verify: `/var/www/codepet/app/page.tsx`
- Create/verify: `/var/www/codepet/app/globals.css`

**Steps:**
1. Backup existing docs if needed: `mkdir -p /tmp/codepet-docs-backup && cp -a /var/www/codepet/docs /tmp/codepet-docs-backup/`
2. Scaffold into temp dir:
   ```bash
   cd /var/www
   npx create-next-app@latest codepet-new --ts --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm
   ```
3. Move scaffold files into `/var/www/codepet`, preserving `docs/`.
4. Verify files:
   ```bash
   cd /var/www/codepet
   npm run lint
   npm run build
   ```
5. Expected: lint/build pass.

### Task 0.2: Install backend dependencies

**Objective:** Add DB/auth/validation packages.

**Files:**
- Modify: `/var/www/codepet/package.json`

**Command:**
```bash
cd /var/www/codepet
npm install @prisma/client prisma bcryptjs jose zod
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Verify:**
```bash
npm ls @prisma/client prisma bcryptjs jose zod
```

### Task 0.3: Add environment template

**Objective:** Document required runtime envs.

**Files:**
- Create: `/var/www/codepet/.env.example`
- Create: `/var/www/codepet/.env`

**Content:**
```env
DATABASE_URL=postgresql://codepet:PASSWORD@localhost:5432/codepet
JWT_SECRET=replace-with-32-plus-random-chars
AI_ENDPOINT=http://127.0.0.1:20128/v1
AI_API_KEY=replace-with-9router-or-mimo-key
AI_MODEL=MiMo-V2.5-Pro
GITHUB_TOKEN=
NEXT_PUBLIC_APP_NAME=CodePet
NEXT_PUBLIC_AI_LABEL=Xiaomi MiMo V2.5 Pro
```

**Verify:** `.env` exists and is gitignored.

### Task 0.4: Create PostgreSQL DB/user

**Objective:** Prepare DB for Prisma.

**Command:**
```bash
sudo -u postgres psql <<'SQL'
CREATE USER codepet WITH PASSWORD 'CHANGE_ME_STRONG';
CREATE DATABASE codepet OWNER codepet;
GRANT ALL PRIVILEGES ON DATABASE codepet TO codepet;
SQL
```

**Verify:**
```bash
psql postgresql://codepet:CHANGE_ME_STRONG@localhost:5432/codepet -c 'select 1;'
```

---

## Phase 1 — Prisma Schema + Seed

### Task 1.1: Initialize Prisma

**Objective:** Add Prisma config.

**Files:**
- Create: `/var/www/codepet/prisma/schema.prisma`
- Create: `/var/www/codepet/lib/prisma.ts`

**Command:**
```bash
cd /var/www/codepet
npx prisma init
```

**`lib/prisma.ts`:**
```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Task 1.2: Define core Prisma models

**Objective:** Add users, pets, battles, friends, guilds, skins, activities.

**Files:**
- Modify: `/var/www/codepet/prisma/schema.prisma`

**Models:**
- `User`
- `Pet`
- `Battle`
- `Friendship`
- `Guild`
- `GuildMember`
- `GuildWar`
- `GuildMessage`
- `Skin`
- `UserSkin`
- `Activity`

**Acceptance:** schema matches design spec tables and includes indexes/relations.

**Verify:**
```bash
npx prisma validate
npx prisma db push
npx prisma generate
```

### Task 1.3: Seed starter skins

**Objective:** Create default/common/rare skins for testing.

**Files:**
- Create: `/var/www/codepet/prisma/seed.ts`
- Modify: `/var/www/codepet/package.json` (`prisma.seed`)

**Seed skins:**
- Default Cyan (common, level 1)
- Sakura Pink (common, level 5)
- Matrix Green (uncommon, streak 7)
- Battle Scarred (rare, 10 wins)
- Guild Crown (epic, guild war 1)
- Legend Gold (legendary, legend stage)

**Verify:**
```bash
npx prisma db seed
npx prisma studio
```

---

## Phase 2 — Auth

### Task 2.1: Create auth utility

**Objective:** Hash passwords, sign/verify JWT, read current user.

**Files:**
- Create: `/var/www/codepet/lib/auth.ts`

**Functions:**
- `hashPassword(password)`
- `verifyPassword(password, hash)`
- `signSession(userId)`
- `verifySession(token)`
- `getCurrentUser()`
- `requireUser()`

**Verify:** add quick Vitest unit tests for hash + JWT.

### Task 2.2: Register API

**Objective:** Create account + default pet + default skin unlock.

**Files:**
- Create: `/var/www/codepet/app/api/auth/register/route.ts`

**Behavior:**
- Validate username/email/password with Zod
- Reject duplicate username/email
- Hash password
- Create user + pet in transaction
- Grant default skin if seeded
- Set httpOnly session cookie

**Verify:**
```bash
curl -i -X POST http://127.0.0.1:3000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"username":"rey","email":"rey@example.com","password":"password123"}'
```

### Task 2.3: Login/logout/me APIs

**Objective:** Finish basic session flow.

**Files:**
- Create: `/var/www/codepet/app/api/auth/login/route.ts`
- Create: `/var/www/codepet/app/api/auth/logout/route.ts`
- Create: `/var/www/codepet/app/api/auth/me/route.ts`

**Verify:** register → logout → login → `/api/auth/me` returns user + pet.

### Task 2.4: Auth UI pages

**Objective:** Build `/login` and `/register`.

**Files:**
- Create: `/var/www/codepet/components/AuthForm.tsx`
- Create: `/var/www/codepet/app/login/page.tsx`
- Create: `/var/www/codepet/app/register/page.tsx`

**Verify:** browser register/login redirects to `/dashboard`.

---

## Phase 3 — Port Original UI + Pet System

### Task 3.1: Copy visual foundation from original

**Objective:** Preserve CodePet aesthetic.

**Files:**
- Copy/adapt: `/tmp/codepet-study/app/globals.css` → `/var/www/codepet/app/globals.css`
- Copy/adapt components:
  - `PixelPet.tsx`
  - `XPBar.tsx`
  - `MoodBadge.tsx`
  - `StatCard.tsx`
  - `ActivityFeed.tsx`
  - `Achievements.tsx`
  - `EvolutionTimeline.tsx`

**Verify:** app renders without TS errors.

### Task 3.2: Create DB-backed pet library

**Objective:** Move pet calculations into reusable server-safe functions.

**Files:**
- Create/modify: `/var/www/codepet/lib/pet.ts`

**Functions:**
- `calculateLevel(xp)`
- `calculateStage(level)`
- `calculateStats(level, stage)`
- `awardXp(userId, amount, reason)`
- `checkEvolution(pet)`

**Verify:** Vitest unit tests for level/stage/stats.

### Task 3.3: Pet API routes

**Objective:** Feed/pet/update state in DB.

**Files:**
- Create: `/var/www/codepet/app/api/pet/route.ts`
- Create: `/var/www/codepet/app/api/pet/feed/route.ts`
- Create: `/var/www/codepet/app/api/pet/pet/route.ts`

**Verify:** authenticated curl calls mutate DB and create activities.

### Task 3.4: Dashboard page

**Objective:** Replace localStorage dashboard with DB API fetch.

**Files:**
- Create/modify: `/var/www/codepet/app/dashboard/page.tsx`

**UI:**
- Pet card
- Stats cards
- Feed/Pet buttons
- Activity feed
- Tabs/links: battles, friends, guild, skins

**Verify:** dashboard works after login.

---

## Phase 4 — MiMo AI Integration

### Task 4.1: Create MiMo AI client

**Objective:** OpenAI-compatible wrapper with MiMo branding.

**Files:**
- Create: `/var/www/codepet/lib/ai.ts`

**Behavior:**
- Reads `AI_ENDPOINT`, `AI_API_KEY`, `AI_MODEL`
- Sends chat completions request
- Supports streaming text where possible
- UI text always says MiMo / Xiaomi MiMo V2.5 Pro

### Task 4.2: Pet chat API + component

**Objective:** MiMo-powered pet chat.

**Files:**
- Create: `/var/www/codepet/app/api/chat/route.ts`
- Copy/adapt: `/tmp/codepet-study/components/PetChat.tsx`

**Verify:** chat response streams/returns text and displays `Powered by Xiaomi MiMo V2.5 Pro`.

### Task 4.3: AI challenge API + component

**Objective:** MiMo-generated coding challenges.

**Files:**
- Create: `/var/www/codepet/app/api/challenges/generate/route.ts`
- Copy/adapt: `/tmp/codepet-study/components/Challenge.tsx`

**Verify:** generate challenge from dashboard, award XP after completion.

---

## Phase 5 — Pet Skins

### Task 5.1: Extend PixelPet with skin prop

**Objective:** Add palette/accessory/animation overrides without breaking original art.

**Files:**
- Modify: `/var/www/codepet/components/PixelPet.tsx`

**Props:**
```ts
type PetSkin = {
  palette?: { body?: string; eye?: string; accent?: string; glow?: string };
  accessory?: string | null;
  animation?: string | null;
};
```

**Verify:** default pet unchanged; passing Sakura/Gold palette changes colors.

### Task 5.2: Skin APIs

**Objective:** List owned skins and equip/unequip.

**Files:**
- Create: `/var/www/codepet/app/api/skins/route.ts`
- Create: `/var/www/codepet/app/api/skins/my/route.ts`
- Create: `/var/www/codepet/app/api/skins/equip/route.ts`
- Create: `/var/www/codepet/app/api/skins/unequip/route.ts`
- Create: `/var/www/codepet/app/api/skins/check-unlocks/route.ts`

**Verify:** authenticated user can equip seeded skin.

### Task 5.3: Skin UI

**Objective:** Build skin gallery and preview.

**Files:**
- Create: `/var/www/codepet/components/SkinSelector.tsx`
- Create: `/var/www/codepet/components/SkinPreview.tsx`
- Create: `/var/www/codepet/app/skins/page.tsx`

**Verify:** `/skins` shows locked/unlocked skins, preview, equip buttons.

---

## Phase 6 — Friends

### Task 6.1: Friend APIs

**Objective:** Request/accept/remove friends.

**Files:**
- Create: `/var/www/codepet/app/api/friends/route.ts`
- Create: `/var/www/codepet/app/api/friends/[id]/accept/route.ts`
- Create: `/var/www/codepet/app/api/friends/[id]/route.ts`

**Rules:**
- No self-friend
- No duplicate pending/accepted edge cases
- Friend status includes `pending`, `accepted`, `blocked`

### Task 6.2: Friend UI

**Objective:** Manage friends and pending requests.

**Files:**
- Create: `/var/www/codepet/components/FriendList.tsx`
- Create: `/var/www/codepet/app/dashboard/friends/page.tsx`

**Verify:** user A can request user B, user B accepts, both see accepted.

---

## Phase 7 — Battles

### Task 7.1: Battle calculation library

**Objective:** Deterministic turn resolver.

**Files:**
- Create: `/var/www/codepet/lib/battle.ts`

**Functions:**
- `createInitialBattleState()`
- `resolveTurn(playerAAction, playerBAction, pets)`
- `calculateDamage(action, attacker, defender)`
- `determineWinner(state)`

**Tests:**
- Attack damage respects DEF
- Defend halves damage
- Special costs HP and ignores 50% DEF
- Flee uses SPD diff
- 20-turn limit winner = higher HP

### Task 7.2: Battle APIs

**Objective:** Challenge/accept/action/state.

**Files:**
- Create: `/var/www/codepet/app/api/battles/challenge/route.ts`
- Create: `/var/www/codepet/app/api/battles/queue/route.ts`
- Create: `/var/www/codepet/app/api/battles/[id]/route.ts`
- Create: `/var/www/codepet/app/api/battles/[id]/accept/route.ts`
- Create: `/var/www/codepet/app/api/battles/[id]/action/route.ts`

**Verify:** two users can complete one full battle via curl.

### Task 7.3: Battle UI

**Objective:** Real-time-ish arena.

**Files:**
- Create: `/var/www/codepet/components/BattleArena.tsx`
- Create: `/var/www/codepet/components/BattleQueue.tsx`
- Create: `/var/www/codepet/app/battle/[id]/page.tsx`
- Create: `/var/www/codepet/app/dashboard/battles/page.tsx`

**Verify:** challenge friend → accept → choose actions → battle ends → XP awarded.

---

## Phase 8 — Guilds + Chat

### Task 8.1: Guild APIs

**Objective:** Create/list/detail/join/approve/manage members.

**Files:**
- Create: `/var/www/codepet/app/api/guilds/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/join/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/approve/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/members/[uid]/route.ts`

**Rules:**
- Create guild costs 500 pet XP
- One guild per user
- Max 50 members
- Roles: leader/officer/member

### Task 8.2: Guild chat APIs

**Objective:** DB-backed guild messages with polling/SSE.

**Files:**
- Create: `/var/www/codepet/app/api/guilds/[id]/messages/route.ts`

**Verify:** members can post/read; non-members denied.

### Task 8.3: Guild UI

**Objective:** Browse guilds, create/join, chat.

**Files:**
- Create: `/var/www/codepet/components/GuildList.tsx`
- Create: `/var/www/codepet/components/GuildDetail.tsx`
- Create: `/var/www/codepet/components/GuildChat.tsx`
- Create: `/var/www/codepet/app/guild/page.tsx`
- Create: `/var/www/codepet/app/guild/[id]/page.tsx`

**Verify:** create guild, join request, approve, chat.

---

## Phase 9 — Guild Wars

### Task 9.1: Guild war APIs

**Objective:** Schedule/accept/select champions/status.

**Files:**
- Create: `/var/www/codepet/app/api/guilds/[id]/wars/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/wars/[wid]/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/wars/[wid]/accept/route.ts`
- Create: `/var/www/codepet/app/api/guilds/[id]/wars/[wid]/champions/route.ts`

**Rules:**
- Only leader/officer schedule/accept
- 3-5 champions each side
- Best-of-N scoring
- Winning guild +1000 XP, champions +100 XP

### Task 9.2: Guild war UI

**Objective:** Schedule and view guild wars.

**Files:**
- Create: `/var/www/codepet/components/GuildWarScheduler.tsx`
- Create: `/var/www/codepet/components/GuildWarView.tsx`

**Verify:** two guilds can schedule and accept a war.

---

## Phase 10 — Leaderboards + Landing

### Task 10.1: Leaderboard APIs

**Objective:** Real DB-backed rankings.

**Files:**
- Create: `/var/www/codepet/app/api/leaderboard/global/route.ts`
- Create: `/var/www/codepet/app/api/leaderboard/guilds/route.ts`
- Create: `/var/www/codepet/app/api/leaderboard/battles/route.ts`

**Verify:** rankings reflect DB users/guilds/battles.

### Task 10.2: Leaderboard UI

**Objective:** Replace mock leaderboard.

**Files:**
- Modify/Create: `/var/www/codepet/components/Leaderboard.tsx`
- Create: `/var/www/codepet/app/leaderboard/page.tsx`

**Verify:** page shows global/guild/battle tabs.

### Task 10.3: Landing page

**Objective:** Showcase project for Xiaomi submission.

**Files:**
- Modify: `/var/www/codepet/app/page.tsx`

**Must include:**
- `Powered by Xiaomi MiMo V2.5 Pro`
- AI pet chat demo copy
- AI coding challenge feature copy
- Multiplayer battles/guilds/skins feature cards
- Register/login CTA

**Verify:** unauthenticated homepage looks polished.

---

## Phase 11 — Hardening + Deploy

### Task 11.1: Add auth guards and validation pass

**Objective:** Ensure protected APIs/pages require login.

**Check:**
- All mutating APIs call `requireUser()`
- Zod validation on JSON body
- No password_hash returned to client
- Guild/battle/friend permissions enforced

### Task 11.2: Build verification

**Objective:** Ensure production build passes.

**Command:**
```bash
cd /var/www/codepet
npm run lint
npm run build
npx prisma validate
```

### Task 11.3: Create systemd service

**Objective:** Run app as service.

**File:** `/etc/systemd/system/codepet.service`

**Service:**
```ini
[Unit]
Description=CodePet Next.js App
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=/var/www/codepet
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
```

**Verify:**
```bash
systemctl daemon-reload
systemctl enable --now codepet
systemctl status codepet --no-pager
curl -I http://127.0.0.1:3000
```

### Task 11.4: Nginx + cloudflared route

**Objective:** Publish `codepet.reihan.site`.

**Files:**
- Create: `/etc/nginx/sites-available/codepet.reihan.site`
- Symlink: `/etc/nginx/sites-enabled/codepet.reihan.site`
- Modify cloudflared config if needed

**Verify:**
```bash
nginx -t
systemctl reload nginx
curl -I https://codepet.reihan.site
```

---

## Execution Strategy

Parallelizable after Phase 0-3:
- Agent A: Auth + pet core
- Agent B: Battle/friends
- Agent C: Guild/guild wars
- Agent D: Skins + MiMo UI polish

Hard dependency order:
1. Scaffold + Prisma + auth
2. Pet DB-backed dashboard
3. Then battles/friends/guilds/skins/AI can branch
4. Final integration + deploy

## Acceptance Criteria

- User can register/login/logout.
- User gets persistent pet stored in PostgreSQL.
- Pet feed/pet/chat/challenge work without localStorage.
- UI shows MiMo branding (`Xiaomi MiMo V2.5 Pro`) on AI features.
- User can unlock/equip pet skins.
- User can add friends and challenge friend to turn-based battle.
- Battle resolves correctly, awards XP, records activity.
- User can create/join guild, chat, schedule guild war.
- Leaderboards use real DB data.
- Production build passes.
- App deployed behind `codepet.reihan.site`.
