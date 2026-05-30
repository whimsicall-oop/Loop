# 9 — UI / UX Flow Document

## 9.1 Principles

Diegetic where possible, minimal HUD during play, generous readability, controller-first
navigation with full keyboard/mouse/touch parity, and smooth transitions (no hard cuts).
Built on Unity UI + TextMeshPro, scaled via Canvas Scaler (reference 1920×1080, match width/
height 0.5) so it adapts from phones to 4K TVs.

## 9.2 Screen flow

```
Boot ─► Main Menu ─┬─► New Game ─► Slot Select ─► Name ─► Intro Cutscene ─► Gameplay
                   ├─► Continue ─► Slot Select ─────────────────────────► Gameplay
                   ├─► Settings ─► (Audio / Video / Controls / Accessibility / Back)
                   └─► Credits

Gameplay ─► Pause ─┬─► Resume
                   ├─► Skill Tree
                   ├─► Map
                   ├─► Restart Checkpoint
                   ├─► Settings
                   └─► Quit to Menu
Gameplay ─► Game Over ─► (Respawn checkpoint / Quit)
Gameplay ─► Level Complete ─► Results (Completion/Collection/Secret %, time) ─► Next
Boss ─► Victory ─► Cinematic ─► World Map
```

## 9.3 Main menu

New Game / Continue / Settings / Credits. Animated parallax background (reuses `ParallaxLayer`),
ambient music bed, subtle drifting VFX. Continue is disabled (greyed) if no save exists.

## 9.4 HUD (`UI/HUDController.cs`)

- **Hearts** top-left, half-heart granularity, rebuilt on max-heart upgrades.
- **XP bar + level** under hearts.
- **Currency** (coins/gems) top-right.
- **Active power** indicator with a **radial cooldown** (bottom or beside hearts).
- Event-driven: redraws only on change. Fades to near-invisible during calm exploration,
  restores on damage/combat/collect (juice without clutter).

## 9.5 Pause menu

Freezes time (`GameStateMachine` sets `timeScale = 0`; audio uses unscaled fades). Resume,
Skill Tree, Map, Restart Checkpoint, Settings, Quit. Opens/closes with a quick scale+fade.

## 9.6 Skill tree screen

Four category branches (Mobility/Combat/Survival/Magic) as a node graph; nodes show icon,
name, cost, prerequisites, and locked/affordable/owned state (drives off
`ProgressionSystem.CanUnlock`). Confirming spends points and immediately re-applies stats.

## 9.7 Settings & accessibility

- **Audio**: Master / Music / SFX / Ambience sliders → `AudioManager.SetMixerVolume`.
- **Video**: resolution, fullscreen, vsync, quality, bloom/effects toggle, frame cap.
- **Controls**: full rebinding (Input System), gamepad glyphs auto-detected.
- **Accessibility**: colorblind modes (palette LUT), UI scale slider, subtitles + speaker
  labels, difficulty/assist toggles (extra coyote time, no-fall-death practice, reduced
  enemy damage), screen-shake toggle/intensity, hit-stop toggle, hold-vs-toggle for sprint/
  glide, reduced-motion (dampens parallax/flashes).

## 9.8 Transitions & feel

Standardized 0.2–0.4s ease-in/out fades & scales via a shared `UITransition` helper. Menu
selection has audio + a subtle scale pop. Loading uses an animated mascot, never a frozen
frame. Damage numbers (`UI/DamageNumber`) pool and float from world space.

## 9.9 Diegetic touches

Skill tree framed as the character's "constellation"; the map is an in-world relic chart;
collectible counts shown as physical tallies — reinforcing the world over generic chrome.
