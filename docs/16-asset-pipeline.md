# 16 — Asset Pipeline

This document is the **art/audio hand-off contract**: the specs, settings, and process for
turning creative source into runtime assets that drop into the systems already built.

## 16.1 Art style target

Hand-painted, high-contrast, warm-lit storybook realism with crisp readable silhouettes —
quality bar referencing top-tier indie platformers. Characters pop via rim/outline lighting;
backgrounds use atmospheric depth (8–12 parallax layers, fog, light shafts).

## 16.2 Character art

- **Master artwork**: 4K hand-painted, layered (PSD), with separated parts for rigging
  (body, limbs, hair, cloth, eyes) to enable secondary motion (hair/cloth) via the 2D
  Animation package (Sprite Skinning) or Spine.
- **Expressions**: blendable mouth/eye sets for cinematic close-ups.
- **Power skins**: one master + recolour/overlay variants per element (Fire/Ice/Lightning/
  Wind/Wing) → `RuntimeAnimatorController` overrides referenced by `PowerUpDefinition`.
- **Export**: atlased sprite sheets (max 2048², trim, 4px padding), PPU consistent project-
  wide (recommend 100). Normal maps for key sprites (lighting).

## 16.3 Animation

- Authored 24–60 fps; principles: squash & stretch, anticipation, follow-through, overlap.
- Player clips: Idle, Walk, Run, Sprint, Jump, Fall, DoubleJump, Dash, WallSlide, Attack1-3,
  Charged, Hurt, Death, Victory, plus per-power idles.
- Animator: layered controller (base locomotion + override for power skins); animation events
  fire footsteps and hitbox activation frames.

## 16.4 Environment

- Tilesets (Tilemap) + SpriteShape for organic terrain; modular props.
- Parallax layers exported per depth; foreground/midground/background/atmosphere separated.
- Tileable seamlessly; consistent lighting direction baked into paint, dynamic light on top.

## 16.5 VFX textures

- Particle sheets (flipbooks) for fire/smoke/sparkle; soft-edged, premultiplied alpha.
- Authored to read at gameplay scale; tinting handled in-shader/particle so one sheet serves
  many colours.

## 16.6 Audio

See Audio doc §10.8: 48 kHz/24-bit WAV masters; music stems with sample-accurate loops;
SFX trimmed/normalized; names match `SoundBank` ids.

## 16.7 Import settings (enforced by an editor `AssetPostprocessor`)

| Asset | Settings |
|-------|----------|
| Sprites | PPU 100, Bilinear, compression per platform (ASTC mobile, BC7 desktop), mipmaps off for UI/sprites, atlased |
| Sprite Atlas | One per logical group (player, each enemy, UI, each biome) |
| Audio | Music = Streaming/Vorbis; short SFX = Decompress on load/ADPCM; force mono for positional |
| Textures (FX) | Clamp/Repeat as needed, alpha-is-transparency |

An `AssetPostprocessor` applies these automatically on import so artists can't accidentally
ship uncompressed 4K into the build.

## 16.8 Naming & organization

`category_subject_variant_state` (e.g. `enemy_goblin_archer_attack`, `vfx_dash_trail`,
`sfx_footstep_grass_01`). Source masters live in `/Art` (Addressables-excluded from build);
runtime atlases/clips referenced by prefabs/configs.

## 16.9 Hand-off flow

```
Concept → master paint (4K PSD) → rig/animate → export atlas+clips → import (auto-settings)
→ assign to prefab/Definition → in-engine review → optimize (atlas, compression) → ship
```

Each deliverable has an acceptance checklist (readable silhouette, consistent PPU/lighting,
atlas fit, memory budget, looks correct under day/night + weather).

## 16.10 What's ready for assets now

Every system exposes the slots: `PowerUpDefinition` (skin/aura/icon), `EnemyConfig` (+ prefab
sprite/animator), `SoundBank` (clip arrays by id), `VfxManager` (prefab per id), HUD sprites,
collectible prefabs. Dropping authored assets into these requires **no code changes**.
