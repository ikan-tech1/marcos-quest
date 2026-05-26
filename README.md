# Eashan's Quest

A next-gen Mario-style platformer built with **Phaser 4**, **React**, and **TypeScript**. Features double jump, dash trails, combo scoring, moving platforms, and a mushroom-kingdom landing page with parallax clouds, hills, and a golden coin start button.

**[Play Live](https://mario-two-lyart.vercel.app)**

## Features

### Gameplay
- **Double jump** with sparkle VFX and coyote time / jump buffer
- **Wall slide & wall jump**, **dash** with ghost trails
- **Combo system** — chain stomps for up to 4× score multiplier
- **Moving platforms** on all 3 levels
- **Power-ups** — Spark Capsule, Blaze Orb, Star Fragment (triple jump!)
- **Enemies** — Walkers, Shells, Flyers

### Frontend
- **React UI overlay** — menu, HUD, level clear, game over
- **Mushroom-kingdom landing page** — sky, drifting clouds, green hills, grass/dirt ground strip
- **Decorative world elements** — bobbing coins, question blocks, brick blocks, pipe (CSS-only)
- **Portal-style game cabinet** — wooden frame with gold trim, mouse-tilt 3D stage
- **Golden coin START GAME button** with pixel-art Press Start 2P typography

## Controls

| Input | Action |
|-------|--------|
| Arrow Keys / A D | Move |
| Space / W | Jump (press twice for double jump) |
| Shift / K | Dash |
| Z / J | Fire (with Blaze power) |
| Enter / Click | Start / confirm |

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
├── game/                # (Phaser scenes in scenes/)
├── ui/                  # React overlays (Menu, HUD, GameOver)
├── entities/            # Player, Enemy, MovingPlatform, Projectile
├── systems/             # Input, Audio, GameState, GameBridge
├── levels/              # Level data + builder
└── styles/global.css    # Platformer world + UI design system
```

## License

Original code and assets. Gameplay inspired by classic platformers; no Nintendo IP used.
