# 10 — Audio Design Document

## 10.1 Direction

Warm, orchestral-hybrid score (live-feel strings/woodwinds + light synth shimmer for the
elemental/sky fantasy), crisp tactile SFX, and a living ambient bed. Audio is a primary
"first 10 seconds" selling point alongside visuals.

## 10.2 System (`Audio/AudioManager.cs` + `SoundBank.cs`)

- **Pooled SFX voices** (round-robin, 16 default), per-clip **pitch/volume variation** and
  multi-clip variants so repeated sounds never feel robotic.
- **Adaptive music**: two music sources cross-fade tracks; **additive layered stems** fade
  in/out over a phase-aligned base (calm → combat → boss intensity).
- **Mixer routing**: Master / Music / SFX / Ambience exposed params; settings sliders convert
  linear → dB (`SetMixerVolume`).
- SFX addressed by **string id** via `SoundBank` — code never references clips directly.

## 10.3 Adaptive music model

```
Base bed (always) ── intensity rises ──► + rhythm layer (combat) ──► + brass/choir (boss)
```

`SetMusicLayer(id, clip, active, vol)` layers stems synced to the base `timeSamples`.
Exploration vs. combat is driven by a simple threat meter (nearby alerted enemies); boss
phases drive layers explicitly (boss doc §8.7).

## 10.4 SFX taxonomy (ids resolved in `SoundBank`)

| Category | Example ids |
|----------|-------------|
| Locomotion | `footstep_grass`, `footstep_stone`, `jump`, `land_soft`, `land_heavy`, `dash`, `wall_jump`, `ground_pound` |
| Combat | `melee_swing`, `hit_flesh`, `hit_armor`, `crit`, `player_hurt`, `player_death` |
| Powers | `power_equip`, `fire_cast`, `ice_cast`, `lightning_cast`, `wind_gust`, `wing_flap` |
| World | `coin_pickup`, `gem_pickup`, `relic_pickup`, `checkpoint`, `secret_found` |
| Enemy | `slime_move`, `bat_screech`, `golem_slam`, `arrow_release` |
| Ambience | `amb_valley_day`, `amb_caverns`, `amb_storm` |
| UI | `ui_move`, `ui_confirm`, `ui_back`, `ui_unlock` |

## 10.5 Footstep & surface system

Footsteps are animation-event driven; the surface under the player (from `CollisionSensor`
ground material / a surface tag) selects the clip set, so grass/stone/wood sound distinct.

## 10.6 Mix philosophy

- Ducking: music dips ~3 dB under boss roars/important SFX (mixer snapshot or sidechain).
- Combat SFX sit forward; ambience and music never mask gameplay-critical cues.
- Spatialized SFX (`spatialBlend = 1`) for positioned world sounds; UI/music 2D.
- Hit-stop pairs with a punchy transient for impact weight.

## 10.7 Accessibility & platform

- Independent volume buses; mono-downmix option; visual cues accompany key audio (subtitle
  system covers narrative + significant SFX captions).
- Mobile: shorter ambient loops, compressed banks, respects silent switch.
- Console cert: pause/mute on focus loss, no audio on suspend.

## 10.8 Asset spec (hand-off)

Music stems: 48 kHz / 24-bit WAV masters → compressed (Vorbis ~0.6) loops with sample-accurate
loop points. SFX: 48 kHz mono (positional) / stereo (UI/music), trimmed, normalized to a
consistent target. Naming matches the `SoundBank` ids above.
