# 15 — Build Instructions

## 15.1 Prerequisites

- **Unity 2022.3 LTS** (see `ProjectSettings/ProjectVersion.txt` — `2022.3.40f1`). Install via
  Unity Hub with the modules for your target platforms (Windows/Mac/Linux IL2CPP, Android,
  iOS, and console modules under NDA).
- Git + Git LFS (LFS for binary art/audio once added — see `.gitattributes` to be created).
- Platform SDKs: Android SDK/NDK (mobile), Xcode (iOS), console SDKs via platform partner
  programs.

## 15.2 First open

1. Clone the repo. `git lfs install` (once art/audio land).
2. Open the project folder in Unity Hub → it resolves packages from `Packages/manifest.json`
   (URP, Cinemachine, Input System, 2D, TextMeshPro, Addressables, Test Framework).
3. Let Unity import; open `Assets/Scenes/Boot.unity`.
4. Press Play — the `GameBootstrap` composition root brings up the singletons and Main Menu.

> Note: this repo ships **code + shaders + docs + data structures**. Binary art/audio assets
> and authored scenes are produced per the Asset Pipeline (§16); until then, scenes are wired
> with the data slots ready and the systems run headless-friendly where possible.

## 15.3 Project settings to verify

- **Player ▸ Scripting Backend**: IL2CPP for shipping builds (Mono OK for editor iteration).
- **Player ▸ Api Compatibility**: .NET Standard 2.1.
- **Quality / URP**: assign the URP asset per quality tier (`Assets/Settings`).
- **Input**: Project Settings ▸ Player ▸ Active Input Handling = "Both" (legacy provider works
  today; Input System provider is the shipping target).
- **Physics2D**: gravity Y can stay default (motor overrides per-body); set layer collision
  matrix (Player/Enemy/Ground/Hazard/Projectile).

## 15.4 Building

| Platform | Steps |
|----------|-------|
| **Windows/Mac/Linux** | File ▸ Build Settings ▸ Standalone ▸ IL2CPP ▸ Build |
| **Android** | Switch platform ▸ set keystore ▸ ARM64 ▸ IL2CPP ▸ Build (AAB for Play) |
| **iOS** | Switch platform ▸ Build → Xcode project ▸ sign ▸ archive |
| **Switch/PS/Xbox** | Install platform module (NDA) ▸ switch platform ▸ platform build |

## 15.5 Command-line / CI

```
Unity -batchmode -quit -projectPath . \
  -executeMethod Skybound.Editor.BuildPipeline.BuildWindows \
  -logFile build.log
```

`Assets/Editor/BuildPipeline.cs` (to add) wraps `BuildPipeline.BuildPlayer` with per-platform
options, version stamping, and Addressables build. Wire into GitHub Actions / Unity Build
Automation for nightly builds (see Roadmap §19).

## 15.6 Addressables

Art/audio ship as Addressable groups for streaming and patchability. Build content
(`Window ▸ Asset Management ▸ Addressables ▸ Build`) before the player build; CI does both.

## 15.7 Versioning

Semantic version in Player Settings; CI stamps build number from the commit count. Tag
releases `vMAJOR.MINOR.PATCH`.
