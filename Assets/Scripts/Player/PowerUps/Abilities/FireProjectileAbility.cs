using Skybound.Combat;
using Skybound.Systems;
using UnityEngine;

namespace Skybound.Player.PowerUps.Abilities
{
    /// <summary>Fire Orb: launches a burning projectile in the facing direction.</summary>
    [CreateAssetMenu(menuName = "Skybound/PowerUps/Abilities/Fire Projectile", fileName = "FireProjectile")]
    public class FireProjectileAbility : PowerAbility
    {
        [SerializeField] private Projectile _projectilePrefab;
        [SerializeField] private float _speed = 16f;
        [SerializeField] private float _damage = 1.5f;
        [SerializeField] private float _knockback = 4f;
        [SerializeField] private Vector2 _muzzleOffset = new Vector2(0.6f, 0.3f);

        // One pool per definition instance; created lazily on first use.
        private ObjectPool<Projectile> _pool;

        public override bool Activate(in PowerContext ctx)
        {
            if (_projectilePrefab == null)
            {
                return false;
            }

            _pool ??= new ObjectPool<Projectile>(_projectilePrefab, 6);

            Vector2 origin = (Vector2)ctx.Transform.position +
                             new Vector2(_muzzleOffset.x * ctx.Facing, _muzzleOffset.y);
            Projectile shot = _pool.Get(origin, Quaternion.identity);
            Vector2 velocity = new Vector2(_speed * ctx.Facing, 0f);

            shot.Launch(velocity, _damage, DamageType.Fire, _knockback, ctx.Player, p => _pool.Release(p));
            return true;
        }
    }
}
