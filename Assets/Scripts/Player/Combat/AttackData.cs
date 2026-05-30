using UnityEngine;

namespace Skybound.Combat
{
    /// <summary>
    /// Data-driven definition of one attack (or one link in a combo chain). Designers
    /// build the whole melee combo tree by chaining these assets, tuning windows and
    /// cancel timings without code. Damage scales with the player's damage stat at runtime.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/Combat/Attack", fileName = "Attack")]
    public class AttackData : ScriptableObject
    {
        [Header("Identity")]
        public string AttackName = "Slash";
        public DamageType DamageType = DamageType.Physical;

        [Header("Damage")]
        public float BaseDamage = 1f;
        [Range(0f, 1f)] public float CritChance = 0.1f;
        public float CritMultiplier = 2f;

        [Header("Hitbox (local space, +x = facing)")]
        public Vector2 HitboxOffset = new Vector2(0.8f, 0f);
        public Vector2 HitboxSize = new Vector2(1.4f, 1.2f);

        [Header("Timing (seconds)")]
        [Tooltip("Wind-up before the hitbox activates.")]
        public float Startup = 0.06f;
        [Tooltip("How long the hitbox stays live.")]
        public float Active = 0.08f;
        [Tooltip("Recovery before another action is allowed.")]
        public float Recovery = 0.12f;
        [Tooltip("Window after recovery starts during which the next combo input chains.")]
        public float ComboWindow = 0.25f;

        [Header("Feel")]
        public float Knockback = 6f;
        public float HitStop = 0.05f;
        [Tooltip("Self-movement applied on activation, e.g. a lunge. +x = facing.")]
        public Vector2 LungeImpulse = new Vector2(2f, 0f);

        [Header("Chaining")]
        [Tooltip("Attack performed if the player attacks again inside the combo window.")]
        public AttackData NextInCombo;
    }
}
