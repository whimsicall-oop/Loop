# Skybound Adventures

A premium-quality **2D action-platformer** built in **Unity (2022.3 LTS) + URP**, C#.
Exploration, precision platforming, light combat, elemental powers, an RPG skill tree, and a
multi-phase boss — engineered for commercial release on Steam, Switch, PlayStation, Xbox, and
mobile.

> **100% original IP.** No copyrighted characters, names, assets, sounds, or level layouts.

## What's in this repository

This is the **engineering + design foundation** produced by the studio:

- **Complete, modular C# codebase** (~4.4k lines, 49 files) — movement, physics, combat,
  powers, enemy AI, boss, camera, save, progression, audio, VFX, environment, UI.
- **Custom shaders** — stylized water, foliage wind, sprite outline + hit-flash.
- **Data-driven architecture** — ScriptableObjects so designers/artists author content
  without touching code.
- **Full design documentation** — see [`docs/`](docs/README.md) (19 documents).

### Highlight: game feel

The player controller (`Assets/Scripts/Player/Movement/PlayerMotor.cs`) implements the
features that separate great platformers from the rest: **coyote time (150 ms)**, **jump
buffering (150 ms)**, **variable jump height**, **double/triple jump**, **wall slide/jump**,
**dash / air dash**, **ground pound**, asymmetric custom gravity (no floatiness), momentum
and acceleration curves, and event hooks for VFX/SFX/animation. All tuned via data
(`MovementConfig`).

## Project layout

```
Assets/Scripts/   All gameplay & engine systems (see docs/04-folder-structure.md)
Assets/Shaders/   Custom URP shaders
Assets/...        Art, Audio, Prefabs, Scenes, Settings (content slots, see docs/16)
docs/             Architecture, TDD, GDD, level/enemy/boss/UI/audio/shader/VFX/save
                  design, balancing, build, pipeline, optimization, testing, roadmap
Packages/         manifest.json (URP, Cinemachine, Input System, 2D, TMP, Addressables)
```

## Getting started

1. Open the folder with **Unity 2022.3 LTS** (Unity Hub resolves packages automatically).
2. Open `Assets/Scenes/Boot.unity` and press Play.
3. See [`docs/15-build-instructions.md`](docs/15-build-instructions.md) for platform builds.

## Honest scope note

A text-based engineering deliverable provides the code, shaders, data structures, and full
specs — **not** the binary creative assets (4K hand-painted art, rigs, particle textures,
music/SFX). Every system exposes the data slots and import-settings hooks so those assets,
produced per [`docs/16-asset-pipeline.md`](docs/16-asset-pipeline.md), drop in with **no code
changes**. The code has been written to compile against Unity 2022.3 + the listed packages;
it has not been compiled in this environment (no Unity install), so treat M0→M1 as the first
in-editor verification pass.

## License

See [LICENSE](LICENSE).
