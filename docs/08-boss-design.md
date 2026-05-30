# 8 — Boss Design: "Verdant Colossus" (World 1)

## 8.1 Concept

An ancient stone-and-vine guardian, dormant in the ruin's heart, that awakens as the valley's
corruption peaks. A test of every verb the player has learned across World 1: jump chains,
dash dodges, wall use, ground pound, and elemental powers.

## 8.2 Structure (driven by `BossController`)

Phase transitions are **health-threshold driven**; each transition plays a cinematic beat
(brief invulnerability, transformation VFX, environmental change, **music stem swap**) before
combat resumes. Each phase cycles a pool of `BossAttack` strategy assets.

| Phase | HP band | Theme | Attacks | Music |
|-------|---------|-------|---------|-------|
| **1 — Awakening** | 100–66% | Slow, readable | Boulder lob, ground slam (shockwave), vine sweep | Base boss theme |
| **2 — Fury** | 66–33% | Faster, arena shrinks | Triple boulder, charge across arena, falling debris (env. destruction) | + percussion layer |
| **3 — Last Stand** | 33–0% | Transformed, glowing core | Beam sweep (use Ice platform / Wind glide), arena floor breaks into islands, core-exposed windows | + choir + intensified |

## 8.3 Cinematic introduction

On arena entry the trigger calls `BossController.BeginEncounter()`:
`GameState → BossIntro` (locks input), camera pulls to a framing shot via
`CameraController.SetCinematicFocus`, the title/nameplate animates in, the awakening plays,
music swells, then `GameState → Playing`. (~3s, skippable after first viewing.)

## 8.4 Weakness system

The Colossus is armored except its **core**, exposed only after specific attacks
(post-slam recovery in P1, after the charge in P2, during beam wind-down in P3). This teaches
**dodge → punish** and gives each attack a built-in counter — the player learns the rhythm.
Elemental synergy: Ice freezes its beam pools into safe platforms; Wind deflects debris;
Fire burns the vines binding the core for bonus damage.

## 8.5 Attack design (each a `BossAttack` asset)

- **Boulder Lob** — arcing projectile to the player's predicted position; telegraph shadow on
  ground. Counter: move/dash.
- **Ground Slam** — radial shockwave; counter: jump on the tell. Exposes core on recovery.
- **Charge** — horizontal rush wall-to-wall; counter: jump/dash over, or wall-jump. Stuns
  itself on wall impact (core window).
- **Beam Sweep** (P3) — slow rotating beam; counter: Ice platforms / Wind glide / precise
  jumps. Leaves burning pools (positional pressure).
- **Debris Fall** (P2+) — environmental destruction drops rubble; counter: read shadows, keep
  moving. Demonstrates the destructible arena.

`Execute()` returns the recovery time, so the sequencer paces attacks; designers tune
aggression by reordering the pool and adjusting recovery.

## 8.6 Difficulty & fairness

- Always at least one safe spot during any attack.
- Telegraphs scale with phase but never vanish.
- Checkpoint immediately before the arena; death restarts the fight, not the level.
- Phase transitions are invulnerable & brief — a breather, not a punish.

## 8.7 Dynamic music

`AudioManager.SetMusicLayer` adds/removes stems on phase change (percussion → choir),
phase-aligned to the base track so layering is seamless. Victory triggers
`GameState → Victory` and a stinger; defeat fades to the calmer base.

## 8.8 Reward

First clear: World 2 unlock, a guaranteed skill point, the Wing orb confirmation, and a
"Colossus Felled" achievement. The arena becomes a re-challengeable time-attack for
speedrun achievements.
