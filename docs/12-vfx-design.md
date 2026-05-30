# 12 — VFX Design Document

## 12.1 Philosophy

**Every action gets feedback.** VFX communicate state (powered-up, invincible), reward
(collect bursts), and weight (landing dust, hit sparks). Driven by `VfxManager` (id-addressed,
pooled) so gameplay requests effects by name with no prefab refs or GC.

## 12.2 Spawn API

`VfxManager.Spawn(id, position, rotation, scale, tint)` → pulls a `PooledVfx` from the named
pool, plays it, auto-returns on completion. Tint lets one prefab serve many themes (e.g. one
hit-spark recoloured per damage element).

## 12.3 Effect catalogue (ids)

| Id | Trigger | Look |
|----|---------|------|
| `landing_dust` | `PlayerMotor.Landed` (scaled by impact) | radial dust puff, scale ∝ speed |
| `land_heavy` / `pound_shock` | heavy land / ground pound | shockwave ring + debris + screen shake |
| `dash_trail` | dash | ghost/streak afterimages along path |
| `wall_dust` | wall slide/jump | small scrape particles on the wall |
| `jump_puff` | jump | quick toe-off puff |
| `hit_spark` | damage dealt | directional spark, tinted by `DamageType` |
| `crit_burst` | critical hit | bigger flash + radial shards |
| `coin_burst` / `gem_burst` | pickup | sparkle pop + upward motes |
| `relic_pickup` | relic | golden ring expand + light flare |
| `enemy_death` | enemy death | dissolve + soul motes (via dissolve shader) |
| `water_splash` | enter water | droplet fan + ripple |
| `rain_impact` | rain on ground/player | tiny splashes (GPU, weather-driven) |
| `fire_cast` / `ice_cast` / `lightning_cast` / `wind_gust` / `wing_flap` | powers | per-element signatures |
| `power_aura_*` | equipped power | looping aura parented to player |
| `checkpoint_flare` | checkpoint | rising light column |

## 12.4 Player aura & power identity

Each `PowerUpDefinition.AuraVfx` is a looping particle prefab parented to the player on equip
(swapped on cycle). Combined with the skin override and `SpriteOutlineFlash` glow, the
character's element reads instantly at a glance.

## 12.5 Animation feel principles (applied to VFX too)

Squash & stretch (dust puffs), anticipation (charge glow before a charged attack), follow-
through (dash trail lingers), overlapping action (embers drift after a fire cast). Timed to
animation events for frame-accurate sync.

## 12.6 Environmental VFX (ambient life)

Moving grass (GrassWind shader), swaying trees (vertex anim), flying birds (spline movers),
dynamic clouds (parallax + cloud shader), water reflections/ripples, drifting dust motes in
light shafts, falling leaves, volumetric fog (URP). These run continuously at a strict budget
(emission scaled by on-screen area + quality setting).

## 12.7 Performance

- **Everything pooled** (`ObjectPool<T>` / `PooledVfx`); prewarm counts per effect in
  `VfxManager._entries`.
- GPU particles where possible (rain/snow/ambient); CPU only for gameplay-reactive bursts.
- Hard cap concurrent particles per category; mobile quality tier reduces emission and
  disables overdraw-heavy ambient layers.
- Effects auto-despawn after `duration + maxLifetime` so trails finish without leaks.

## 12.8 Camera & time feedback

VFX coordinate with `CameraShake` (trauma scaled to impact) and `HitStop` (freeze-frame on
hits) — the trio (particles + shake + freeze) is the core "juice" recipe.
