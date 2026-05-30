# 6 — Level Design: World 1, "Emerald Valley"

## 6.1 Theme & arc

A sun-dappled valley of floating islands, waterfalls, and ancient overgrown ruins. The world
opens bright and gentle and gradually climbs into windswept heights and a storm-wreathed
ruin where the boss waits. **One new mechanic per level**, each taught safely then tested.

## 6.2 Teaching philosophy

Every mechanic follows **introduce → practice (safe) → combine → test (consequence)**. New
mechanics are first shown with no failure cost, then layered with prior verbs, then placed
over a hazard. No text tutorials — geometry and enemy placement teach.

## 6.3 The 10 levels

| # | Name | New mechanic | Focus | Relics |
|---|------|--------------|-------|--------|
| 1 | Verdant Threshold | Walk/Run/Jump + coyote/buffer | Onboarding, feel | 1 |
| 2 | Mossfall Steps | Double jump | Vertical traversal | 2 |
| 3 | Hollow Roots | Dash / air dash | Gap closing, timing | 2 |
| 4 | Cascade Climb | Wall slide + wall jump | Vertical chains | 3 |
| 5 | Emberwild Grove | **Fire orb** | Burn puzzles, ranged combat | 2 |
| 6 | Frostspring Caverns | **Ice orb** | Freeze→platform puzzles | 3 |
| 7 | Galewind Bluffs | **Wind orb** glide + weather wind | Glide gauntlets | 2 |
| 8 | Stormstep Ascent | Triple jump + storm hazards | Precision + power combo | 3 |
| 9 | Sunken Reliquary | Ground pound + secrets density | Exploration, puzzle | 3 |
| 10 | Colossus Approach | All verbs; **Wing orb** finale + boss run-up | Mastery test | 2 |

## 6.4 Level anatomy (template)

```
[Entrance + checkpoint] → [Teach zone] → [Practice loop with optional secret branch]
→ [Skill gate / puzzle] → [Set-piece moment] → [Combat arena] → [Exit + relic vault]
                              ↑ hidden room              ↑ secret route (collection %)
```

- **Critical path** designed for ~60s–90s flow; everything else is optional depth.
- **Secret routes** branch off the path and rejoin, rewarding curiosity, never punishing the
  player who skips them.
- **Hidden rooms** gated by a mechanic the player already owns (false walls, breakables,
  off-screen ledges hinted by parallax/lighting).
- **Puzzle sections** are power-based (freeze water into a step; burn a vine bridge; glide a
  wind current) — diegetic, never abstract.

## 6.5 Difficulty curve (designer targets)

| Level | Platforming | Combat | Puzzle | Avg deaths (playtest target) |
|-------|------------|--------|--------|------------------------------|
| 1–2 | 1–2 | 1 | 0–1 | <1 |
| 3–4 | 3 | 2 | 1 | 1–2 |
| 5–7 | 3–4 | 3 | 3 | 2–3 |
| 8–9 | 4–5 | 3 | 4 | 3–5 |
| 10 | 5 | 4 | 3 | 4–6 |

Curve validated by telemetry (deaths per checkpoint, time-in-zone). Spikes flatten in tuning.

## 6.6 Collectible distribution

- **Coins**: dense on path (juice + economy), trails guide toward optional routes.
- **Gems**: 3–5/level, off-path, mild challenge.
- **Relics**: gate level completion %; in a vault behind a skill gate or puzzle.
- **Artifacts**: 1 hidden per level, lore; finding all 10 unlocks a cosmetic + achievement.

Tracked via `Collectible` (unique ids persisted) → Completion/Collection/Secret %.

## 6.7 Build process in Unity

- Tilemaps (`com.unity.2d.tilemap`) for collision/visuals; SpriteShape for organic terrain.
- `LevelInfo` per scene sets id, display name, camera confiner bounds, music track.
- Checkpoints (`Checkpoint`) at zone boundaries; placement keeps deaths' lost-progress <45s.
- Parallax: 8–12 `ParallaxLayer`s (see Environment/VFX docs) for depth.
- Each level is its own scene; the boss arena loads additively.

## 6.8 Pacing of intensity (rest vs. tension)

Alternate high-APM platforming/combat with calm vistas (collectible cleanup, scenic reveals)
so tension has a rhythm. Day/night and weather shifts mark act transitions within the world.
