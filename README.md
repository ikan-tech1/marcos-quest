# Marco's Quest

A next-gen Mario-style platformer built with **Phaser 4**, **React**, and **TypeScript**. Features double jump, dash trails, combo scoring, moving platforms, and a polished 3D glass UI shell.

**[Play Live](https://marcos-quest.vercel.app)** *(after deploy)*

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
- **3D perspective cabinet** — mouse-tilt game stage with CSS depth
- **Glassmorphism** panels, animated grid floor, floating orbs
- **Press Start 2P** retro typography + Space Grotesk body font

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
├── App.tsx              # React shell + Phaser mount
├── game/                # (Phaser scenes in scenes/)
├── ui/                  # React overlays (Menu, HUD, GameOver)
├── entities/            # Player, Enemy, MovingPlatform, Projectile
├── systems/             # Input, Audio, GameState, GameBridge
├── levels/              # Level data + builder
└── styles/global.css    # 3D UI design system
```

## License

Original code and assets. Gameplay inspired by classic platformers; no Nintendo IP used.
