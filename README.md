# Eashan's Quest

A next-gen Mario-style platformer built with **Phaser 4**, **React**, and **TypeScript**. Features double jump, dash trails, combo scoring, moving platforms, and a mushroom-kingdom landing page with parallax clouds, hills, and a golden coin start button.

**[Play Live](https://mario-two-lyart.vercel.app)**

## Features

### Gameplay
- **4 worlds** — progressive difficulty with gaps, moving platforms, and enemy gauntlets
- **Double jump** with sparkle VFX and coyote time / jump buffer
- **Wall slide & wall jump**, **dash** with ghost trails
- **Run animations** — leg-cycle sprites when moving on ground
- **Combo system** — chain stomps for up to 4× score multiplier
- **Moving platforms** on all levels
- **Power-ups** — Spark Capsule, Blaze Orb, Star Fragment (triple jump!)
- **Enemies** — Walkers (ledge-aware), Shells (kickable), Flyers
- **Level select** — unlock worlds as you progress; replay any unlocked stage

### Frontend
- **React UI overlay** — menu, HUD, pause, level clear, game over
- **Pause menu** — resume, restart, sound toggle, quit (Esc / P)
- **High score** — persisted in localStorage with new-record celebration
- **Mobile touch controls** — on-screen D-pad, jump, dash, and fire on touch devices
- **Mushroom-kingdom landing page** — sky, drifting clouds, green hills, grass/dirt ground strip
- **Crisp pixel rendering** — Phaser integer zoom only (no CSS canvas scaling)

## Controls

| Input | Action |
|-------|--------|
| Arrow Keys / A D | Move |
| Space / W | Jump (press twice for double jump) |
| Shift / K | Dash |
| Z / J | Fire (with Blaze power) |
| Esc / P | Pause |
| Enter / Click | Start / confirm |

On mobile, use the on-screen touch buttons.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Build & Deploy

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
vercel --prod    # deploy to production
```

Deploys automatically to **Vercel** via GitHub integration.

## Tech Stack

- [Phaser 4](https://phaser.io) — game engine
- [React 19](https://react.dev) — UI overlays
- [Vite 8](https://vite.dev) — build tool
- [Vercel](https://vercel.com) — hosting

## Project Structure

```
src/
├── App.tsx              # React shell + Phaser mount + world background
├── ui/                  # React overlays (Menu, HUD, Pause, GameOver, Touch)
├── entities/            # Player, Enemy, MovingPlatform, Projectile
├── systems/             # Input, Audio, GameState, Storage, GameBridge
├── levels/              # Level data + builder
└── styles/global.css    # Platformer world + UI design system
```

## License

Original code and assets. Gameplay inspired by classic platformers; no Nintendo IP used.
