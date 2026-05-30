using UnityEngine;

namespace Skybound.Enemies
{
    /// <summary>
    /// Data profile for an enemy archetype (Slime, Beetle, Bat, Goblin Archer, Golem,
    /// Shadow Assassin, Forest Spirit). One prefab + one config = one enemy; reskinning
    /// or rebalancing is data-only. Behaviour flags select which states the FSM wires up.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/Enemies/Enemy Config", fileName = "EnemyConfig")]
    public class EnemyConfig : ScriptableObject
    {
        [Header("Identity")]
        public string EnemyName = "Slime";

        [Header("Stats")]
        public float MaxHealth = 3f;
        public float ContactDamage = 1f;
        public float AttackDamage = 1f;

        [Header("Movement")]
        public float PatrolSpeed = 2f;
        public float ChaseSpeed = 4f;
        public bool Flying;
        [Tooltip("Turn around at ledges/walls during patrol (ground enemies).")]
        public bool EdgeAware = true;

        [Header("Perception")]
        public float SightRange = 7f;
        public float SightAngle = 120f;
        public float AttackRange = 1.4f;
        [Tooltip("Range at which a low-health/cowardly enemy disengages.")]
        public float RetreatRange = 2.5f;
        public LayerMask SightObstacles;

        [Header("Combat Timing (seconds)")]
        public float AlertDuration = 0.6f;
        public float AttackWindup = 0.4f;
        public float AttackCooldown = 1.2f;
        public float RecoverDuration = 0.8f;
        public float HurtDuration = 0.25f;

        [Header("Behaviour Flags")]
        public bool CanRetreat;
        [Tooltip("Ranged enemies keep distance and fire projectiles (Goblin Archer).")]
        public bool Ranged;
        [Range(0f, 1f)] public float RetreatHealthThreshold = 0.25f;

        [Header("Rewards")]
        public int XpReward = 10;
        public int CoinReward = 3;
    }
}
