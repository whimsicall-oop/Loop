using System.Collections.Generic;
using UnityEngine;

namespace Skybound.Progression
{
    public enum SkillCategory { Mobility, Combat, Survival, Magic }

    /// <summary>Stat each skill node modifies, applied additively/multiplicatively at runtime.</summary>
    public enum StatModifierTarget
    {
        ExtraHearts,
        DashCharges,
        ExtraJumps,
        DamageMultiplier,
        CooldownReduction,
        MoveSpeedMultiplier
    }

    /// <summary>
    /// One node in the skill tree. Nodes form a DAG via <see cref="Prerequisites"/>; the
    /// tree shape is pure data. Each node grants one or more <see cref="StatModifier"/>s the
    /// <see cref="ProgressionSystem"/> aggregates into the live player stat block.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/Progression/Skill", fileName = "Skill")]
    public class SkillDefinition : ScriptableObject
    {
        [System.Serializable]
        public struct StatModifier
        {
            public StatModifierTarget Target;
            public float Value;
        }

        [Header("Identity")]
        public string SkillId = "skill_id";
        public string DisplayName = "Skill";
        [TextArea] public string Description;
        public SkillCategory Category = SkillCategory.Combat;
        public Sprite Icon;

        [Header("Cost & Gating")]
        public int SkillPointCost = 1;
        public int RequiredCharacterLevel = 1;
        public List<SkillDefinition> Prerequisites = new List<SkillDefinition>();

        [Header("Effect")]
        public List<StatModifier> Modifiers = new List<StatModifier>();
    }
}
