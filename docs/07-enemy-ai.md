# 7 — Enemy AI Document

## 7.1 Approach

A compact, transparent **finite state machine** (`Enemies/AI/StateMachine.cs`) over a
behaviour-tree library, chosen for debuggability and zero runtime allocation across the
shipping roster. `EnemyController` is the **blackboard** (perception, distance, facing,
hurt/death flags) and exposes movement/attack primitives; states are pure behaviour that
call those primitives, so they're portable across grounded and flying archetypes.

## 7.2 State set

`Idle, Patrol, Alert, Chase, Attack, Retreat, Hurt, Recover, Death`

- **Alert** and **Recover** are folded into Chase/Attack timing in the base controller (the
  alert "tell" is the windup before committing); they exist as explicit states for enemies
  that need a telegraphed reaction beat.
- **Hurt** and **Death** are **any-state transitions** — any behaviour is interruptible by a
  hit, which is essential for responsive combat.

```
Idle ──(has patrol)──► Patrol ──(see player)──► Chase ──(in range)──► Attack
  └──(see player)──────────────────────────────►        ◄──(out of range)──┘
Chase ──(lost player, far)──► Patrol
[any] ──(low HP & sees player, if CanRetreat)──► Retreat ──(safe distance)──► Chase
[any] ──(took damage)──► Hurt        [any] ──(HP 0)──► Death
```

## 7.3 Perception

`EnemyController.UpdatePerception()` each frame:
1. Distance gate (`SightRange`).
2. Vision cone (`SightAngle` around facing).
3. Line-of-sight raycast against `SightObstacles`.

All three must pass to set `CanSeePlayer`. Flying enemies ignore edge/ledge checks; grounded
enemies use `BlockedAhead()` (wall ray + ledge ray) to patrol safely and stop at cliffs.

## 7.4 Roster (data-only via `EnemyConfig`)

| Enemy | HP | Move | Behaviour flags | Role |
|-------|----|------|-----------------|------|
| **Slime** | 2 | slow ground, ping-pong patrol | EdgeAware | Trash, teaches stomp |
| **Beetle** | 4 | armored ground; flips on stomp | EdgeAware | Timing/positioning |
| **Flying Bat** | 2 | flying, swoop chase | Flying | Aerial threat |
| **Goblin Archer** | 3 | ranged, kites | Ranged, CanRetreat | Forces approach/cover |
| **Stone Golem** | 12 | slow, heavy melee | high HP, AoE slam | Mini-tank, arena gate |
| **Shadow Assassin** | 4 | fast, dashes in/out | CanRetreat, fast | High-skill duel |
| **Forest Spirit** | 5 | floats, casts | Flying, Ranged | Support/elemental |

`EnemyController.PerformAttack` is `virtual`; ranged enemies (Archer, Spirit) override it to
fire pooled `Projectile`s and prefer `RetreatRange`; the Golem overrides for a telegraphed
AoE slam.

## 7.5 Tuning levers (per `EnemyConfig`)

`SightRange/Angle`, `AttackRange`, `RetreatRange`, `AlertDuration`, `AttackWindup`,
`AttackCooldown`, `RecoverDuration`, `HurtDuration`, speeds, HP, contact/attack damage,
`RetreatHealthThreshold`, and rewards (`XpReward`, `CoinReward`).

## 7.6 Group behaviour

Encounters are authored, not emergent-AI heavy: a Golem + 2 Archers reads as a puzzle
(close the gap while dodging arrows). Optional lightweight coordination (archers spread,
melee flank) can layer on via a per-arena `EncounterDirector` without touching individual FSMs.

## 7.7 Fairness rules

- Telegraph every attack (`AttackWindup`) with an animation tell + audio cue.
- Off-screen enemies don't attack; they hold until on-screen (readability).
- Knockback on hit (`OnDamaged`) gives the player breathing room and sells impact.
- Death is delayed (`Destroy(..., 1.2f)`) so the death animation/VFX play; loot/XP fire once
  through `EnemyDeathBroker`.

## 7.8 Performance

- Perception is simple math + one raycast/frame/enemy; cull updates when `!IsPlayable`.
- Shipping enemies cache the player reference (the example states' `FindGameObjectWithTag`
  per-tick is flagged in TDD §2.11 to be replaced with the cached `Player` field).
- Off-screen enemies tick at reduced rate via a culling group (planned optimization, §17).
