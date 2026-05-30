# Skybound Adventures — Documentation Index

A 2D action-platformer built in **Unity (2022.3 LTS) + URP**, C#, designed for commercial
release on Steam, Switch, PlayStation, Xbox, and mobile.

This folder is the studio's living documentation set. Each document is self-contained but
cross-references the others and the source in `Assets/Scripts/`.

| # | Document | File |
|---|----------|------|
| 1 | Architecture | [01-architecture.md](01-architecture.md) |
| 2 | Technical Design (TDD) | [02-technical-design.md](02-technical-design.md) |
| 3 | Gameplay Design (GDD) | [03-gameplay-design.md](03-gameplay-design.md) |
| 4 | Folder Structure | [04-folder-structure.md](04-folder-structure.md) |
| 5 | Source Code | `Assets/Scripts/` (see TDD for the map) |
| 6 | Level Design | [06-level-design.md](06-level-design.md) |
| 7 | Enemy AI | [07-enemy-ai.md](07-enemy-ai.md) |
| 8 | Boss Design | [08-boss-design.md](08-boss-design.md) |
| 9 | UI / UX Flow | [09-ui-flow.md](09-ui-flow.md) |
| 10 | Audio Design | [10-audio-design.md](10-audio-design.md) |
| 11 | Shader Design | [11-shader-design.md](11-shader-design.md) |
| 12 | VFX Design | [12-vfx-design.md](12-vfx-design.md) |
| 13 | Save System Design | [13-save-system.md](13-save-system.md) |
| 14 | Balancing Spreadsheet Structure | [14-balancing.md](14-balancing.md) |
| 15 | Build Instructions | [15-build-instructions.md](15-build-instructions.md) |
| 16 | Asset Pipeline | [16-asset-pipeline.md](16-asset-pipeline.md) |
| 17 | Optimization Strategy | [17-optimization.md](17-optimization.md) |
| 18 | Testing Strategy | [18-testing.md](18-testing.md) |
| 19 | Commercial Release Roadmap | [19-roadmap.md](19-roadmap.md) |

## Scope & honesty note

This repository delivers, for real and ready to compile/extend:

- A complete, modular, SOLID **C# codebase** for every gameplay/engine system in the brief.
- **Custom shaders** (water, grass wind, sprite outline + hit-flash).
- The full **design documentation** set below.
- A **data-driven** architecture (ScriptableObjects) so designers/artists author content
  without code changes.

What a text-based engineering deliverable **cannot** include — and what the documents below
specify precisely for the art/audio teams to produce — are the binary creative assets:
hand-painted 4K artwork, sprite sheets, skeletal rigs, particle textures, and music/SFX
audio files. Every system is built with the import settings, data slots, and integration
hooks in place so those assets drop straight in. See the Asset Pipeline (16) for the exact
specs, naming conventions, and hand-off process.
