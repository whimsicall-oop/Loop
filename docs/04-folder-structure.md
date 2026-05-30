# 4 — Folder Structure

```
/                         Repo root
├─ Assets/
│  ├─ Art/                Source artwork (organized by subject)
│  │  ├─ Characters/      Player + power skins (4K masters → atlased sprites)
│  │  ├─ Enemies/         Enemy sprite sheets & rigs
│  │  ├─ Environment/     Tilesets, parallax layers, props
│  │  ├─ Items/           Collectibles, pickups
│  │  └─ UI/              Icons, frames, fonts
│  ├─ Animations/         Animator controllers, clips, blend trees
│  ├─ Audio/
│  │  ├─ Music/           Adaptive stems (base + layers), boss themes
│  │  └─ SFX/             Footsteps, jumps, combat, ambience
│  ├─ Characters/         Player & companion prefabs + configs
│  ├─ Enemies/            Enemy prefabs + EnemyConfig assets
│  ├─ Items/              Collectible/powerup prefabs + definitions
│  ├─ Levels/             Tilemaps, level prefabs, spawn data
│  ├─ UI/                 Canvas prefabs (menus, HUD, pause)
│  ├─ VFX/                Particle prefabs, PooledVfx, trails
│  ├─ Shaders/            Custom .shader files (water, grass, outline, …)
│  ├─ Prefabs/            Shared composite prefabs (Player rig, Camera rig)
│  ├─ Scenes/             Boot, MainMenu, EV_01…EV_10, BossArena
│  ├─ Settings/           URP assets, render features, input actions, mixer
│  └─ Scripts/
│     ├─ Core/            Singleton, GameState, GameTimer
│     ├─ Player/          Input, PlayerController, + Movement/Combat/PowerUps
│     ├─ Enemies/         EnemyController, EnemyConfig, + AI/
│     ├─ Bosses/          BossController, BossAttack strategies
│     ├─ Camera/          CameraController, CameraShake
│     ├─ SaveData/        SaveModel, SaveSystem
│     ├─ Progression/     ProgressionSystem, SkillDefinition
│     ├─ Audio/           AudioManager, SoundBank
│     ├─ VFX/             VfxManager, PooledVfx
│     ├─ Environment/     Parallax, DayNight, Weather
│     ├─ UI/              HUDController, DamageNumber, menus
│     ├─ Items/           Collectible
│     ├─ Levels/          LevelInfo, Checkpoint
│     ├─ Systems/         ObjectPool, HitStop, Achievements
│     ├─ Managers/        GameBootstrap (composition root)
│     └─ Data/            Shared data assets / enums
├─ Packages/              manifest.json (URP, Cinemachine, Input System, 2D, …)
├─ ProjectSettings/       Unity project configuration
└─ docs/                  This documentation set
```

**Conventions**

- One public type per `.cs`; namespace mirrors folder (`Skybound.<Folder>`).
- Data assets named `<Thing>Config` / `<Thing>Definition` / `<Thing>Data`.
- Prefabs in PascalCase; scenes prefixed by world (`EV_` = Emerald Valley).
- Art masters kept out of build via Addressables groups; runtime sprites atlased.
