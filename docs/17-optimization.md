# 17 — Optimization Strategy

Target: **stable 60 FPS** on the platform matrix (mid-range mobile, Switch, PS/Xbox, PC),
with headroom. Optimize by measurement, not guesswork — profile first.

## 17.1 Budgets (per frame, 16.6 ms @ 60 FPS)

| System | Budget (mobile) |
|--------|-----------------|
| Rendering (CPU submit) | ≤ 4 ms |
| Physics2D | ≤ 2 ms |
| Gameplay scripts | ≤ 4 ms |
| Particles/VFX | ≤ 2 ms |
| UI | ≤ 1 ms |
| Headroom/GC | rest |

GC allocations on steady-state gameplay: **target 0 B/frame**.

## 17.2 CPU / scripting

- **Pooling** for all frequent spawns (`ObjectPool<T>`, `PooledVfx`): projectiles, VFX,
  damage numbers, coin pops. No `Instantiate`/`Destroy` churn in combat.
- **Structs** for transient data (`DamageInfo`, `GameTimer`, `PowerContext`) → no heap.
- **Event-driven UI**: HUD redraws only on change; no per-frame polling layouts.
- **Cache references**: no `GetComponent`/`Find` on hot paths (the example enemy states'
  per-tick `FindGameObjectWithTag` is flagged to use the cached `Player` field — TDD §2.11).
- **Culling groups**: off-screen enemies tick AI at reduced rate / sleep; perception skipped.
- **Fixed timestep** tuned (0.0166–0.02) to balance feel vs. physics cost.

## 17.3 Rendering

- **2D Renderer (URP)** with SRP Batcher on; minimize material count (the uber sprite shader
  helps). Sprite Atlases per group → batched draw calls.
- **Overdraw** is the mobile killer: limit transparent layers, time-box full-screen distortion
  (dash/shockwave only), scale ambient particle emission by on-screen area + quality tier.
- **Parallax/clouds** are cheap quads; fog/light shafts gated behind quality.
- **Dynamic 2D lights/shadows**: cap count per area; bake static ambient where possible.

## 17.4 Memory & streaming

- **Addressables** for art/audio: load the current biome, unload the rest; boss arena loads
  additively and unloads on exit.
- Texture compression per platform (ASTC mobile, BC7 desktop); music streamed, SFX
  decompressed-on-load only for short clips.
- Atlas sizing to platform max; mipmaps off for sprites/UI.

## 17.5 Physics

- BoxCast-based sensors (deterministic, cheap) instead of many trigger callbacks.
- Layer collision matrix prunes irrelevant pairs (Projectile ignores Projectile, etc.).
- Continuous detection only where needed (player, fast projectiles).

## 17.6 Quality tiers

| Tier | Particles | Lights | Post (bloom/shafts) | Parallax layers |
|------|-----------|--------|---------------------|-----------------|
| Mobile-Low | reduced | few | off | 6 |
| Mobile-High / Switch | medium | medium | bloom only | 8 |
| Console/PC | full | full | full | 10–12 |

Selected at runtime by device profiling; user-overridable in Settings.

## 17.7 Tooling & gates

- Unity Profiler + Frame Debugger + Memory Profiler in every milestone pass.
- A CI **performance test** scene runs a scripted gameplay capture and fails the build if
  frame time or GC regresses past thresholds.
- Per-platform soak tests (battery/thermal on mobile, memory ceiling on console).
