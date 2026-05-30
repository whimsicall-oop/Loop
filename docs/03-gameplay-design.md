# 3 — Gameplay Design Document (GDD)

## 3.1 Pitch

**Skybound Adventures** is a hand-crafted 2D action-platformer about a young sky-wanderer who
channels elemental orbs to traverse a vertical world of floating islands. It fuses precise,
expressive movement with light combat, deep exploration, and an RPG skill tree — the
fluidity of a movement platformer with the secrets-and-progression hook of a metroidvania.

**Fantasy:** *"I move beautifully, and I keep getting more powerful and more free."*

## 3.2 The 10-second promise

On first input the player should feel: responsive acceleration, a satisfying weighty jump,
a snappy dash with a trail, reactive dust/landing VFX, parallax depth, and a warm adaptive
score. Every system in this repo exists to make those first 10 seconds excellent.

## 3.3 Core loop

```
Explore → encounter platforming/combat/secret → collect (coins/gems/relics) →
gain XP → spend skill points → unlock movement/combat options →
reach further/secret areas → boss → new world.
```

Moment-to-moment: **Move → Read space → Commit → Get feedback → Reward.**

## 3.4 Controls (default)

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move | A/D or ←/→ | Left stick |
| Jump (hold = higher) | Space | A / Cross |
| Double/Triple jump | Space (in air) | A / Cross |
| Dash / Air dash | Left Shift | RB / R1 |
| Sprint | Left Ctrl (hold) | LB / L1 |
| Crouch / Fast-fall | S / ↓ | Down |
| Ground pound | S in air | Down in air |
| Attack (combo) | J | X / Square |
| Use power | K | Y / Triangle |
| Cycle power | Q | D-pad ↔ |
| Wall slide/jump | auto on wall + Jump | same |

All rebindable (§ accessibility, doc 9). `IInputProvider` abstracts the backend.

## 3.5 Movement verbs & game feel

See TDD §2.2. The feel pillars: **responsive** (coyote + buffer + input queueing),
**precise** (deterministic dashes, predictable arcs), **smooth** (acceleration curves, no
snapping), **weighty** (asymmetric gravity, impactful landings with dust + shake scaled to
impact speed). Explicitly avoid floatiness via `FallGravityMultiplier`.

## 3.6 Combat

- 3-hit melee combo (chain inside the combo window), plus **stomp** (bounce off enemy heads),
  **dash attack**, **charged attack**, and power **projectiles**.
- Feedback: hit-stop, knockback, critical hits, floating damage numbers, i-frames, status
  effects (Burn/Freeze/Shock).
- Health: **5 hearts** base (half-heart granularity), upgradeable via the skill tree and
  hidden heart relics.

## 3.7 Elemental powers

| Orb | Active | Passive / traversal | Identity |
|-----|--------|---------------------|----------|
| **Fire** | Burning projectile | Burn DoT, ignites objects | warm orange aura, embers |
| **Ice** | Freeze beam | Freeze enemies → platforms | cyan aura, frost trail |
| **Lightning** | Chain zap | Speed boost, dash extends | electric blue, sparks |
| **Wind** | — | Glide, updrafts, deflect projectiles | pale green, swirling leaves |
| **Wing** | Toggle | Temporary free flight | golden feathers |

The player's silhouette/skin and movement profile change per power
(`PowerUpDefinition.CharacterOverride` + `MovementOverride`).

## 3.8 Progression & economy

- **XP** from kills, secrets, first-clears → **character levels** → **skill points**.
- **Skill tree**: Mobility / Combat / Survival / Magic. Upgrades: Extra Hearts, Dash Upgrade
  (extra charge), Jump Upgrade (extra air jump), Damage Upgrade, Cooldown Reduction, Move
  Speed.
- **Currency**: Coins (common, shops/respec), Gems (rare, premium unlocks).
- **Collectibles**: Coins, Gems, **Ancient Relics** (1–3 per level, gate completion),
  **Hidden Artifacts** (lore + cosmetic). Tracked as Completion %, Collection %, Secret %.

## 3.9 Difficulty philosophy

Generous defaults (coyote/buffer) make the game feel fair; challenge comes from level design,
not from fighting the controls. Difficulty settings (doc 9) tune enemy damage, i-frame length,
and optional assist toggles (extra coyote time, no-fall-death practice) without gating content.

## 3.10 Session shape

15–25 min sessions: a level (~5–8 min) + collectible cleanup + a skill-tree decision. World 1
(Emerald Valley) is ~60–90 min to clear, ~3 h to 100%.
