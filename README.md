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

### Game Modes (menu selectable)
- **Adventure** — classic campaign with level select (default)
- **Speedrun** — prominent timer + ghost best time in localStorage; sequential levels only
- **Hardcore** — 1 life, no power-up respawn on death
- **Coin Rush** — 60-second timer; collect max coins in a random level
- **Boss Rush** — jump straight to the Iron Guard boss level

### Missions & Side Quests
- **Mission board** on title menu and pause menu — 3 active missions at a time
- Examples: stomp 5 enemies without damage, collect 20 coins in one level, clear with 200+ seconds left, defeat boss without fire
- Progress tracked in-game; rewards: bonus score, cosmetics, secret unlocks
- **Side quest ? signs** in levels — walk near and press **E** for mini objective popups
- Mission complete fanfare + coin shower VFX

### Daily Challenge
- Seed based on today's date — deterministic modifier (Low Gravity, Double Enemies, Fog, Turbo Rush, Coin Frenzy, Icy Slopes)
- One challenge per day; streak counter in localStorage
- **Daily Challenge** card on title menu with date, modifier, and reward

### Kingdom Shop
- Appears between worlds in Adventure mode
- Spend banked coins on: extra life (30), power-up stash (25), hint scroll (15)

### Checkpoints
- Green flag checkpoints mid-level — touch to save respawn point

### Easter Eggs (15+ discoverable secrets)
- Konami code on title screen → +3 lives
- Hidden dev message near World 1-1 secret block
- Secret underground pipe warp in World 2-1 → unlocks Star Chamber
- **Hidden chamber in World 2-1** — press ↓ at tile 32 for bonus room
- Flag-pole top bonus (+5000) when you reach the top
- Hidden 1-Up in invisible blocks
- Score Master toast at 10,000 points
- Spring Obsessed — bounce 5 springs in one level
- Sky Walker — triple jump high on World 1-2
- Flag Dash — dash near the flag pole
- Sign Reader — talk to multiple ? signs
- **Cheat codes** in pause Settings: QUEST, COINS, STAR (and more to find)
- **Nova** — 5th hero unlocked after completing all missions

### Achievements
- 12 badges (some secret) — first stomp, 100 coins, combos, daily streak, boss slayer, and more
- Pop-up toasts on unlock; grid view in menu and pause

### Frontend
- **Full-viewport immersive shell (default)** — game scales to max integer Phaser zoom (crisp pixels, no CSS canvas scale); cinematic sky letterboxing on ultrawide/tall screens
- **Optional Arcade View** — toggle a retro cabinet with neon marquee, CRT bezel, side art, control panel, and synced score/lives/coin LED; see [Arcade View](#arcade-view) below
- **Hero title screen** — full-world parallax sky, hills, pipes, and floating blocks behind wooden sign menus (not a tiny embedded widget)
- **In-world UI panels** — wood-sign pause/game-over menus, plank HUD, grass-corner viewport frame, world-themed touch controls
- **Screen transitions** — fade/scale between loading, menu, gameplay, pause, level clear, and game over
- **UI sound cues** — click/confirm/cancel tones on menu and pause interactions
- **React UI overlay** — menu, HUD (score, coins, lives, timer, world), pause, level clear, game over
- **Pause menu tabs** — Resume | Missions | Achievements | Settings (cheat codes + secrets log)
- **Game mode selector** + daily challenge card on title menu
- **Mission tracker** compact HUD widget during play
- **Mode badge** on HUD showing current mode
- **Flashy combo meter** with pulse ring animation
- **High score** — persisted in localStorage with new-record celebration
- **Mobile touch controls** — on-screen D-pad, jump, dash, and fire styled to match the kingdom aesthetic
- **Crisp pixel rendering** — Phaser `scale.setZoom()` integer scaling only

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
| Esc / P | Pause (tabbed menu) |
| E | Talk to ? side-quest signs |
| Enter / Click | Start / confirm |

On mobile, use the on-screen touch buttons.

## Arcade View

**Default:** full-viewport gameplay with HUD overlay. **Arcade View** is an optional alternate presentation — same game, same characters, same controls.

### When to use each mode

| Mode | Best for |
|------|----------|
| **Fullscreen (default)** | Maximum screen real estate, ultrawide/tall displays, first-time players |
| **Arcade View** | Retro cabinet aesthetic, stream overlays, showing off the “real arcade” vibe |

### How to enable

1. **Title menu** — toggle **🕹 Arcade Mode ON/OFF** (saved to `localStorage`)
2. **In-game (fullscreen mode)** — click the **🕹** button in the top-right HUD
3. **In-game (arcade mode)** — use the marquee buttons (view / pause / browser fullscreen)

Press **F** for browser fullscreen in either view mode.

### Cabinet layout

```
┌─────────────────────────────────────┐
│  MARQUEE — EASHAN'S QUEST + hero    │  ← neon title, world label, pause/fullscreen
├────┬─────────────────────────┬──────┤
│SIDE│   CRT BEZEL + GAME      │ SIDE │  ← kingdom pixel side art
│ART │   (integer Phaser zoom) │ ART  │
├────┴─────────────────────────┴──────┤
│  CONTROL PANEL — joystick, buttons  │  ← decorative; matches real keys
│  COIN LED · LIVES · SCORE STRIP     │  ← synced live from GameBridge HUD
└─────────────────────────────────────┘
         ▓▓▓ cabinet base ▓▓▓
    ░░░ dim arcade room floor ░░░       ← spotlight + tile floor, not void
```

### Synced elements

- **Score strip** under CRT bezel (score, timer, high score)
- **Life lights** (3 icons) on control panel
- **Coin slot LED** — glows on collect with pulse animation
- **World label** on marquee updates per level
- **Hero name** shown under neon title
- **Cabinet glow** when actively playing

### Zoom / crisp pixels

The Phaser canvas is positioned inside the CRT cutout. Scale uses **integer Phaser `setZoom()` only** — no CSS `transform: scale()` on the canvas. Switching view modes recalculates zoom for the new available CRT dimensions.

### Implementation notes

- Arcade cabinet mounts only when view mode is `arcade` and gameplay is active — does not wrap Phaser boot
- `GameBridge` replays screen/HUD state to new subscribers so loading is never blocked
- Four playable characters work identically in both modes

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
├── App.tsx              # React shell + Phaser mount + view mode routing
├── config/
│   ├── cabinetLayout.ts # Arcade CRT + cabinet geometry + zoom
│   └── gameLayout.ts    # Fullscreen integer zoom layout
├── ui/                  # React overlays (Menu, HUD, ArcadeCabinet, Pause, …)
├── entities/            # Player, Enemy, MovingPlatform, Projectile
├── objects/             # Block, Coin, PowerUp, Pipe
├── systems/             # Input, Audio, GameState, EasterEggs, Storage, GameBridge
│                        # gameModes, missions, dailyChallenge, achievements
├── levels/              # Level data + builder
└── styles/global.css    # Platformer world + UI design system
```

## License

Original code and assets. Gameplay inspired by classic platformers; no Nintendo IP used.
