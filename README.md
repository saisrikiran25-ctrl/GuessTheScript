# Guess the Script 🎬

> Pick the match narrative before kickoff. See if football agrees.

A World Cup 2026 knockout-stage prediction game built around **narrative prediction** — not scorelines. Players predict the *story* of the match before kickoff, then score points based on how closely reality follows their script.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

## Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Admin key default: `gts_admin_2026`

---

## Project Structure

```
src/
├── types/          # TypeScript interfaces
├── data/           # Match fixtures, scripts, badges, mock leaderboard
├── engine/         # Scoring, resolution, badge logic
├── store/          # React context stores (player, match)
├── utils/          # Storage, formatting, analytics, share card
├── styles/         # Global CSS + animations
├── components/
│   ├── ui/         # Button, Card, Badge, Toast, Modal, Skeleton...
│   ├── match/      # MatchCard
│   ├── prediction/ # ScriptCard, SidePredictionChip
│   ├── layout/     # BottomNav, ScreenHeader
├── screens/        # All page-level screens
├── App.tsx
├── Router.tsx
└── main.tsx
```

---

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Onboarding | `/welcome` | 3-slide intro + name input |
| Home | `/` | Match hub with 3 fixture cards |
| Match Detail | `/match/:id` | Match hub with CTA/locked/result state |
| Prediction | `/match/:id/predict` | 3-step: script → side preds → confirm |
| Results | `/match/:id/result` | Cinematic score reveal + share |
| Leaderboard | `/leaderboard` | Tournament + per-match boards |
| Profile | `/profile` | Badges, history, stats |
| Admin | `/admin` | Match resolution (key: `gts_admin_2026`) |

---

## Game Logic

### Scripts
9 narrative scripts across 4 families:
- **A: Tempo & Control** — Cagey, Fast Start, Dominant
- **B: Drama & Chaos** — Explosive Finish, Card-Heavy, Comeback
- **C: Deadline Drama** — Late Winner, Extra Time
- **D: Shootout** — Penalties

### Scoring (max 185 pts per match)
- Exact script match: **100 pts**
- Correct family: **40 pts**
- Partial: **15 pts**
- Dimension bonuses (4x): **+10 pts each**
- Side predictions (2x): **+15 pts each**
- Perfect bonus: **+25 pts**

### Admin: Resolving a Match

1. Navigate to `/admin`
2. Enter admin key (`gts_admin_2026`)
3. Select a match
4. Enter match stats (goal times, cards, ET, penalties)
5. Click **Resolve Match**
6. Players can now view results at `/match/:id/result`

---

## Deployment (Vercel)

```bash
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

Set environment variables:
- `VITE_ADMIN_KEY` — your chosen admin password

---

## V1.1 Roadmap

- [ ] Supabase backend for real multi-user leaderboard
- [ ] Real football API (API-Football) for live resolution
- [ ] Auth (Magic Link + Google OAuth)
- [ ] Halftime script revision
- [ ] Named friend groups
- [ ] Push notifications
- [ ] Halftime checkpoint reveals

---

Built with React + TypeScript + Vite. Dark mode only. Mobile-first.
