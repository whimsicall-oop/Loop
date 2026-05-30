# 1 — Architecture Document

## 1.1 Goals

- **Modular & component-based** — each system is a focused MonoBehaviour or ScriptableObject
  with a single responsibility, composed on prefabs rather than inherited into god-objects.
- **SOLID** — depend on abstractions (`IInputProvider`, `IDamageable`, `PowerAbility`,
  `BossAttack`, `IState`); extend by adding types, not editing existing ones.
- **Data-driven** — tuning and content live in ScriptableObjects so designers/artists iterate
  without recompiling and without engineering bottlenecks.
- **Decoupled** — systems communicate through C# events and small broker types, never by
  reaching across the scene graph.
- **Performance-first** — pooling, event-driven UI, zero per-frame allocations on hot paths.

## 1.2 Layered view

```
┌───────────────────────────────────────────────────────────────┐
│  Presentation     UI (HUD, menus), VFX, Audio, Camera           │
├───────────────────────────────────────────────────────────────┤
│  Gameplay         Player (motor/combat/powers), Enemies, Boss,   │
│                   Items, Levels, Checkpoints                     │
├───────────────────────────────────────────────────────────────┤
│  Systems/Services Progression, Save, Achievements, HitStop,      │
│                   ObjectPool, Weather, DayNight                  │
├───────────────────────────────────────────────────────────────┤
│  Core             Singleton<T>, GameStateMachine, GameTimer      │
└───────────────────────────────────────────────────────────────┘
```

Dependencies point **downward only**. Core knows nothing about gameplay; gameplay knows
nothing about presentation (it raises events that presentation listens to).

## 1.3 Key patterns and where they live

| Pattern | Usage | File(s) |
|---------|-------|---------|
| Singleton (lifetime-managed) | Global services | `Core/Singleton.cs` |
| State Machine | Game state, enemy AI | `Core/GameState.cs`, `Enemies/AI/StateMachine.cs` |
| Strategy (ScriptableObject) | Powers, boss attacks | `Player/PowerUps/PowerAbility.cs`, `Bosses/BossController.cs` |
| Object Pool | Projectiles, VFX, damage numbers | `Systems/ObjectPool.cs` |
| Observer / Events | Health, motor, progression → UI/VFX/audio | throughout |
| Broker | Global fire-and-forget signals | `Enemies/EnemyDeathBroker.cs` |
| Facade | Player composition | `Player/PlayerController.cs` |
| Data asset | All tuning/content | every `*Config`, `*Definition`, `*Data` |

## 1.4 The player rig (composition example)

A single Player prefab composes focused components, each independently testable:

```
Player (GameObject)
├─ Rigidbody2D (dynamic, gravityScale 0)
├─ Collider2D
├─ CollisionSensor      — environment probing
├─ PlayerMotor          — velocity integration + all movement feel
├─ Health               — hearts, i-frames, death
├─ PlayerCombat         — melee combo state machine
│   └─ Hitbox           — transient damage volume
├─ PowerUpController    — equip/cycle/fire elemental powers
├─ PlayerController     — facade: wires events → VFX/audio/camera/progression
└─ LegacyInputProvider  — IInputProvider implementation
```

No component reaches into another's internals; they coordinate through the motor's public
surface and C# events. Swapping input backends, or unit-testing the motor with a fake
`IInputProvider`, requires zero changes elsewhere.

## 1.5 Communication contracts

- **Input:** `IInputProvider` — gameplay never reads `UnityEngine.Input` directly.
- **Damage:** `IDamageable.TakeDamage(in DamageInfo)` — one contract for players, enemies,
  breakables, bosses.
- **State:** `GameStateMachine.StateChanged(prev, next)` — pause, cutscene, boss intro,
  game-over all flow through one authority that also owns `Time.timeScale`.
- **Death/loot:** `EnemyDeathBroker.EnemyDied(enemy, pos)` — progression, loot, achievements
  subscribe; the enemy doesn't know they exist.

## 1.6 Scene topology

- **Boot** — `GameBootstrap` (composition root) + persistent singletons; loads MainMenu.
- **MainMenu** — UI only.
- **Gameplay scenes** — one per level (`EV_01` … `EV_10`) containing `LevelInfo`, parallax
  layers, tilemaps, spawns, checkpoints, the Player prefab, and a Camera rig.
- **Boss arena** — its own scene loaded additively for streaming and memory isolation.

## 1.7 Extensibility checklist (open/closed in practice)

- New power → new `PowerAbility` subclass + a `PowerUpDefinition` asset. No controller edits.
- New enemy → new `EnemyConfig` asset (+ optional `EnemyController` subclass for special
  attacks). Reuses the shared FSM and states.
- New boss attack → new `BossAttack` subclass asset, dropped into a phase list.
- New skill → new `SkillDefinition` asset wired into the tree by prerequisite references.
- New collectible/achievement → new asset; no code.
