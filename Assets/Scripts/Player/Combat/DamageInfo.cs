using UnityEngine;

namespace Skybound.Combat
{
    public enum DamageType { Physical, Fire, Ice, Lightning, Wind, Environmental }

    /// <summary>
    /// Immutable description of a single hit. Passing a struct keeps combat allocation-free
    /// and makes every damage event fully self-describing for VFX, audio, and damage numbers.
    /// </summary>
    public readonly struct DamageInfo
    {
        public readonly float Amount;
        public readonly DamageType Type;
        public readonly Vector2 SourcePosition;
        public readonly Vector2 KnockbackDir;
        public readonly float KnockbackForce;
        public readonly bool IsCritical;
        public readonly GameObject Instigator;

        public DamageInfo(float amount, DamageType type, Vector2 sourcePosition,
            Vector2 knockbackDir, float knockbackForce, bool isCritical, GameObject instigator)
        {
            Amount = amount;
            Type = type;
            SourcePosition = sourcePosition;
            KnockbackDir = knockbackDir.normalized;
            KnockbackForce = knockbackForce;
            IsCritical = isCritical;
            Instigator = instigator;
        }
    }

    /// <summary>Anything that can take damage implements this — players, enemies, breakables.</summary>
    public interface IDamageable
    {
        bool IsAlive { get; }
        void TakeDamage(in DamageInfo info);
    }
}
