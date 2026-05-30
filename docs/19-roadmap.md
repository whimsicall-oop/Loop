# 19 — Commercial Release Roadmap

A milestone plan to take Skybound Adventures from this engineering foundation to a shipped,
premium indie title. Durations assume a small experienced team (the studio roles in the brief).

## 19.1 Milestones

### M0 — Foundation ✅ (this repo)
Architecture, all gameplay/engine systems in code, shaders, data structures, full design docs.
**Exit:** project opens, systems compile, data slots ready for content.

### M1 — Vertical Slice (6–8 weeks)
One fully-art'd level (EV_01), the player with final movement feel + one power (Fire), 2
enemies, final HUD, audio bed, day/night, weather. The "first 10 seconds" looks/feels
shippable.
**Exit:** a stranger plays 5 min and is impressed; greenlight internal/external.

### M2 — Production: World 1 Content (10–14 weeks)
All 10 EV levels art'd & tuned, all 5 powers, full enemy roster, the Verdant Colossus boss,
skill tree populated, save/progression end-to-end, full SFX/music, all VFX.
**Exit:** World 1 playable start→boss with final-quality content.

### M3 — Alpha / Feature Complete (6 weeks)
All systems final: achievements, accessibility suite, settings, controller support,
localization framework, Addressables streaming. No new features after this.
**Exit:** feature-complete; content may still be tuned.

### M4 — Beta / Content Complete (6 weeks)
All content in & locked; balance from telemetry; closed external beta; performance to 60 FPS
on all targets; first platform cert dry-runs.
**Exit:** content-complete, no S1/S2 bugs, hits perf targets.

### M5 — Cert & Launch Prep (4–6 weeks)
Platform certification (Steam/Switch/PS/Xbox), store pages, trailer, demo build, marketing
beats, day-1 patch staging.
**Exit:** all platforms cert-passed, store-ready.

### M6 — Launch & Live (ongoing)
Simultaneous Steam/Switch/PS/Xbox; mobile shortly after (touch-control polish). Day-1 patch,
hotfix cadence, community feedback loop.

## 19.2 Scope ladder (post-launch)

1. **World 2+** (new biomes, mechanics, bosses) — engine already scales (data-driven content).
2. **Speedrun/Time-Attack** mode + leaderboards (achievements hooks exist).
3. **New Game+** and harder difficulties.
4. **Cosmetics** (artifact-unlocked skins) — already modeled in saves.
5. **Photo mode / accessibility expansions**.

## 19.3 Risk register

| Risk | Mitigation |
|------|------------|
| Art throughput (hand-painted is slow) | Lock style early (M1 slice), build reusable atlases, parallax modularity |
| Movement feel drift | `MovementConfig` data + telemetry; lock feel in M1, regression-guard with tests |
| Performance on mobile/Switch | Budgets + CI perf gate from M1; quality tiers built in |
| Cert surprises | Cert dry-runs in M4; suspend/resume & save quotas handled in code |
| Scope creep | Feature freeze at M3; scope ladder defers extras to post-launch |

## 19.4 Team / discipline mapping (per brief)

Creative Director (vision/greenlights) · Game Designer (GDD, levels, balance) · Gameplay
Engineer (movement/combat/systems) · Graphics Engineer (URP, shaders, lighting) · Technical
Artist (pipeline, shaders, rigs) · Environment/Character/VFX Artists (content) · Level
Designer (10 levels + secrets) · UI/UX (menus, HUD, accessibility) · Audio Director (adaptive
score, SFX) · QA Lead (test strategy, cert, telemetry).

## 19.5 Definition of "premium indie" done

60 FPS everywhere · impressive first 10 seconds · fluid responsive controls · animation-film-
grade motion · rich living world · adaptive audio · 100%-completable with rewarding secrets ·
full accessibility · clean cert on all platforms.
