# Eashan's Quest

A next-gen Mario-style platformer built with **Phaser 4**, **React**, and **TypeScript**. Features double jump, dash trails, combo scoring, moving platforms, warp pipes, flag-pole finishes, and a mushroom-kingdom landing page with parallax clouds, hills, and a golden coin start button.

**[Play Live](https://mario-two-lyart.vercel.app)**

## Features

### Gameplay
- **8 worlds + secret level** — overworld, underground, sky, and castle themes with increasing difficulty
- **Classic block vocabulary** — question blocks, brick blocks (break when big), hidden invisible blocks, multi-coin blocks, spring/note bounce pads
- **Warp pipes** — enter from above (↓) to warp across the map or into secret coin rooms
- **Flag pole finish** — slide down the pole, time bonus + height bonus, level clear fanfare
- **400-second timer** — classic countdown; time out = death
- **100 coins = 1-Up** — plus green Vita Capsule (1-Up mushroom) power-ups from blocks
- **Double jump** with sparkle VFX and coyote time / jump buffer
- **Wall slide & wall jump**, **dash** with ghost trails
- **Combo system** — chain stomps for up to 4× score multiplier
- **Moving platforms** on most levels
- **Power-ups** — Spark Capsule (grow), Blaze Orb (fire), Star Fragment (invincibility + triple jump), Vita Capsule (1-Up)
- **Enemies** — Walkers (ledge-aware), Shells (kickable), Flyers (lose wings → walker), Piranha Sprouts (pipe timers), Iron Guard boss (3 stomps)
- **Stomp / fire / star / shell** interactions — full Mario-style combat vocabulary
- **Level select** — unlock worlds as you progress; replay any unlocked stage; secret Star Chamber when discovered

### Easter Eggs (5+ discoverable secrets)
- Konami code on title screen → +3 lives
- Hidden dev message near World 1-1 secret block
- Secret underground pipe warp in World 2-1 → unlocks Star Chamber
- Flag-pole top bonus (+5000) when you reach the top
- Hidden 1-Up in invisible blocks
- Score Master toast at 10,000 points

### Frontend
- **React UI overlay** — menu, HUD (score, coins, lives, timer, world), pause, level clear, game over
- **Pause menu** — resume, restart, sound toggle, quit (Esc / P)
- **High score** — persisted in localStorage with new-record celebration
- **Mobile touch controls** — on-screen D-pad, jump, dash, and fire on touch devices
- **Mushroom-kingdom landing page** — sky, drifting clouds, green hills, grass/dirt ground strip
- **Crisp pixel rendering** — Phaser integer zoom only (no CSS canvas scaling)

### Audio (procedural Web Audio)
- Distinct SFX: jump, coin, stomp, power-up, break, fire, pipe, flag, 1-up, death, win, secret
- Theme music moods: overworld, underground, sky, castle

## Controls

| Input | Action |
|-------|--------|
| Arrow Keys / A D | Move |
| Space / W | Jump (press twice for double jump) |
| ↓ / S (on pipe) | Enter warp pipe |
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
├── objects/             # Block, Coin, PowerUp, Pipe
├── systems/             # Input, Audio, GameState, EasterEggs, Storage, GameBridge
├── levels/              # Level data + builder
└── styles/global.css    # Platformer world + UI design system
```

## License

Original code and assets. Gameplay inspired by classic platformers; no Nintendo IP used.
