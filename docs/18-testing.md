# 18 — Testing Strategy

## 18.1 Pyramid

```
        Manual / QA passes (feel, polish, cert)
      Playtest telemetry (curve, drop-off, balance)
    Integration / PlayMode tests (systems in a scene)
  Unit / EditMode tests (pure logic, fast, deterministic)
```

## 18.2 Unit (EditMode, Unity Test Framework)

Pure, fast, no scene. High-value targets:

- **`GameTimer`** — Tick countdown, finish-edge returns true exactly once, Restart/Stop.
- **`MovementConfig` derivations** — gravity/jumpVelocity match `h`/`t` analytically.
- **`ProgressionSystem`** — XP curve, multi-level-up on big grants, skill prerequisite/cost
  gating, stat aggregation correctness.
- **`SaveModel` round-trip** — serialize→deserialize equality; migration from v0→v1.
- **`StateMachine`** — transition selection order, any-state precedence, enter/exit hooks.
- **`Health`** — half-heart math, i-frame blocking, death fires once, SetMaxHearts refill.

Designed so these classes are testable without MonoBehaviour where possible (structs, plain
classes); MonoBehaviours expose logic through public methods.

## 18.3 Integration (PlayMode)

In a minimal test scene with the Player rig:

- Coyote time: leave a ledge, jump within 150 ms → jump succeeds; after → fails.
- Jump buffer: press jump just before landing → jump fires on land.
- Variable jump: tap vs. hold → measurably different apex height.
- Wall jump: slide → buffered jump launches away with lockout.
- Dash cooldown / air-dash count limits.
- Combat: hitbox hits each target once per swing; crit applies multiplier; i-frames block.
- Save: checkpoint → kill player → respawn at checkpoint position.
- Enemy FSM: scripted player mover triggers Patrol→Chase→Attack→Hurt→Death path.

## 18.4 Fault injection

- Save crash-safety: abort between `.tmp` write and `File.Replace` → live save intact; `.bak`
  recovers a corrupted primary.
- Missing-asset resilience: null clip/prefab ids no-op gracefully (no exceptions).

## 18.5 Automated performance test

A capture scene runs a deterministic input replay; asserts avg/95th frame time and per-frame
GC stay under budget (§17). Runs in CI on a representative runner; regressions fail the PR.

## 18.6 Playtest telemetry

Instrument deaths-per-checkpoint, time-in-zone, power usage, skill pick rates, quit points.
Feed back into the balance sheet (§14). Weekly internal playtests; external beta before launch.

## 18.7 Manual QA passes

- **Feel pass**: movement/combat polish, every action has audio+VFX+animation.
- **Completion pass**: 100% all collectibles reachable; no soft-locks.
- **Accessibility pass**: rebinding, colorblind, subtitles, assist toggles all functional.
- **Platform/cert pass**: suspend/resume, focus loss, input device swap, save quotas, TRC/XR
  compliance, performance on min-spec.
- **Localization pass**: text fits, no truncation/overflow, glyph coverage.

## 18.8 CI

GitHub Actions / Unity Build Automation: on PR run EditMode + PlayMode tests + perf test +
a build smoke test. Block merge on failure. Nightly full multi-platform build + Addressables.

## 18.9 Bug triage

Severity S1 (crash/soft-lock/progress-loss) → S4 (cosmetic). S1/S2 block release; tracked in
the issue tracker with repro, build, and save attached.
