using Skybound.Combat;
using UnityEngine;

namespace Skybound.Player.PowerUps
{
    /// <summary>
    /// Pooled projectile used by Fire (and reused by enemies / Goblin Archer). Travels in a
    /// straight line, applies a configurable status on hit, and despawns on impact or timeout.
    /// Pooling avoids per-shot GC; see <see cref="Skybound.Systems.ObjectPool{T}"/>.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    public class Projectile : MonoBehaviour
    {
        [SerializeField] private LayerMask _hitMask;
        [SerializeField] private float _lifetime = 3f;
        [SerializeField] private GameObject _impactVfx;

        private Rigidbody2D _rb;
        private DamageType _damageType;
        private float _damage;
        private float _knockback;
        private GameObject _owner;
        private float _age;
        private System.Action<Projectile> _onDespawn;

        private void Awake() => _rb = GetComponent<Rigidbody2D>();

        public void Launch(Vector2 velocity, float damage, DamageType type, float knockback,
            GameObject owner, System.Action<Projectile> onDespawn)
        {
            _rb.velocity = velocity;
            _damage = damage;
            _damageType = type;
            _knockback = knockback;
            _owner = owner;
            _onDespawn = onDespawn;
            _age = 0f;
            transform.right = velocity.normalized;
        }

        private void Update()
        {
            _age += Time.deltaTime;
            if (_age >= _lifetime)
            {
                Despawn();
            }
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if ((_hitMask.value & (1 << other.gameObject.layer)) == 0)
            {
                return;
            }

            var dmg = other.GetComponentInParent<IDamageable>();
            if (dmg != null && dmg.IsAlive)
            {
                var info = new DamageInfo(_damage, _damageType, transform.position,
                    _rb.velocity, _knockback, false, _owner);
                dmg.TakeDamage(in info);
            }

            if (_impactVfx != null)
            {
                Instantiate(_impactVfx, transform.position, Quaternion.identity);
            }

            Despawn();
        }

        private void Despawn()
        {
            _onDespawn?.Invoke(this);
            gameObject.SetActive(false);
        }
    }
}
