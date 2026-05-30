# 14 — Balancing Spreadsheet Structure

A single Google Sheet / Excel workbook (`Skybound_Balance.xlsx`) is the source of truth for
tuning. Designers edit it; an editor importer (`Assets/Editor/BalanceImporter.cs`, to build)
parses CSV exports into the ScriptableObjects so live values match the sheet. Tabs:

## 14.1 `Movement`
One row per `MovementConfig` (Base, Fire, Ice, Lightning, Wind, Wing). Columns: WalkSpeed,
SprintSpeed, CrouchSpeed, GroundAccel/Decel, AirAccel/Decel, TurnBoost, JumpHeight, TimeToApex,
FallMult, LowJumpMult, MaxFall, FastFall, MaxJumps, AirJumpScale, Coyote, JumpBuffer,
WallSlide, WallJumpX/Y, DashSpeed/Dur/CD, AirDashes, GroundPoundSpeed. Derived columns compute
gravity/jumpVelocity for sanity.

## 14.2 `Player Stats`
Level → XP-to-next (`base·level^exp`), cumulative XP, skill points granted. Base hearts,
i-frame duration, base damage.

## 14.3 `Skills`
One row per `SkillDefinition`: id, name, category, cost, required level, prerequisites,
modifier target(s) + value(s). Validates the DAG (no cycles, reachable costs vs. point income).

## 14.4 `Enemies`
One row per `EnemyConfig`: HP, contact/attack damage, speeds, sight range/angle, attack/
retreat range, all timing windows, behaviour flags, XP/coin reward. Derived: time-to-kill at
each player damage tier, threat score.

## 14.5 `Boss`
Per phase: HP band %, attack list, per-attack damage/telegraph/recovery, DPS-in / DPS-out,
expected fight length.

## 14.6 `Combat`
Per `AttackData`: base damage, crit chance/mult, startup/active/recovery/combo window,
knockback, hit-stop, lunge. Derived: combo DPS, frame advantage.

## 14.7 `Powers`
Cooldown, duration, damage, projectile speed, effect magnitudes; uptime % at various cooldown-
reduction tiers.

## 14.8 `Economy`
Coin/gem sources per level (path + optional), sinks (shop/respec costs), relic/artifact counts.
Validates that intended purchases are affordable on the designed route.

## 14.9 `Levels`
Per level: length (s), checkpoint count, coins/gems/relics/artifacts, new mechanic, target
deaths, target completion time (casual / 100% / speedrun).

## 14.10 `Telemetry Targets`
KPIs reconciled against live playtest data: deaths-per-checkpoint, time-in-zone, power usage
rates, skill pick rates, drop-off points. Out-of-band rows flag tuning work.

## 14.11 Workflow
Edit sheet → export tab CSVs to `Assets/Balance/*.csv` → run **Tools ▸ Balance ▸ Import** →
assets updated → diff in version control → playtest → iterate. Round-trip keeps code, data,
and design aligned without manual ScriptableObject editing.
