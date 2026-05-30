# 2 — Technical Design Document (TDD)

Engine: **Unity 2022.3 LTS**, **URP 14**, C# 9. Physics2D for collision response; custom
integration for movement feel. Target: stable 60 FPS on the platform matrix (see §17).

## 2.1 Source map

| Area | Namespace | Folder |
|------|-----------|--------|
| Core utilities | `Skybound.Core` | `Scripts/Core` |
| Input | `Skybound.Player` | `Scripts/Player` |
| Movement | `Skybound.Player.Movement` | `Scripts/Player/Movement` |
| Combat | `Skybound.Combat` | `Scripts/Player/Combat` |
| Power-ups | `Skybound.Player.PowerUps` | `Scripts/Player/PowerUps` |
| Enemies / AI | `Skybound.Enemies(.AI)` | `Scripts/Enemies` |
| Bosses | `Skybound.Bosses` | `Scripts/Bosses` |
| Camera | `Skybound.CameraSystem` | `Scripts/Camera` |
| Save | `Skybound.SaveData` | `Scripts/SaveData` |
| Progression | `Skybound.Progression` | `Scripts/Progression` |
| Audio | `Skybound.Audio` | `Scripts/Audio` |
| Environment | `Skybound.Environment` | `Scripts/Environment` |
| VFX | `Skybound.VFX` | `Scripts/VFX` |
| UI | `Skybound.UI` | `Scripts/UI` |
| Items / Levels | `Skybound.Items`, `Skybound.Levels` | `Scripts/Items`, `Scripts/Levels` |
| Systems / Managers | `Skybound.Systems`, `Skybound.Managers` | `Scripts/Systems`, `Scripts/Managers` |

Assembly: `Skybound.asmdef` (references `UnityEngine.UI`). Splitting into runtime/editor/test
assemblies is a later optimization; documented in §17.

## 2.2 Movement model (the most important system)

`PlayerMotor` uses a **dynamic Rigidbody2D with `gravityScale = 0`** and applies custom
gravity. Rationale: Unity's built-in gravity is symmetric and floaty; platformer feel needs
**asymmetric** gravity (fall faster than you rise) and instant tuning.

- **Authoring:** designers set `JumpHeight` and `TimeToApex`. Gravity and jump velocity are
  derived (`g = -2h/t²`, `v = |g|·t`). This is far more controllable than raw forces.
- **Update vs FixedUpdate:** input is sampled and buffered in `Update`; velocity is integrated
  in `FixedUpdate`. Feel is framerate-independent and no press is dropped between physics ticks.
- **Coyote time (150 ms):** a timer armed on leaving the ground; a jump within the window
  still counts as grounded.
- **Jump buffer (150 ms):** a jump press is stored and consumed the moment a jump becomes
  legal (landing, touching a wall).
- **Variable height:** releasing jump mid-rise multiplies gravity (`LowJumpGravityMultiplier`).
- **Multi-jump:** up to triple; each air jump scales velocity by `AirJumpScale`.
- **Wall slide/jump:** clamps fall speed on a wall; a buffered jump becomes a wall jump with a
  short input lockout so the arc reads.
- **Dash / air dash:** fixed-velocity burst with cooldown; air dashes limited and refunded on
  ground/wall contact.
- **Ground pound:** brief hover for readability, then a high-speed drop with landing shock.

All values live in `MovementConfig` (a ScriptableObject) and can be hot-swapped per power-up.

## 2.3 Combat

- `DamageInfo` is an immutable `readonly struct` (no GC). `IDamageable` is the single contract.
- `Health` models hearts (2 HP/heart for half-heart granularity) + i-frames + events.
- Attacks are `AttackData` assets forming a combo chain (`NextInCombo`). `PlayerCombat` runs a
  startup→active→recovery state machine with a combo-buffer window.
- `Hitbox` is **query-driven** (`OverlapBoxNonAlloc` during the active window, dedup per
  swing) rather than persistent trigger colliders — deterministic, no re-entry bugs.
- **Game feel:** `HitStop` freeze-frames on impact (unscaled time, reentrant-safe);
  `CameraShake` uses a Perlin trauma model; knockback rides through `DamageInfo`.

## 2.4 Powers

`PowerUpDefinition` bundles identity (tint, skin override, aura), an optional
`MovementConfig` override, and a `PowerAbility` strategy. `PowerUpController` owns equip /
cycle / fire with cooldown and sustained-duration handling, and never knows a specific power's
logic. Fire = pooled projectile; Wind = sustained glide tick; Ice/Lightning/Wing follow the
same template (see GDD §3 and VFX §12).

## 2.5 Enemy AI

A compact, allocation-free `StateMachine` with declarative transitions and "any-state"
transitions for Hurt/Death. `EnemyController` is the blackboard (perception, facing, distance)
and exposes movement/attack primitives that the state classes call. Behaviour selection is
data: `EnemyConfig` flags (`Ranged`, `CanRetreat`, `Flying`, `EdgeAware`) wire the FSM.
See §7.

## 2.6 Boss

`BossController` is a phase sequencer: health thresholds trigger cinematic transitions
(invuln window, transformation VFX, music stem swap) and each phase cycles a pool of
`BossAttack` strategies. See §8.

## 2.7 Camera

Hand-rolled rig (`CameraController`) with dead zone, velocity look-ahead, critically-damped
`SmoothDamp` (no overshoot/jitter), dynamic speed zoom, bounds confiner, and a cinematic
focus blend. `CameraShake` composes on top in `LateUpdate`. In production this can be backed
by Cinemachine; the hand-rolled version documents exact intended behaviour and is dependency-
light. See §9 for framing rules.

## 2.8 Persistence

`SaveSystem` — multi-slot JSON in `persistentDataPath`, **atomic writes** (`File.Replace`
with `.bak` rotation), forward-migration via `SaveModel.Version`. Checkpoints autosave. See §13.

## 2.9 Progression

`ProgressionSystem` — XP curve `base·level^exp`, skill-point economy, prerequisite-gated
`SkillDefinition` DAG, and aggregation of unlocked modifiers into a `PlayerStats` block that
`PlayerController` applies (extra hearts, dash charges, damage, cooldown reduction, speed).

## 2.10 Audio

`AudioManager` — pooled SFX voices (round-robin, pitch variation), dual-source music
cross-fade, additive **layered stems** for adaptive intensity, routed through an `AudioMixer`
for settings volumes. SFX addressed by string id via `SoundBank`. See §10.

## 2.11 Performance contracts

- No `Find`/`GetComponent` on per-frame hot paths in shipping enemies (the FSM caches refs;
  the `Find` calls in example states are flagged for replacement with a cached player ref).
- Pool everything spawned frequently (`ObjectPool<T>`): projectiles, VFX, damage numbers.
- Event-driven UI: the HUD redraws only on change.
- Structs for transient data (`DamageInfo`, `GameTimer`, `PowerContext`).

## 2.12 Coding standards

- Namespaces mirror folders; one public type per file.
- `[SerializeField] private` over public fields; expose via properties.
- XML/inline comments explain **why**, not what.
- No magic numbers in logic — promote to serialized fields/config.
