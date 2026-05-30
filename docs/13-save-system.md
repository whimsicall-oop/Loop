# 13 — Save System Design

## 13.1 Requirements

Auto-save, manual save, checkpoints, multiple slots; persist progress, skills, currency,
unlocks, achievements. Must be crash-safe and forward-compatible.

## 13.2 Model (`SaveData/SaveModel.cs`)

Plain `[Serializable]` POCO, free of engine types (uses `Vector3Data`) so it round-trips
through `JsonUtility`. `Version` enables migration. Fields cover world progress (level,
checkpoint, respawn pos, completed levels), stats (level, XP, max hearts, unlocked skills,
skill points), economy (coins, gems), collectibles (relics/artifacts/secrets by unique id),
unlocked powers, achievements, and aggregate completion %.

## 13.3 System (`SaveData/SaveSystem.cs`)

- **3 slots**, files at `Application.persistentDataPath/save_slot_N.sky` (maps to each
  platform's sandbox — console/mobile safe).
- **Atomic writes**: write `.tmp` → `File.Replace(path, .bak)` so a crash mid-write never
  corrupts the live save (the #1 "lost progress" support cause). A `.bak` gives one-step
  recovery; load falls back to `.bak` automatically.
- **Peek** reads a slot without activating it (slot-select UI shows name/level/playtime/%).
- **Checkpoints** call `RecordCheckpoint(id, pos, levelId)` which autosaves.
- **Migration** hook (`Migrate`) upgrades old versions on load.

## 13.4 Save triggers

| Type | When |
|------|------|
| Checkpoint autosave | Touch a `Checkpoint` |
| Event autosave | Level complete, skill unlock, boss defeat, power gained |
| Manual save | Pause menu (where platform cert allows) |
| Periodic | Optional safety autosave every N minutes (mobile/long sessions) |

## 13.5 Flow

```
New Game  → NewGame(slot, name) → fresh model → Save()
Continue  → Load(slot) → (try file, else .bak) → Migrate → set Active → raise Loaded
Play      → checkpoints/events → Save() (atomic)
Death     → respawn at SaveModel.RespawnPosition (PlayerController)
```

## 13.6 Integrity & cheating

- Optional HMAC checksum field for storefront leaderboards (speedrun) to deter trivial
  tampering; single-player saves stay human-readable JSON for support/debug by default.
- Console: respect platform save APIs/quotas; wrap writes in the platform's save-data
  container where required (integration layer).

## 13.7 Cloud & platforms

- Steam Cloud / platform cloud: include `persistentDataPath/*.sky` in the cloud manifest;
  `LastSavedUnixTime` resolves conflicts (newest wins, with a prompt on large divergence).
- Multiple profiles per machine handled by slots; platform user id namespaces the folder.

## 13.8 Testing

Edit-mode tests round-trip a populated `SaveModel` through JSON and assert equality; a
fault-injection test kills the process between `.tmp` write and `Replace` to prove the live
save survives (see Testing §18).
