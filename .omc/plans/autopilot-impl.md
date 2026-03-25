# FocusRoom MVP — Implementation Plan

## Source Documents
- Design: `/DATA3/users/mj/focusroom/docs/vaiv-no-branch-design-20260324-172100.md`
- DESIGN.md: `/DATA3/users/mj/focusroom/DESIGN.md`
- CEO Plan: `/DATA3/users/mj/focusroom/docs/ceo-plans/2026-03-24-focusroom-mvp.md`

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Supabase (email auth + anonymous auth + Postgres + Realtime Presence)
- @dicebear/core + @dicebear/collection (adventurer-neutral)
- Vercel deploy target
- PostHog analytics
- next-pwa for PWA support

## Task Breakdown

### Group A: Scaffolding (sequential, must be first)
- A1: `create-next-app` with TypeScript + App Router
- A2: Install deps (supabase, dicebear, posthog, next-pwa, canvas-confetti)
- A3: Configure tailwind with DESIGN.md tokens (colors, fonts, spacing, radius)
- A4: Set up font loading (Fraunces, Plus Jakarta Sans, Pretendard, Geist Mono)
- A5: Global layout with grain texture overlay + time-based background
- A6: Git init + initial commit

### Group B: Database & Auth (sequential after A)
- B1: Supabase types + client setup (`lib/supabase.ts`)
- B2: SQL schema: `profiles`, `sessions` tables
- B3: Auth helpers: guest login, email signup, session check, guest→email conversion
- B4: Middleware: auto-login redirect logic

### Group C: Shared Components (parallel after A)
- C1: `<Avatar />` — @dicebear/core wrapper, fallback to initials
- C2: `<Timer />` — Geist Mono, countdown from started_at+duration, urgent state
- C3: `<Button />` — Primary, Secondary, Ghost, Accent variants
- C4: `<Input />` — Warm focus ring, placeholder style
- C5: `<TimeChip />` — 25/50/90min selector chips
- C6: `<Toast />` — Bottom center, slide-up, auto-dismiss
- C7: `<OnlineBadge />` — "●12명이 지금 집중 중" with live count

### Group D: Screens (parallel after B+C)
- D1: Auth screen (`/`) — guest CTA + email signup + online count
- D2: Entry screen (`/entry`) — task input + time select + online count + CTA
- D3: Room screen (`/room`) — sticky timer bar + avatar grid + ambient sound
- D4: Result screen (`/result`) — completion/timeout + history + share + email upsell

### Group E: Features (parallel after D)
- E1: NPC logic — dynamic scaling, random tasks/timers, enter/exit animation
- E2: Ambient sound — cafe sounds, volume proportional to user count, toggle
- E3: Room entry sequence — 1.5s multi-sensory timeline
- E4: Session end sequences — confetti (complete) / darkening (timeout)
- E5: PWA manifest + service worker + offline banner
- E6: PostHog events (6 events + identification)
- E7: Share card generation (canvas → image → Web Share API)

### Group F: Edge Functions
- F1: Session expiry cron (1-min interval, server-side timeout)

## Parallelization Strategy
```
A (sequential) → B (sequential) ─┐
                                  ├→ D (4 screens in parallel) → E (features in parallel) → F
A (sequential) → C (parallel) ───┘
```

## File Structure
```
focusroom/
├── app/
│   ├── layout.tsx          # Global layout, fonts, grain, time-bg
│   ├── page.tsx            # Auth screen
│   ├── entry/page.tsx      # Entry screen
│   ├── room/page.tsx       # Room screen
│   └── result/page.tsx     # Result screen
├── components/
│   ├── Avatar.tsx
│   ├── Timer.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── TimeChip.tsx
│   ├── Toast.tsx
│   ├── OnlineBadge.tsx
│   ├── AvatarGrid.tsx
│   ├── TimerBar.tsx
│   └── SessionHistory.tsx
├── lib/
│   ├── supabase.ts         # Client + types
│   ├── auth.ts             # Auth helpers
│   ├── npc.ts              # NPC logic
│   ├── sound.ts            # Ambient sound manager
│   ├── posthog.ts          # PostHog setup
│   └── time-bg.ts          # Time-based background
├── hooks/
│   ├── useTimer.ts
│   ├── usePresence.ts
│   ├── useSession.ts
│   └── useTimeBackground.ts
├── public/
│   ├── manifest.json
│   ├── sounds/
│   │   └── cafe-ambient.mp3
│   └── icons/
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── DESIGN.md
├── CLAUDE.md
└── docs/
```
