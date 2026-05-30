using System;
using System.IO;
using Skybound.Core;
using UnityEngine;

namespace Skybound.SaveData
{
    /// <summary>
    /// Persistence service: multi-slot save/load, autosave, checkpoints, and atomic writes.
    ///
    /// Robustness choices that matter for a commercial release:
    ///  • Atomic save — write to a temp file then File.Replace, so a crash mid-write never
    ///    corrupts an existing save (the #1 cause of "lost progress" support tickets).
    ///  • A .bak rotation gives a one-step recovery if a slot is ever unreadable.
    ///  • Console/mobile use persistentDataPath, which maps to each platform's sandbox.
    /// </summary>
    public class SaveSystem : Singleton<SaveSystem>
    {
        public const int MaxSlots = 3;
        private const string FileExtension = ".sky";

        public SaveModel Active { get; private set; }
        public int ActiveSlot { get; private set; } = -1;

        public event Action<int> Saved;
        public event Action<int> Loaded;

        private static string SlotPath(int slot) =>
            Path.Combine(Application.persistentDataPath, $"save_slot_{slot}{FileExtension}");

        public bool SlotExists(int slot) => File.Exists(SlotPath(slot));

        /// <summary>Start a brand-new game in <paramref name="slot"/>.</summary>
        public SaveModel NewGame(int slot, string playerName)
        {
            Active = new SaveModel
            {
                SlotName = string.IsNullOrWhiteSpace(playerName) ? "Adventurer" : playerName,
                LastSavedUnixTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
            ActiveSlot = slot;
            Save();
            return Active;
        }

        public bool Load(int slot)
        {
            string path = SlotPath(slot);
            if (!TryReadModel(path, out SaveModel model) &&
                !TryReadModel(path + ".bak", out model))
            {
                Debug.LogWarning($"[SaveSystem] No readable save in slot {slot}.");
                return false;
            }

            Active = Migrate(model);
            ActiveSlot = slot;
            Loaded?.Invoke(slot);
            return true;
        }

        /// <summary>Persist the active model to its slot. No-op if nothing is loaded.</summary>
        public void Save()
        {
            if (Active == null || ActiveSlot < 0)
            {
                return;
            }

            Active.LastSavedUnixTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string path = SlotPath(ActiveSlot);
            string tmp = path + ".tmp";
            string bak = path + ".bak";

            try
            {
                string json = JsonUtility.ToJson(Active, prettyPrint: true);
                File.WriteAllText(tmp, json);

                if (File.Exists(path))
                {
                    File.Replace(tmp, path, bak); // atomic swap + backup rotation
                }
                else
                {
                    File.Move(tmp, path);
                }

                Saved?.Invoke(ActiveSlot);
            }
            catch (Exception e)
            {
                Debug.LogError($"[SaveSystem] Save failed: {e.Message}");
            }
        }

        /// <summary>Lightweight peek for the slot-select UI without making a slot active.</summary>
        public SaveModel Peek(int slot)
        {
            return TryReadModel(SlotPath(slot), out SaveModel m) ? m : null;
        }

        public void DeleteSlot(int slot)
        {
            foreach (string p in new[] { SlotPath(slot), SlotPath(slot) + ".bak" })
            {
                if (File.Exists(p)) File.Delete(p);
            }

            if (slot == ActiveSlot)
            {
                Active = null;
                ActiveSlot = -1;
            }
        }

        // --- Checkpoint / autosave helpers -------------------------------------
        public void RecordCheckpoint(string checkpointId, Vector3 respawnPosition, string levelId)
        {
            if (Active == null)
            {
                return;
            }

            Active.LastCheckpointId = checkpointId;
            Active.RespawnPosition = respawnPosition;
            Active.CurrentLevelId = levelId;
            Save(); // checkpoints autosave
        }

        public void AddPlaytime(float seconds)
        {
            if (Active != null)
            {
                Active.PlaytimeSeconds += seconds;
            }
        }

        private static bool TryReadModel(string path, out SaveModel model)
        {
            model = null;
            if (!File.Exists(path))
            {
                return false;
            }

            try
            {
                model = JsonUtility.FromJson<SaveModel>(File.ReadAllText(path));
                return model != null;
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[SaveSystem] Failed reading {path}: {e.Message}");
                return false;
            }
        }

        private static SaveModel Migrate(SaveModel model)
        {
            // Forward-migration hook. Bump SaveModel.Version and add upgrade steps here.
            if (model.Version < 1)
            {
                model.Version = 1;
            }

            return model;
        }
    }
}
