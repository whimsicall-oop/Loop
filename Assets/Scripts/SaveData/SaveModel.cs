using System;
using System.Collections.Generic;
using UnityEngine;

namespace Skybound.SaveData
{
    /// <summary>
    /// Plain serializable snapshot of all persistent player progress. Kept free of engine
    /// types (no Transform/GameObject) so it round-trips cleanly through JSON and stays
    /// versioned. <see cref="Version"/> enables forward-migration when the schema evolves.
    /// </summary>
    [Serializable]
    public class SaveModel
    {
        public int Version = 1;
        public string SlotName = "Adventurer";
        public long LastSavedUnixTime;
        public float PlaytimeSeconds;

        [Header("World Progress")]
        public string CurrentLevelId = "EV_01";
        public string LastCheckpointId;
        public Vector3Data RespawnPosition;
        public List<string> CompletedLevels = new List<string>();

        [Header("Stats / Progression")]
        public int CharacterLevel = 1;
        public int Xp;
        public int MaxHearts = 5;
        public List<string> UnlockedSkillIds = new List<string>();
        public int SkillPoints;

        [Header("Economy")]
        public int Coins;
        public int Gems;

        [Header("Collectibles (by unique id)")]
        public List<string> CollectedRelics = new List<string>();
        public List<string> CollectedArtifacts = new List<string>();
        public List<string> DiscoveredSecrets = new List<string>();

        [Header("Powers & Unlocks")]
        public List<string> UnlockedPowers = new List<string>();
        public List<string> UnlockedAchievements = new List<string>();

        /// <summary>Aggregate completion across levels/collectibles/secrets (0..1).</summary>
        public float CompletionPercent;
    }

    /// <summary>JSON-friendly Vector3 (JsonUtility serializes public fields only).</summary>
    [Serializable]
    public struct Vector3Data
    {
        public float x, y, z;
        public Vector3Data(Vector3 v) { x = v.x; y = v.y; z = v.z; }
        public Vector3 ToVector3() => new Vector3(x, y, z);
        public static implicit operator Vector3(Vector3Data d) => d.ToVector3();
        public static implicit operator Vector3Data(Vector3 v) => new Vector3Data(v);
    }
}
