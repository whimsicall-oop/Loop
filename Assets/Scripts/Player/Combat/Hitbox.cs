using System.Collections.Generic;
using Skybound.Systems;
using UnityEngine;

namespace Skybound.Combat
{
    /// <summary>
    /// A transient, query-driven damage volume. Rather than persistent trigger colliders
    /// (which suffer ordering and re-entry bugs), each attack opens a hitbox for a few
    /// frames and we OverlapBox once per physics tick, deduping targets so a single swing
    /// hits each victim exactly once. Applies damage, knockback, crits, and hit-stop.
    /// </summary>
    public class Hitbox : MonoBehaviour
    {
        [SerializeField] private LayerMask _targetMask;

        private readonly HashSet<IDamageable> _alreadyHit = new HashSet<IDamageable>();
        private readonly Collider2D[] _buffer = new Collider2D[16];

        private bool _active;
        private AttackData _attack;
        private int _facing;
        private float _damageMultiplier = 1f;
        private GameObject _owner;

        /// <summary>Open the hitbox for an attack. Call <see cref="Tick"/> while active.</summary>
        public void Activate(AttackData attack, int facing, float damageMultiplier, GameObject owner)
        {
            _attack = attack;
            _facing = facing < 0 ? -1 : 1;
            _damageMultiplier = damageMultiplier;
            _owner = owner;
            _active = true;
            _alreadyHit.Clear();
        }

        public void Deactivate() => _active = false;

        /// <summary>Run from the owner's FixedUpdate during the attack's active window.</summary>
        public void Tick()
        {
            if (!_active || _attack == null)
            {
                return;
            }

            Vector2 center = (Vector2)transform.position +
                             new Vector2(_attack.HitboxOffset.x * _facing, _attack.HitboxOffset.y);

            int count = Physics2D.OverlapBoxNonAlloc(center, _attack.HitboxSize, 0f, _buffer, _targetMask);
            for (int i = 0; i < count; i++)
            {
                var dmg = _buffer[i].GetComponentInParent<IDamageable>();
                if (dmg == null || !dmg.IsAlive || _alreadyHit.Contains(dmg))
                {
                    continue;
                }

                _alreadyHit.Add(dmg);
                ApplyHit(dmg, _buffer[i].transform.position);
            }
        }

        private void ApplyHit(IDamageable target, Vector2 targetPos)
        {
            bool crit = Random.value < _attack.CritChance;
            float amount = _attack.BaseDamage * _damageMultiplier * (crit ? _attack.CritMultiplier : 1f);
            Vector2 knockDir = new Vector2(_facing, 0.25f);

            var info = new DamageInfo(amount, _attack.DamageType, transform.position,
                knockDir, _attack.Knockback, crit, _owner);

            target.TakeDamage(in info);

            if (HitStop.HasInstance)
            {
                HitStop.Instance.Freeze(_attack.HitStop);
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            if (!_active || _attack == null) return;
            Gizmos.color = new Color(1f, 0.3f, 0.2f, 0.4f);
            Vector2 center = (Vector2)transform.position +
                             new Vector2(_attack.HitboxOffset.x * _facing, _attack.HitboxOffset.y);
            Gizmos.DrawCube(center, _attack.HitboxSize);
        }
#endif
    }
}
