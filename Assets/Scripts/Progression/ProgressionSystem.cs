using System;
using System.Collections.Generic;
using Skybound.Core;
using Skybound.SaveData;
using UnityEngine;

namespace Skybound.Progression
{
    /// <summary>Aggregated, ready-to-apply player stats derived from level + unlocked skills.</summary>
    public struct PlayerStats
    {
        public int BonusHearts;
        public int BonusJumps;
        public int DashCharges;
        public float DamageMultiplier;
        public float CooldownReduction;   // 0..~0.6
        public float MoveSpeedMultiplier;

        public static PlayerStats Default => new PlayerStats
        {
            BonusHearts = 0,
            BonusJumps = 0,
            DashCharges = 1,
            DamageMultiplier = 1f,
            CooldownReduction = 0f,
            MoveSpeedMultiplier = 1f
        };
    }

    /// <summary>
    /// XP → level curve, skill-point economy, and skill unlocking. Recomputes the aggregate
    /// <see cref="PlayerStats"/> whenever progression changes and raises <see cref="StatsChanged"/>
    /// so the player rig re-applies bonuses (extra hearts, dash charges, damage, etc.).
    /// State of record lives in the <see cref="SaveModel"/>; this class is the behaviour over it.
    /// </summary>
    public class ProgressionSystem : Singleton<ProgressionSystem>
    {
        [SerializeField] private List<SkillDefinition> _allSkills = new List<SkillDefinition>();
        [Header("XP Curve: xp(level) = Base * level^Exponent")]
        [SerializeField] private int _baseXp = 100;
        [SerializeField] private float _exponent = 1.5f;
        [SerializeField] private int _skillPointsPerLevel = 1;

        private readonly Dictionary<string, SkillDefinition> _skillLookup = new Dictionary<string, SkillDefinition>();

        public PlayerStats Stats { get; private set; } = PlayerStats.Default;

        public event Action<PlayerStats> StatsChanged;
        public event Action<int> LeveledUp;       // new level
        public event Action<float, int> XpChanged; // (progress 0..1, current level)

        protected override void OnSingletonAwake()
        {
            foreach (var s in _allSkills)
            {
                if (s != null) _skillLookup[s.SkillId] = s;
            }
        }

        private SaveModel Save => SaveSystem.Instance.Active;

        /// <summary>XP required to advance FROM the given level to the next.</summary>
        public int XpForLevel(int level) => Mathf.RoundToInt(_baseXp * Mathf.Pow(level, _exponent));

        public void GrantXp(int amount)
        {
            if (Save == null || amount <= 0)
            {
                return;
            }

            Save.Xp += amount;

            int required = XpForLevel(Save.CharacterLevel);
            while (Save.Xp >= required)
            {
                Save.Xp -= required;
                Save.CharacterLevel++;
                Save.SkillPoints += _skillPointsPerLevel;
                LeveledUp?.Invoke(Save.CharacterLevel);
                required = XpForLevel(Save.CharacterLevel);
            }

            XpChanged?.Invoke((float)Save.Xp / required, Save.CharacterLevel);
        }

        public bool CanUnlock(SkillDefinition skill)
        {
            if (Save == null || skill == null || Save.UnlockedSkillIds.Contains(skill.SkillId))
            {
                return false;
            }

            if (Save.SkillPoints < skill.SkillPointCost || Save.CharacterLevel < skill.RequiredCharacterLevel)
            {
                return false;
            }

            foreach (var pre in skill.Prerequisites)
            {
                if (pre != null && !Save.UnlockedSkillIds.Contains(pre.SkillId))
                {
                    return false;
                }
            }

            return true;
        }

        public bool TryUnlock(SkillDefinition skill)
        {
            if (!CanUnlock(skill))
            {
                return false;
            }

            Save.SkillPoints -= skill.SkillPointCost;
            Save.UnlockedSkillIds.Add(skill.SkillId);
            RecomputeStats();
            SaveSystem.Instance.Save();
            return true;
        }

        /// <summary>Rebuild the aggregate stat block from all unlocked skills + base level perks.</summary>
        public void RecomputeStats()
        {
            var stats = PlayerStats.Default;
            if (Save == null)
            {
                Stats = stats;
                return;
            }

            foreach (string id in Save.UnlockedSkillIds)
            {
                if (!_skillLookup.TryGetValue(id, out SkillDefinition skill))
                {
                    continue;
                }

                foreach (var mod in skill.Modifiers)
                {
                    ApplyModifier(ref stats, mod);
                }
            }

            Stats = stats;
            Save.MaxHearts = 5 + stats.BonusHearts;
            StatsChanged?.Invoke(Stats);
        }

        private static void ApplyModifier(ref PlayerStats stats, SkillDefinition.StatModifier mod)
        {
            switch (mod.Target)
            {
                case StatModifierTarget.ExtraHearts: stats.BonusHearts += Mathf.RoundToInt(mod.Value); break;
                case StatModifierTarget.ExtraJumps: stats.BonusJumps += Mathf.RoundToInt(mod.Value); break;
                case StatModifierTarget.DashCharges: stats.DashCharges += Mathf.RoundToInt(mod.Value); break;
                case StatModifierTarget.DamageMultiplier: stats.DamageMultiplier += mod.Value; break;
                case StatModifierTarget.CooldownReduction:
                    stats.CooldownReduction = Mathf.Clamp(stats.CooldownReduction + mod.Value, 0f, 0.6f); break;
                case StatModifierTarget.MoveSpeedMultiplier: stats.MoveSpeedMultiplier += mod.Value; break;
            }
        }
    }
}
