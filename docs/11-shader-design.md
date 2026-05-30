# 11 — Shader Design Document

Target: **URP 14** (2D Renderer), shader model 3.0+ for broad mobile/console support. Three
shaders ship in `Assets/Shaders/`; the rest are specified here for the technical artist.

## 11.1 Shipped shaders

### Water2D (`Water2D.shader`)
Stylized water surface: two-layer value-noise UV distortion (waves), depth gradient
(shallow→deep), animated caustic banding, and a foam line at the surface edge. Drives off
`_Time`; transparent, ZWrite off. For refraction of the scene behind it, feed
`_CameraOpaqueTexture` via a URP Renderer Feature (documented inline). Tunables: wave
strength/speed/scale, foam width, caustic strength, deep/shallow colours.

### GrassWind (`GrassWind.shader`)
Vertex-displacement wind for foliage. Pins the sprite base (UV.y≈0), sways the tip (UV.y≈1)
with layered sines phase-offset by **world position** so a field desyncs naturally. Reads a
`_WindForce` the `WeatherSystem` drives (per-renderer), plus stiffness/frequency/amplitude.

### SpriteOutlineFlash (`SpriteOutlineFlash.shader`)
Multi-purpose character/enemy/pickup material: alpha-neighbour **outline** (works on any
sprite), per-renderer **hit flash** (white lerp for i-frame/damage feedback), and a **glow**
term for power auras / collectible shimmer. One material covers three needs → fewer materials,
better batching.

## 11.2 Specified (to author)

| Shader | Purpose | Technique |
|--------|---------|-----------|
| **Fire** | Flames, embers, fire orb | Scrolling noise + gradient ramp + additive, vertex flicker |
| **Ice** | Frozen enemies, ice platforms | Fresnel rim + refraction tint + sparkle mask |
| **Magic** | Generic spell FX, runes | Polar-coord noise, emissive ramp, dissolve edge |
| **Clouds** | Volumetric-feel parallax clouds | FBM noise, soft lighting, slow scroll |
| **Distortion** | Heat haze, shockwaves, dash | Grab-pass UV offset by a normal/radial map |
| **Dissolve** | Enemy death, reveals | Noise threshold + emissive burn edge |
| **Light scatter** | God rays / volumetric shafts | Radial blur from light source, additive |

## 11.3 Lighting (URP 2D)

- **Global Light 2D** driven by `DayNightCycle` (intensity + colour over time).
- **Freeform/Point/Spot Light 2D** for dynamic sources (player aura, fire, lanterns).
- **Shadow Caster 2D** on terrain/props for real-time shadows.
- **Normal maps** on key sprites for rim/directional light response.
- **Bloom + volumetric shafts** via URP post-processing Volume (per-area overrides).
- **Rim lighting** through the outline/glow shader to pop characters off backgrounds.

## 11.4 Conventions

- One uber-material per role where possible (outline/flash/glow) to cut draw-call/material
  count; expose per-renderer params via MaterialPropertyBlocks (no material instancing).
- All animated shaders use `_Time`/per-renderer floats — never per-frame `material.SetX`
  allocations.
- Mobile fallbacks: `Sprites/Default` fallback declared; expensive terms (caustics, grab-pass
  refraction) gated behind a quality keyword.

## 11.5 Performance budget

- Transparent overdraw is the main cost on mobile; keep full-screen distortion sparing and
  time-boxed (dash/shockwave only).
- Profile with the Frame Debugger; keep water/grass within the 2D Renderer's batched pass.
